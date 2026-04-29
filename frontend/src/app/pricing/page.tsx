'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, X, ArrowRight } from 'lucide-react'

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
    ctaStyle: 'ghost' as const,
  },
]

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')

  return (
    <main className="min-h-screen bg-[#0B0B0F] text-[#E8E8ED]">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-[#0B0B0F]/80 backdrop-blur-md border-b border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-medium tracking-tight text-[#E8E8ED]">
            Hunt-X
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth" className="text-sm px-4 py-2 text-[#E8E8ED] hover:bg-white/[0.04] rounded-md transition-colors duration-150">
              Sign In
            </Link>
            <Link href="/upload" className="text-sm px-4 py-2 bg-[#3B82F6] text-white rounded-md hover:bg-[#60A5FA] transition-all duration-150 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-16 pb-12 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#3B82F6]/[0.05] rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-[1200px] mx-auto px-4 relative">
          <span className="text-xs text-[#5A5E66] uppercase tracking-wider">Pricing</span>
          <h1 className="text-4xl md:text-5xl font-medium mt-4 mb-4 text-[#E8E8ED]" style={{ letterSpacing: '-0.96px', lineHeight: 1.1 }}>
            Simple Pricing, Powerful Results
          </h1>
          <p className="text-lg text-[#8A8F98] mb-8">
            Start free. Upgrade when you are ready to accelerate your job search.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-2 p-1 bg-[#1A1A24] rounded-lg border border-white/[0.06]">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-4 py-2 text-sm rounded-md transition-all duration-150 ${billing === 'monthly' ? 'bg-[#3B82F6] text-white' : 'text-[#8A8F98] hover:text-[#E8E8ED]'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-4 py-2 text-sm rounded-md transition-all duration-150 ${billing === 'yearly' ? 'bg-[#3B82F6] text-white' : 'text-[#8A8F98] hover:text-[#E8E8ED]'}`}
            >
              Yearly
            </button>
          </div>
          {billing === 'yearly' && (
            <p className="text-xs text-[#00D26A] mt-2">Save 2 months free with yearly billing</p>
          )}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-4">
            {plans.map((plan) => {
              const price = billing === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice
              const period = billing === 'monthly' ? '/mo' : '/year'
              return (
                <div
                  key={plan.name}
                  className={`relative p-8 rounded-lg border flex flex-col ${
                    plan.featured
                      ? 'border-[#3B82F6]/[0.4] shadow-[0_0_30px_rgba(59,130,246,0.15)]'
                      : 'border-white/[0.06]'
                  } bg-[#1A1A24]`}
                >
                  {plan.featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[10px] font-medium bg-[#3B82F6] text-white rounded-md">
                      MOST POPULAR
                    </span>
                  )}
                  <div className={`text-sm mb-2 ${plan.featured ? 'text-[#60A5FA]' : 'text-[#5A5E66]'}`}>{plan.name}</div>
                  <div className="text-5xl font-medium text-[#E8E8ED] mb-1">
                    &euro;{price}
                  </div>
                  <div className="text-base text-[#8A8F98] mb-4">{period}</div>
                  <p className="text-base text-[#8A8F98] mb-6">{plan.description}</p>
                  <Link
                    href={plan.name === 'Free' ? '/upload' : '/auth'}
                    className={`block w-full py-3 text-center rounded-md text-sm font-medium transition-all duration-150 active:scale-[0.98] mb-6 ${
                      plan.ctaStyle === 'primary'
                        ? 'bg-[#3B82F6] text-white hover:bg-[#60A5FA] hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                        : 'border border-white/[0.10] text-[#E8E8ED] hover:bg-white/[0.04] hover:border-white/[0.14]'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                  <ul className="space-y-3 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className="flex items-start gap-2 text-sm">
                        {feature.included ? (
                          <Check className="w-4 h-4 text-[#00D26A] mt-0.5 shrink-0" />
                        ) : (
                          <X className="w-4 h-4 text-[#5A5E66] mt-0.5 shrink-0" />
                        )}
                        <span className={feature.included ? 'text-[#8A8F98]' : 'text-[#5A5E66]'}>
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
      <section className="py-16 bg-[#12121A] border-y border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-2xl font-medium text-[#E8E8ED] mb-8 text-center">Full Feature Comparison</h2>
          <div className="bg-[#1A1A24] rounded-lg border border-white/[0.06] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left p-4 font-medium text-[#8A8F98]">Feature</th>
                  <th className="text-center p-4 font-medium text-[#E8E8ED]">Free</th>
                  <th className="text-center p-4 font-medium text-[#E8E8ED]">Starter</th>
                  <th className="text-center p-4 font-medium text-[#00D26A]">Pro</th>
                  <th className="text-center p-4 font-medium text-[#00D26A]">Team</th>
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
                  <tr key={row.feature} className={i % 2 === 0 ? 'bg-[#1A1A24]' : 'bg-[#12121A]'}>
                    <td className="p-4 text-[#8A8F98]">{row.feature}</td>
                    <td className="p-4 text-center text-[#8A8F98]">{row.free}</td>
                    <td className="p-4 text-center text-[#8A8F98]">{row.starter}</td>
                    <td className="p-4 text-center text-[#00D26A]">{row.pro}</td>
                    <td className="p-4 text-center text-[#00D26A]">{row.team}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16">
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-2xl font-medium text-[#E8E8ED] mb-8 text-center">Frequently Asked Questions</h2>
          <div className="max-w-2xl mx-auto space-y-3">
            {[
              { q: 'Can I cancel anytime?', a: 'Yes. You can cancel your subscription at any time from your account settings. Your access continues until the end of your billing period.' },
              { q: 'What happens when I hit my free limit?', a: 'You will be prompted to upgrade to a paid plan. Your existing data (resumes, evaluations) remains accessible even on the free tier.' },
              { q: 'Is there a free trial for paid plans?', a: 'We offer a generous free tier so you can try core features before upgrading. There is no separate trial period for paid plans.' },
              { q: 'Can I change plans later?', a: 'Absolutely. You can upgrade or downgrade at any time. Upgrades take effect immediately; downgrades apply at the next billing cycle.' },
              { q: 'Do you offer refunds?', a: 'If you are not satisfied, contact us within 14 days of your first paid subscription for a full refund.' },
            ].map((faq) => (
              <details key={faq.q} className="group bg-[#1A1A24] rounded-lg border border-white/[0.06] overflow-hidden">
                <summary className="flex items-center justify-between cursor-pointer list-none px-6 py-4 hover:bg-white/[0.02] transition-colors duration-150">
                  <span className="text-sm font-medium text-[#E8E8ED]">{faq.q}</span>
                  <span className="text-[#8A8F98] group-open:rotate-180 transition-transform duration-150">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                </summary>
                <p className="text-sm text-[#8A8F98] px-6 pb-4 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#12121A] border-t border-white/[0.06] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#3B82F6]/[0.06] rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-[1200px] mx-auto px-4 text-center relative">
          <h2 className="text-2xl font-medium text-[#E8E8ED] mb-2">Still have questions?</h2>
          <p className="text-base text-[#8A8F98] mb-6">
            Our team is here to help you choose the right plan.
          </p>
          <a
            href="mailto:support@hunt-x.app"
            className="inline-block px-6 py-3 bg-[#3B82F6] text-white rounded-md hover:bg-[#60A5FA] transition-all duration-150 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] font-medium active:scale-[0.98]"
          >
            Contact Support
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto px-4 text-center text-sm text-[#5A5E66]">
          &copy; 2026 Hunt-X. All rights reserved.
        </div>
      </footer>
    </main>
  )
}
