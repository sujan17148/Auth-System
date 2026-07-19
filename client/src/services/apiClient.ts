import { APP_QUERY_KEYS } from '@/constants/queryKeys';
import { getAccessToken, refreshAccessToken, removeAccessToken } from '@/features/auth/api/auth';
import { queryClient } from '@/services/queryClient';
import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { jwtDecode } from 'jwt-decode';

export const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
});

type Decoded = { exp?: number };
const timeBuffer = 60;
const getNowSeconds = () => Math.floor(Date.now() / 1000);

const isTokenExpiring = (token: string | null): boolean => {
  if (!token) return true;

  try {
    const decoded = jwtDecode<Decoded>(token);
    if (!decoded.exp) return false;
    return decoded.exp <= getNowSeconds() + timeBuffer;
  } catch {
    return true;
  }
};

let refreshPromise: Promise<string | null> | null = null;

export const runRefresh = (refreshFn: () => Promise<string | null>) => {
  if (!refreshPromise) {
    refreshPromise = refreshFn().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    let token = getAccessToken();

    if (isTokenExpiring(token)) {
      token = await runRefresh(refreshAccessToken);
    }

    if (token) {
      const headers = AxiosHeaders.from(config.headers ?? {});
      headers.set('Authorization', `Bearer ${token}`);
      config.headers = headers;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await runRefresh(refreshAccessToken);
        if (newToken) {
          const headers = AxiosHeaders.from(originalRequest.headers ?? {});
          headers.set('Authorization', `Bearer ${newToken}`);
          originalRequest.headers = headers;
          return apiClient(originalRequest);
        }
      } catch {
        // fall through
      }

      removeAccessToken();
      queryClient.setQueryData(APP_QUERY_KEYS.auth.me, null);
      queryClient.removeQueries({ queryKey: APP_QUERY_KEYS.auth.me });
    }
    return Promise.reject(error);
  },
);
