const axios = require('axios');

// Railway blocks outbound SMTP (port 587), which made nodemailer time out on
// every send. Resend's API runs over plain HTTPS, so it isn't affected.
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const res = await axios.post(
      'https://api.resend.com/emails',
      {
        from: process.env.RESEND_FROM_EMAIL || 'Adswadi WhatsApp API <onboarding@resend.dev>',
        to,
        subject,
        html,
        text,
      },
      { headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` } }
    );
    return res.data;
  } catch (err) {
    console.error('Email send error:', err?.response?.data || err.message);
    throw err;
  }
};

const CLIENT_URL = process.env.CLIENT_URL || 'https://app.adswadi.com';

const sendInviteEmail = async (email, inviterName, inviteToken, organizationName) => {
  const inviteUrl = `${CLIENT_URL}/accept-invite?token=${inviteToken}`;

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
  try { await sendEmail({
    to: email,
    subject: 'Welcome to Adswadi WhatsApp API!',
    html: `
      <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #7B2FBE;">Welcome, ${name}! 🎉</h1>
        <p style="color: #444; font-size: 16px;">
          Your account is ready. Start growing your business with WhatsApp Marketing today.
        </p>
        <a href="${CLIENT_URL}/onboarding"
           style="display: inline-block; background: linear-gradient(90deg, #7B2FBE, #4A6CF7); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Get Started
        </a>
      </div>
    `,
    text: `Welcome ${name}! Visit ${CLIENT_URL}/onboarding to get started.`,
  }); } catch (_) {}
};

const sendPasswordResetEmail = async (email, name, resetUrl) => {
  await sendEmail({
    to: email,
    subject: 'Reset your Adswadi password',
    html: `
      <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(90deg, #7B2FBE, #4A6CF7, #E91E8C); padding: 3px; border-radius: 12px;">
          <div style="background: white; border-radius: 10px; padding: 40px;">
            <h1 style="color: #7B2FBE; font-size: 24px; margin-bottom: 8px;">Reset your password</h1>
            <p style="color: #444; font-size: 16px; margin-bottom: 24px;">
              Hi ${name}, we received a request to reset your Adswadi password. Click below to set a new one.
            </p>
            <a href="${resetUrl}"
               style="display: inline-block; background: linear-gradient(90deg, #7B2FBE, #4A6CF7); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Reset Password
            </a>
            <p style="color: #888; font-size: 13px; margin-top: 32px;">
              This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        </div>
      </div>
    `,
    text: `Reset your password: ${resetUrl} (expires in 1 hour)`,
  });
};

const sendOtpEmail = async (email, name, otp) => {
  await sendEmail({
    to: email,
    subject: `${otp} is your Adswadi verification code`,
    html: `
      <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(90deg, #7B2FBE, #4A6CF7, #E91E8C); padding: 3px; border-radius: 12px;">
          <div style="background: white; border-radius: 10px; padding: 40px; text-align: center;">
            <h1 style="color: #7B2FBE; font-size: 22px; margin-bottom: 8px;">Verify your email</h1>
            <p style="color: #444; font-size: 15px; margin-bottom: 24px;">
              Hi ${name}, enter this code to confirm ${email} is yours.
            </p>
            <div style="display: inline-block; background: #F5F0FF; border-radius: 12px; padding: 16px 32px; letter-spacing: 8px; font-size: 32px; font-weight: 800; color: #1A0A2E; font-family: monospace;">
              ${otp}
            </div>
            <p style="color: #888; font-size: 13px; margin-top: 24px;">
              This code expires in 10 minutes. If you didn't create an Adswadi account, you can safely ignore this email.
            </p>
          </div>
        </div>
      </div>
    `,
    text: `Your Adswadi verification code is ${otp}. It expires in 10 minutes.`,
  });
};

module.exports = { sendEmail, sendInviteEmail, sendWelcomeEmail, sendPasswordResetEmail, sendOtpEmail };
