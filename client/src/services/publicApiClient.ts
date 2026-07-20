import { config } from '@/lib/config';
import axios from 'axios';

export const publicApiClient = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
});
