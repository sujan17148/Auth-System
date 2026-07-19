import { getAccessToken, removeAccessToken } from '@/features/auth/api/auth';
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

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && !isTokenExpiring(token)) {
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
    if (error.response?.status === 401) {
      removeAccessToken();
    }
    return Promise.reject(error);
  },
);
