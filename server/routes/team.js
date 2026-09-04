const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');
const { success, error } = require('../utils/responseHelper');
const { sendInviteEmail } = require('../services/emailService');
const { getPlanLimits } = require('../config/planLimits');

// GET /api/team
router.get('/', authenticate, async (req, res) => {
  try {
    const ownerId = req.user.role === 'owner' ? req.user._id : req.user.organizationId;
    const ownerUser = req.user.role === 'owner' ? req.user : await User.findById(ownerId);

    const members = await User.find({
      $or: [{ _id: ownerId }, { organizationId: ownerId }],
      isRemoved: { $ne: true },
    }).select('name email role avatar isActive lastLogin createdAt');

    const limits = await getPlanLimits(ownerUser?.plan || 'free');

    return success(res, { members, seatLimit: limits.team_members, planName: ownerUser?.plan || 'free' });
  } catch (err) {
    return error(res, 'Failed to fetch team', 500);
  }
});

// POST /api/team/invite
router.post('/invite', authenticate, authorize('owner', 'admin'), async (req, res) => {
  try {
    const { email, role = 'agent' } = req.body;
    if (!email) return error(res, 'Email required', 400);

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return error(res, 'User already exists', 409);

    const orgId = req.user.role === 'owner' ? req.user._id : req.user.organizationId;
    // Billing (and the plan's seat count) lives on the organization owner,
    // not on whichever admin is sending this invite.
    const owner = req.user.role === 'owner' ? req.user : await User.findById(orgId);
    if (!owner) return error(res, 'Organization owner not found', 404);

    const limits = await getPlanLimits(owner.plan);
    if (limits.team_members !== -1) {
      // Counts pending invites too (they're created as real, inactive User
      // rows below) — otherwise sending 5 invites at once on a 3-seat plan
      // would blow past the limit before any of them were even accepted.
      // Removed members don't count, so removing someone actually frees a seat.
      const seatsUsed = await User.countDocuments({
        $or: [{ _id: orgId }, { organizationId: orgId }],
        isRemoved: { $ne: true },
      });
      if (seatsUsed >= limits.team_members) {
        return error(
          res,
          `Your ${owner.plan} plan includes ${limits.team_members} team seat${limits.team_members === 1 ? '' : 's'} (including you) — you're using all of them. Upgrade your plan to invite more.`,
          403
        );
      }
    }

    const inviteToken = crypto.randomBytes(32).toString('hex');

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

    // Only allow acting on a member of the caller's own organization —
    // without this, any owner/admin could pass another organization's user
    // id and modify or deactivate a completely unrelated customer's account.
    const orgId = req.user.role === 'owner' ? req.user._id : req.user.organizationId;
    const member = await User.findOneAndUpdate(
      { _id: req.params.id, organizationId: orgId },
      updates,
      { new: true }
    ).select('-password');
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

    const orgId = req.user.role === 'owner' ? req.user._id : req.user.organizationId;
    const member = await User.findOneAndUpdate(
      { _id: req.params.id, organizationId: orgId },
      { isActive: false, isRemoved: true }
    );
    if (!member) return error(res, 'Member not found', 404);
    await User.findByIdAndUpdate(orgId, { $pull: { teamMembers: req.params.id } });

    return success(res, {}, 'Member removed');
  } catch (err) {
    return error(res, 'Failed to remove member', 500);
  }
});

module.exports = router;
