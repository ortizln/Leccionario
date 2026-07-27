import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from './toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError(err => {
      const msg = err?.error?.message || err?.message || 'Error desconocido';
      if (err.status === 401) {
        window.localStorage.removeItem('auth_session');
        window.location.href = '/login';
      } else if (err.status === 403) {
        toast.error('No tiene permisos para esta acción');
      } else if (err.status === 404) {
        toast.warning('Recurso no encontrado');
      } else if (err.status >= 500) {
        toast.error('Error del servidor: ' + msg);
      } else if (err.status === 0) {
        toast.error('Sin conexión al servidor');
      } else {
        toast.warning(msg);
      }
      return throwError(() => err);
    })
  );
};
