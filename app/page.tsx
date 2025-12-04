import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">People-First Performance</h1>
          <p className="text-xl text-gray-600 mb-8">Manage Goals, Recruitment, and Performance Reviews in one unified platform. Built for growing teams.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/auth/sign-up" className="btn btn-primary btn-lg">Get Started Free</Link>
            <Link href="/pricing" className="btn btn-outline btn-lg">View Pricing</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">🎯 Goals & OKRs</h3>
              <p>Set aligned goals, track progress, and celebrate wins across your organization.</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">💼 Recruitment</h3>
              <p>AI-powered CV scoring, candidate tracking, and interview management in one place.</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">⭐ Performance</h3>
              <p>360° feedback, peer reviews, and data-driven insights for fair evaluations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-8">Simple, Transparent Pricing</h2>
          <p className="text-gray-600 mb-8">Start free. Upgrade when you're ready.</p>
          <Link href="/pricing" className="btn btn-primary btn-lg">See All Plans</Link>
        </div>
      </section>
    </main>
  )
}
