export interface RateLimitResult {
  allowed: boolean; // was the request permitted?
  remaining: number; // how many requests are left in the current window/bucket
  limit: number; // the configured maximum
  delay?: number | null; // optional wait time (leaky bucket shaping mode)
}

export interface SlidingWindowConfig {
  maxRequests: number;
  windowSeconds: number;
}

export interface TokenBucketConfig {
  maxTokens: number;
  refillRate: number;
}
