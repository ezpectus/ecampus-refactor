'use server';

import { cookies } from 'next/headers';
import { getLocale } from 'next-intl/server';
import { TOKEN_COOKIE_NAME } from './constants/cookies';
import { DEFAULT_LOCALE } from '@/i18n/routing';
import { headers as nextHeaders } from 'next/headers';
import { env } from './env';

const getLocaleSafe = async () => {
  try {
    return getLocale();
  } catch (error) {
    return DEFAULT_LOCALE;
  }
};

const Client = (basePath: string) => {
  return async <T>(url: string | URL, options: RequestInit = {}) => {
    const { headers = {}, ...otherOptions } = options;
    const resolvedCookies = await cookies();
    const jwt = resolvedCookies.get(TOKEN_COOKIE_NAME)?.value;
    const locale = await getLocaleSafe();

    const input = new URL(url, basePath).href;

    const contentType = new Headers(headers).get('Content-type') ?? 'application/json';
    const resolvedHeaders = await nextHeaders();

    const cacheOption =
      'next' in otherOptions || 'cache' in otherOptions
        ? {}
        : { next: { revalidate: 300 } as const };

    const response = await fetch<T>(input, {
      ...cacheOption,
      signal: AbortSignal.timeout(10000),
      headers: {
        Accept: 'application/json',
        Authorization: jwt ? `Bearer ${jwt}` : '',
        'Content-Type': contentType,
        'Accept-Language': locale,
        'X-Forwarded-For': sanitizedForwardedFor,
        'X-Real-IP': sanitizedRealIp,
        ...headers,
      },
      ...otherOptions,
    });

    return response;
  };
};

export const apiFetch = Client(env.API_BASE_URL);
