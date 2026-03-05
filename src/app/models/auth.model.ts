/**
 * TypeScript models mirroring RubacCore's token and user contracts.
 *
 * WHY separate models instead of using `any`?
 *  - Type safety: the compiler catches mismatches before they hit the network
 *  - IntelliSense: every field is auto-completed in the IDE
 *  - Documentation: the shape of the API is visible at a glance here
 */

/**
 * Raw response from POST /connect/token (OpenIddict password flow).
 * Field names follow the OAuth2 spec (snake_case).
 */
export interface TokenResponse {
  access_token:   string;
  refresh_token?: string;  // only present when offline_access scope is granted
  // id_token is a signed JWS (3-part JWT) — always decodable client-side.
  // access_token is an encrypted JWE (5-part) — cannot be decoded client-side.
  // We decode id_token for user info (name, email, roles) and store
  // access_token only for the Authorization header on API calls.
  id_token?:      string;
  token_type:     string;  // always "Bearer"
  expires_in:     number;  // seconds until access_token expires
}

/**
 * Decoded payload of the access token.
 * These claims are set in RubacCore's AuthController.BuildSignInResultAsync.
 */
export interface TokenPayload {
  sub:             string;   // user id (subject)
  name:            string;   // username
  email:           string;
  given_name?:     string;   // firstName
  family_name?:    string;   // lastName
  role:            string | string[]; // can be a single string or array
  exp:             number;   // expiry Unix timestamp
}

/**
 * Normalised user profile — what the rest of the app works with.
 * Always use this, never work with raw TokenPayload.
 */
export interface AuthUser {
  id:          string;
  userName:    string;
  email:       string;
  firstName:   string;
  lastName:    string;
  roles:       string[];
  isAdmin:     boolean;
  isManager:   boolean;
  isConsultant: boolean;
}
