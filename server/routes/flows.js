const express = require('express');
const router = express.Router();
const Flow = require('../models/Flow');
const { authenticate } = require('../middleware/auth');
const { success, error } = require('../utils/responseHelper');

// GET /api/flows
router.get('/', authenticate, async (req, res) => {
  try {
    const flows = await Flow.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return success(res, { flows });
  } catch (err) {
    return error(res, 'Failed to fetch flows', 500);
  }
});

// GET /api/flows/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const flow = await Flow.findOne({ _id: req.params.id, userId: req.user._id });
    if (!flow) return error(res, 'Flow not found', 404);
    return success(res, { flow });
  } catch (err) {
    return error(res, 'Failed to fetch flow', 500);
  }
});

// POST /api/flows
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, trigger, steps, waAccountId } = req.body;
    if (!name || !trigger) return error(res, 'Name and trigger are required', 400);

    const flow = await Flow.create({
      userId: req.user._id,
      name,
      description,
      trigger,
      steps: steps || [],
      waAccountId: waAccountId || null,
    });

    return success(res, { flow }, 'Flow created', 201);
  } catch (err) {
    return error(res, 'Failed to create flow', 500);
  }
});

// PUT /api/flows/:id
router.put('/:id', authenticate, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.userId;
    delete updates.stats;

    const flow = await Flow.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true }
    );
    if (!flow) return error(res, 'Flow not found', 404);
    return success(res, { flow });
  } catch (err) {
    return error(res, 'Failed to update flow', 500);
  }
});

// PUT /api/flows/:id/toggle
router.put('/:id/toggle', authenticate, async (req, res) => {
  try {
    const flow = await Flow.findOne({ _id: req.params.id, userId: req.user._id });
    if (!flow) return error(res, 'Flow not found', 404);

    flow.isActive = !flow.isActive;
    await flow.save();

    return success(res, { flow, isActive: flow.isActive }, `Flow ${flow.isActive ? 'activated' : 'deactivated'}`);
  } catch (err) {
    return error(res, 'Failed to toggle flow', 500);
  }
});

// DELETE /api/flows/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const flow = await Flow.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!flow) return error(res, 'Flow not found', 404);
    return success(res, {}, 'Flow deleted');
  } catch (err) {
    return error(res, 'Failed to delete flow', 500);
  }
});

module.exports = router;
