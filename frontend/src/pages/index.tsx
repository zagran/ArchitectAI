import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CpuChipIcon,
  CurrencyDollarIcon,
  MapIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  BoltIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import Layout from '@/components/Layout/Layout';

const features = [
  {
    icon: BoltIcon,
    title: 'AI-Powered Generation',
    description: 'Describe your requirements in plain English. Amazon Nova AI designs a complete AWS architecture tailored to your needs in seconds.',
  },
  {
    icon: CurrencyDollarIcon,
    title: 'Cost Analysis',
    description: 'Get a detailed monthly and annual cost breakdown per component with scenario comparisons and optimization recommendations.',
  },
  {
    icon: MapIcon,
    title: 'Implementation Roadmap',
    description: 'Receive a phased implementation plan with tasks, risks, IaC code blocks, and rollback procedures — ready to execute.',
  },
  {
    icon: ChartBarIcon,
    title: 'Interactive Diagrams',
    description: 'Explore your architecture with a drag-and-drop canvas or editable Mermaid flowcharts. Visualize connections and data flows at a glance.',
  },
  {
    icon: ArrowDownTrayIcon,
    title: 'Draw.io Export',
    description: 'Export your architecture as a Draw.io diagram with real AWS service icons, ready to share with your team.',
  },
  {
    icon: CpuChipIcon,
    title: 'Smart Optimizations',
    description: 'AI identifies cost, performance, and security improvements ranked by impact and effort so you know what to tackle first.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Describe Your Requirements',
    description: 'Enter your project description, constraints (budget, region, compliance), and preferences. Upload supporting documents if needed.',
  },
  {
    number: '02',
    title: 'AI Designs Your Architecture',
    description: 'Amazon Nova analyzes your input and generates a complete multi-component AWS architecture with connections, protocols, and reasoning.',
  },
  {
    number: '03',
    title: 'Analyze, Optimize & Export',
    description: 'Review costs, apply optimizations, generate an implementation roadmap, and export diagrams — all from one place.',
  },
];

export default function Landing() {
  return (
    <Layout>
      <Head>
        <title>ArchitectAI — AI-Powered AWS Architecture Generator</title>
        <meta
          name="description"
          content="Transform business requirements into complete AWS architectures with cost analysis, implementation roadmaps, and interactive diagrams — powered by Amazon Nova AI."
        />
      </Head>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-900 text-white">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}
        />
        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-36 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium mb-8 border border-white/20">
              <BoltIcon className="h-4 w-4 text-yellow-300" />
              Powered by Amazon Nova AI
            </div>

            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Architecture design,
              <br />
              <span className="text-primary-200">done in seconds</span>
            </h1>

            <p className="mt-6 text-lg leading-8 text-primary-100 max-w-2xl mx-auto">
              Describe your project requirements and let AI generate a complete AWS architecture —
              with cost breakdowns, optimization suggestions, implementation roadmaps, and exportable diagrams.
            </p>

            <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-semibold text-primary-700 shadow-sm hover:bg-primary-50 transition-colors"
              >
                Get Started Free
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-base font-semibold text-white hover:bg-white/10 transition-colors"
              >
                See How It Works
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-secondary-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-secondary-900 sm:text-4xl">
              Everything you need to architect faster
            </h2>
            <p className="mt-4 text-lg text-secondary-600 max-w-xl mx-auto">
              From first draft to production-ready blueprint in one tool.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="bg-white rounded-xl border border-secondary-200 p-6 shadow-sm"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 mb-4">
                  <feature.icon className="h-5 w-5 text-primary-600" />
                </div>
                <h3 className="text-base font-semibold text-secondary-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-secondary-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-secondary-900 sm:text-4xl">How it works</h2>
            <p className="mt-4 text-lg text-secondary-600">Three steps from idea to architecture.</p>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative"
              >
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-px bg-secondary-200 -translate-x-6" />
                )}
                <div className="text-5xl font-black text-primary-100 mb-4">{step.number}</div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">{step.title}</h3>
                <p className="text-sm text-secondary-600 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="bg-secondary-50 py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-900 sm:text-4xl">
              What you get with every architecture
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              'Full component list with service types and descriptions',
              'Cost breakdown by component — monthly & annual',
              'Scenario comparisons (baseline, optimized, high-availability)',
              'Prioritized optimization recommendations',
              'Phased implementation roadmap with IaC snippets',
              'Interactive drag-and-drop architecture canvas',
              'Editable Mermaid flowchart with live preview',
              'Draw.io export with AWS icons',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 bg-white rounded-lg border border-secondary-200 p-4">
                <CheckCircleIcon className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-secondary-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to design your architecture?
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            Free to use. No credit card required.
          </p>
          <div className="mt-8">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3.5 text-base font-semibold text-primary-700 shadow-sm hover:bg-primary-50 transition-colors"
            >
              Start Building
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary-900 py-10">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-primary-600 flex items-center justify-center">
              <CpuChipIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">ArchitectAI</span>
          </div>
          <p className="text-xs text-secondary-500">
            © {new Date().getFullYear()} ArchitectAI. Powered by Amazon Nova AI.
          </p>
        </div>
      </footer>
    </Layout>
  );
}
