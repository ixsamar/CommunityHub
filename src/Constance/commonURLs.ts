import {API_URL} from '@env';

export const ENV = {
  API_URL: API_URL || 'http://localhost:5000',
  API_TIMEOUT: 15000,
  IS_DEV: __DEV__,
  MOCK_REFRESH_TOKEN_EXPIRY: 60 * 1000,
  MOCK_ACCESS_TOKEN_EXPIRY: 30 * 1000,
};
