'use client';

import { Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type { ParentChild } from '@/actions/parent.actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/utils/empty-state';

import { ChildDetail } from './child-detail';

interface Props {
  items: ParentChild[];
  emptyMessage: string;
}

export const ParentView = ({ items, emptyMessage }: Props) => {
  const t = useTranslations('private.parent');
  const [selectedChild, setSelectedChild] = useState<ParentChild | null>(null);

  if (items.length === 0) {
    return <EmptyState icon={<Users size={24} />} title={emptyMessage} />;
  }

  if (selectedChild) {
    return <ChildDetail child={selectedChild} onBack={() => setSelectedChild(null)} />;
  }

  return (
    <div className="flex flex-col gap-[20px]">
      <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2 lg:grid-cols-3">
        {items.map((child) => (
          <Card
            key={child.id}
            className="cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => setSelectedChild(child)}
            data-testid={`child-card-${child.studentId}`}
          >
            <CardHeader className="flex-row items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={child.photo || undefined} alt={child.studentName} />
                <AvatarFallback>{child.studentName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <CardTitle className="text-base">{child.studentName}</CardTitle>
                <span className="text-muted-foreground text-sm">{child.groupName ?? '—'}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm">
                <div>
                  <span className="text-muted-foreground">{t('gpa')}: </span>
                  <span className="font-semibold">{child.gpa}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('study-year')}: </span>
                  <span className="font-semibold">{child.studyYear}</span>
                </div>
              </div>
              {child.faculty && <p className="text-muted-foreground mt-2 text-sm">{child.faculty}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
