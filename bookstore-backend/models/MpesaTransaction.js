const mongoose = require('mongoose');

/**
 * MpesaTransaction Model
 * Logs all M-Pesa STK Push transactions via Lipia Online.
 * Used for payment history, replay protection, and audit trail.
 */
const mpesaTransactionSchema = new mongoose.Schema({
  // Reference from Lipia Online
  transactionReference: {
    type: String,
    unique: true,
    sparse: true,
  },

  // M-Pesa receipt number (populated on success)
  mpesaReceiptNumber: { type: String },

  // Linked entities
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },

  // Payment details
  phoneNumber:       { type: String, required: true },
  amount:            { type: Number, required: true },
  currency:          { type: String, default: 'KES' },
  externalReference: { type: String }, // our order/license ref

  // Purpose of payment
  paymentPurpose: {
    type: String,
    enum: ['order', 'license_one_time', 'license_monthly', 'license_annual'],
    default: 'order',
  },

  // Status
  status: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'],
    default: 'PENDING',
  },

  // Raw callback payload (for audit)
  callbackPayload: { type: mongoose.Schema.Types.Mixed },

  // Replay protection — track processed callbacks
  callbackProcessed: { type: Boolean, default: false },

  // Timestamps
  initiatedAt:  { type: Date, default: Date.now },
  completedAt:  { type: Date },

}, { timestamps: true });

// Index for fast lookup by reference
mpesaTransactionSchema.index({ transactionReference: 1 });
mpesaTransactionSchema.index({ userId: 1, createdAt: -1 });
mpesaTransactionSchema.index({ status: 1 });

module.exports = mongoose.model('MpesaTransaction', mpesaTransactionSchema);
