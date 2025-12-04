import { NextResponse } from 'next/server';
import { createStripeCheckoutSession } from '../../../../src/lib/payment/stripe/client';
import { createClient } from '@/src/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, currency, successUrl, cancelUrl, customer_email, organization_id, metadata } = body;
    if (!amount || !successUrl || !cancelUrl) return NextResponse.json({ error: 'missing params' }, { status: 400 });

    const session = await createStripeCheckoutSession({ amount, currency: currency || 'usd', successUrl, cancelUrl, customer_email, metadata: { ...(metadata || {}), organization_id } });

    // Persist mapping between session and organization for webhook mapping
    try {
      const supabase = await createClient();
      await supabase.from('orders').insert({
        organization_id: organization_id ?? metadata?.organization_id ?? null,
        provider: 'stripe',
        provider_order_id: session.id,
        amount: amount,
        currency: currency || 'usd',
        metadata: session,
      });
    } catch (err) {
      console.warn('Failed to persist stripe session mapping', err);
    }

    return NextResponse.json(session);
  } catch (err) {
    console.error('Stripe checkout error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
