import { Heading2, Description } from '@/components/typography';
import { RegisterForm } from './register-form';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LocaleProps } from '@/types/locale-props';

const INTL_NAMESPACE = 'auth.register';

export async function generateMetadata({ params }: LocaleProps) {
  const { locale } = await params;

  const t = await getTranslations({ locale, namespace: INTL_NAMESPACE });

  return {
    title: t('header'),
  };
}

export default async function RegisterPage({ params }: LocaleProps) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations(INTL_NAMESPACE);

  return (
    <>
      <Heading2>{t('header')}</Heading2>
      <Description>{t('description')}</Description>
      <RegisterForm />
    </>
  );
}
