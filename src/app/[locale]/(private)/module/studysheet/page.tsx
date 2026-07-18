import { getMonitoring } from '@/actions/monitoring.actions';
import { StudySheetContent } from '@/app/[locale]/(private)/module/studysheet/components/study-sheet-content';
import { LoadingScreen } from '@/components/loading-screen';
import { getTranslations } from 'next-intl/server';
import { LocaleProps } from '@/types/locale-props';

export async function generateMetadata({ params }: LocaleProps) {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: 'private.study-sheet' });

  return {
    title: t('title'),
  };
}

export default async function StudySheetPage() {
  let sheet;
  try {
    sheet = await getMonitoring();
  } catch {
    // silently fail — loading screen will show
  }

  if (!sheet) {
    return <LoadingScreen />;
  }

  return <StudySheetContent sheet={sheet} />;
}
