import { Queue } from 'bullmq';
import { bullmqConnection } from './config.js';

export const Queues = {
  EMAIL_QUEUE: 'email-queue',
};

export const emailQueue = new Queue(Queues.EMAIL_QUEUE, {
  connection: bullmqConnection,
  defaultJobOptions: {
    removeOnComplete: {
      age: 60 * 60, //in sec
    },
    removeOnFail: {
      age: 24 * 60 * 60,
    },
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});
