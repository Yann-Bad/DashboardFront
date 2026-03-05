import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Route guard — blocks navigation to protected routes for unauthenticated users.
 *
 * HOW IT WORKS:
 *  Angular calls this function before activating any route that declares
 *  `canActivate: [authGuard]`. It returns true (allow) or redirects (deny).
 *
 * WHY redirect to /login instead of returning false?
 *  Returning false just freezes the router. Redirecting gives the user a
 *  clear action to take (log in) rather than a blank page.
 *
 * WHY store the attempted URL in state?
 *  After login, we navigate to `state.redirect` so the user lands on
 *  the page they originally wanted, not always the dashboard.
 *
 * USAGE in app.routes.ts:
 *   { path: 'dashboard', canActivate: [authGuard], loadComponent: ... }
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirect to login, passing the attempted URL so we can return after login.
  return router.createUrlTree(['/login'], {
    queryParams: { redirect: state.url },
  });
};
