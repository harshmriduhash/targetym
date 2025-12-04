import { NextResponse } from 'next/server';
import { verifyRazorpaySignature } from '../../../../src/lib/payment/razorpay/client';
import { createClient } from '@/src/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';

    const ok = verifyRazorpaySignature(raw, signature);
    if (!ok) {
      console.warn('Invalid Razorpay signature');
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const event = JSON.parse(raw);
    console.log('Razorpay webhook event:', event.event || event);

    // Connect to Supabase and insert an audit row
    const supabase = await createClient();

    // Extract common fields
    const provider = 'razorpay';
    const payload = event;
    let provider_payment_id: string | null = null;
    let provider_subscription_id: string | null = null;
    let amount: number | null = null;
    let currency: string | null = null;
    let status: string | null = null;

    // Try to read common payment fields
    if (event?.payload?.payment?.entity) {
      const e = event.payload.payment.entity;
      provider_payment_id = e.id;
      amount = e.amount;
      currency = e.currency;
      status = e.status;
      // order_id may help link to organization if you stored receipt
      provider_subscription_id = e.order_id || null;
    }

    // Insert audit record
    try {
      await supabase.from('payments_audit').insert({
        provider,
        provider_payment_id,
        provider_subscription_id,
        amount,
        currency,
        status,
        raw_event: payload,
      });
    } catch (dbErr) {
      console.error('Failed to insert payments_audit', dbErr);
    }

    // If payment captured/authorized -> try to activate subscription on organization
    try {
      const successful = status === 'captured' || event.event === 'payment.captured' || event.event === 'payment.authorized';
      if (successful && provider_payment_id) {
        // Attempt to find organization by matching order receipt or order_id if present
        // Note: this requires order metadata/receipt to contain organization_id at order creation time.
        // Fallback: do not update organization if mapping is not available.

        // Example: if receipt was used to store org:<orgId>
        let orgId: string | null = null;
        try {
          // If order_id present, fetch order details
          if (provider_subscription_id) {
            const { data: orderData }: any = await supabase.from('orders').select('*').eq('provider_order_id', provider_subscription_id).maybeSingle();
            if (orderData?.organization_id) orgId = orderData.organization_id;
          }
        } catch (err) {
          // ignore
        }

        if (orgId) {
          const periodEnd = new Date();
          periodEnd.setDate(periodEnd.getDate() + 30);
          await supabase.from('organizations').update({
            razorpay_payment_id: provider_payment_id,
            subscription_status: 'active',
            subscription_current_period_end: periodEnd.toISOString(),
          }).eq('id', orgId);
        }
      }
    } catch (err) {
      console.error('Failed to update organization subscription from Razorpay event', err);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Razorpay webhook error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
