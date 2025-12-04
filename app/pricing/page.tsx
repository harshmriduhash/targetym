'use client'
import Link from 'next/link'
import StripeCheckout from '@/components/payment/StripeCheckout'

export default function PricingPage() {
  return (
    <main className="min-h-screen py-12 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Pricing</h1>
          <p className="text-gray-600">Simple, transparent pricing. No hidden fees. Cancel anytime.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free */}
          <div className="p-8 bg-white rounded-lg border border-gray-200">
            <h3 className="text-2xl font-semibold mb-2">Free</h3>
            <p className="text-gray-600 mb-4">Perfect for small teams getting started</p>
            <p className="text-3xl font-bold mb-6">$0<span className="text-lg text-gray-600">/month</span></p>
            <ul className="space-y-3 mb-6 text-sm">
              <li>✓ Up to 5 team members</li>
              <li>✓ Basic goal tracking</li>
              <li>✓ Job posting (1)</li>
              <li>✓ Performance reviews (limited)</li>
              <li>✗ AI CV scoring</li>
              <li>✗ Priority support</li>
            </ul>
            <Link href="/auth/sign-up" className="btn btn-outline w-full">Get Started</Link>
          </div>

          {/* Pro */}
          <div className="p-8 bg-white rounded-lg border-2 border-blue-500 relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">Most Popular</span>
            </div>
            <h3 className="text-2xl font-semibold mb-2">Pro</h3>
            <p className="text-gray-600 mb-4">For growing teams</p>
            <p className="text-3xl font-bold mb-2">$49<span className="text-lg text-gray-600">/month</span></p>
            <p className="text-sm text-gray-500 mb-6">or ₹4,900 INR/month for India</p>
            <ul className="space-y-3 mb-6 text-sm">
              <li>✓ Up to 50 team members</li>
              <li>✓ Advanced goal tracking & OKRs</li>
              <li>✓ Unlimited job postings</li>
              <li>✓ Performance reviews (unlimited)</li>
              <li>✓ AI CV scoring (up to 100/month)</li>
              <li>✓ Email support</li>
            </ul>
            <StripeCheckout amount={4900 * 100} currency="usd" />
          </div>

          {/* Enterprise */}
          <div className="p-8 bg-white rounded-lg border border-gray-200">
            <h3 className="text-2xl font-semibold mb-2">Enterprise</h3>
            <p className="text-gray-600 mb-4">For large organizations</p>
            <p className="text-3xl font-bold mb-6">Custom<span className="text-lg text-gray-600">/month</span></p>
            <ul className="space-y-3 mb-6 text-sm">
              <li>✓ Unlimited team members</li>
              <li>✓ All Pro features</li>
              <li>✓ AI CV scoring (unlimited)</li>
              <li>✓ Custom integrations</li>
              <li>✓ Dedicated support</li>
              <li>✓ SLA guarantee</li>
            </ul>
            <a href="mailto:sales@targetym.com" className="btn btn-outline w-full">Contact Sales</a>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-center">FAQs</h2>
          <div className="space-y-4">
            <div className="p-4 bg-white rounded">
              <h4 className="font-semibold">Can I change plans anytime?</h4>
              <p className="text-gray-600 text-sm">Yes. Upgrade or downgrade at any time. Changes take effect at the end of your billing cycle.</p>
            </div>
            <div className="p-4 bg-white rounded">
              <h4 className="font-semibold">Is there a free trial?</h4>
              <p className="text-gray-600 text-sm">Our Free plan is your trial. No credit card required. Upgrade to Pro when ready.</p>
            </div>
            <div className="p-4 bg-white rounded">
              <h4 className="font-semibold">Do you offer discounts for annual billing?</h4>
              <p className="text-gray-600 text-sm">Yes! Annual plans come with 20% off. Contact sales@targetym.com for details.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
