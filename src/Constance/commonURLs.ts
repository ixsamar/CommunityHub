import {API_URL as devUrl} from './env';
import {API_URL as prodUrl} from './env.production';

export const ENV = {
  API_URL: __DEV__ ? devUrl : prodUrl,
  API_TIMEOUT: 15000,
  IS_DEV: __DEV__,
  MOCK_REFRESH_TOKEN_EXPIRY: 60 * 1000,
  MOCK_ACCESS_TOKEN_EXPIRY: 30 * 1000,
};
