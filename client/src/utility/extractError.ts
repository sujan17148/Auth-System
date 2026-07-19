import { isAxiosError } from 'axios';

export const extractError = (error: unknown): string => {
  if (isAxiosError(error)) {
    const payload = error.response?.data;
    if (payload && typeof payload === 'object') {
      if (typeof (payload as { message?: unknown }).message === 'string') {
        return (payload as { message: string }).message;
      }
      const [firstKey] = Object.keys(payload);
      if (firstKey) {
        const value = (payload as Record<string, unknown>)[firstKey];
        if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
        if (typeof value === 'string') return value;
      }
    }
    if (error.message) return error.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return 'An unexpected error occurred.';
};
