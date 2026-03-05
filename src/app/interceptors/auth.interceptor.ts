import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * HTTP Interceptor — attaches the Bearer access token to every outgoing request.
 *
 * HOW IT WORKS:
 *  1. Every HTTP call from Angular passes through this function.
 *  2. If a token exists, it is added as Authorization: Bearer <token>.
 *  3. If the server responds with 401 (token expired), we automatically
 *     try to refresh the token once and replay the original request.
 *  4. If refresh also fails, the user is logged out.
 *
 * WHY a functional interceptor (not class-based)?
 *  Angular 15+ recommends functional interceptors — they are tree-shakable,
 *  easier to test, and work with provideHttpClient(withInterceptors([...])).
 *
 * WHY attach to ALL requests, not just DashboardCore calls?
 *  All API calls in this app go to DashboardCore which requires a token.
 *  The token endpoint itself (RubacCore /connect/token) is excluded below
 *  to avoid infinite loops during login/refresh.
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);

  // Do NOT attach tokens to the token endpoint itself —
  // that would create an infinite loop on token refresh.
  if (req.url.includes('/connect/token')) {
    return next(req);
  }

  const token = authService.getAccessToken();
  const authReq = token ? addToken(req, token) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Access token expired — attempt silent refresh once.
        return authService.refresh().pipe(
          switchMap(() => {
            // Refresh succeeded: replay original request with new token.
            const newToken = authService.getAccessToken();
            return next(newToken ? addToken(req, newToken) : req);
          }),
          catchError(refreshError => {
            // Refresh failed: authService.refresh() already called logout().
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};

/** Clone the request and add the Authorization header. */
function addToken(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}
