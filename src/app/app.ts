import { Component, inject, computed, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly authService = inject(AuthService);

  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly currentUser     = this.authService.currentUser;

  // Dropdown visibility
  readonly menuOpen = signal(false);

  // Two-letter initials from the username (e.g. "admin" → "AD")
  readonly userInitials = computed(() => {
    const user = this.currentUser();
    if (!user) return '?';
    const parts = user.userName.trim().split(/[\s._\-]+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : user.userName.slice(0, 2).toUpperCase();
  });

  // Highest role for display in the badge
  readonly roleLabel = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    if (user.isAdmin)      return 'Admin';
    if (user.isManager)    return 'Manager';
    if (user.isConsultant) return 'Consultant';
    return 'Utilisateur';
  });

  toggleMenu(): void  { this.menuOpen.update(v => !v); }
  closeMenu(): void   { this.menuOpen.set(false); }

  logout(): void {
    this.menuOpen.set(false);
    this.authService.logout();
  }
}
