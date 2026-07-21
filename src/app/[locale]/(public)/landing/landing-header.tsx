'use client';

import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { LocaleSwitch } from '@/components/ui/locale-switch';
import { Link } from '@/i18n/routing';

export const LandingHeader = () => {
  const t = useTranslations('landing');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-12">
        <Link href="/" aria-label={t('meta.title')}>
          <span className="text-xl font-bold text-neutral-900">Student Portal</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-4 sm:flex" aria-label={t('nav.aria-label')}>
          <LocaleSwitch />
          <Link href="/login">
            <Button variant="secondary" size="small">
              {t('nav.login')}
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" size="small">
              {t('nav.register')}
            </Button>
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="flex items-center justify-center rounded-lg p-2 text-neutral-700 transition-colors hover:bg-neutral-100 sm:hidden"
          onClick={() => setIsOpen((v) => !v)}
          aria-label={isOpen ? t('nav.close-menu') : t('nav.open-menu')}
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {isOpen && (
        <nav
          id="mobile-nav"
          className="flex flex-col gap-3 border-t border-neutral-100 px-6 py-4 sm:hidden"
          aria-label={t('nav.aria-label')}
        >
          <LocaleSwitch />
          <Link href="/login" onClick={() => setIsOpen(false)}>
            <Button variant="secondary" size="small" className="w-full">
              {t('nav.login')}
            </Button>
          </Link>
          <Link href="/register" onClick={() => setIsOpen(false)}>
            <Button variant="primary" size="small" className="w-full">
              {t('nav.register')}
            </Button>
          </Link>
        </nav>
      )}
    </header>
  );
};
