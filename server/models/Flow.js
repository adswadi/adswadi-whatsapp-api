const mongoose = require('mongoose');

const flowSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: false },
    trigger: {
      type: {
        type: String,
        enum: ['keyword', 'first_message', 'opt_in', 'schedule', 'broadcast_reply', 'button_click'],
        required: true,
      },
      keywords: [{ type: String }],
      exactMatch: { type: Boolean, default: false },
      schedule: { type: String, default: null }, // cron
    },
    steps: [
      {
        id: { type: String, required: true },
        order: { type: Number, required: true },
        type: {
          type: String,
          enum: ['send_message', 'send_template', 'add_tag', 'remove_tag', 'assign_agent', 'wait', 'condition', 'webhook', 'end'],
          required: true,
        },
        config: { type: mongoose.Schema.Types.Mixed, default: {} },
        nextStepId: { type: String, default: null },
        branches: [
          {
            condition: String,
            nextStepId: String,
          },
        ],
      },
    ],
    stats: {
      triggered: { type: Number, default: 0 },
      completed: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
    },
    waAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'WhatsAppAccount', default: null },
  },
  { timestamps: true }
);

// The flow engine runs this query on every single inbound message.
flowSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('Flow', flowSchema);
