// lib/email.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || "onboarding@resend.dev";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const APP_NAME = "NovelTracker";

export async function sendVerificationEmail(
  email: string,
  token: string,
  username: string
) {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: `${APP_NAME} <${FROM_EMAIL}>`,
    to: email,
    subject: `${APP_NAME} — Verify Your Email`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #0a0a0f; color: #e5e5e5; padding: 40px; border-radius: 12px;">
        <h1 style="color: #3b82f6; margin-bottom: 8px;">📚 ${APP_NAME}</h1>
        <h2 style="margin-top: 0;">Welcome, ${username}!</h2>
        <p style="color: #9ca3af; line-height: 1.6;">
          Thanks for signing up. Please verify your email address to activate your account.
        </p>
        <a href="${verifyUrl}" 
           style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; 
                  border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">
          Verify Email
        </a>
        <p style="color: #6b7280; font-size: 14px;">
          Or copy this link: <br/>
          <span style="color: #9ca3af;">${verifyUrl}</span>
        </p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          This link expires in 24 hours. If you didn't create an account, ignore this email.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  username: string
) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: `${APP_NAME} <${FROM_EMAIL}>`,
    to: email,
    subject: `${APP_NAME} — Reset Your Password`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #0a0a0f; color: #e5e5e5; padding: 40px; border-radius: 12px;">
        <h1 style="color: #3b82f6; margin-bottom: 8px;">📚 ${APP_NAME}</h1>
        <h2 style="margin-top: 0;">Password Reset</h2>
        <p style="color: #9ca3af; line-height: 1.6;">
          Hi ${username}, we received a request to reset your password.
        </p>
        <a href="${resetUrl}" 
           style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; 
                  border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0;">
          Reset Password
        </a>
        <p style="color: #6b7280; font-size: 14px;">
          Or copy this link: <br/>
          <span style="color: #9ca3af;">${resetUrl}</span>
        </p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          This link expires in 1 hour. If you didn't request this, ignore this email. Your password won't change.
        </p>
      </div>
    `,
  });
}