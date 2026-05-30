const mongoose = require('mongoose');

/**
 * License Model
 * Tracks trial periods, paid licenses, and subscription status per user.
 * Survives restarts, reboots, and updates — persisted in MongoDB.
 */
const licenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },

  // License type
  licenseType: {
    type: String,
    enum: ['trial', 'one_time', 'monthly', 'annual'],
    default: 'trial',
  },

  // License status
  status: {
    type: String,
    enum: ['active', 'expired', 'suspended'],
    default: 'active',
  },

  // Trial tracking
  trialStartDate: {
    type: Date,
    default: Date.now,
  },
  trialEndDate: {
    type: Date,
    default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
  },
  trialUsed: {
    type: Boolean,
    default: true,
  },

  // Paid license tracking
  activatedAt:  { type: Date },
  expiresAt:    { type: Date }, // null = lifetime (one_time)
  renewedAt:    { type: Date },

  // Payment reference
  lastPaymentReference: { type: String },
  lastPaymentAmount:    { type: Number },
  lastPaymentDate:      { type: Date },

  // M-Pesa receipt
  mpesaReceiptNumber: { type: String },

  // License key (generated on activation)
  licenseKey: { type: String },

}, { timestamps: true });

// ── Virtual: is trial still valid ────────────────────────────
licenseSchema.virtual('isTrialActive').get(function () {
  if (this.licenseType !== 'trial') return false;
  return this.status === 'active' && new Date() < this.trialEndDate;
});

// ── Virtual: is paid license valid ───────────────────────────
licenseSchema.virtual('isPaidActive').get(function () {
  if (this.licenseType === 'trial') return false;
  if (this.status !== 'active') return false;
  if (this.licenseType === 'one_time') return true; // lifetime
  return this.expiresAt && new Date() < this.expiresAt;
});

// ── Virtual: days remaining in trial ─────────────────────────
licenseSchema.virtual('trialDaysRemaining').get(function () {
  if (this.licenseType !== 'trial') return 0;
  const diff = this.trialEndDate - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
});

module.exports = mongoose.model('License', licenseSchema);
