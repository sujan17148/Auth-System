import axios from 'axios';

export const publicApiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
});
