import { NextResponse } from 'next/server';
import { createClient } from '@/src/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, amount, currency, metadata } = body;

    const supabase = await createClient();

    await supabase.from('payments_audit').insert({
      provider: 'razorpay',
      provider_payment_id: razorpay_payment_id,
      provider_subscription_id: razorpay_order_id,
      amount: amount ?? null,
      currency: currency ?? null,
      status: 'captured',
      raw_event: body,
    });

    // Optionally update organization if metadata contains org id
    if (metadata?.organization_id) {
      const periodEnd = new Date();
      periodEnd.setDate(periodEnd.getDate() + 30);
      await supabase.from('organizations').update({
        razorpay_payment_id: razorpay_payment_id,
        subscription_status: 'active',
        subscription_current_period_end: periodEnd.toISOString(),
      }).eq('id', metadata.organization_id);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Razorpay confirm error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
