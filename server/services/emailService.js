const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const t = getTransporter();
    const info = await t.sendMail({
      from: `"Adswadi WhatsApp API" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text,
    });
    return info;
  } catch (err) {
    console.error('Email send error:', err.message);
    throw err;
  }
};

const sendInviteEmail = async (email, inviterName, inviteToken, organizationName) => {
  const inviteUrl = `${process.env.CLIENT_URL}/accept-invite?token=${inviteToken}`;

  await sendEmail({
    to: email,
    subject: `You're invited to join ${organizationName} on Adswadi WhatsApp API`,
    html: `
      <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(90deg, #7B2FBE, #4A6CF7, #E91E8C); padding: 3px; border-radius: 12px;">
          <div style="background: white; border-radius: 10px; padding: 40px;">
            <h1 style="color: #7B2FBE; font-size: 24px; margin-bottom: 8px;">You're Invited!</h1>
            <p style="color: #444; font-size: 16px; margin-bottom: 24px;">
              <strong>${inviterName}</strong> has invited you to join <strong>${organizationName}</strong> on Adswadi WhatsApp API.
            </p>
            <a href="${inviteUrl}"
               style="display: inline-block; background: linear-gradient(90deg, #7B2FBE, #4A6CF7); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Accept Invitation
            </a>
            <p style="color: #888; font-size: 13px; margin-top: 32px;">
              This invite link will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
        </div>
      </div>
    `,
    text: `You're invited to join ${organizationName}. Click here to accept: ${inviteUrl}`,
  });
};

const sendWelcomeEmail = async (email, name) => {
  await sendEmail({
    to: email,
    subject: 'Welcome to Adswadi WhatsApp API!',
    html: `
      <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #7B2FBE;">Welcome, ${name}! 🎉</h1>
        <p style="color: #444; font-size: 16px;">
          Your account is ready. Start growing your business with WhatsApp Marketing today.
        </p>
        <a href="${process.env.CLIENT_URL}/onboarding"
           style="display: inline-block; background: linear-gradient(90deg, #7B2FBE, #4A6CF7); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Get Started
        </a>
      </div>
    `,
    text: `Welcome ${name}! Visit ${process.env.CLIENT_URL}/onboarding to get started.`,
  });
};

module.exports = { sendEmail, sendInviteEmail, sendWelcomeEmail };
