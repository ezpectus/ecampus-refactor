'use client';

import { Activity, BarChart3, GraduationCap, TrendingUp, UserCheck, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { AnalyticsData } from '@/actions/analytics.actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  data: AnalyticsData;
}

export const AnalyticsView = ({ data }: Props) => {
  const t = useTranslations('private.analytics');

  const { overview, roleDistribution, monthlyRegistrations, facultyDistribution, activityData, gradeDistribution } = data;

  const metrics = [
    { key: 'total-users', value: overview.totalUsers, icon: <Users className="h-5 w-5" />, color: 'bg-blue-50 text-blue-600' },
    { key: 'students', value: overview.students, icon: <GraduationCap className="h-5 w-5" />, color: 'bg-green-50 text-green-600' },
    { key: 'active-students', value: overview.activeStudents, icon: <UserCheck className="h-5 w-5" />, color: 'bg-purple-50 text-purple-600' },
    { key: 'new-this-month', value: overview.newUsersThisMonth, icon: <TrendingUp className="h-5 w-5" />, color: 'bg-orange-50 text-orange-600' },
    { key: 'avg-gpa', value: overview.avgGpa, icon: <BarChart3 className="h-5 w-5" />, color: 'bg-cyan-50 text-cyan-600' },
    { key: 'parents', value: overview.parents, icon: <Activity className="h-5 w-5" />, color: 'bg-pink-50 text-pink-600' },
  ] as const;

  return (
    <div className="flex flex-col gap-[20px]">
      <div className="grid grid-cols-2 gap-[20px] lg:grid-cols-3 xl:grid-cols-6">
        {metrics.map((metric) => (
          <Card key={metric.key}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${metric.color}`}>
                {metric.icon}
              </div>
              <div>
                <p className="text-xl font-bold">{metric.value}</p>
                <p className="text-xs text-muted-foreground">{t(`metrics.${metric.key}`)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-[20px]">
        <Card className="col-span-12 xl:col-span-8">
          <CardHeader>
            <CardTitle>{t('charts.user-activity')}</CardTitle>
          </CardHeader>
          <CardContent>
            {activityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }} />
                  <Area type="monotone" dataKey="activeUsers" stroke="#3b82f6" strokeWidth={2} fill="url(#activityGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground py-12 text-center text-sm">{t('no-data')}</p>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-12 xl:col-span-4">
          <CardHeader>
            <CardTitle>{t('charts.role-distribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            {roleDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={roleDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="role"
                  >
                    {roleDistribution.map((entry) => (
                      <Cell key={entry.role} fill={ROLE_COLORS[entry.role] ?? '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground py-12 text-center text-sm">{t('no-data')}</p>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-12 xl:col-span-6">
          <CardHeader>
            <CardTitle>{t('charts.registrations')}</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyRegistrations.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyRegistrations}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }} />
                  <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground py-12 text-center text-sm">{t('no-data')}</p>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-12 xl:col-span-6">
          <CardHeader>
            <CardTitle>{t('charts.faculty-distribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            {facultyDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={facultyDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="faculty" type="category" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }} />
                  <Bar dataKey="students" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground py-12 text-center text-sm">{t('no-data')}</p>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-12">
          <CardHeader>
            <CardTitle>{t('charts.grade-distribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            {gradeDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={gradeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="grade" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {gradeDistribution.map((entry) => (
                      <Cell key={entry.grade} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground py-12 text-center text-sm">{t('no-data')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: '#ef4444',
  TEACHER: '#3b82f6',
  STUDENT: '#22c55e',
  PARENT: '#f59e0b',
};
