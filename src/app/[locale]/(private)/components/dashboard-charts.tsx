'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const GPA_DATA = [
  { semester: '1', gpa: 3.2 },
  { semester: '2', gpa: 3.5 },
  { semester: '3', gpa: 3.4 },
  { semester: '4', gpa: 3.7 },
  { semester: '5', gpa: 3.8 },
  { semester: '6', gpa: 3.9 },
];

const GRADE_DISTRIBUTION = [
  { name: 'A', value: 45, color: '#22c55e' },
  { name: 'B', value: 30, color: '#3b82f6' },
  { name: 'C', value: 15, color: '#f59e0b' },
  { name: 'D', value: 7, color: '#f97316' },
  { name: 'F', value: 3, color: '#ef4444' },
];

const ATTENDANCE_DATA = [
  { month: 'Sep', attended: 28, missed: 2 },
  { month: 'Oct', attended: 26, missed: 4 },
  { month: 'Nov', attended: 29, missed: 1 },
  { month: 'Dec', attended: 24, missed: 6 },
  { month: 'Jan', attended: 30, missed: 0 },
  { month: 'Feb', attended: 27, missed: 3 },
];

export const DashboardCharts = () => {
  const t = useTranslations('private.main.dashboard');

  return (
    <div className="grid grid-cols-12 gap-[20px]">
      <Card className="col-span-12 xl:col-span-8">
        <CardHeader>
          <CardTitle>{t('gpa-trend')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={GPA_DATA}>
              <defs>
                <linearGradient id="gpaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="semester"
                label={{ value: t('semester'), position: 'insideBottom', offset: -5 }}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                domain={[2, 4]}
                label={{ value: t('gpa'), angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
                labelStyle={{ fontWeight: 600 }}
              />
              <Area
                type="monotone"
                dataKey="gpa"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#gpaGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-12 xl:col-span-4">
        <CardHeader>
          <CardTitle>{t('grade-distribution')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={GRADE_DISTRIBUTION}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {GRADE_DISTRIBUTION.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 flex flex-wrap justify-center gap-4">
            {GRADE_DISTRIBUTION.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-neutral-600">
                  {entry.name}: {entry.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-12">
        <CardHeader>
          <CardTitle>{t('attendance')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ATTENDANCE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
              />
              <Bar dataKey="attended" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="missed" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
