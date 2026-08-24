import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from './toast.service';
import { API_URL } from './api.config';

const BASE_HREF = document.querySelector('base')?.getAttribute('href')?.replace(/\/$/, '') || '';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError(err => {
      const msg = err?.error?.message || err?.message || 'Error desconocido';
      if (err.status === 401) {
        if (req.url.startsWith(`${API_URL}/auth/`)) {
          return throwError(() => err);
        }
        window.localStorage.removeItem('auth_session');
        window.location.href = `${BASE_HREF}/login`;
      } else if (err.status === 403) {
        toast.error('No tiene permisos para esta accion');
      } else if (err.status === 404) {
        toast.warning('Recurso no encontrado');
      } else if (err.status >= 500) {
        toast.error('Error del servidor: ' + msg);
      } else if (err.status === 0) {
        toast.error('Sin conexion al servidor');
      } else {
        toast.warning(msg);
      }
      return throwError(() => err);
    })
  );
};
