import { Queues } from './queues.js';
import { bullmqConnection } from './config.js';
import { Worker } from 'bullmq';
import { mailService } from '../mail/mail.service.js';

export enum EmailJobType {
  WELCOME_EMAIL = 'welcome_email',
  PASSWORD_RESET_EMAIL = 'password_reset_email',
  EMAIL_VERIFICATION_EMAIL = 'email_verification_email',
}

export const emailWorker = new Worker(
  Queues.EMAIL_QUEUE,
  async (job) => {
    switch (job.name) {
      case EmailJobType.WELCOME_EMAIL:
        await mailService.sendWelcomeEmail(job.data);
        break;
      case EmailJobType.PASSWORD_RESET_EMAIL:
        await mailService.sendPasswordResetEmail(job.data);
        break;
      case EmailJobType.EMAIL_VERIFICATION_EMAIL:
        await mailService.sendVerificationEmail(job.data);
        break;
      default:
        console.error(`Unknown job type: ${job.name}`);
    }
  },
  { connection: bullmqConnection },
);

emailWorker.on('completed', (job) => {
  console.info(`[EMAIL] Completed job=${job.id} type=${job.name}`);
});

emailWorker.on('failed', (job, error) => {
  console.error(
    `[EMAIL] Failed job=${job?.id} type=${job?.name} attempts=${job?.attemptsMade}`,
    error,
  );
});
