const mongoose = require('mongoose');

const segmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['static', 'dynamic'], default: 'static' },
    filters: [
      {
        field: String,
        operator: { type: String, enum: ['equals', 'not_equals', 'contains', 'not_contains', 'exists', 'not_exists'] },
        value: String,
      },
    ],
    contactCount: { type: Number, default: 0 },
    color: { type: String, default: '#7B2FBE' },
  },
  { timestamps: true }
);

segmentSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Segment', segmentSchema);
