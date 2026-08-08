import { Redis } from 'ioredis';
import { config } from './config.js';

export const redisClient = new Redis(config.redisUrl);
