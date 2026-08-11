import { Redis } from 'ioredis';
import { config } from '../config/config.js';

export const bullmqConnection = new Redis(config.redisUrl, { maxRetriesPerRequest: null });
