import { Component, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

/**
 * Login page — collects username + password and calls AuthService.login().
 *
 * FLOW:
 *  1. User fills in the form and submits.
 *  2. AuthService.login() POSTs to RubacCore /connect/token.
 *  3. On success: tokens are stored, currentUser signal updates,
 *     and the router navigates to the originally requested page (or /dashboard).
 *  4. On failure: an error message is shown without clearing the form.
 *
 * WHY use FormsModule (template-driven) here instead of ReactiveFormsModule?
 *  A login form has no complex validation logic — just required fields.
 *  Template-driven is less boilerplate for simple forms. Use ReactiveFormsModule
 *  for complex forms with dynamic validation (registration, settings, etc.).
 */
@Component({
  selector:    'app-login',
  standalone:  true,
  imports:     [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl:    './login.css',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router      = inject(Router);
  private readonly route       = inject(ActivatedRoute);

  userName = '';
  password = '';

  // Signals for UI state — no need for a separate isLoading variable
  readonly loading  = signal(false);
  readonly errorMsg = signal<string | null>(null);

  onSubmit(): void {
    if (!this.userName || !this.password) return;

    this.loading.set(true);
    this.errorMsg.set(null);

    this.authService.login(this.userName, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        // Navigate to the originally requested route, or fall back to /dashboard.
        // Use router.navigate (array form) so Angular processes the command
        // after the current change-detection cycle, giving signals time to settle.
        const redirect = this.route.snapshot.queryParamMap.get('redirect');
        if (redirect) {
          this.router.navigateByUrl(redirect);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);

        if (err.error?.error === 'access_denied') {
          // User authenticated but has no roles for this application.
          this.errorMsg.set(
            err.error.error_description ?? 'Votre compte n\'a pas encore de rôle attribué pour cette application. Veuillez contacter votre administrateur.'
          );
        } else if (err.status === 400 && err.error?.error === 'invalid_grant') {
          // Wrong username or password.
          this.errorMsg.set(
            err.error.error_description ?? 'Identifiants invalides. Veuillez vérifier votre nom d\'utilisateur et mot de passe.'
          );
        } else {
          this.errorMsg.set(
            err?.error?.error_description ?? 'Une erreur inattendue s\'est produite. Veuillez réessayer.'
          );
        }
      },
    });
  }
}
