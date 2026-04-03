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
  {
    path: 'soldes',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/soldes/soldes.component').then(m => m.SoldesComponent),
  },
  {
    path: 'majorations',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/majorations/majorations.component').then(m => m.MajorationsComponent),
  },
  {
    path: 'acomptes',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/acomptes/acomptes.component').then(m => m.AcomptesComponent),
  },
  {
    path: 'prestations',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/prestations/prestations.component').then(m => m.PrestationsComponent),
  },
  {
    path: 'liquidation-trends',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/liquidation-trends/liquidation-trends.component').then(m => m.LiquidationTrendsComponent),
  },
  {
    path: 'grappe-familiale',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/grappe-familiale/grappe-familiale.component').then(m => m.GrappeFamilialeComponent),
  },
  {
    path: 'immatriculations',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/immatriculations/immatriculations.component').then(m => m.ImmatriculationsComponent),
  },
  {
    path: 'employeurs-stats',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/employeurs-stats/employeurs-stats.component').then(m => m.EmployeursStatsComponent),
  },
  {
    path: 'recouvrement',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/recouvrement/recouvrement.component').then(m => m.RecouvrementComponent),
  },

  // ── Financial / Summary Account ──────────────────────────────────────
  {
    path: 'treasury',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/treasury-summary/treasury-summary').then(m => m.TreasurySummaryComponent),
  },
  {
    path: 'summary-accounts',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/summary-accounts/summary-accounts').then(m => m.ReconciliationComponent),
  },
  {
    path: 'trends',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/trends/trends').then(m => m.TrendsComponent),
  },

  // ── Budget ────────────────────────────────────────────────────────────
  {
    path: 'budget-execution',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/budget-execution/budget-execution').then(m => m.BudgetExecutionComponent),
  },

  // ── Patrimoine Immobilier (DGI) ──────────────────────────────────────
  {
    path: 'property-dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/property-dashboard/property-dashboard').then(m => m.PropertyDashboardComponent),
  },
  {
    path: 'property-detail',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/property-detail/property-detail').then(m => m.PropertyDetailComponent),
  },

  // ── Analyse Paiements par Document (FinancialContext) ─────────────────
  {
    path: 'document-payment',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/document-payment/document-payment').then(m => m.DocumentPaymentComponent),
  },

  // ── Analyse Financière IA (ML.NET) ───────────────────────────────────
  {
    path: 'forecast',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/forecast/forecast.component').then(m => m.ForecastComponent),
  },
  {
    path: 'anomalies',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/anomalies/anomalies.component').then(m => m.AnomaliesComponent),
  },

  // ── Analyse Trésorerie IA (ML.NET) ───────────────────────────────────
  {
    path: 'treasury-forecast',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/treasury-forecast/treasury-forecast.component').then(m => m.TreasuryForecastComponent),
  },
  {
    path: 'treasury-anomalies',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/treasury-anomalies/treasury-anomalies.component').then(m => m.TreasuryAnomaliesComponent),
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
