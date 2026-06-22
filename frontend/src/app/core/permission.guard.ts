import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const permissionGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const requiredPermission = route.data?.['permission'] as string | undefined;
  const denyRoles = (route.data?.['denyRoles'] as string[] | undefined) ?? [];

  if (denyRoles.some(role => auth.hasRole(role))) {
    return router.parseUrl(auth.defaultRoute());
  }

  if (!requiredPermission || auth.hasPermission(requiredPermission)) {
    return true;
  }

  return router.parseUrl(auth.defaultRoute());
};
