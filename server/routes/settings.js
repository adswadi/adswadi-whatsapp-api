const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { upload, handleUpload } = require('../middleware/upload');
const { success, error } = require('../utils/responseHelper');

// GET /api/settings
router.get('/', authenticate, async (req, res) => {
  return success(res, { settings: req.user.settings, user: req.user });
});

// PUT /api/settings/notifications
router.put('/notifications', authenticate, async (req, res) => {
  try {
    const { notifications } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 'settings.notifications': { ...req.user.settings?.notifications, ...notifications } },
      { new: true }
    );
    return success(res, { settings: user.settings });
  } catch (err) {
    return error(res, 'Failed to update notifications', 500);
  }
});

// PUT /api/settings/general
router.put('/general', authenticate, async (req, res) => {
  try {
    const { timezone, language, autoAssign } = req.body;
    const updates = {};
    if (timezone) updates['settings.timezone'] = timezone;
    if (language) updates['settings.language'] = language;
    if (autoAssign !== undefined) updates['settings.autoAssign'] = autoAssign;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    return success(res, { settings: user.settings });
  } catch (err) {
    return error(res, 'Failed to update settings', 500);
  }
});

// POST /api/settings/avatar
router.post('/avatar', authenticate, upload.single('avatar'), handleUpload, async (req, res) => {
  try {
    if (!req.uploadedFile) return error(res, 'No file uploaded', 400);
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: req.uploadedFile.url }, { new: true });
    return success(res, { avatar: req.uploadedFile.url, user });
  } catch (err) {
    return error(res, 'Failed to upload avatar', 500);
  }
});

module.exports = router;
