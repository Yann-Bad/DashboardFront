import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';

/**
 * Route table.
 *
 * PATTERN:
 *  - Public routes (login, forbidden) have NO guards.
 *  - All app routes use canActivate: [authGuard]          → must be logged in.
 *  - Sensitive routes add            canActivate: [authGuard, roleGuard]
 *    with data: { roles: ['Admin'] }                     → must have that role.
 *
 * WHY two-level guards?
 *  authGuard  handles authentication ("are you logged in?").
 *  roleGuard  handles authorisation  ("do you have permission?").
 *  Keeping them separate means you can mix and match per route:
 *    some routes need only authGuard,
 *    others need both authGuard + roleGuard.
 */
export const routes: Routes = [
  // ── Public ───────────────────────────────────────────────────
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent),
  },
  {
    // Shown when roleGuard blocks a route (authenticated but wrong role)
    path: 'forbidden',
    loadComponent: () => import('./pages/forbidden/forbidden').then(m => m.ForbiddenComponent),
  },

  // ── Protected (any authenticated user) ───────────────────────────────
  {
    path: 'dashboard',
    canActivate: [authGuard],            // any logged-in user can see the dashboard
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then(m => m.DashboardComponent),
  },
  {
    path: 'centres',
    canActivate: [authGuard],            // Consultant, Manager, Admin can list centres
    loadComponent: () =>
      import('./pages/centres/centres-list').then(m => m.CentresListComponent),
  },
  {
    path: 'centres/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/centre-detail/centre-detail').then(m => m.CentreDetailComponent),
  },
  {
    path: 'declarations',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/declarations/declarations.component').then(m => m.DeclarationsComponent),
  },
  {
    path: 'dossiers',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dossiers/dossiers.component').then(m => m.DossiersComponent),
  },
  {
    path: 'encaissements',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/encaissements/encaissements.component').then(m => m.EncaissementsComponent),
  },

  // ── Protected (Admin + Manager only) ─────────────────────────────────
  // Example for a future stats-management or config route:
  // {
  //   path: 'settings',
  //   canActivate: [authGuard, roleGuard],
  //   data: { roles: ['Admin', 'Manager'] },
  //   loadComponent: () => import('./pages/settings/settings').then(m => m.SettingsComponent),
  // },

  // ── Fallback ─────────────────────────────────────────────────────
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
