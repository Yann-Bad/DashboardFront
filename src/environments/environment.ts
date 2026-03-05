// ── Development environment ────────────────────────────────────────────────
//
// This file is used during `ng serve` (development build).
// It is REPLACED by environment.production.ts when building with
// --configuration=production (see angular.json → fileReplacements).
//
// PORTS — from Properties/launchSettings.json of each .NET project:
//
//   RubacCore  (identity / token server)
//     HTTP  → http://localhost:5262   ← used here
//     HTTPS → https://localhost:7140  (requires dotnet dev-certs https --trust
//                                      AND dotnet watch run --launch-profile https)
//
//   DashboardCore  (resource API)
//     HTTP  → http://localhost:5273
//     HTTPS → https://localhost:7208
//     Note: /api/* calls are proxied via proxy.conf.json in ng serve.
//
// WHY HTTP and not HTTPS?
//   `dotnet watch run` (no profile flag) starts RubacCore on http://localhost:5262
//   only. All three layers must use the SAME scheme+host+port because:
//     1. Angular must reach /connect/token  →  must match the listening address
//     2. The `iss` claim in every JWT is the server's own base URL
//     3. DashboardCore compares the token's `iss` against its configured Issuer
//   Any mismatch in scheme (http vs https) or port causes either a connection
//   error (step 1) or a token rejection (steps 2-3).
export const environment = {
  production: false,

  // RubacCore token endpoint base URL — must match what RubacCore listens on
  authServerUrl: 'http://localhost:5262',

  // DashboardCore base URL
  // /api/* is already proxied by proxy.conf.json in ng serve,
  // so this is only needed if you ever call DashboardCore directly.
  apiBaseUrl: 'http://localhost:5273',
};
