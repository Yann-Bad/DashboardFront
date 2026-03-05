import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * Forbidden page (403) — shown when a user is authenticated but lacks
 * the required role to access a route.
 *
 * WHY a dedicated page instead of redirecting to /dashboard?
 *  - Clear feedback: the user knows they're logged in but not authorised.
 *  - Avoids confusion: a silent redirect would leave them wondering why
 *    they ended up on an unrelated page.
 *  - Debug-friendly: shows which roles the user currently has.
 */
@Component({
  selector:   'app-forbidden',
  standalone: true,
  template: `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f0f2f5;">
      <div style="background:#fff;border-radius:8px;box-shadow:0 2px 16px rgba(0,0,0,.1);padding:2.5rem 2rem;max-width:420px;text-align:center;">
        <h1 style="font-size:3rem;margin:0;color:#dc2626;">403</h1>
        <h2 style="margin:.5rem 0 1rem;color:#1a1a2e;">Access Denied</h2>
        <p style="color:#6b7280;margin-bottom:1.5rem;">
          You are logged in as <strong>{{ user()?.userName }}</strong>
          but do not have permission to access this page.
        </p>
        <p style="color:#9ca3af;font-size:.85rem;margin-bottom:1.5rem;">
          Your roles: {{ user()?.roles?.join(', ') || 'none' }}
        </p>
        <div style="display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap;">
          <button (click)="goBack()"
            style="padding:.6rem 1.2rem;background:#4f46e5;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:600;">
            ← Go Back
          </button>
          <button (click)="logout()"
            style="padding:.6rem 1.2rem;background:#fff;color:#374151;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;font-weight:600;">
            Sign out
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ForbiddenComponent {
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);

  readonly user = this.authService.currentUser;

  goBack():  void { this.router.navigate(['/dashboard']); }
  logout():  void { this.authService.logout(); }
}
