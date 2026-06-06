const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Broadcast = require('../models/Broadcast');
const Contact = require('../models/Contact');
const Conversation = require('../models/Conversation');
const { authenticate } = require('../middleware/auth');
const { success, error } = require('../utils/responseHelper');

const getDateRange = (period) => {
  const now = new Date();
  const start = new Date();
  switch (period) {
    case '7d': start.setDate(now.getDate() - 7); break;
    case '30d': start.setDate(now.getDate() - 30); break;
    case '90d': start.setDate(now.getDate() - 90); break;
    default: start.setDate(now.getDate() - 30);
  }
  return { start, end: now };
};

// GET /api/analytics/overview
router.get('/overview', authenticate, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const { start, end } = getDateRange(period);
    const userId = req.user._id;

    const [
      totalContacts,
      newContacts,
      totalConversations,
      openConversations,
      totalMessages,
      outboundMessages,
      inboundMessages,
      broadcastStats,
    ] = await Promise.all([
      Contact.countDocuments({ userId }),
      Contact.countDocuments({ userId, createdAt: { $gte: start, $lte: end } }),
      Conversation.countDocuments({ userId }),
      Conversation.countDocuments({ userId, status: 'open' }),
      Message.countDocuments({ userId, createdAt: { $gte: start, $lte: end } }),
      Message.countDocuments({ userId, direction: 'outbound', createdAt: { $gte: start, $lte: end } }),
      Message.countDocuments({ userId, direction: 'inbound', createdAt: { $gte: start, $lte: end } }),
      Broadcast.aggregate([
        { $match: { userId, createdAt: { $gte: start, $lte: end } } },
        {
          $group: {
            _id: null,
            totalBroadcasts: { $sum: 1 },
            totalSent: { $sum: '$stats.sent' },
            totalDelivered: { $sum: '$stats.delivered' },
            totalRead: { $sum: '$stats.read' },
            totalFailed: { $sum: '$stats.failed' },
          },
        },
      ]),
    ]);

    const bs = broadcastStats[0] || {};

    return success(res, {
      contacts: { total: totalContacts, new: newContacts },
      conversations: { total: totalConversations, open: openConversations },
      messages: { total: totalMessages, outbound: outboundMessages, inbound: inboundMessages },
      broadcasts: {
        total: bs.totalBroadcasts || 0,
        sent: bs.totalSent || 0,
        delivered: bs.totalDelivered || 0,
        read: bs.totalRead || 0,
        failed: bs.totalFailed || 0,
        deliveryRate: bs.totalSent > 0 ? Math.round((bs.totalDelivered / bs.totalSent) * 100) : 0,
        readRate: bs.totalDelivered > 0 ? Math.round((bs.totalRead / bs.totalDelivered) * 100) : 0,
      },
    });
  } catch (err) {
    console.error('Analytics overview error:', err);
    return error(res, 'Failed to fetch analytics', 500);
  }
});

// GET /api/analytics/messages-chart
router.get('/messages-chart', authenticate, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const { start } = getDateRange(period);

    const data = await Message.aggregate([
      {
        $match: {
          userId: req.user._id,
          createdAt: { $gte: start },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            direction: '$direction',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.date': 1 } },
    ]);

    // Transform to chart format
    const chartMap = {};
    data.forEach(({ _id, count }) => {
      if (!chartMap[_id.date]) chartMap[_id.date] = { date: _id.date, inbound: 0, outbound: 0 };
      chartMap[_id.date][_id.direction] = count;
    });

    return success(res, { chart: Object.values(chartMap) });
  } catch (err) {
    return error(res, 'Failed to fetch chart data', 500);
  }
});

// GET /api/analytics/contacts-growth
router.get('/contacts-growth', authenticate, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    const { start } = getDateRange(period);

    const data = await Contact.aggregate([
      {
        $match: { userId: req.user._id, createdAt: { $gte: start } },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return success(res, { chart: data.map((d) => ({ date: d._id, count: d.count })) });
  } catch (err) {
    return error(res, 'Failed to fetch growth data', 500);
  }
});

// GET /api/analytics/broadcast-performance
router.get('/broadcast-performance', authenticate, async (req, res) => {
  try {
    const broadcasts = await Broadcast.find({ userId: req.user._id, status: 'completed' })
      .sort({ completedAt: -1 })
      .limit(10)
      .select('name stats completedAt');

    return success(res, { broadcasts });
  } catch (err) {
    return error(res, 'Failed to fetch broadcast performance', 500);
  }
});

// GET /api/analytics/top-tags
router.get('/top-tags', authenticate, async (req, res) => {
  try {
    const data = await Contact.aggregate([
      { $match: { userId: req.user._id } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    return success(res, { tags: data.map((d) => ({ tag: d._id, count: d.count })) });
  } catch (err) {
    return error(res, 'Failed to fetch tag analytics', 500);
  }
});

module.exports = router;
