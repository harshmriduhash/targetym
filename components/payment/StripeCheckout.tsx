"use client";
import React from 'react';
import { loadStripe } from '@stripe/stripe-js';

type Props = {
  amount: number; // integer in cents
  currency?: string;
  customer_email?: string;
};

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function StripeCheckout({ amount, currency = 'usd', customer_email }: Props) {
  const onCheckout = async () => {
    try {
      const res = await fetch('/api/checkout/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency, successUrl: window.location.href, cancelUrl: window.location.href, customer_email }),
      });
      const data = await res.json();
      if (!data || !data.id) throw new Error('No session returned');

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to initialize');
      await stripe.redirectToCheckout({ sessionId: data.id });
    } catch (err) {
      console.error('Stripe checkout failed', err);
      alert('Unable to start Stripe checkout');
    }
  };

  return (
    <button onClick={onCheckout} className="btn btn-primary">
      Pay {currency} {amount}
    </button>
  );
}
