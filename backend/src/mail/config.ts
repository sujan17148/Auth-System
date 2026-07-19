import nodemailer from 'nodemailer';
import { config } from '../config/config.js';

export const transporter = nodemailer.createTransport({
  host: config.smtpHost,
  port: config.smtpPort,
  secure: Number(config.smtpPort) === 465, // use STARTTLS (upgrade connection to TLS after connecting)
  auth: {
    user: config.smtpUser,
    pass: config.smtpPassword,
  },
});

export const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('Server is ready to take our messages');
  } catch (err) {
    console.error('Verification failed:', err);
  }
};

interface SendEmailPayload {
  to: string;
  subject: string;
  text?: string;
  html: string;
}

export const sendEmail = async ({ to, subject, text, html }: SendEmailPayload) => {
  try {
    const info = await transporter.sendMail({
      from: `"Auth System" <${config.smtpUser}>`, // sender address
      to,
      subject,
      ...(text && { text }),
      html,
    });

    console.log('Message sent: %s', info.messageId);
    // Preview URL is only available when using an Ethereal test account
    // console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.error('Error while sending mail:', err);
  }
};


