/**
 * Lipia Online M-Pesa Service
 * Integrates with https://lipia-api.kreativelabske.com/api/v2
 * Payment link: https://lipia-online.vercel.app/link/PHINTECHSOLUTIONS
 *
 * Docs: https://lipia-online-docs.vercel.app
 */

const MpesaTransaction = require('../models/MpesaTransaction');

const LIPIA_BASE_URL = process.env.LIPIA_BASE_URL || 'https://lipia-api.kreativelabske.com/api/v2';
const LIPIA_API_KEY  = process.env.LIPIA_API_KEY;

// ── Helper: build auth headers ────────────────────────────────
const getHeaders = () => ({
  'Authorization': `Bearer ${LIPIA_API_KEY}`,
  'Content-Type': 'application/json',
});

// ── Normalize Kenyan phone number to 2547xxxxxxxx format ──────
const normalizePhone = (phone) => {
  const cleaned = String(phone).replace(/\s+/g, '').replace(/^\+/, '');
  if (cleaned.startsWith('254')) return cleaned;
  if (cleaned.startsWith('0'))   return '254' + cleaned.slice(1);
  return cleaned;
};

/**
 * Initiate STK Push
 * Sends a payment prompt to the customer's phone.
 *
 * @param {Object} params
 * @param {string} params.phoneNumber     - Customer phone (07xx, 01xx, 254xx, +254xx)
 * @param {number} params.amount          - Amount in KES (positive integer)
 * @param {string} params.externalRef     - Your reference ID (orderId, licenseId, etc.)
 * @param {string} params.callbackUrl     - Public HTTPS URL to receive callback
 * @param {Object} params.metadata        - Optional key-value metadata
 * @param {string} params.userId          - Internal user ID for logging
 * @param {string} params.orderId         - Internal order ID (optional)
 * @param {string} params.paymentPurpose  - 'order' | 'license_one_time' | etc.
 * @returns {Object} { success, transactionReference, message }
 */
const initiateStkPush = async ({
  phoneNumber,
  amount,
  externalRef,
  callbackUrl,
  metadata = {},
  userId,
  orderId,
  paymentPurpose = 'order',
}) => {
  if (!LIPIA_API_KEY) {
    throw new Error('LIPIA_API_KEY is not configured. Set it in your .env file.');
  }

  const normalizedPhone = normalizePhone(phoneNumber);
  const roundedAmount   = Math.round(amount); // M-Pesa requires integer

  const payload = {
    phone_number:       normalizedPhone,
    amount:             roundedAmount,
    external_reference: externalRef,
    callback_url:       callbackUrl,
    metadata: {
      ...metadata,
      userId:         userId?.toString(),
      orderId:        orderId?.toString(),
      paymentPurpose,
      platform:       'PhinTech Smart Bookstore',
    },
  };

  const response = await fetch(`${LIPIA_BASE_URL}/payments/stk-push`, {
    method:  'POST',
    headers: getHeaders(),
    body:    JSON.stringify(payload),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.customerMessage || result.message || 'STK Push failed');
  }

  const transactionReference = result.data?.TransactionReference;

  // Log transaction to DB
  await MpesaTransaction.create({
    transactionReference,
    userId,
    orderId,
    phoneNumber:       normalizedPhone,
    amount:            roundedAmount,
    externalReference: externalRef,
    paymentPurpose,
    status:            'PENDING',
    initiatedAt:       new Date(),
  });

  return {
    success:              true,
    transactionReference,
    responseCode:         result.data?.ResponseCode,
    responseDescription:  result.data?.ResponseDescription,
    message:              result.customerMessage || 'STK Push initiated successfully',
  };
};

/**
 * Check Transaction Status
 * Poll the status of a payment using its transaction reference.
 *
 * @param {string} transactionReference - From initiateStkPush response
 * @returns {Object} { status, amount, mpesaReceiptNumber, ... }
 */
