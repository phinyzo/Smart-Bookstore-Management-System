const stripe = require('../config/stripe');

const createPaymentIntent = async (amount, currency = 'kes') => {
  return await stripe.paymentIntents.create({
    amount: amount * 100,
    currency,
  });
};

const verifyWebhookSignature = (payload, sig, secret) => {
  return stripe.webhooks.constructEvent(payload, sig, secret);
};

module.exports = { createPaymentIntent, verifyWebhookSignature };
