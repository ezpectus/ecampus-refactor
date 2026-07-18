import { PublicLink } from './public-link';
import { LifebuoyOutline, Student, Chats } from '@/app/images';
import { getTranslations } from 'next-intl/server';
import { env } from '@/lib/env';

export const PublicLinks = async () => {
  const t = await getTranslations('auth.login.publicLink');

  return (
    <div className="mt-8 grid grid-cols-2 gap-8 sm:grid-cols-3">
      <PublicLink target="_blank" href={env.NEXT_PUBLIC_SUGGESTIONS_FORM} icon={<LifebuoyOutline />}>
        {t('support')}
      </PublicLink>
      <PublicLink href="/curator-search" icon={<Student />}>
        {t('curator-search')}
      </PublicLink>
      <PublicLink href={env.NEXT_PUBLIC_WHATSAPP_SUPPORT_LINK} target="_blank" icon={<Chats />}>
        {t('chat')}
      </PublicLink>
    </div>
  );
};
