import { redisClient } from '../config/redis.js';
import type { RateLimitResult, TokenBucketConfig } from './types.js';

const LUA_SCRIPT = `
local key = KEYS[1]

local max_tokens = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

local data = redis.call('HGETALL', key)

local tokens = max_tokens
local last_refill = now

if #data > 0 then
    local fields = {}

    for i = 1, #data, 2 do
        fields[data[i]] = data[i + 1]
    end

    tokens = tonumber(fields['tokens']) or max_tokens
    last_refill = tonumber(fields['last_refill']) or now
end

-- Refill based on elapsed time
local elapsed = now - last_refill

if elapsed > 0 then
    tokens = math.min(
        max_tokens,
        tokens + (elapsed * refill_rate)
    )
end

local allowed = 0
local remaining = tokens

if tokens >= 1 then
    tokens = tokens - 1
    remaining = tokens
    allowed = 1
end

redis.call(
    'HSET',
    key,
    'tokens',
    tostring(tokens),
    'last_refill',
    tostring(now)
)

redis.call(
    'EXPIRE',
    key,
    math.ceil(max_tokens / refill_rate) + 1
)

return {
    allowed,
    remaining
}
`;

export async function tokenBucketRateLimiter(
  key: string,
  config: TokenBucketConfig,
): Promise<RateLimitResult> {
  const { maxTokens, refillRate } = config;

  const now = Date.now() / 1000;

  const result = (await redisClient.eval(
    LUA_SCRIPT,
    1,
    key,
    maxTokens.toString(),
    refillRate.toString(),
    now.toString(),
  )) as [number, number];

  const allowed = result[0] === 1;
  const remaining = Math.floor(result[1]);

  return {
    allowed,
    remaining,
    limit: maxTokens,
  };
}
