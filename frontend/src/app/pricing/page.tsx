'use client'

import { useState } from 'react'
import Link from 'next/link'

const plans = [
  {
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Perfect for trying out Hunt-X',
    features: [
      { text: '5 job scans per month', included: true },
      { text: '1 CV generation', included: true },
      { text: 'Basic resume analysis', included: true },
      { text: 'Email support', included: true },
      { text: 'Cover letter generation', included: false },
      { text: 'Interview prep', included: false },
      { text: 'Application tracker', included: false },
      { text: 'Priority support', included: false },
    ],
    cta: 'Get Started',
    ctaStyle: 'ghost' as const,
  },
  {
    name: 'Starter',
    monthlyPrice: 9,
    yearlyPrice: 90,
    description: 'For active job seekers',
    features: [
      { text: '20 job scans per month', included: true },
      { text: '5 CV generations', included: true },
      { text: 'Full resume analysis', included: true },
      { text: 'Cover letter generation', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Interview prep', included: false },
      { text: 'Application tracker', included: false },
      { text: 'API access', included: false },
    ],
    cta: 'Start Starter',
    ctaStyle: 'primary' as const,
  },
  {
    name: 'Pro',
    monthlyPrice: 29,
    yearlyPrice: 290,
    description: 'For serious job hunters',
    featured: true,
    features: [
      { text: 'Unlimited job scans', included: true },
      { text: 'Unlimited CV generations', included: true },
      { text: 'Advanced AI resume scoring', included: true },
      { text: 'Unlimited cover letters', included: true },
      { text: 'Interview prep & mock questions', included: true },
      { text: 'Application tracker', included: true },
      { text: 'Priority chat support', included: true },
      { text: 'API access', included: false },
    ],
    cta: 'Start Pro',
    ctaStyle: 'primary' as const,
  },
  {
    name: 'Team',
    monthlyPrice: 49,
    yearlyPrice: 490,
    description: 'For teams & career coaches',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Up to 5 team members', included: true },
      { text: 'Shared job boards', included: true },
      { text: 'Team analytics dashboard', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'API access', included: true },
      { text: 'White-label exports', included: true },
      { text: 'Admin analytics', included: true },
    ],
    cta: 'Contact Sales',
    ctaStyle: 'ghost-dark' as const,
  },
]

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')

  return (
    <main className="min-h-screen bg-white text-[#061b31]">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#e5edf5]">
        <div className="max-w-[1080px] mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-normal tracking-tight" style={{ fontFamily: 'sohne-var, SF Pro Display, system-ui, sans-serif' }}>
            Hunt-X
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth" className="text-sm px-4 py-2 text-[#061b31] hover:bg-[#f6f9fc] rounded transition">
              Sign In
            </Link>
            <Link href="/upload" className="text-sm px-4 py-2 bg-[#533afd] text-white rounded hover:bg-[#4338ca] transition">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-16 pb-12 text-center">
        <div className="max-w-[1080px] mx-auto px-4">
          <span className="text-xs text-[#64748d] uppercase tracking-wider">Pricing</span>
          <h1 className="text-4xl md:text-5xl font-light mt-4 mb-4 text-[#061b31]" style={{ letterSpacing: '-0.96px' }}>
            Simple Pricing, Powerful Results
          </h1>
          <p className="text-lg text-[#64748d] mb-8">
            Start free. Upgrade when you are ready to accelerate your job search.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-2 p-1 bg-[#f6f9fc] rounded-lg">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-4 py-2 text-sm rounded transition ${billing === 'monthly' ? 'bg-[#061b31] text-white' : 'text-[#64748d] hover:text-[#061b31]'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-4 py-2 text-sm rounded transition ${billing === 'yearly' ? 'bg-[#061b31] text-white' : 'text-[#64748d] hover:text-[#061b31]'}`}
            >
              Yearly
            </button>
          </div>
          {billing === 'yearly' && (
            <p className="text-xs text-[#15be53] mt-2">Save 2 months free with yearly billing</p>
          )}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16">
        <div className="max-w-[1080px] mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-4">
            {plans.map((plan) => {
              const price = billing === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice
              const period = billing === 'monthly' ? '/mo' : '/year'
              return (
                <div
                  key={plan.name}
                  className={`relative p-8 rounded-lg border bg-white flex flex-col ${
                    plan.featured
                      ? 'border-t-4 border-t-[#533afd] border-[#e5edf5] shadow-[0_30px_45px_-30px_rgba(50,50,93,0.25)]'
                      : 'border-[#e5edf5]'
                  }`}
                >
                  {plan.featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[10px] font-normal bg-[#533afd] text-white rounded">
                      MOST POPULAR
                    </span>
                  )}
                  <div className={`text-sm mb-2 ${plan.name === 'Starter' || plan.name === 'Pro' ? 'text-[#533afd]' : 'text-[#64748d]'}`}>
                    {plan.name}
                  </div>
                  <div className="text-5xl font-light text-[#061b31] mb-1">
                    &euro;{price}
                  </div>
                  <div className="text-base text-[#64748d] mb-4">{period}</div>
                  <p className="text-base text-[#64748d] mb-6">{plan.description}</p>
                  <Link
                    href={plan.name === 'Free' ? '/upload' : '/auth'}
                    className={`block w-full py-3 text-center rounded text-sm font-normal mb-6 transition ${
                      plan.ctaStyle === 'primary'
                        ? 'bg-[#533afd] text-white hover:bg-[#4338ca]'
                        : plan.ctaStyle === 'ghost-dark'
                        ? 'border border-[#061b31] text-[#061b31] hover:bg-[#f6f9fc]'
                        : 'border border-[#b9b9f9] text-[#533afd] hover:bg-[#f6f9fc]'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                  <ul className="space-y-3 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className="flex items-start gap-2 text-sm">
                        {feature.included ? (
                          <svg className="w-4 h-4 text-[#15be53] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-[#64748d] mt-0.5 shrink-0 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        <span className={feature.included ? 'text-[#64748d]' : 'text-[#64748d] opacity-40'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 bg-[#f6f9fc]">
        <div className="max-w-[1080px] mx-auto px-4">
          <h2 className="text-2xl font-light text-[#061b31] mb-8 text-center">Full Feature Comparison</h2>
          <div className="bg-white rounded-lg border border-[#e5edf5] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5edf5]">
                  <th className="text-left p-4 font-normal text-[#64748d]">Feature</th>
                  <th className="text-center p-4 font-normal text-[#061b31]">Free</th>
                  <th className="text-center p-4 font-normal text-[#061b31]">Starter</th>
                  <th className="text-center p-4 font-normal text-[#061b31]">Pro</th>
                  <th className="text-center p-4 font-normal text-[#061b31]">Team</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Job Scans', free: '5/mo', starter: '20/mo', pro: 'Unlimited', team: 'Unlimited' },
                  { feature: 'CV Generations', free: '1/mo', starter: '5/mo', pro: 'Unlimited', team: 'Unlimited' },
                  { feature: 'Resume Analysis', free: 'Basic', starter: 'Full', pro: 'Advanced AI', team: 'Advanced AI' },
                  { feature: 'Cover Letters', free: '—', starter: '5/mo', pro: 'Unlimited', team: 'Unlimited' },
                  { feature: 'Interview Prep', free: '—', starter: '—', pro: 'Included', team: 'Included' },
                  { feature: 'App Tracker', free: '—', starter: '—', pro: 'Included', team: 'Included' },
                  { feature: 'Team Members', free: '—', starter: '—', pro: '—', team: 'Up to 5' },
                  { feature: 'API Access', free: '—', starter: '—', pro: '—', team: 'Included' },
                  { feature: 'Support', free: 'Email', starter: 'Priority Email', pro: 'Priority Chat', team: 'Dedicated' },
                ].map((row, i) => (
                  <tr key={row.feature} className={i % 2 === 0 ? 'bg-white' : 'bg-[#f6f9fc]'}>
                    <td className="p-4 text-[#64748d]">{row.feature}</td>
                    <td className="p-4 text-center text-[#64748d]">{row.free}</td>
                    <td className="p-4 text-center text-[#64748d]">{row.starter}</td>
                    <td className="p-4 text-center text-[#15be53]">{row.pro}</td>
                    <td className="p-4 text-center text-[#15be53]">{row.team}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16">
        <div className="max-w-[1080px] mx-auto px-4">
          <h2 className="text-2xl font-light text-[#061b31] mb-8 text-center">Frequently Asked Questions</h2>
          <div className="max-w-2xl mx-auto space-y-4">
            {[
              { q: 'Can I cancel anytime?', a: 'Yes. You can cancel your subscription at any time from your account settings. Your access continues until the end of your billing period.' },
              { q: 'What happens when I hit my free limit?', a: 'You will be prompted to upgrade to a paid plan. Your existing data (resumes, evaluations) remains accessible even on the free tier.' },
              { q: 'Is there a free trial for paid plans?', a: 'We offer a generous free tier so you can try core features before upgrading. There is no separate trial period for paid plans.' },
              { q: 'Can I change plans later?', a: 'Absolutely. You can upgrade or downgrade at any time. Upgrades take effect immediately; downgrades apply at the next billing cycle.' },
              { q: 'Do you offer refunds?', a: 'If you are not satisfied, contact us within 14 days of your first paid subscription for a full refund.' },
            ].map((faq) => (
              <details key={faq.q} className="group border-b border-[#e5edf5] pb-4">
                <summary className="flex items-center justify-between cursor-pointer list-none py-2">
                  <span className="text-base font-normal text-[#061b31]">{faq.q}</span>
                  <span className="text-[#64748d] group-open:rotate-180 transition">&#9662;</span>
                </summary>
                <p className="text-base text-[#64748d] pt-2 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#1c1e54]">
        <div className="max-w-[1080px] mx-auto px-4 text-center">
          <h2 className="text-2xl font-light text-white mb-2">Still have questions?</h2>
          <p className="text-base text-white/70 mb-6">
            Our team is here to help you choose the right plan.
          </p>
          <a
            href="mailto:support@hunt-x.app"
            className="inline-block px-6 py-3 bg-white text-[#533afd] rounded hover:bg-gray-100 transition"
          >
            Contact Support
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#e5edf5]">
        <div className="max-w-[1080px] mx-auto px-4 text-center text-sm text-[#64748d]">
          &copy; 2026 Hunt-X. All rights reserved.
        </div>
      </footer>
    </main>
  )
}
