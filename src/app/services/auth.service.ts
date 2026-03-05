import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, throwError } from 'rxjs';
import type { Observable } from 'rxjs';
import { AuthUser, TokenPayload, TokenResponse } from '../models/auth.model';
import { environment } from '../../environments/environment';

/**
 * AuthService — single source of truth for authentication state.
 *
 * RESPONSIBILITIES:
 *  1. Login  : POST /connect/token → store tokens in localStorage
 *  2. Logout : clear storage, redirect to /login
 *  3. Refresh: POST /connect/token (refresh_token grant) → store new tokens
 *  4. Expose : current user as an Angular Signal (reactive, no BehaviorSubject needed)
 *
 * WHY localStorage instead of memory?
 *  - Survives page refresh — user stays logged in
 *  - Simple for a local-dev SPA; in production consider httpOnly cookies
 *    to avoid XSS token theft (trade-off: requires a BFF or token proxy)
 *
 * WHY Signals instead of BehaviorSubject?
 *  - Angular 17+: Signals are the idiomatic reactive primitive
 *  - No RxJS subscription leaks in components
 *  - computed() automatically derives isAuthenticated, isAdmin etc.
 */

const ACCESS_TOKEN_KEY  = 'rubac_access_token';
const REFRESH_TOKEN_KEY = 'rubac_refresh_token';
const ID_TOKEN_KEY      = 'rubac_id_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http   = inject(HttpClient);
  private readonly router = inject(Router);

  // ── Token endpoint (RubacCore) ─────────────────────────────────────────────
  // URL comes from environment.ts (dev) or environment.production.ts (prod).
  // Swapped automatically by angular.json fileReplacements at build time.
  // To change the server URL edit src/environments/environment.ts — never
  // hard-code URLs here so the same code deploys to any environment.
  private readonly tokenUrl = `${environment.authServerUrl}/connect/token`;

  // ── Reactive state (Signals) ───────────────────────────────────────────────

  /** Currently authenticated user, or null when logged out. */
  readonly currentUser = signal<AuthUser | null>(this.loadUserFromStorage());

  /** True when a valid access token is present. */
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  /** Convenience role checks — used by guards and templates. */
  readonly isAdmin      = computed(() => this.currentUser()?.isAdmin      ?? false);
  readonly isManager    = computed(() => this.currentUser()?.isManager    ?? false);
  readonly isConsultant = computed(() => this.currentUser()?.isConsultant ?? false);

  // ── Public API ─────────────────────────────────────────────────────────────

  /**
   * POST /connect/token using the OAuth2 password flow.
   *
   * WHY password flow and not PKCE/auth-code?
   *  For an internal SPA where users already trust the app (same organisation),
   *  password flow is simpler and avoids the redirect dance.
   *  Auth-code + PKCE is the right choice for public clients or third-party logins.
   */
  // Returns Observable<void> — the component only needs to know success/failure,
  // not the raw token response.
  login(userName: string, password: string): Observable<void> {
    const body = new HttpParams()
      .set('grant_type', 'password')
      .set('client_id',  'dashboard-front')
      .set('username',   userName)
      .set('password',   password)
      .set('scope',      'openid profile email roles offline_access dashboard');

    return this.http
      .post<TokenResponse>(this.tokenUrl, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .pipe(
        // map stores tokens AND transforms the response to void.
        // Errors propagate naturally to the component's error handler —
        // no catchError here so exceptions inside storeTokens are visible.
        map(response => {
          this.storeTokens(response);
        })
      );
  }

  /**
   * POST /connect/token using the refresh_token grant.
   *
   * Called automatically by the HTTP interceptor when receiving a 401.
   * A new access_token + refresh_token pair is received and stored.
   * If refresh fails (token expired/revoked), the user is logged out.
   */
  refresh(): Observable<void> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('no_refresh_token'));
    }

    const body = new HttpParams()
      .set('grant_type',    'refresh_token')
      .set('client_id',     'dashboard-front')
      .set('refresh_token', refreshToken);

    return this.http
      .post<TokenResponse>(this.tokenUrl, body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .pipe(
        map(response => {
          this.storeTokens(response);
        })
      );
  }

  /** Clear all tokens and redirect to the login page. */
  logout(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(ID_TOKEN_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  /** Raw access token — used by the HTTP interceptor to set Authorization header. */
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private storeTokens(response: TokenResponse): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, response.access_token);
    if (response.refresh_token)
      localStorage.setItem(REFRESH_TOKEN_KEY, response.refresh_token);
    // Store id_token separately — it is the only token that can be
    // decoded client-side (JWS). The access_token is an encrypted
    // JWE and its payload cannot be decoded in the browser.
    if (response.id_token)
      localStorage.setItem(ID_TOKEN_KEY, response.id_token);

    // Decode user info from id_token, not access_token
    const tokenToDecode = response.id_token ?? response.access_token;
    const user = this.decodeToken(tokenToDecode);
    this.currentUser.set(user);
  }

  /**
   * Decode the JWT access token payload without a library.
   *
   * WHY decode client-side?
   *  The token is already validated server-side on every API call via OpenIddict
   *  introspection. Client-side decoding is only for UX (show the user's name,
   *  show/hide menu items). Never trust client-side decoded claims for security decisions.
   */
  private decodeToken(jwt: string): AuthUser | null {
    try {
      const payloadB64  = jwt.split('.')[1];
      const payloadJson = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
      const payload     = JSON.parse(payloadJson) as TokenPayload;

      // Role can be a single string or an array (OpenIddict serialises one role
      // as a plain string, multiple roles as an array).
      const roles = Array.isArray(payload.role)
        ? payload.role
        : payload.role ? [payload.role] : [];

      return {
        id:          payload.sub,
        userName:    payload.name,
        email:       payload.email,
        firstName:   payload.given_name  ?? '',
        lastName:    payload.family_name ?? '',
        roles,
        isAdmin:      roles.includes('Admin'),
        isManager:    roles.includes('Manager'),
        isConsultant: roles.includes('Consultant'),
      };
    } catch {
      return null;
    }
  }

  /** On app startup, restore user from a token already in localStorage. */
  private loadUserFromStorage(): AuthUser | null {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!accessToken) return null;  // no session at all

    // id_token is a plain JWS — the ONLY token we can decode client-side.
    // access_token is an encrypted JWE and cannot be decoded here.
    const idToken = localStorage.getItem(ID_TOKEN_KEY);
    const tokenToDecode = idToken ?? accessToken;
    const user = this.decodeToken(tokenToDecode);

    // Check expiry using the id_token (decodable). If the id_token is
    // present and expired the access_token is also expired; prompt re-login.
    if (user && idToken && this.isTokenExpired(idToken)) {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(ID_TOKEN_KEY);
      return null;
    }

    return user;
  }

  private isTokenExpired(jwt: string): boolean {
    try {
      const payload = JSON.parse(atob(jwt.split('.')[1])) as TokenPayload;
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}
