import { sendEmail } from './config.js';
import { passwordResetEmailTemplate } from './templates/password-reset-email.js';
import { verificationEmailTemplate } from './templates/verification-email.js';
import { welcomeEmailTemplate } from './templates/welcome-email.js';

export interface ISendVerifyEmail {
  email: string;
  firstName: string;
  otp: string;
}

export interface ISendPasswordResetEmail {
  email: string;
  firstName: string;
  resetLink: string;
}

export interface ISendWelcomeEmail {
  email: string;
  firstName: string;
}

export interface IMailService {
  sendVerificationEmail(data: ISendVerifyEmail): Promise<void>;
  sendPasswordResetEmail(data: ISendPasswordResetEmail): Promise<void>;
  sendWelcomeEmail(data: ISendWelcomeEmail): Promise<void>;
}

class MailService implements IMailService {
  async sendVerificationEmail(data: ISendVerifyEmail): Promise<void> {
    await sendEmail({
      to: data.email,
      subject: 'Verify your email',
      text: `Your verification code is ${data.otp}. It expires in 2 minutes.`,
      html: verificationEmailTemplate(data.firstName, data.otp),
    });
  }

  async sendPasswordResetEmail(data: ISendPasswordResetEmail): Promise<void> {
    await sendEmail({
      to: data.email,
      subject: 'Reset your password',
      text: `Reset your password by visiting the following link:\n\n${data.resetLink}\n\nThis link expires in 5 minutes. If you didn't request a password reset, you can safely ignore this email.`,
      html: passwordResetEmailTemplate(data.firstName, data.resetLink),
    });
  }

  async sendWelcomeEmail(data: ISendWelcomeEmail): Promise<void> {
    await sendEmail({
      to: data.email,
      subject: 'Welcome to Auth System',
      text: `Welcome to Auth System!

Hello ${data.firstName},

Your account has been successfully created.

You can now sign in and start using Auth System.

Thank you for joining us—we're excited to have you on board!

Best regards,
The Auth System Team`,
      html: welcomeEmailTemplate(data.firstName),
    });
  }
}

export const mailService = new MailService();
