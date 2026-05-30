/**
 * License Controller
 * Exposes license status, pricing, and admin management endpoints.
 */

const licenseService = require('../services/licenseService');
const License        = require('../models/License');

// ── @desc    Get current user's license status ────────────────
// ── @route   GET /api/license/status ─────────────────────────
// ── @access  Private ─────────────────────────────────────────
exports.getLicenseStatus = async (req, res, next) => {
  try {
    const status = await licenseService.checkLicenseStatus(req.user._id);
    res.status(200).json(status);
  } catch (error) {
    console.error('[License] getLicenseStatus error:', error.message);
    next(error);
  }
};

// ── @desc    Get pricing information ─────────────────────────
// ── @route   GET /api/license/pricing ────────────────────────
// ── @access  Public ──────────────────────────────────────────
exports.getPricing = async (req, res) => {
  res.status(200).json({
    currency: 'KES',
    pricing:  licenseService.PRICING,
    trial: {
      days:    licenseService.TRIAL_DAYS,
      message: `${licenseService.TRIAL_DAYS}-day free trial — no credit card required`,
    },
    paymentLink: process.env.LIPIA_PAYMENT_LINK,
    plans: [
      {
        id:          'trial',
        name:        'Free Trial',
        price:       0,
        duration:    '14 days',
        description: 'Full access for 14 days. No payment required.',
        features:    ['Full book catalog access', 'Order management', 'Email notifications'],
      },
      {
        id:          'monthly',
        name:        'Monthly Subscription',
        price:       licenseService.PRICING.monthly,
        duration:    '1 month',
        description: 'Renews monthly. Cancel anytime.',
        features:    ['Everything in trial', 'Priority support', 'Advanced analytics'],
        badge:       'Popular',
      },
      {
        id:          'annual',
        name:        'Annual Subscription',
        price:       licenseService.PRICING.annual,
        duration:    '1 year',
        description: 'Best value — save KES 1,000 vs monthly.',
        features:    ['Everything in monthly', '2 months free', 'Dedicated support'],
        badge:       'Best Value',
        savings:     `Save KES ${(licenseService.PRICING.monthly * 12) - licenseService.PRICING.annual}`,
      },
      {
        id:          'one_time',
        name:        'Lifetime License',
        price:       licenseService.PRICING.one_time,
        duration:    'Lifetime',
        description: 'One-time payment. Own it forever.',
        features:    ['Everything in annual', 'Lifetime updates', 'No recurring fees'],
        badge:       'Best Deal',
      },
    ],
  });
};

// ── @desc    Validate a license key ──────────────────────────
// ── @route   POST /api/license/validate ──────────────────────
// ── @access  Private ─────────────────────────────────────────
exports.validateKey = async (req, res, next) => {
  try {
    const { licenseKey } = req.body;
    if (!licenseKey) {
      return res.status(400).json({ message: 'licenseKey is required' });
    }

    const result = await licenseService.validateLicenseKey(licenseKey);
    res.status(200).json(result);
  } catch (error) {
    console.error('[License] validateKey error:', error.message);
    next(error);
  }
};

// ── @desc    Get all licenses (admin) ─────────────────────────
// ── @route   GET /api/license/admin/all ──────────────────────
// ── @access  Private/Admin ────────────────────────────────────
exports.getAllLicenses = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, licenseType } = req.query;
    const query = {};
    if (status)      query.status      = status;
    if (licenseType) query.licenseType = licenseType;

    const skip = (Number(page) - 1) * Number(limit);

    const licenses = await License.find(query)
      .populate('userId', 'name email phone')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await License.countDocuments(query);

    // Compute live status for each license
    const enriched = await Promise.all(
      licenses.map(async (lic) => {
        const liveStatus = await licenseService.checkLicenseStatus(lic.userId._id);
        return { ...lic.toObject(), liveStatus };
      })
    );

    res.status(200).json({
      licenses: enriched,
      total,
      page:  Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error('[License] getAllLicenses error:', error.message);
    next(error);
  }
};

// ── @desc    Manually activate/override a license (admin) ─────
// ── @route   PUT /api/license/admin/:userId/activate ──────────
// ── @access  Private/Admin ────────────────────────────────────
exports.adminActivateLicense = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { licenseType } = req.body;

    const validTypes = ['one_time', 'monthly', 'annual'];
    if (!validTypes.includes(licenseType)) {
      return res.status(400).json({ message: `Invalid licenseType. Must be: ${validTypes.join(', ')}` });
    }

    const license = await licenseService.activateLicense(userId, licenseType, {
      transactionReference: `ADMIN-OVERRIDE-${Date.now()}`,
    });

    res.status(200).json({
      message:  `License activated: ${licenseType}`,
      license,
    });
  } catch (error) {
    console.error('[License] adminActivateLicense error:', error.message);
    next(error);
  }
};
