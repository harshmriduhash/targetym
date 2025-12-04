import { NextResponse } from 'next/server';
import { createRazorpayOrder } from '../../../../src/lib/payment/razorpay/client';
import { createClient } from '@/src/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, currency, receipt, organization_id, metadata } = body;
    if (!amount) return NextResponse.json({ error: 'amount required' }, { status: 400 });

    // Razorpay expects amount in paise (smallest unit). The client should send integer amount.
    const order = await createRazorpayOrder({ amount, currency: currency || 'INR', receipt });
    // Persist mapping between order and organization (if provided)
    try {
      const supabase = await createClient();
      await supabase.from('orders').insert({
        organization_id: organization_id ?? metadata?.organization_id ?? null,
        provider: 'razorpay',
        provider_order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        metadata: order,
      });
    } catch (err) {
      console.warn('Failed to persist razorpay order mapping', err);
    }

    return NextResponse.json(order);
  } catch (err) {
    console.error('Razorpay checkout error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
