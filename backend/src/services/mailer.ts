import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: Number(process.env.SMTP_PORT) || 2525,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  if (!process.env.SMTP_USER) {
    console.log(`[MAIL] SMTP not configured. Log for ${to}: ${subject} - ${text}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: '"CuraVet" <noreply@curavet.com>',
      to,
      subject,
      text,
      html,
    });
    console.log(`[MAIL] Email sent to ${to}`);
  } catch (error) {
    console.error(`[MAIL] Failed to send email to ${to}:`, error);
  }
};
