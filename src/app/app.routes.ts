import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard').then((m) => m.DashboardComponent),
  },
  {
    path: 'centres',
    loadComponent: () =>
      import('./pages/centres/centres-list').then((m) => m.CentresListComponent),
  },
  {
    path: 'centres/:id',
    loadComponent: () =>
      import('./pages/centre-detail/centre-detail').then((m) => m.CentreDetailComponent),
  },
  {
    path: 'declarations',
    loadComponent: () =>
      import('./pages/declarations/declarations.component').then((m) => m.DeclarationsComponent),
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
