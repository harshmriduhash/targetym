"use client";
import React from 'react';
import StripeCheckout from '@/components/payment/StripeCheckout';

export default function PricingSelection({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const amountCents = 4900 * 100; // example $49 in cents

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Choose a plan</h3>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="p-4 border rounded">Free<br/><div className="mt-2">Limited features</div></div>
          <div className="p-4 border rounded">Pro<br/><div className="mt-2">$49/month</div></div>
          <div className="p-4 border rounded">Enterprise<br/><div className="mt-2">Contact us</div></div>
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={onPrev} className="btn">Back</button>
        <div className="flex gap-2">
          <button onClick={onNext} className="btn">Skip for now</button>
          <StripeCheckout amount={amountCents} currency="usd" />
        </div>
      </div>
    </div>
  );
}
