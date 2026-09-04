const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { success, error } = require('../utils/responseHelper');
const { validatePassword } = require('../utils/validators');
const { CLIENT_URL } = require('../config/clientUrl');
const { sendWelcomeEmail, sendInviteEmail, sendPasswordResetEmail, sendOtpEmail } = require('../services/emailService');

const OTP_EXPIRY_MS = 10 * 60 * 1000;

const generateAndSendOtp = async (user) => {
  const otp = crypto.randomInt(100000, 999999).toString();
  user.emailOtp = crypto.createHash('sha256').update(otp).digest('hex');
  user.emailOtpExpires = new Date(Date.now() + OTP_EXPIRY_MS);
  await user.save();
  await sendOtpEmail(user.email, user.name, otp);
};

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '15m',
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES || '7d',
  });
  return { accessToken, refreshToken };
};

// POST /api/auth/register — creates the account but withholds login tokens
// until the email is verified via /verify-email below.
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, organizationName } = req.body;

    if (!name || !email || !password) {
      return error(res, 'Name, email, and password are required', 400);
    }
    const passwordError = validatePassword(password);
    if (passwordError) return error(res, passwordError, 400);

    const existing = await User.findOne({ email });
    if (existing) return error(res, 'Email already registered', 409);

    const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const user = await User.create({ name, email, password, organizationName: organizationName || name + "'s Team", trialEndsAt });

    // The account now exists regardless of what happens next — if the email
    // provider hiccups here, failing the whole request would report
    // "Registration failed" for an account that was, in fact, created,
    // while leaving the user with no way to retry except a confusing
    // "Email already registered" on their next attempt. Log it and let them
    // continue to the verify screen, where "Resend code" tries again.
    try {
      await generateAndSendOtp(user);
    } catch (otpErr) {
      console.error('OTP send failed during register (account created, verification pending):', otpErr?.response?.data || otpErr.message);
    }

    return success(res, { email: user.email }, 'Verification code sent to your email', 201);
  } catch (err) {
    console.error('Register error:', err);
    return error(res, 'Registration failed', 500);
  }
});

// POST /api/auth/verify-email — completes registration: checks the OTP,
// marks the account verified, and only now issues login tokens.
router.post('/verify-email', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return error(res, 'Email and verification code are required', 400);

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.emailOtp || !user.emailOtpExpires) {
      return error(res, 'Invalid or expired verification code', 400);
    }
    if (user.emailOtpExpires < new Date()) {
      return error(res, 'Verification code has expired. Request a new one.', 400);
    }
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
    if (hashedOtp !== user.emailOtp) {
      return error(res, 'Incorrect verification code', 400);
    }

    user.isEmailVerified = true;
    user.emailOtp = null;
    user.emailOtpExpires = null;

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    sendWelcomeEmail(user.email, user.name).catch(() => {});

    return success(res, { user, accessToken, refreshToken }, 'Email verified');
  } catch (err) {
    console.error('Verify email error:', err);
    return error(res, 'Failed to verify email', 500);
  }
});

