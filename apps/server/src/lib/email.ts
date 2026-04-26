import nodemailer from "nodemailer";
import { env } from "./env";

const transport = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const sendPasswordResetEmail = async (
  to: string,
  resetToken: string,
  name: string,
): Promise<void> => {
  const resetLink = `${env.FRONTEND_URL}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(to)}`;
  const expiry = env.PASSWORD_RESET_EXPIRY_MINUTES;

  await transport.sendMail({
    from: env.SMTP_FROM,
    to,
    subject: "Reset your NexChat password",
    text: `Hi ${name},\n\nUse this link to reset your password:\n${resetLink}\n\nThis link expires in ${expiry} minutes.\n\nIf you did not request this, ignore this email.`,
    html: `<p>Hi ${name},</p><p>Use this link to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>This link expires in <strong>${expiry} minutes</strong>.</p><p>If you did not request this, ignore this email.</p>`,
  });
};
