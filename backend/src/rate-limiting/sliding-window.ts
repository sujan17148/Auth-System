import { redisClient } from '../config/redis.js';
import type { RateLimitResult, SlidingWindowConfig } from './types.js';

const LUA_SCRIPT = `
local current_key = KEYS[1]
local previous_key = KEYS[2]

local max_requests = tonumber(ARGV[1])
local window_seconds = tonumber(ARGV[2])
local elapsed = tonumber(ARGV[3])

local prev_count = tonumber(redis.call('GET', previous_key) or '0')
local current_count = tonumber(redis.call('GET', current_key) or '0')

local weighted_prev = prev_count * (1 - elapsed)
local estimated = weighted_prev + current_count

if estimated >= max_requests then
    return { 0, 0, current_count }
end

local new_count = redis.call('INCR', current_key)

if new_count == 1 then
    redis.call('EXPIRE', current_key, window_seconds * 2)
end

local new_estimate = weighted_prev + new_count
local remaining = math.max(0, math.floor(max_requests - new_estimate))

return { 1, remaining, new_count }
`;

export async function slidingWindowCounter(
  key: string,
  config: SlidingWindowConfig,
): Promise<RateLimitResult> {
  const { maxRequests, windowSeconds } = config;

  const now = Math.floor(Date.now() / 1000);

  const currentWindow = Math.floor(now / windowSeconds);
  const previousWindow = currentWindow - 1;

  // Same hash tag ensures both keys go to the same Redis Cluster slot.
  const currentKey = `{${key}}:${currentWindow}`;
  const previousKey = `{${key}}:${previousWindow}`;

  const elapsed = (now % windowSeconds) / windowSeconds;

  const result = (await redisClient.eval(
    LUA_SCRIPT,
    2,
    currentKey,
    previousKey,
    maxRequests.toString(),
    windowSeconds.toString(),
    elapsed.toString(),
  )) as [number, number, number];

  const allowed = result[0] === 1;
  const remaining = result[1];

  return {
    allowed,
    remaining,
    limit: maxRequests,
  };
}