// POST /api/auth/resend-otp
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return error(res, 'Email is required', 400);

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return error(res, 'No pending signup found for this email', 404);
    if (user.isEmailVerified) return error(res, 'This email is already verified — please log in', 400);

    // A code issued less than a minute ago is still fresh — resending
    // immediately would just let someone spam the inbox (and Resend's API).
    const issuedAt = user.emailOtpExpires ? new Date(user.emailOtpExpires.getTime() - OTP_EXPIRY_MS) : null;
    if (issuedAt && Date.now() - issuedAt.getTime() < 60 * 1000) {
      return error(res, 'Please wait a minute before requesting another code', 429);
    }

    await generateAndSendOtp(user);
    return success(res, {}, 'Verification code resent');
  } catch (err) {
    console.error('Resend OTP error:', err);
    return error(res, 'Failed to resend code', 500);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return error(res, 'Email and password required', 400);

    const user = await User.findOne({ email });
    if (!user) return error(res, 'Invalid credentials', 401);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return error(res, 'Invalid credentials', 401);

    if (!user.isActive) return error(res, 'Account deactivated', 403);

    // Accounts created before the trial system existed have no trialEndsAt —
    // give them a one-time grace window instead of locking them out immediately.
    if (!user.trialEndsAt && !user.organizationId) {
      user.trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
    const adminEmails = (process.env.PLATFORM_ADMIN_EMAILS || 'adswadiofficial@gmail.com').split(',').map((e) => e.trim().toLowerCase());
    if (!user.isPlatformAdmin && adminEmails.includes(user.email.toLowerCase())) {
      user.isPlatformAdmin = true;
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    return success(res, { user, accessToken, refreshToken }, 'Login successful');
  } catch (err) {
    console.error('Login error:', err);
    return error(res, 'Login failed', 500);
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return error(res, 'Email is required', 400);

    const user = await User.findOne({ email });
    // Always respond the same way whether or not the email exists, so this
    // endpoint can't be used to check which emails are registered.
    if (!user) return success(res, {}, 'If that email is registered, a reset link has been sent');

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    await User.findByIdAndUpdate(user._id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000),
    });

    const resetUrl = `${CLIENT_URL}/reset-password?token=${rawToken}`;
    sendPasswordResetEmail(email, user.name, resetUrl).catch(() => {});

    return success(res, {}, 'If that email is registered, a reset link has been sent');
  } catch (err) {
    console.error('Forgot password error:', err);
    return error(res, 'Failed to process request', 500);
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return error(res, 'Token and new password are required', 400);
    const passwordError = validatePassword(password);
    if (passwordError) return error(res, passwordError, 400);

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) return error(res, 'Invalid or expired reset link', 400);

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.refreshToken = null; // force re-login everywhere
    await user.save();

    return success(res, {}, 'Password reset successfully. Please log in.');
  } catch (err) {
    console.error('Reset password error:', err);
    return error(res, 'Failed to reset password', 500);
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return error(res, 'Refresh token required', 400);

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return error(res, 'Invalid refresh token', 401);
    }

    // Don't rotate the refresh token here — the user has several tabs open
    // at once, and rotating on every refresh invalidates every other tab's
    // copy the moment one of them refreshes, logging the rest out early.
    // Just issue a fresh access token; the refresh token still expires and
    // gets replaced normally on next login.
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '15m',
    });

    return success(res, { accessToken, refreshToken });
  } catch (err) {
    return error(res, 'Invalid or expired refresh token', 401);
  }
});

// POST /api/auth/logout
router.post('/logout', authenticate, async (req, res) => {
  try {
    req.user.refreshToken = null;
    await req.user.save();
    return success(res, {}, 'Logged out successfully');
  } catch (err) {
    return error(res, 'Logout failed', 500);
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  return success(res, { user: req.user });
});

// PUT /api/auth/profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, organizationName, settings, avatar } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (organizationName) updates.organizationName = organizationName;
    if (settings) updates.settings = { ...req.user.settings, ...settings };
    if (avatar) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    return success(res, { user });
  } catch (err) {
    return error(res, 'Profile update failed', 500);
  }
});

// PUT /api/auth/change-password
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return error(res, 'Current password incorrect', 400);

    const passwordError = validatePassword(newPassword);
    if (passwordError) return error(res, passwordError, 400);

    user.password = newPassword;
    await user.save();

    return success(res, {}, 'Password changed successfully');
  } catch (err) {
    return error(res, 'Password change failed', 500);
  }
});

// POST /api/auth/complete-onboarding
router.post('/complete-onboarding', authenticate, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { onboardingCompleted: true });
    return success(res, {}, 'Onboarding completed');
  } catch (err) {
    return error(res, 'Failed to complete onboarding', 500);
  }
});

// POST /api/auth/accept-invite
router.post('/accept-invite', async (req, res) => {
  try {
    const { token, name, password } = req.body;
    const user = await User.findOne({ inviteToken: token, isRemoved: { $ne: true } });
    if (!user) return error(res, 'Invalid or expired invite token', 400);

    const passwordError = validatePassword(password);
    if (passwordError) return error(res, passwordError, 400);

    user.name = name;
    user.password = password;
    user.inviteToken = null;
    user.isActive = true;
    // The organization-setup wizard (business name, connect WhatsApp, invite
    // team) is for the owner who created the org — an invited agent is
    // joining one that's already set up and shouldn't be routed through it.
    user.onboardingCompleted = true;
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    return success(res, { user, accessToken, refreshToken }, 'Account activated');
  } catch (err) {
    return error(res, 'Failed to accept invite', 500);
  }
});

module.exports = router;
