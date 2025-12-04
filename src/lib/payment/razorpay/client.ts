import Razorpay from 'razorpay';
import crypto from 'crypto';

const RZP_KEY_ID = process.env.RZP_KEY_ID || '';
const RZP_KEY_SECRET = process.env.RZP_KEY_SECRET || '';

if (!RZP_KEY_ID || !RZP_KEY_SECRET) {
  // Not throwing here so local dev can still run non-payment flows.
  console.warn('Razorpay keys not set in environment (RZP_KEY_ID / RZP_KEY_SECRET)');
}

const razorpay = new Razorpay({ key_id: RZP_KEY_ID, key_secret: RZP_KEY_SECRET });

export async function createRazorpayOrder({ amount, currency = 'INR', receipt }: { amount: number; currency?: string; receipt?: string }) {
  // Razorpay expects amount in smallest currency unit (paise for INR)
  const amt = Math.round(amount);
  const options = {
    amount: amt,
    currency,
    receipt: receipt ?? `rcpt_${Date.now()}`,
    payment_capture: 1,
  } as any;

  return razorpay.orders.create(options);
}

export function verifyRazorpaySignature(payload: string, signature: string) {
  try {
    const expected = crypto.createHmac('sha256', RZP_KEY_SECRET).update(payload).digest('hex');
    return expected === signature;
  } catch (err) {
    console.error('Razorpay signature verification error', err);
    return false;
  }
}

export default razorpay;
