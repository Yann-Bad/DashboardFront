import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Role guard — blocks navigation when the authenticated user lacks a required role.
 *
 * HOW IT WORKS:
 *  Each protected route declares the roles allowed via route data:
 *
 *    {
 *      path: 'admin',
 *      canActivate: [authGuard, roleGuard],
 *      data: { roles: ['Admin'] },
 *      loadComponent: ...
 *    }
 *
 *  This guard reads `route.data['roles']` and checks the current user's roles.
 *
 * WHY a separate guard instead of handling this in authGuard?
 *  Single Responsibility:
 *    authGuard  answers: "Are you logged in?"
 *    roleGuard  answers: "Do you have permission for THIS route?"
 *  This also lets you combine them: some routes need both, others only authGuard.
 *
 * IMPORTANT: Always pair roleGuard with authGuard.
 *  roleGuard does not check authentication — if called alone on an unauth'd user,
 *  currentUser() is null and the check fails silently with a redirect to /login.
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService    = inject(AuthService);
  const router         = inject(Router);
  const requiredRoles  = (route.data['roles'] as string[] | undefined) ?? [];

  // No specific roles required for this route.
  if (requiredRoles.length === 0) return true;

  const user = authService.currentUser();

  if (!user) {
    return router.createUrlTree(['/login']);
  }

  const hasRole = requiredRoles.some(r => user.roles.includes(r));

  if (hasRole) return true;

  // User is authenticated but not authorised for this route.
  // Redirect to /forbidden (a gentle "Access Denied" page) instead of /login.
  return router.createUrlTree(['/forbidden']);
};
