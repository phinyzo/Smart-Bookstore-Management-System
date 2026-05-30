/**
 * Email Service
 * Sends transactional emails via Nodemailer (Gmail SMTP).
 * All amounts displayed in KES.
 * Branded: Powered by PhinTech Solutions — Built in Kenya
 */

const transporter = require('../config/email');
const EmailLog    = require('../models/EmailLog');

// ── Shared email footer ───────────────────────────────────────
const emailFooter = `
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #eee;
    text-align:center;font-size:11px;color:#aaa;">
    <p style="margin:0;">Smart Bookstore Management System</p>
    <p style="margin:4px 0;">
      Powered by
      <a href="https://phintechsolutions.com" style="color:#534AB7;text-decoration:none;">
        PhinTech Solutions
      </a>
      — Built in Kenya 🇰🇪
    </p>
  </div>
`;

// ── Log helper ────────────────────────────────────────────────
const logEmail = async (userId, emailType, recipientEmail, status) => {
  try {
    await EmailLog.create({ userId, emailType, recipientEmail, status, sentAt: new Date() });
  } catch (err) {
    console.error('[EmailLog] Failed to save log:', err.message);
  }
};

// ── Send order confirmation ───────────────────────────────────
const sendOrderConfirmation = async (userEmail, order, userId) => {
  try {
    await transporter.sendMail({
      from:    `"Smart Bookstore" <${process.env.EMAIL_USER}>`,
      to:      userEmail,
      subject: 'Order Confirmed — Smart Bookstore',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;
          padding:24px;border:1px solid #eee;border-radius:8px;">
          <h2 style="color:#1a1a2e;">✅ Order Confirmed</h2>
          <p style="color:#333;font-size:15px;">
            Thank you for your order. Here are your order details:
          </p>
          <div style="background:#f5f5f5;padding:16px;border-radius:8px;margin:16px 0;">
            <p style="margin:0 0 8px;font-size:13px;color:#666;">Order ID</p>
            <p style="margin:0 0 12px;font-weight:bold;font-family:monospace;color:#1a1a2e;">
              #${order._id.toString().slice(-8).toUpperCase()}
            </p>
            <p style="margin:0 0 4px;font-size:13px;color:#666;">Total Amount</p>
            <p style="margin:0 0 12px;font-weight:bold;font-size:18px;color:#1D9E75;">
              KES ${Number(order.totalPrice).toLocaleString('en-KE')}
            </p>
            <p style="margin:0 0 4px;font-size:13px;color:#666;">Status</p>
            <p style="margin:0 0 12px;font-weight:bold;color:#534AB7;">${order.orderStatus}</p>
            <p style="margin:0 0 4px;font-size:13px;color:#666;">Shipping Address</p>
            <p style="margin:0;color:#333;">${order.shippingAddress}</p>
          </div>
          <p style="color:#555;font-size:14px;">
            We'll send you an update when your order is shipped.
          </p>
          ${emailFooter}
        </div>
      `,
    });

    console.log(`[Email] Order confirmation sent to: ${userEmail}`);
    await logEmail(userId, 'Order Confirmation', userEmail, 'Sent');

  } catch (error) {
    console.error('[Email] Order confirmation failed:', error.message);
    await logEmail(userId, 'Order Confirmation', userEmail, 'Failed');
  }
};

// ── Send order status update ──────────────────────────────────
const sendOrderStatusUpdate = async (userEmail, orderStatus, orderId, userId) => {
  const statusMessages = {
    Confirmed:  { subject: 'Order Confirmed ✅',          emoji: '✅', msg: 'Your order has been confirmed and is being prepared.' },
    Processing: { subject: 'Order Being Processed 📦',    emoji: '📦', msg: 'Your order is currently being packed.' },
    Shipped:    { subject: 'Order Shipped 🚚',             emoji: '🚚', msg: 'Your order is on its way!' },
    Delivered:  { subject: 'Order Delivered 🎉',           emoji: '🎉', msg: 'Your order has been delivered. Enjoy your books!' },
    Cancelled:  { subject: 'Order Cancelled ❌',           emoji: '❌', msg: 'Your order has been cancelled.' },
  };

  const info = statusMessages[orderStatus];
  if (!info) return;

  try {
    await transporter.sendMail({
      from:    `"Smart Bookstore" <${process.env.EMAIL_USER}>`,
      to:      userEmail,
      subject: `Smart Bookstore — ${info.subject}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;
          padding:24px;border:1px solid #eee;border-radius:8px;">
          <h2 style="color:#1a1a2e;">${info.emoji} Order Status Update</h2>
          <p style="font-size:16px;color:#333;">${info.msg}</p>
          <div style="background:#f5f5f5;padding:16px;border-radius:8px;margin:16px 0;">
            <p style="margin:0 0 4px;font-size:13px;color:#666;">Order ID</p>
            <p style="margin:0 0 12px;font-weight:bold;font-family:monospace;color:#1a1a2e;">
              #${orderId.toString().slice(-8).toUpperCase()}
            </p>
            <p style="margin:0 0 4px;font-size:13px;color:#666;">New Status</p>
            <p style="margin:0;font-weight:bold;color:#534AB7;">${orderStatus}</p>
          </div>
          ${emailFooter}
        </div>
      `,
    });

    await logEmail(userId, `Status Update — ${orderStatus}`, userEmail, 'Sent');
    console.log(`[Email] Status update (${orderStatus}) sent to: ${userEmail}`);

  } catch (error) {
    await logEmail(userId, `Status Update — ${orderStatus}`, userEmail, 'Failed');
    console.error('[Email] Status update failed:', error.message);
  }
};

// ── Send license activation confirmation ─────────────────────
const sendLicenseActivation = async (userEmail, userId, licenseType, licenseKey, expiresAt) => {
  const typeLabels = {
    one_time: 'Lifetime License',
    monthly:  'Monthly Subscription',
    annual:   'Annual Subscription',
  };

  const expiryText = expiresAt
    ? `Expires: ${new Date(expiresAt).toLocaleDateString('en-KE', { dateStyle: 'long' })}`
    : 'Never expires — Lifetime license';

  try {
    await transporter.sendMail({
      from:    `"Smart Bookstore" <${process.env.EMAIL_USER}>`,
      to:      userEmail,
      subject: 'License Activated — Smart Bookstore 🎉',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;
          padding:24px;border:1px solid #eee;border-radius:8px;">
          <h2 style="color:#1a1a2e;">🎉 License Activated</h2>
          <p style="color:#333;font-size:15px;">
            Your <strong>${typeLabels[licenseType] || licenseType}</strong> has been
            successfully activated. You now have full access to Smart Bookstore.
          </p>
          <div style="background:#E8F5E9;padding:16px;border-radius:8px;margin:16px 0;
            border-left:4px solid #1D9E75;">
            <p style="margin:0 0 4px;font-size:13px;color:#666;">License Type</p>
            <p style="margin:0 0 12px;font-weight:bold;color:#1a1a2e;">
              ${typeLabels[licenseType] || licenseType}
            </p>
            <p style="margin:0 0 4px;font-size:13px;color:#666;">License Key</p>
            <p style="margin:0 0 12px;font-weight:bold;font-family:monospace;
              color:#534AB7;font-size:16px;letter-spacing:1px;">
              ${licenseKey}
            </p>
            <p style="margin:0 0 4px;font-size:13px;color:#666;">Validity</p>
            <p style="margin:0;font-weight:bold;color:#1D9E75;">${expiryText}</p>
          </div>
          <p style="color:#888;font-size:12px;">
            Keep your license key safe. You may need it for manual verification.
          </p>
          ${emailFooter}
        </div>
      `,
    });

    await logEmail(userId, 'License Activation', userEmail, 'Sent');
    console.log(`[Email] License activation sent to: ${userEmail}`);

  } catch (error) {
    await logEmail(userId, 'License Activation', userEmail, 'Failed');
    console.error('[Email] License activation email failed:', error.message);
  }
};

module.exports = {
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendLicenseActivation,
};
