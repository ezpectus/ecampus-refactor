import { ReactNode } from 'react';
import './globals.css';
import { exo2Font } from '@/app/font';
import { NextIntlClientProvider } from 'next-intl';
import { GoogleAnalytics } from '@next/third-parties/google';
import { env } from '@/lib/env';

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="uk">
      <body className={`${exo2Font.className}`}>
        <NextIntlClientProvider messages={null}>{children}</NextIntlClientProvider>
      </body>
      {env.NEXT_PUBLIC_GA_ID && <GoogleAnalytics gaId={env.NEXT_PUBLIC_GA_ID} />}
    </html>
  );
}
