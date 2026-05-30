/**
 * Stripe config — lazy initialization.
 * Only throws if STRIPE_SECRET_KEY is missing when a Stripe call is actually made.
 * This prevents the server from crashing at startup when Stripe is not configured.
 */

const Stripe = require('stripe');

let _stripe = null;

const getStripe = () => {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      // Return a stub that throws a clear error on use
      return {
        paymentIntents: {
          create: () => { throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY in your environment variables.'); },
        },
        webhooks: {
          constructEvent: () => { throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY in your environment variables.'); },
        },
      };
    }
    _stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return _stripe;
};

// Proxy so existing code using `stripe.paymentIntents.create(...)` still works
module.exports = new Proxy({}, {
  get(_, prop) {
    return getStripe()[prop];
  },
});
