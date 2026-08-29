const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['owner', 'admin', 'agent'], default: 'owner' },
    avatar: { type: String, default: null },
    plan: { type: String, enum: ['free', 'starter', 'growth', 'enterprise'], default: 'free' },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    organizationName: { type: String, default: '' },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    onboardingCompleted: { type: Boolean, default: false },
    onboardingStep: { type: Number, default: 0 },
    trialEndsAt: { type: Date, default: null },
    isPlatformAdmin: { type: Boolean, default: false },
    settings: {
      notifications: {
        email: { type: Boolean, default: true },
        browser: { type: Boolean, default: true },
        newMessage: { type: Boolean, default: true },
        broadcastComplete: { type: Boolean, default: true },
      },
      timezone: { type: String, default: 'Asia/Kolkata' },
      language: { type: String, default: 'en' },
      autoAssign: { type: Boolean, default: false },
    },
    lastLogin: { type: Date, default: null },
    refreshToken: { type: String, default: null },
    inviteToken: { type: String, default: null },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.inviteToken;
  delete obj.resetPasswordToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
