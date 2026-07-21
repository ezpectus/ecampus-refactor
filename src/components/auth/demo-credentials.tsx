'use client';

import { GraduationCap, KeyRound, Presentation, Shield, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface DemoUser {
  key: string;
  username: string;
  password: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'PARENT';
  fullName: string;
  icon: typeof Shield;
}

interface Props {
  onSelect?: (username: string, password: string, role?: string, fullName?: string) => void;
}

const DEMO_USERS: DemoUser[] = [
  { key: 'admin', username: 'admin', password: 'test12345', role: 'ADMIN', fullName: 'Admin User', icon: Shield },
  { key: 'teacher', username: 'teacher', password: 'test12345', role: 'TEACHER', fullName: 'Teacher User', icon: Presentation },
  { key: 'student', username: 'student', password: 'test12345', role: 'STUDENT', fullName: 'Student User', icon: GraduationCap },
  { key: 'parent', username: 'parent', password: 'test12345', role: 'PARENT', fullName: 'Parent User', icon: Users },
];

export const DemoCredentials = ({ onSelect }: Props) => {
  const t = useTranslations('auth.demo');

  if (process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS !== 'true') return null;

  return (
    <Card className="bg-muted/50 mt-6 border-dashed">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <KeyRound size={16} className="text-basic-blue" />
          <div>
            <p className="text-foreground text-sm font-semibold">{t('title')}</p>
            <p className="text-muted-foreground text-xs">{t('description')}</p>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-4">
          {DEMO_USERS.map(({ key, username, password, role, fullName, icon: Icon }) => (
            <Button
              key={key}
              type="button"
              variant="tertiary"
              size="small"
              className="border-border bg-card h-auto justify-start gap-2 border px-3 py-2 text-left"
              onClick={() => onSelect?.(username, password, role, fullName)}
            >
              <Icon size={16} />
              <span className="min-w-0">
                <span className="block text-xs font-semibold">{t(`roles.${key}`)}</span>
                <span className="text-muted-foreground block truncate text-[11px]">
                  {username} / {password}
                </span>
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
