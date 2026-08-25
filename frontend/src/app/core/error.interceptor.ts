import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from './toast.service';
import { API_URL } from './api.config';
import { AuthService } from './auth.service';

const BASE_HREF = document.querySelector('base')?.getAttribute('href')?.replace(/\/$/, '') || '';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError(err => {
      if (err.status === 401) {
        if (req.url.startsWith(`${API_URL}/auth/`)) {
          return throwError(() => err);
        }
        if (auth.isAuthenticated()) {
          toast.error('Sesion expirada. Inicie sesion nuevamente.');
          auth.logout();
          window.location.href = `${BASE_HREF}/login`;
        }
      } else if (err.status === 403) {
        toast.error('No tiene permisos para esta accion');
      } else if (err.status === 404) {
        toast.warning('Recurso no encontrado');
      } else if (err.status >= 500) {
        const msg = err?.error?.message || 'Error del servidor';
        toast.error(msg);
      } else if (err.status === 0) {
        toast.error('Sin conexion al servidor');
      } else {
        const msg = err?.error?.message || (err?.error?.errors ? Object.values(err.error.errors).join(', ') : null);
        if (msg) toast.warning(msg);
      }
      return throwError(() => err);
    })
  );
};
