'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'lifetime'>('lifetime')

  return (
    <main className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple Pricing</h1>
          <p className="text-slate-400">Start free. Upgrade when you're ready.</p>
        </div>

        {/* Free Tier */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="p-8 bg-slate-800 rounded-xl border border-slate-700">
            <div className="text-sm text-slate-400 mb-2">Free</div>
            <div className="text-4xl font-bold mb-4">€0</div>
            <ul className="text-slate-300 space-y-3 mb-8">
              <li>✓ 1 CV generation</li>
              <li>✓ Basic resume upload</li>
              <li>✓ AI analysis preview</li>
              <li className="text-slate-500">✗ Unlimited CVs</li>
              <li className="text-slate-500">✗ Application tracker</li>
            </ul>
            <Link
              href="/upload"
              className="block w-full py-3 text-center border border-slate-600 hover:border-slate-500 rounded-lg font-semibold transition"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro Monthly */}
          <div className="p-8 bg-slate-800 rounded-xl border border-blue-500/50 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 text-sm font-semibold rounded-full">
              Most Popular
            </div>
            <div className="text-sm text-blue-400 mb-2">Pro Monthly</div>
            <div className="text-4xl font-bold mb-4">€29<span className="text-lg text-slate-400">/mo</span></div>
            
            <ul className="text-slate-300 space-y-3 mb-8">
              <li>✓ Unlimited CV generations</li>
              <li>✓ AI resume analysis</li>
              <li>✓ Application tracker</li>
              <li>✓ Priority support</li>
              <li>✓ Cancel anytime</li>
            </ul>
            <Link
              href="/checkout?plan=monthly"
              className="block w-full py-3 text-center bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition"
            >
              Start Pro Monthly
            </Link>
          </div>

          {/* Lifetime */}
          <div className="p-8 bg-slate-800 rounded-xl border border-emerald-500/50">
            <div className="text-sm text-emerald-400 mb-2">Lifetime Deal</div>
            <div className="text-4xl font-bold mb-4">€49<span className="text-lg text-slate-400"> once</span></div>
            
            <ul className="text-slate-300 space-y-3 mb-8">
              <li>✓ Everything in Pro</li>
              <li>✓ Lifetime updates</li>
              <li>✓ No monthly fees</li>
              <li>✓ Best value</li>
              <li className="text-emerald-400">✓ Save €349 over 2 years</li>
            </ul>
            <Link
              href="/checkout?plan=lifetime"
              className="block w-full py-3 text-center bg-emerald-500 hover:bg-emerald-600 rounded-lg font-semibold transition"
            >
              Get Lifetime Access
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <div className="text-center">
          <p className="text-slate-400">
            Questions?{' '}
            <a href="mailto:support@hunt-x.app" className="text-blue-400 hover:text-blue-300">
              support@hunt-x.app
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}