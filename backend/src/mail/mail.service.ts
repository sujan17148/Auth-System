import { sendEmail } from './config.js';
import { passwordResetEmailTemplate } from './templates/password-reset-email.js';
import { verificationEmailTemplate } from './templates/verification-email.js';

interface ISendEmail {
  email: string;
  firstName: string;
  otp: string;
}

export interface IMailService {
  sendVerificationEmail(data: ISendEmail): Promise<void>;
  sendPasswordResetEmail(data: ISendEmail): Promise<void>;
}

class MailService implements IMailService {
  async sendVerificationEmail(data: ISendEmail): Promise<void> {
    await sendEmail({
      to: data.email,
      subject: 'Verify your email',
      text: `Your verification code is ${data.otp}. It expires in 2 minutes.`,
      html: verificationEmailTemplate(data.firstName, data.otp),
    });
  }

  async sendPasswordResetEmail(data: ISendEmail): Promise<void> {
    await sendEmail({
      to: data.email,
      subject: 'Reset your password',
      text: `Your password reset code is ${data.otp}. It expires in 2 minutes.`,
      html: passwordResetEmailTemplate(data.firstName, data.otp),
    });
  }
}

export const mailService = new MailService();
