// Resend email service integration
// Install: pnpm add resend react-email

import { Resend } from 'resend';
import { render } from '@react-email/render';
import { VerificationEmailTemplate, WelcomeEmailTemplate } from './templates';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@cubisacademy.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface SendVerificationEmailParams {
  to: string;
  userName: string;
  verificationCode: string;
}

export async function sendVerificationEmail({
  to,
  userName,
  verificationCode,
}: SendVerificationEmailParams) {
  try {
    // Render React component to HTML
    const html = await render(
      VerificationEmailTemplate({
        userName,
        verificationCode,
        expiresIn: '24 hours',
      })
    );

    const { data, error } = await resend.emails.send({
      from: `Cubis Academy <${FROM_EMAIL}>`,
      to,
      subject: 'Verify Your Email - Cubis Academy',
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error('Failed to send verification email');
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Send verification email error:', error);
    throw error;
  }
}

interface SendWelcomeEmailParams {
  to: string;
  userName: string;
  locale?: string;
}

export async function sendWelcomeEmail({
  to,
  userName,
  locale = 'km',
}: SendWelcomeEmailParams) {
  try {
    const dashboardUrl = `${APP_URL}/${locale}/student`;

    const html = await render(
      WelcomeEmailTemplate({
        userName,
        dashboardUrl,
      })
    );

    const { data, error } = await resend.emails.send({
      from: `Cubis Academy <${FROM_EMAIL}>`,
      to,
      subject: 'Welcome to Cubis Academy! 🎉',
      html,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error('Failed to send welcome email');
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('Send welcome email error:', error);
    throw error;
  }
}

// Helper to check if Resend is configured
export function isResendConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}
