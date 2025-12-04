import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/src/lib/supabase/server';

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

const stripe = new Stripe(STRIPE_KEY, { apiVersion: '2022-11-15' });

export async function POST(req: Request) {
  try {
    const sig = req.headers.get('stripe-signature') || '';
    const raw = await req.text();

    if (!STRIPE_WEBHOOK_SECRET) {
      console.warn('STRIPE_WEBHOOK_SECRET not configured - attempting to parse without verification');
      const event = JSON.parse(raw);
      console.log('Stripe webhook (unverified):', event.type);
      // Insert audit row unverified
      const supabase = await createClient();
      await supabase.from('payments_audit').insert({ provider: 'stripe', raw_event: event, status: event.type });
      return NextResponse.json({ received: true });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(raw, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Stripe webhook signature verification failed', err);
      return NextResponse.json({ error: 'invalid signature' }, { status: 400 });
    }

    console.log('Stripe webhook event:', event.type);

    const supabase = await createClient();

    // Handle relevant events
    try {
      if (event.type === 'checkout.session.completed' || event.type === 'invoice.paid') {
        const obj: any = event.data.object;
        const provider = 'stripe';
        const provider_payment_id = obj.payment_intent || obj.payment || obj.id || null;
        const provider_subscription_id = obj.subscription || null;
        const amount = obj.amount_total ?? obj.amount || null;
        const currency = obj.currency || null;
        const status = 'paid';

        await supabase.from('payments_audit').insert({
          provider,
          provider_payment_id,
          provider_subscription_id,
          amount,
          currency,
          status,
          raw_event: event,
        });

        // Try to update organization if we can find it by metadata / customer email
        try {
          // Many setups put organization_id in metadata. Fallback to customer email mapping.
          const customer_email = obj.customer_details?.email || obj.customer_email || null;
          let orgId: string | null = null;
          if (customer_email) {
            const { data: profile }: any = await supabase.from('profiles').select('organization_id').eq('email', customer_email).maybeSingle();
            if (profile?.organization_id) orgId = profile.organization_id;
          }

          if (orgId) {
            const periodEnd = new Date();
            periodEnd.setDate(periodEnd.getDate() + 30);
            await supabase.from('organizations').update({
              stripe_payment_id: provider_payment_id,
              subscription_status: 'active',
              subscription_current_period_end: periodEnd.toISOString(),
            }).eq('id', orgId);
          }
        } catch (err) {
          console.error('Failed to map stripe event to organization', err);
        }
      } else {
        // store all events for inspection
        await supabase.from('payments_audit').insert({ provider: 'stripe', raw_event: event, status: event.type });
      }
    } catch (e) {
      console.error('Error handling stripe event', e);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
