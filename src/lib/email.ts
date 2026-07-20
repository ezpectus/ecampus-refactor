import nodemailer from 'nodemailer';

import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

const mailLogger = logger.createScoped('mail');

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!env.SMTP_HOST || !env.SMTP_USER) {
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }
  return transporter;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<boolean> {
  const transport = getTransporter();
  if (!transport) {
    mailLogger.warn('SMTP not configured, skipping email', { to: opts.to, subject: opts.subject });
    return false;
  }

  try {
    await transport.sendMail({
      from: env.SMTP_FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });
    mailLogger.info('Email sent', { to: opts.to, subject: opts.subject });
    return true;
  } catch (error) {
    mailLogger.error('Failed to send email', { to: opts.to, subject: opts.subject, error: String(error) });
    return false;
  }
}

export function isEmailConfigured(): boolean {
  return !!env.SMTP_HOST && !!env.SMTP_USER;
}
