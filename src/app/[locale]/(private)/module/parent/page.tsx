import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getChildren } from '@/actions/parent.actions';
import { SubLayout } from '@/app/[locale]/(private)/sub-layout';
import { LocaleProps } from '@/types/locale-props';

import { ParentView } from './components/parent-view';

const INTL_NAMESPACE = 'private.parent';

export async function generateMetadata({ params }: LocaleProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: INTL_NAMESPACE });
  return { title: t('title') };
}

export default async function ParentPage({ params }: LocaleProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations(INTL_NAMESPACE);
  const childItems = await getChildren();

  return (
    <SubLayout pageTitle={t('title')}>
      <div className="col-span-12">
        <ParentView items={childItems} emptyMessage={t('empty')} />
      </div>
    </SubLayout>
  );
}
