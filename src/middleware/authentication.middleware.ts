import dayjs from 'dayjs';
import { NextRequest } from 'next/server';
import { getAuthInfo, gotoLogin, matchesAnyUrl } from './utils';
import { authorizationMiddleware } from './authorization.middleware';
import { PUBLIC_PATHS } from './constants';
import { intlMiddleware } from './intl.middleware';

const isAuthenticated = (request: NextRequest) => {
  const payload = getAuthInfo(request);

  if (!payload) {
    return false;
  }

  return payload.exp && payload.exp > dayjs().unix();
};

export const authenticationMiddleware = (request: NextRequest) => {
  const userAuthenticated = isAuthenticated(request);

  if (userAuthenticated) {
    return authorizationMiddleware(request);
  }

  if (matchesAnyUrl(request, PUBLIC_PATHS, false)) {
    return intlMiddleware(request);
  }

  return gotoLogin(request);
};
