import Stripe from 'stripe';

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || '';

if (!STRIPE_KEY) {
  console.warn('Stripe secret key not set in environment (STRIPE_SECRET_KEY)');
}

const stripe = new Stripe(STRIPE_KEY, { apiVersion: '2022-11-15' });

export async function createStripeCheckoutSession({
  amount,
  currency = 'usd',
  successUrl,
  cancelUrl,
  customer_email,
  metadata,
}: {
  amount: number;
  currency?: string;
  successUrl: string;
  cancelUrl: string;
  customer_email?: string;
  metadata?: Record<string, any>;
}) {
  // amount in cents
  const unitAmount = Math.round(amount);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency,
          product_data: { name: 'Targetym - Subscription' },
          unit_amount: unitAmount,
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email,
    metadata: metadata ?? {},
  });

  return session;
}

export default stripe;
