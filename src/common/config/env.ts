/**
 * Application environment configuration.
 * Avoid placing real API keys or credentials directly here.
 * Use external environment files (.env) in production.
 */
export const ENV = {
  API_URL: 'https://api.communityhub.mock',
  API_TIMEOUT: 15000, // 15 seconds network timeout
  IS_DEV: __DEV__,
  MOCK_REFRESH_TOKEN_EXPIRY: 60 * 1000, // mock refresh token expiry time (60 seconds)
  MOCK_ACCESS_TOKEN_EXPIRY: 30 * 1000,  // mock access token expiry time (30 seconds)
};
