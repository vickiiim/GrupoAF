import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const expectedRoles: string[] = route.data['roles'];
  const userRole = authService.getRole();

  if (expectedRoles && (!userRole || !expectedRoles.includes(userRole))) {
    alert('No tienes permisos para acceder a esta sección');
    router.navigate(['/login']);
    return false;
  }

  return true;
};