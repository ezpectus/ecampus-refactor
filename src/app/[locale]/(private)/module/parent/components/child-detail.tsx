'use client';

import { ArrowLeft, BookOpen, CalendarCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { type ChildAttendance, type ChildCourse, getChildAttendance, getChildCourses } from '@/actions/parent.actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Props {
  child: {
    studentId: number;
    studentName: string;
    groupName: string | null;
    faculty: string | null;
    gpa: number;
    studyYear: number;
  };
  onBack: () => void;
}

export const ChildDetail = ({ child, onBack }: Props) => {
  const t = useTranslations('private.parent');
  const [courses, setCourses] = useState<ChildCourse[]>([]);
  const [attendance, setAttendance] = useState<ChildAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    Promise.all([getChildCourses(child.studentId), getChildAttendance(child.studentId)])
      .then(([c, a]) => {
        if (!isCancelled) {
          setCourses(c);
          setAttendance(a);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setCourses([]);
          setAttendance([]);
        }
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });
    return () => {
      isCancelled = true;
    };
  }, [child.studentId]);

  const attendanceData = attendance.map((a) => ({
    month: a.month,
    present: a.present,
    missed: a.total - a.present,
  }));

  return (
    <div className="flex flex-col gap-[20px]">
      <div className="flex items-center gap-4">
        <Button variant="tertiary" size="small" type="button" onClick={onBack} icon={<ArrowLeft className="h-4 w-4" />}>
          {t('back')}
        </Button>
        <div>
          <h2 className="text-xl font-bold">{child.studentName}</h2>
          <p className="text-muted-foreground text-sm">
            {child.faculty ?? '—'} · {child.groupName ?? '—'} · {t('study-year')}: {child.studyYear}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-[20px] lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{courses.length}</p>
              <p className="text-muted-foreground text-xs">{t('courses')}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <CalendarCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold">{child.gpa}</p>
              <p className="text-muted-foreground text-xs">{t('gpa')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('grades-table')}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground py-8 text-center text-sm">{t('loading')}</p>
          ) : courses.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">{t('no-courses')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('table.course')}</TableHead>
                  <TableHead className="w-32">{t('table.teacher')}</TableHead>
                  <TableHead className="w-24">{t('table.credits')}</TableHead>
                  <TableHead className="w-24">{t('table.grade')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.name}</TableCell>
                    <TableCell className="text-muted-foreground">{course.teacherName ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{course.credits}</TableCell>
                    <TableCell className="font-semibold">{course.displayGrade}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {attendanceData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('attendance-chart')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }} />
                <Bar dataKey="present" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="missed" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
