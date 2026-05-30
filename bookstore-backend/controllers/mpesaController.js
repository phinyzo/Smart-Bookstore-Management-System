/**
 * M-Pesa Controller (Lipia Online)
 * Handles STK Push initiation, status checks, callbacks, and payment history.
 */

const lipiaService    = require('../services/lipiaService');
const licenseService  = require('../services/licenseService');
const MpesaTransaction = require('../models/MpesaTransaction');
const Order           = require('../models/Order');
const { sendOrderConfirmation } = require('../services/emailService');
const User            = require('../models/User');

// ── Build callback URL ────────────────────────────────────────
const getCallbackUrl = (req) => {
  const base = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
  return `${base}/api/mpesa/callback`;
};

// ── @desc    Initiate STK Push for an order ───────────────────
// ── @route   POST /api/mpesa/pay-order ───────────────────────
// ── @access  Private ─────────────────────────────────────────
exports.payOrder = async (req, res, next) => {
  try {
    const { orderId, phoneNumber } = req.body;

    if (!orderId || !phoneNumber) {
      return res.status(400).json({ message: 'orderId and phoneNumber are required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to pay for this order' });
    }

    if (order.paymentStatus === 'Paid') {
      return res.status(400).json({ message: 'Order is already paid' });
    }

    const result = await lipiaService.initiateStkPush({
      phoneNumber,
      amount:         order.totalPrice,
      externalRef:    orderId.toString(),
      callbackUrl:    getCallbackUrl(req),
      metadata:       { orderId: orderId.toString(), purpose: 'order_payment' },
      userId:         req.user._id,
      orderId,
      paymentPurpose: 'order',
    });

    res.status(200).json({
      success:              true,
      message:              'STK Push sent to your phone. Enter your M-Pesa PIN to complete payment.',
      transactionReference: result.transactionReference,
      amount:               order.totalPrice,
      currency:             'KES',
    });
  } catch (error) {
    console.error('[M-Pesa] payOrder error:', error.message);
    next(error);
  }
};

// ── @desc    Initiate STK Push for a license purchase ─────────
// ── @route   POST /api/mpesa/pay-license ─────────────────────
// ── @access  Private ─────────────────────────────────────────
exports.payLicense = async (req, res, next) => {
  try {
    const { licenseType, phoneNumber } = req.body;

    const validTypes = ['one_time', 'monthly', 'annual'];
    if (!validTypes.includes(licenseType)) {
      return res.status(400).json({
        message: `Invalid licenseType. Must be one of: ${validTypes.join(', ')}`,
      });
    }

    if (!phoneNumber) {
      return res.status(400).json({ message: 'phoneNumber is required' });
    }

    const amount = licenseService.PRICING[licenseType];
    const externalRef = `license-${licenseType}-${req.user._id}-${Date.now()}`;

    const result = await lipiaService.initiateStkPush({
      phoneNumber,
      amount,
      externalRef,
      callbackUrl:    getCallbackUrl(req),
      metadata:       { licenseType, userId: req.user._id.toString(), purpose: 'license_purchase' },
      userId:         req.user._id,
      paymentPurpose: `license_${licenseType}`,
    });

    res.status(200).json({
      success:              true,
      message:              `STK Push sent. Enter your M-Pesa PIN to activate your ${licenseType.replace('_', '-')} license.`,
      transactionReference: result.transactionReference,
      amount,
      currency:             'KES',
      licenseType,
    });
  } catch (error) {
    console.error('[M-Pesa] payLicense error:', error.message);
    next(error);
  }
};

// ── @desc    Check transaction status ─────────────────────────
// ── @route   GET /api/mpesa/status/:reference ─────────────────
// ── @access  Private ─────────────────────────────────────────
exports.checkStatus = async (req, res, next) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({ message: 'Transaction reference is required' });
    }

    const statusData = await lipiaService.checkTransactionStatus(reference);

    res.status(200).json({
      success: true,
      ...statusData,
    });
  } catch (error) {
    console.error('[M-Pesa] checkStatus error:', error.message);
    next(error);
  }
};

