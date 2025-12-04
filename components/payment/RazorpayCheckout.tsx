"use client";
import React from 'react';

type Props = {
  amount: number; // in paise (INR) or cents depending on currency
  currency?: string;
  receipt?: string;
};

async function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) return resolve();
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load script: ' + src));
    document.body.appendChild(script);
  });
}

export default function RazorpayCheckout({ amount, currency = 'INR', receipt }: Props) {
  const onCheckout = async () => {
    try {
      await loadScript('https://checkout.razorpay.com/v1/checkout.js');

      const res = await fetch('/api/checkout/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency, receipt }),
      });
      const order = await res.json();
      if (!order || !order.id) throw new Error('Order creation failed');

      const options: any = {
        key: process.env.NEXT_PUBLIC_RZP_KEY_ID || (window as any).RZP_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Targetym',
        description: 'Subscription',
        order_id: order.id,
        handler: function (response: any) {
          // After payment success, webhooks should handle subscription activation.
          // Optionally, you can POST the payment response to an endpoint for immediate activation.
          fetch('/api/payments/razorpay/confirm', { method: 'POST', body: JSON.stringify(response), headers: { 'Content-Type': 'application/json' } });
        },
        prefill: { email: '' },
        theme: { color: '#2563eb' },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Razorpay checkout failed', err);
      alert('Payment failed to start. Check console for details.');
    }
  };

  return (
    <button onClick={onCheckout} className="btn btn-primary">
      Pay {currency} {amount}
    </button>
  );
}
