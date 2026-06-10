import Cookies from 'js-cookie';

const ACCESS_KEY = 'dio_access';
const REFRESH_KEY = 'dio_refresh';

export const tokenStorage = {
  getAccess(): string | undefined {
    return Cookies.get(ACCESS_KEY);
  },
  getRefresh(): string | undefined {
    return Cookies.get(REFRESH_KEY);
  },
  set(access: string, refresh: string) {
    // Access — 1 soat, Refresh — 7 kun (settings.py bilan mos)
    Cookies.set(ACCESS_KEY, access, { expires: 1 / 24, sameSite: 'lax' });
    Cookies.set(REFRESH_KEY, refresh, { expires: 7, sameSite: 'lax' });
  },
  clear() {
    Cookies.remove(ACCESS_KEY);
    Cookies.remove(REFRESH_KEY);
  },
};