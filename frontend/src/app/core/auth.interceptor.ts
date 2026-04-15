import { HttpInterceptorFn } from '@angular/common/http';
import { API_URL } from './api.config';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith(`${API_URL}/auth/`)) {
    return next(req);
  }

  let token: string | null = null;
  try {
    const raw = window.localStorage.getItem('auth_session');
    token = raw ? JSON.parse(raw).token ?? null : null;
  } catch {
    token = null;
  }
  if (!token) {
    return next(req);
  }
  return next(req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  }));
};
