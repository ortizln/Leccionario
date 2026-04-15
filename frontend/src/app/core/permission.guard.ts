import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const permissionGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const requiredPermission = route.data?.['permission'] as string | undefined;

  if (!requiredPermission || auth.hasPermission(requiredPermission)) {
    return true;
  }

  return router.parseUrl(auth.defaultRoute());
};
