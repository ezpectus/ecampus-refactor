import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getAnalytics } from '@/actions/analytics.actions';
import { SubLayout } from '@/app/[locale]/(private)/sub-layout';
import { LocaleProps } from '@/types/locale-props';

import { AnalyticsView } from './components/analytics-view';

const INTL_NAMESPACE = 'private.analytics';

export async function generateMetadata({ params }: LocaleProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: INTL_NAMESPACE });
  return { title: t('title') };
}

export default async function AnalyticsPage({ params }: LocaleProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations(INTL_NAMESPACE);
  const data = await getAnalytics();

  return (
    <SubLayout pageTitle={t('title')}>
      <div className="col-span-12">
        <AnalyticsView data={data} />
      </div>
    </SubLayout>
  );
}
