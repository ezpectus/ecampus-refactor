'use server';

import qs from 'query-string';
import JWT from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/client';
import { User } from '@/types/models/user';
import { AuthResponse } from '@/types/models/auth-response';
import { SID_COOKIE_NAME, TOKEN_COOKIE_NAME } from '@/lib/constants/cookies';
import { USER_PROFILE_CACHE_TAG } from '@/lib/constants/cache-tags';
import { env } from '@/lib/env';

const MAIN_COOKIE_DOMAIN = env.MAIN_COOKIE_DOMAIN;
const ROOT_COOKIE_DOMAIN = env.ROOT_COOKIE_DOMAIN;

export async function setLoginCookies(token: string, sessionId: string, rememberMe: boolean) {
  const tokenData = JWT.decode(token) as { exp: number };
  // exp is in seconds, Date expects milliseconds
  const tokenExpiresAt = new Date(tokenData.exp * 1000);

  const expires = rememberMe ? tokenExpiresAt : undefined;
  const resolvedCookies = await cookies();

  const isProduction = env.NODE_ENV === 'production';

  resolvedCookies.set(SID_COOKIE_NAME, sessionId, {
    domain: ROOT_COOKIE_DOMAIN,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    expires,
  });
  resolvedCookies.set(TOKEN_COOKIE_NAME, token, {
    domain: MAIN_COOKIE_DOMAIN,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    expires,
  });
}

export async function loginWithCredentials(username: string, password: string, rememberMe: boolean) {
  const payload = {
    username,
    password,
    grant_type: 'password',
  };

  const response = await apiFetch<AuthResponse>('oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: qs.stringify(payload),
  });

  if (!response.ok) {
    return null;
  }

  const jsonResponse = await response.json();

  if (!jsonResponse) {
    return null;
  }

  const { sessionId, access_token } = jsonResponse;

  await setLoginCookies(access_token, sessionId, rememberMe);
  return true;
}

export async function logout() {
  const resolvedCookies = await cookies();

  resolvedCookies.delete({ domain: ROOT_COOKIE_DOMAIN, name: SID_COOKIE_NAME });
  resolvedCookies.delete({ domain: MAIN_COOKIE_DOMAIN, name: TOKEN_COOKIE_NAME });

  redirect('/');
}

export async function resetPassword(username: string, recaptchaToken: string) {
  try {
    const payload = {
      Captcha: recaptchaToken,
      UserIdentifier: username,
    };

    const response = await apiFetch('account/recovery', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (response.status < 200 || response.status >= 300) {
      throw new Error(`${response.status} Error`);
    }

    return null;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('Unknown error during password reset');
  }
}



export async function getUserDetails() {
  const userResponse = await apiFetch<User>('profile', {
    next: { tags: [USER_PROFILE_CACHE_TAG] },
  });

  if (!userResponse.ok) {
    return null;
  }

  return userResponse.json();
}

export async function redirectToEmploymentSystem() {
  const response = await apiFetch<string>('employment-system/auth');

  if (!response.ok) {
    throw new Error(`Failed to get employment system URL: ${response.status}`);
  }

  const url = await response.json();

  try {
    const parsed = new URL(url);
    const allowedHost = env.API_BASE_URL ? new URL(env.API_BASE_URL).hostname : '';
    if (allowedHost && !parsed.hostname.endsWith(allowedHost)) {
      throw new Error('Untrusted redirect URL');
    }
  } catch {
    throw new Error('Invalid redirect URL');
  }

  redirect(url);
}

