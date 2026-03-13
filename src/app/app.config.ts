import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';

/**
 * Application-wide providers.
 *
 * provideHttpClient(withInterceptors([authInterceptor]))
 *   Every HttpClient call will pass through authInterceptor which:
 *     1. Attaches `Authorization: Bearer <token>` to protected requests
 *     2. Automatically silently refreshes an expired access token (401 handling)
 *
 * This replaces the old class-based HTTP_INTERCEPTORS approach —
 * functional interceptors are the Angular 15+ recommended pattern.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor]), // ← attaches Bearer token to all requests
    ),
    provideCharts(withDefaultRegisterables()),
    provideAnimationsAsync(),
  ],
};
