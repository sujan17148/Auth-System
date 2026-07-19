import axios from 'axios';

export const publicApiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
});