// ── @desc    Lipia Online callback webhook ────────────────────
// ── @route   POST /api/mpesa/callback ────────────────────────
// ── @access  Public (Lipia Online only) ──────────────────────
exports.handleCallback = async (req, res) => {
  // Always respond 200 immediately to acknowledge receipt
  res.status(200).send('ok');

  try {
    const payload = req.body;
    console.log('[M-Pesa Callback] Received:', JSON.stringify(payload));

    const result = await lipiaService.processCallback(payload);

    if (!result.processed) {
      console.log('[M-Pesa Callback] Skipped (duplicate or not found)');
      return;
    }

    const { isSuccess, orderId, userId, paymentPurpose, mpesaReceiptNumber, amount } = result;

    // ── Handle order payment ──────────────────────────────
    if (paymentPurpose === 'order' && orderId) {
      if (isSuccess) {
        await Order.findByIdAndUpdate(orderId, {
          paymentStatus: 'Paid',
          orderStatus:   'Confirmed',
        });

        // Send confirmation email
        if (userId) {
          const user = await User.findById(userId);
          const order = await Order.findById(orderId);
          if (user && order) {
            sendOrderConfirmation(user.email, order, userId).catch((err) =>
              console.error('[M-Pesa Callback] Email failed:', err.message)
            );
          }
        }

        console.log(`[M-Pesa Callback] Order ${orderId} marked as Paid. Receipt: ${mpesaReceiptNumber}`);
      } else {
        await Order.findByIdAndUpdate(orderId, { paymentStatus: 'Failed' });
        console.log(`[M-Pesa Callback] Order ${orderId} payment failed.`);
      }
    }

    // ── Handle license payment ────────────────────────────
    if (paymentPurpose && paymentPurpose.startsWith('license_') && userId) {
      const licenseType = paymentPurpose.replace('license_', ''); // one_time | monthly | annual

      if (isSuccess) {
        // Check if this is a renewal (user already has a paid license)
        const existingLicense = await licenseService.getOrCreateLicense(userId);
        const isRenewal = ['monthly', 'annual'].includes(existingLicense.licenseType) &&
                          existingLicense.status === 'active';

        if (isRenewal && licenseType === existingLicense.licenseType) {
          await licenseService.renewLicense(userId, licenseType, {
            amount,
            mpesaReceiptNumber,
            transactionReference: result.transactionReference,
          });
          console.log(`[M-Pesa Callback] License renewed: ${licenseType} for user ${userId}`);
        } else {
          await licenseService.activateLicense(userId, licenseType, {
            amount,
            mpesaReceiptNumber,
            transactionReference: result.transactionReference,
          });
          console.log(`[M-Pesa Callback] License activated: ${licenseType} for user ${userId}`);
        }
      } else {
        console.log(`[M-Pesa Callback] License payment failed for user ${userId}`);
      }
    }

  } catch (error) {
    console.error('[M-Pesa Callback] Processing error:', error.message);
  }
};

// ── @desc    Get M-Pesa payment history for current user ──────
// ── @route   GET /api/mpesa/history ──────────────────────────
// ── @access  Private ─────────────────────────────────────────
exports.getPaymentHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const transactions = await MpesaTransaction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('orderId', 'totalPrice orderStatus');

    const total = await MpesaTransaction.countDocuments({ userId: req.user._id });

    res.status(200).json({
      transactions,
      total,
      page:  Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error('[M-Pesa] getPaymentHistory error:', error.message);
    next(error);
  }
};

// ── @desc    Get all M-Pesa transactions (admin) ──────────────
// ── @route   GET /api/mpesa/admin/transactions ────────────────
// ── @access  Private/Admin ────────────────────────────────────
exports.getAllTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const transactions = await MpesaTransaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('userId', 'name email')
      .populate('orderId', 'totalPrice orderStatus');

    const total = await MpesaTransaction.countDocuments(query);

    res.status(200).json({
      transactions,
      total,
      page:  Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error('[M-Pesa] getAllTransactions error:', error.message);
    next(error);
  }
};
