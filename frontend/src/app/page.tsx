import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import {
  Sparkles,
  FileText,
  Target,
  BarChart3,
  Zap,
  Shield,
  Check,
  ArrowRight,
  Star
} from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'AI Resume Analysis',
      description: 'Upload your resume and get instant AI-powered insights on your strengths, weaknesses, and improvement suggestions.',
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Tailored CVs',
      description: 'Paste any job description and generate an ATS-optimized CV in seconds, tailored specifically for that role.',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: 'Application Tracker',
      description: 'Keep track of all your job applications in one place. Never lose track of where you applied again.',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Instant Generation',
      description: 'Generate professional CVs in under 30 seconds. Save time and apply to more jobs faster.',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'ATS Optimized',
      description: 'Our AI ensures your CV passes Applicant Tracking Systems with industry-specific keywords and formatting.',
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'AI-Powered Insights',
      description: 'Get personalized recommendations to improve your chances of landing interviews based on your profile.',
    },
  ];

  const pricing = [
    {
      name: 'Free',
      price: '€0',
      period: '/month',
      description: 'Perfect for trying out Hunt-X',
      features: [
        '1 CV generation/month',
        '2 resume uploads',
        'Basic AI analysis',
        'Watermarked PDF exports',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Starter',
      price: '€9',
      period: '/month',
      description: 'For active job seekers',
      features: [
        '10 CV generations/month',
        '10 resume uploads',
        'Full AI analysis',
        'Clean PDF exports',
        'Email support',
      ],
      cta: 'Start Free Trial',
      popular: false,
    },
    {
      name: 'Pro',
      price: '€29',
      period: '/month',
      description: 'For serious job hunters',
      features: [
        'Unlimited CV generations',
        'Unlimited uploads',
        'Advanced AI insights',
        'Cover letters included',
        'Priority support',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Software Engineer',
      content: 'Hunt-X helped me land 5 interviews in just 2 weeks. The AI-generated CVs are incredibly tailored and professional.',
      rating: 5,
    },
    {
      name: 'Marcus Johnson',
      role: 'Product Manager',
      content: 'I was struggling to get callbacks. After using Hunt-X, I finally understood what was missing in my applications.',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Marketing Director',
      content: 'The time saved is incredible. What used to take hours now takes minutes. Best investment for my job search.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Job Search</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Land Your Dream Job with{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                AI-Generated CVs
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Upload your resume once. Generate tailored CVs for every job application in seconds.
              Track your applications and land interviews faster.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/auth">
                <Button variant="primary" size="lg" className="group">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="secondary" size="lg">
                  View Pricing
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-slate-500 text-sm">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Free forever plan</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to{' '}
              <span className="text-indigo-400">Get Hired</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Powerful AI tools designed to help you stand out and land more interviews
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It <span className="text-cyan-400">Works</span>
            </h2>
            <p className="text-slate-400 text-lg">
              Get started in 3 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Upload Your Resume',
                description: 'Upload your existing resume or CV. Our AI analyzes your experience, skills, and achievements.',
              },
              {
                step: '02',
                title: 'Paste Job Description',
                description: 'Copy and paste any job description. Our AI understands the requirements and company culture.',
              },
              {
                step: '03',
                title: 'Generate & Apply',
                description: 'Get a tailored CV in seconds. Download as PDF and apply with confidence.',
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-slate-800 mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-slate-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simple, <span className="text-emerald-400">Transparent</span> Pricing
            </h2>
            <p className="text-slate-400 text-lg">
              Start free, upgrade when you are ready
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricing.map((plan, index) => (
              <div
                key={index}
                className={`relative p-8 rounded-2xl ${
                  plan.popular
                    ? 'bg-gradient-to-b from-indigo-500/20 to-slate-900 border-2 border-indigo-500/50'
                    : 'bg-slate-800/50 border border-slate-700/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full text-white text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-slate-400 text-sm">{plan.description}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-slate-400">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-center gap-3 text-slate-300">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/upload" className="block">
                  <Button
                    variant={plan.popular ? 'primary' : 'secondary'}
                    className="w-full"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/pricing" className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-2">
              View full pricing details
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Loved by <span className="text-purple-400">Job Seekers</span>
            </h2>
            <p className="text-slate-400 text-lg">
              See what our users are saying
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-medium text-white">{testimonial.name}</p>
                  <p className="text-sm text-slate-400">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-cyan-600/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Land Your Dream Job?
          </h2>
          <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of job seekers who have transformed their job search with AI-powered CVs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/upload">
              <Button variant="primary" size="lg" className="group">
                Get Started Free
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="secondary" size="lg">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
