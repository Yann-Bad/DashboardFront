// ── Production environment ─────────────────────────────────────────────────
//
// This file REPLACES environment.ts when building with --configuration=production.
// Update these URLs to match your production deployment.
//
// IMPORTANT: Always use HTTPS in production.

// ng serve	environment.ts → https://localhost:7140
// ng build	environment.production.ts → your prod URL
// ng build --configuration=development	environment.ts
export const environment = {
  production: true,

  // Replace with your production identity server URL
  authServerUrl: 'https://auth.yourdomain.com',

  // Replace with your production API URL
  apiBaseUrl: 'https://api.yourdomain.com',
};


// If you want to use HTTPS in dev, you need to start RubacCore with dotnet watch run --launch-profile https — then all three would use https://localhost:7140.

// Also remember to clear localStorage in the browser (DevTools → Application → Local Storage → delete rubac_* keys) so no old HTTPS-issued tokens are cached.