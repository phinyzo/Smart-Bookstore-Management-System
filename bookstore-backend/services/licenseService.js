/**
 * License Service
 * Manages trial periods, license activation, expiration, and renewal.
 *
 * Pricing (KES):
 *   One-Time License:    KES 25,000
 *   Monthly Subscription: KES 2,000
 *   Annual Subscription:  KES 23,000
 *   Trial:               14 days free
 */

const crypto  = require('crypto');
const License = require('../models/License');

// ── Pricing constants (KES) ───────────────────────────────────
const PRICING = {
  one_time: 25000,
  monthly:  2000,
  annual:   23000,
};

const TRIAL_DAYS = 14;

// ── Generate a unique license key ────────────────────────────
const generateLicenseKey = (userId) => {
  const secret = process.env.LICENSE_SECRET || 'phintech-license-secret';
  const hash   = crypto
    .createHmac('sha256', secret)
    .update(`${userId}-${Date.now()}`)
    .digest('hex')
    .toUpperCase();
  // Format: PHIN-XXXX-XXXX-XXXX-XXXX
  return `PHIN-${hash.slice(0,4)}-${hash.slice(4,8)}-${hash.slice(8,12)}-${hash.slice(12,16)}`;
};

/**
 * Get or create a license for a user.
 * New users automatically get a 14-day trial.
 */
const getOrCreateLicense = async (userId) => {
  let license = await License.findOne({ userId });

  if (!license) {
    const trialEnd = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
    license = await License.create({
      userId,
      licenseType:    'trial',
      status:         'active',
      trialStartDate: new Date(),
      trialEndDate:   trialEnd,
      trialUsed:      true,
    });
  }

  return license;
};

/**
 * Check if a user has an active license (trial or paid).
 * Returns a status object the frontend uses to gate features.
 */
const checkLicenseStatus = async (userId) => {
  const license = await getOrCreateLicense(userId);
  const now     = new Date();

  // ── Paid license checks ───────────────────────────────────
  if (license.licenseType === 'one_time' && license.status === 'active') {
    return {
      isActive:       true,
      licenseType:    'one_time',
      status:         'active',
      message:        'Lifetime license active',
      licenseKey:     license.licenseKey,
      activatedAt:    license.activatedAt,
    };
  }

  if (['monthly', 'annual'].includes(license.licenseType) && license.status === 'active') {
    if (license.expiresAt && now < license.expiresAt) {
      const daysLeft = Math.ceil((license.expiresAt - now) / (1000 * 60 * 60 * 24));
      return {
        isActive:    true,
        licenseType: license.licenseType,
        status:      'active',
        expiresAt:   license.expiresAt,
        daysLeft,
        message:     `${license.licenseType === 'monthly' ? 'Monthly' : 'Annual'} subscription active — ${daysLeft} days remaining`,
        licenseKey:  license.licenseKey,
      };
    } else {
      // Subscription expired — update status
      license.status = 'expired';
      await license.save();
    }
  }

  // ── Trial checks ──────────────────────────────────────────
  if (license.licenseType === 'trial') {
    if (license.status === 'active' && now < license.trialEndDate) {
      const daysLeft = Math.ceil((license.trialEndDate - now) / (1000 * 60 * 60 * 24));
      return {
        isActive:    true,
        licenseType: 'trial',
        status:      'trial',
        trialEndsAt: license.trialEndDate,
        daysLeft,
        message:     `Free trial — ${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`,
        pricing:     PRICING,
      };
    } else {
      // Trial expired
      if (license.status === 'active') {
        license.status = 'expired';
        await license.save();
      }
      return {
        isActive:    false,
        licenseType: 'trial',
        status:      'expired',
        message:     'Your 14-day free trial has expired. Please purchase a license to continue.',
        pricing:     PRICING,
        paymentLink: process.env.LIPIA_PAYMENT_LINK,
      };
    }
  }

  // ── Expired / suspended ───────────────────────────────────
  return {
    isActive:    false,
    licenseType: license.licenseType,
    status:      license.status,
    message:     'License expired or suspended. Please renew to continue.',
    pricing:     PRICING,
    paymentLink: process.env.LIPIA_PAYMENT_LINK,
  };
};

/**
 * Activate a license after successful payment.
 * Called by the M-Pesa callback handler.
 *
 * @param {string} userId
 * @param {string} licenseType - 'one_time' | 'monthly' | 'annual'
 * @param {Object} paymentInfo - { amount, mpesaReceiptNumber, transactionReference }
 */
const activateLicense = async (userId, licenseType, paymentInfo = {}) => {
  const license    = await getOrCreateLicense(userId);
  const now        = new Date();
  const licenseKey = generateLicenseKey(userId);

  let expiresAt = null;
  if (licenseType === 'monthly') {
    expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  } else if (licenseType === 'annual') {
    expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
  }
  // one_time: expiresAt stays null (lifetime)

  license.licenseType           = licenseType;
  license.status                = 'active';
  license.activatedAt           = now;
  license.expiresAt             = expiresAt;
  license.renewedAt             = now;
  license.licenseKey            = licenseKey;
  license.lastPaymentAmount     = paymentInfo.amount;
  license.lastPaymentDate       = now;
  license.lastPaymentReference  = paymentInfo.transactionReference;
  license.mpesaReceiptNumber    = paymentInfo.mpesaReceiptNumber;

  await license.save();

  console.log(`[License] Activated ${licenseType} license for user ${userId} — Key: ${licenseKey}`);

  return license;
};

/**
 * Renew an existing subscription.
 * Extends from current expiry (not from now) to reward early renewals.
 */
const renewLicense = async (userId, licenseType, paymentInfo = {}) => {
  const license = await getOrCreateLicense(userId);
  const now     = new Date();

  // Extend from current expiry if still active, otherwise from now
  const baseDate = (license.expiresAt && license.expiresAt > now)
    ? license.expiresAt
    : now;

  let expiresAt = null;
  if (licenseType === 'monthly') {
    expiresAt = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  } else if (licenseType === 'annual') {
    expiresAt = new Date(baseDate.getTime() + 365 * 24 * 60 * 60 * 1000);
  }

  license.licenseType          = licenseType;
  license.status               = 'active';
  license.expiresAt            = expiresAt;
  license.renewedAt            = now;
  license.lastPaymentAmount    = paymentInfo.amount;
  license.lastPaymentDate      = now;
  license.lastPaymentReference = paymentInfo.transactionReference;
  license.mpesaReceiptNumber   = paymentInfo.mpesaReceiptNumber;

  await license.save();

  console.log(`[License] Renewed ${licenseType} for user ${userId} — expires ${expiresAt}`);

  return license;
};

/**
 * Validate a license key string.
 * Used for offline/manual license verification.
 */
const validateLicenseKey = async (licenseKey) => {
  const license = await License.findOne({ licenseKey }).populate('userId', 'name email');
  if (!license) return { valid: false, message: 'Invalid license key' };

  const status = await checkLicenseStatus(license.userId._id);
  return { valid: status.isActive, license, status };
};

module.exports = {
  PRICING,
  TRIAL_DAYS,
  getOrCreateLicense,
  checkLicenseStatus,
  activateLicense,
  renewLicense,
  validateLicenseKey,
};
