const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { success, error } = require('../utils/responseHelper');
const { sendWelcomeEmail, sendInviteEmail, sendPasswordResetEmail } = require('../services/emailService');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES || '15m',
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES || '7d',
  });
  return { accessToken, refreshToken };
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, organizationName } = req.body;

    if (!name || !email || !password) {
      return error(res, 'Name, email, and password are required', 400);
    }

    const existing = await User.findOne({ email });
    if (existing) return error(res, 'Email already registered', 409);

    const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const user = await User.create({ name, email, password, organizationName: organizationName || name + "'s Team", trialEndsAt });

    const { accessToken, refreshToken } = generateTokens(user._id);

    await User.findByIdAndUpdate(user._id, { refreshToken, lastLogin: new Date() });

    sendWelcomeEmail(email, name).catch(() => {});

    return success(res, { user, accessToken, refreshToken }, 'Registration successful', 201);
  } catch (err) {
    console.error('Register error:', err);
    return error(res, 'Registration failed', 500);
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

    const resetUrl = `${process.env.CLIENT_URL || 'https://app.adswadi.com'}/reset-password?token=${rawToken}`;
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
    if (password.length < 6) return error(res, 'Password must be at least 6 characters', 400);

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
    const user = await User.findOne({ inviteToken: token });
    if (!user) return error(res, 'Invalid or expired invite token', 400);

    user.name = name;
    user.password = password;
    user.inviteToken = null;
    user.isActive = true;
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