const checkTransactionStatus = async (transactionReference) => {
  if (!LIPIA_API_KEY) {
    throw new Error('LIPIA_API_KEY is not configured.');
  }

  const response = await fetch(
    `${LIPIA_BASE_URL}/payments/status?reference=${encodeURIComponent(transactionReference)}`,
    { method: 'GET', headers: getHeaders() }
  );

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.customerMessage || result.message || 'Status check failed');
  }

  const paymentData = result.data?.response;

  return {
    status:             paymentData?.Status,       // 'PENDING' | 'SUCCESS' | 'FAILED'
    isSuccess:          result.data?.status === true,
    amount:             paymentData?.Amount,
    mpesaReceiptNumber: paymentData?.MpesaReceiptNumber,
    phone:              paymentData?.Phone,
    resultCode:         paymentData?.ResultCode,
    resultDesc:         paymentData?.ResultDesc,
    externalReference:  paymentData?.ExternalReference,
    metadata:           paymentData?.Metadata,
    transactionDate:    paymentData?.TransactionDate,
  };
};

/**
 * Poll payment status with retries (up to maxAttempts × intervalMs)
 *
 * @param {string} transactionReference
 * @param {number} maxAttempts  - Default 12 (1 minute at 5s intervals)
 * @param {number} intervalMs   - Default 5000ms
 * @returns {Object} Final status object
 */
const pollPaymentStatus = async (transactionReference, maxAttempts = 12, intervalMs = 5000) => {
  for (let i = 0; i < maxAttempts; i++) {
    const statusData = await checkTransactionStatus(transactionReference);

    if (statusData.status === 'SUCCESS') return statusData;
    if (statusData.status === 'FAILED')  return statusData;

    // Still PENDING — wait before next check
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return { status: 'PENDING', isSuccess: false, message: 'Payment timeout — check manually' };
};

/**
 * Process Lipia Online callback payload
 * Called by the callback route handler.
 * Implements replay protection via callbackProcessed flag.
 *
 * @param {Object} payload - Raw callback body from Lipia Online
 * @returns {Object} { processed, status, transactionReference }
 */
const processCallback = async (payload) => {
  const response          = payload?.response || payload;
  const transactionRef    = response?.MerchantRequestID || response?.CheckoutRequestID;
  const externalReference = response?.ExternalReference;
  const status            = response?.Status;   // 'Success' | 'Failed'
  const isSuccess         = payload?.status === true;
  const mpesaReceipt      = response?.MpesaReceiptNumber;
  const amount            = response?.Amount;

  // Find transaction by external reference (our order/license ID)
  let transaction = await MpesaTransaction.findOne({
    $or: [
      { transactionReference: transactionRef },
      { externalReference },
    ],
  });

  if (!transaction) {
    console.warn(`[Lipia Callback] No transaction found for ref: ${transactionRef} / ext: ${externalReference}`);
    return { processed: false, status, transactionReference: transactionRef };
  }

  // Replay protection — skip if already processed
  if (transaction.callbackProcessed) {
    console.log(`[Lipia Callback] Duplicate callback ignored for: ${transactionRef}`);
    return { processed: false, duplicate: true, status, transactionReference: transactionRef };
  }

  // Update transaction record
  const newStatus = isSuccess ? 'SUCCESS' : 'FAILED';
  transaction.status             = newStatus;
  transaction.mpesaReceiptNumber = mpesaReceipt || '';
  transaction.callbackPayload    = payload;
  transaction.callbackProcessed  = true;
  transaction.completedAt        = new Date();
  await transaction.save();

  return {
    processed:            true,
    status:               newStatus,
    isSuccess,
    transactionReference: transactionRef,
    externalReference,
    mpesaReceiptNumber:   mpesaReceipt,
    amount,
    userId:               transaction.userId,
    orderId:              transaction.orderId,
    paymentPurpose:       transaction.paymentPurpose,
  };
};

module.exports = {
  initiateStkPush,
  checkTransactionStatus,
  pollPaymentStatus,
  processCallback,
  normalizePhone,
};
