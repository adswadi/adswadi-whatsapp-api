const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { success, error } = require('../utils/responseHelper');
const { sendWelcomeEmail, sendInviteEmail } = require('../services/emailService');

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

    const user = await User.create({ name, email, password, organizationName: organizationName || name + "'s Team" });

    const { accessToken, refreshToken } = generateTokens(user._id);

    await User.findByIdAndUpdate(user._id, { refreshToken, lastLogin: new Date() });

    try { await sendWelcomeEmail(email, name); } catch (_) {}

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

    const { accessToken, refreshToken: newRefresh } = generateTokens(user._id);
    user.refreshToken = newRefresh;
    await user.save();

    return success(res, { accessToken, refreshToken: newRefresh });
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
