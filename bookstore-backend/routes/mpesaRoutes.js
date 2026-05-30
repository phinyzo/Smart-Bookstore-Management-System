const express   = require('express');
const router    = express.Router();
const {
  payOrder,
  payLicense,
  checkStatus,
  handleCallback,
  getPaymentHistory,
  getAllTransactions,
} = require('../controllers/mpesaController');
const protect   = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');

// Public — Lipia Online callback (must be accessible without auth)
router.post('/callback', handleCallback);

// Protected — customer routes
router.post('/pay-order',   protect, payOrder);
router.post('/pay-license', protect, payLicense);
router.get('/status/:reference', protect, checkStatus);
router.get('/history',      protect, getPaymentHistory);

// Admin only
router.get('/admin/transactions', protect, adminOnly, getAllTransactions);

module.exports = router;
