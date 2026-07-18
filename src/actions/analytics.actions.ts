'use server';

import { unstable_cache } from 'next/cache';

import { getUserDetails } from '@/actions/auth.actions';
import { getLocalUser } from '@/actions/local-auth.actions';
import { ANALYTICS_CACHE_TAG } from '@/lib/constants/cache-tags';
import { prisma } from '@/lib/prisma';
import { UserCategory } from '@/types/enums/user-category';

const requireAdmin = async () => {
  const localUser = await getLocalUser();
  if (localUser?.role === 'ADMIN') {
    return { schoolId: localUser.schoolId ?? undefined };
  }

  const remoteUser = await getUserDetails();
  if (!remoteUser?.userCategories?.includes(UserCategory.Admin)) {
    return null;
  }

  return { schoolId: undefined as number | undefined };
};

export interface AnalyticsOverview {
  totalUsers: number;
  students: number;
  teachers: number;
  parents: number;
  admins: number;
  activeStudents: number;
  newUsersThisMonth: number;
  avgGpa: number;
}

export interface RoleDistribution {
  role: string;
  count: number;
}

export interface MonthlyRegistration {
  month: string;
  count: number;
}

export interface FacultyDistribution {
  faculty: string;
  students: number;
  avgGpa: number;
}

export interface ActivityData {
  date: string;
  activeUsers: number;
}

export interface GradeDistribution {
  grade: string;
  count: number;
  color: string;
}

export interface AnalyticsData {
  overview: AnalyticsOverview;
  roleDistribution: RoleDistribution[];
  monthlyRegistrations: MonthlyRegistration[];
  facultyDistribution: FacultyDistribution[];
  activityData: ActivityData[];
  gradeDistribution: GradeDistribution[];
}

/**
 * Get comprehensive analytics data for admin dashboard.
 * @returns Safe default on error: empty analytics. Never throws.
 */
export const getAnalytics = unstable_cache(
  async (): Promise<AnalyticsData> => {
    const admin = await requireAdmin();
    if (!admin) {
      return {
        overview: { totalUsers: 0, students: 0, teachers: 0, parents: 0, admins: 0, activeStudents: 0, newUsersThisMonth: 0, avgGpa: 0 },
        roleDistribution: [],
        monthlyRegistrations: [],
        facultyDistribution: [],
        activityData: [],
        gradeDistribution: [],
      };
    }

    const { schoolId } = admin;
    const schoolFilter = schoolId !== undefined ? { schoolId } : {};

    try {
      const now = new Date();
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

      const [
        totalUsers, students, teachers, parents, admins,
        activeStudents, newUsersThisMonth, studentGpas,
        roleGroups, recentUsers, facultyData, recentActivity, allCourses,
      ] = await Promise.all([
        prisma.user.count({ where: schoolFilter }),
        prisma.user.count({ where: { role: 'STUDENT', ...schoolFilter } }),
        prisma.user.count({ where: { role: 'TEACHER', ...schoolFilter } }),
        prisma.user.count({ where: { role: 'PARENT', ...schoolFilter } }),
        prisma.user.count({ where: { role: 'ADMIN', ...schoolFilter } }),
        prisma.user.count({ where: { role: 'STUDENT', status: 'Studying', ...schoolFilter } }),
        prisma.user.count({ where: { createdAt: { gte: monthAgo }, ...schoolFilter } }),
        prisma.user.findMany({ where: { role: 'STUDENT', ...schoolFilter }, select: { gpa: true } }),
        prisma.user.groupBy({ by: ['role'], where: schoolFilter, _count: true }),
        prisma.user.findMany({ where: { createdAt: { gte: new Date(now.getFullYear() - 1, 0, 1) }, ...schoolFilter }, select: { createdAt: true } }),
        prisma.user.groupBy({ by: ['faculty'], where: { role: 'STUDENT', faculty: { not: null }, ...schoolFilter }, _count: true, _avg: { gpa: true } }),
        prisma.user.findMany({ where: { lastActiveAt: { gte: monthAgo }, ...schoolFilter }, select: { lastActiveAt: true } }),
        prisma.course.findMany({ where: schoolId !== undefined ? { schoolId } : {}, select: { grade: true } }),
      ]);

      const avgGpa = studentGpas.length > 0
        ? Math.round((studentGpas.reduce((sum: number, u: { gpa: number }) => sum + u.gpa, 0) / studentGpas.length) * 100) / 100
        : 0;

      const roleDistribution: RoleDistribution[] = roleGroups.map((g: { role: string; _count: number }) => ({
        role: g.role,
        count: g._count,
      }));

      const monthMap = new Map<string, number>();
      for (const u of recentUsers as { createdAt: Date }[]) {
        const key = `${u.createdAt.getFullYear()}-${String(u.createdAt.getMonth() + 1).padStart(2, '0')}`;
        monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
      }
      const monthlyRegistrations: MonthlyRegistration[] = Array.from(monthMap.entries())
        .sort((a: [string, number], b: [string, number]) => a[0].localeCompare(b[0]))
        .map(([month, count]) => ({ month, count }));

      const facultyDistribution: FacultyDistribution[] = facultyData
        .map((f: { faculty: string | null; _count: number; _avg: { gpa: number | null } }) => ({
          faculty: f.faculty ?? 'Unknown',
          students: f._count,
          avgGpa: f._avg.gpa ? Math.round(f._avg.gpa * 100) / 100 : 0,
        }))
        .sort((a: FacultyDistribution, b: FacultyDistribution) => b.students - a.students)
        .slice(0, 10);

      const activityMap = new Map<string, number>();
      for (const u of recentActivity as { lastActiveAt: Date }[]) {
        const key = u.lastActiveAt.toISOString().split('T')[0];
        activityMap.set(key, (activityMap.get(key) ?? 0) + 1);
      }
      const activityData: ActivityData[] = Array.from(activityMap.entries())
        .sort((a: [string, number], b: [string, number]) => a[0].localeCompare(b[0]))
        .slice(-30)
        .map(([date, activeUsers]) => ({ date, activeUsers }));

      const buckets = { A: 0, B: 0, C: 0, D: 0, F: 0 };
      for (const c of allCourses as { grade: number }[]) {
        if (c.grade >= 90) buckets.A++;
        else if (c.grade >= 80) buckets.B++;
        else if (c.grade >= 70) buckets.C++;
        else if (c.grade >= 60) buckets.D++;
        else buckets.F++;
      }
      const gradeDistribution: GradeDistribution[] = [
        { grade: 'A (90-100)', count: buckets.A, color: '#22c55e' },
        { grade: 'B (80-89)', count: buckets.B, color: '#3b82f6' },
        { grade: 'C (70-79)', count: buckets.C, color: '#f59e0b' },
        { grade: 'D (60-69)', count: buckets.D, color: '#f97316' },
        { grade: 'F (<60)', count: buckets.F, color: '#ef4444' },
      ];

      return {
        overview: { totalUsers, students, teachers, parents, admins, activeStudents, newUsersThisMonth, avgGpa },
        roleDistribution,
        monthlyRegistrations,
        facultyDistribution,
        activityData,
        gradeDistribution,
      };
    } catch {
      return {
        overview: { totalUsers: 0, students: 0, teachers: 0, parents: 0, admins: 0, activeStudents: 0, newUsersThisMonth: 0, avgGpa: 0 },
        roleDistribution: [],
        monthlyRegistrations: [],
        facultyDistribution: [],
        activityData: [],
        gradeDistribution: [],
      };
    }
  },
  ['analytics'],
  { revalidate: 120, tags: [ANALYTICS_CACHE_TAG] },
);
