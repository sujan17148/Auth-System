export interface ApiResponse<T> {
  message: string;
  data: T;
}

export const mapApiResponse = <T>(response: ApiResponse<T>): T => {
  if (!response?.data) throw new Error('Invalid API response');
  return response.data;
};

export interface RawPaginatedResponse<T> {
  message: string;
  data: {
    results: T[];
    count: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const mapPaginatedResponse = <T>(
  response: RawPaginatedResponse<T>,
): PaginatedResponse<T> => {
  if (
    !response ||
    typeof response !== 'object' ||
    !response.data ||
    !Array.isArray(response.data.results)
  ) {
    throw new Error('Invalid paginated API response format');
  }

  return {
    results: response.data.results ?? [],
    count: response.data.count ?? 0,
    hasNext: response.data.hasNext ?? false,
    hasPrevious: response.data.hasPrevious ?? false,
  };
};
