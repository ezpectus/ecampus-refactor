'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, CreditCard, BookOpen, CalendarCheck } from 'lucide-react';

const METRICS = [
  { key: 'average-score', value: '3.8', icon: <TrendingUp /> },
  { key: 'credits-earned', value: '168', icon: <CreditCard /> },
  { key: 'courses-active', value: '6', icon: <BookOpen /> },
  { key: 'attendance-rate', value: '92%', icon: <CalendarCheck /> },
] as const;

export const DashboardMetrics = () => {
  const t = useTranslations('private.main.dashboard');

  return (
    <div className="grid grid-cols-2 gap-[20px] lg:grid-cols-4">
      {METRICS.map((metric) => (
        <Card key={metric.key}>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
              {metric.icon}
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-neutral-900">{metric.value}</span>
              <span className="text-sm text-neutral-500">{t(`metrics.${metric.key}`)}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
