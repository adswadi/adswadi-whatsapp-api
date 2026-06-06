const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const { success, error } = require('../utils/responseHelper');
const { sendInviteEmail } = require('../services/emailService');

// GET /api/team
router.get('/', authenticate, async (req, res) => {
  try {
    const owner = req.user.role === 'owner' ? req.user._id : req.user.organizationId;
    const members = await User.find({
      $or: [{ _id: owner }, { organizationId: owner }],
    }).select('name email role avatar isActive lastLogin createdAt');

    return success(res, { members });
  } catch (err) {
    return error(res, 'Failed to fetch team', 500);
  }
});

// POST /api/team/invite
router.post('/invite', authenticate, authorize('owner', 'admin'), async (req, res) => {
  try {
    const { email, role = 'agent' } = req.body;
    if (!email) return error(res, 'Email required', 400);

    const existing = await User.findOne({ email });
    if (existing) return error(res, 'User already exists', 409);

    const inviteToken = crypto.randomBytes(32).toString('hex');
    const orgId = req.user.role === 'owner' ? req.user._id : req.user.organizationId;

    const invitedUser = await User.create({
      name: email.split('@')[0],
      email,
      password: crypto.randomBytes(16).toString('hex'), // temp password
      role,
      organizationId: orgId,
      inviteToken,
      invitedBy: req.user._id,
      isActive: false,
    });

    await User.findByIdAndUpdate(orgId, { $addToSet: { teamMembers: invitedUser._id } });

    try {
      await sendInviteEmail(email, req.user.name, inviteToken, req.user.organizationName || req.user.name + "'s Team");
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
    }

    return success(res, { message: 'Invite sent', inviteToken }, 'Invitation sent', 201);
  } catch (err) {
    console.error('Invite error:', err);
    return error(res, 'Failed to send invite', 500);
  }
});

// PUT /api/team/:id
router.put('/:id', authenticate, authorize('owner', 'admin'), async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const updates = {};
    if (role) updates.role = role;
    if (isActive !== undefined) updates.isActive = isActive;

    const member = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!member) return error(res, 'Member not found', 404);
    return success(res, { member });
  } catch (err) {
    return error(res, 'Failed to update member', 500);
  }
});

// DELETE /api/team/:id
router.delete('/:id', authenticate, authorize('owner'), async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return error(res, 'Cannot remove yourself', 400);
    }

    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    const orgId = req.user.role === 'owner' ? req.user._id : req.user.organizationId;
    await User.findByIdAndUpdate(orgId, { $pull: { teamMembers: req.params.id } });

    return success(res, {}, 'Member removed');
  } catch (err) {
    return error(res, 'Failed to remove member', 500);
  }
});

module.exports = router;
