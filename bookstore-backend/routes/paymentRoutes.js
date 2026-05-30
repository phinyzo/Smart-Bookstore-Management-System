const express = require('express');
const router  = express.Router();
const {
  createPaymentIntent,
  getPaymentByOrder,
} = require('../controllers/paymentController');
const protect = require('../middleware/authMiddleware');

// NOTE: The /webhook route is registered directly in server.js
// with express.raw() BEFORE express.json() — do NOT add it here.

// Protected routes
router.post('/create-intent',   protect, createPaymentIntent);
router.get('/order/:orderId',   protect, getPaymentByOrder);

module.exports = router;
