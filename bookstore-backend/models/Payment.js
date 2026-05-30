const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId:         { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  paymentIntentId: { type: String },
  amount:          { type: Number, required: true },
  currency:        { type: String, default: 'kes' },
  status:          { type: String, enum: ['Pending','Succeeded','Failed'], default: 'Pending' },
  transactionDate: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Payment', paymentSchema);
