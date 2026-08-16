import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CpuChipIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import Layout from '@/components/Layout/Layout';

const deliverables = [
  {
    label: '01',
    title: 'Architecture diagram',
    description:
      'Interactive drag-and-drop canvas with color-coded AWS service nodes and connection arrows. Editable Mermaid flowchart included.',
  },
  {
    label: '02',
    title: 'Cost breakdown',
    description:
      'Monthly and annual per-component estimates with category breakdowns (compute, storage, I/O, transfer) and scenario comparisons.',
  },
  {
    label: '03',
    title: 'Optimization suggestions',
    description:
      'Recommendations ranked by impact and effort, categorized by cost, performance, and security — with step-by-step guidance.',
  },
  {
    label: '04',
    title: 'Implementation roadmap',
    description:
      'Multi-phase delivery plan with tasks, risks, validation criteria, and Infrastructure-as-Code snippets ready to execute.',
  },
];

const steps = [
  {
    title: 'Describe',
    description:
      'Enter project requirements in plain English. Add constraints (budget, region, compliance) and preferences.',
  },
  {
    title: 'Generate',
    description:
      'Amazon Nova Lite designs a complete multi-component AWS architecture with connections, protocols, and reasoning.',
  },
  {
    title: 'Refine',
    description:
      'Review costs, apply optimizations, generate an implementation roadmap, and export to Draw.io or Mermaid.',
  },
];

const stack = [
  { name: 'Amazon Nova', kind: 'AI' },
  { name: 'AWS Bedrock', kind: 'AI' },
  { name: 'Next.js 14', kind: 'Frontend' },
  { name: 'TypeScript', kind: 'Frontend' },
  { name: 'Tailwind CSS', kind: 'Frontend' },
  { name: 'FastAPI', kind: 'Backend' },
  { name: 'PostgreSQL', kind: 'Backend' },
  { name: 'Docker', kind: 'Infra' },
];

const roadmap = [
  'Multi-cloud support (Azure, GCP)',
  'Full IaC generation (Terraform, CloudFormation)',
  'Architecture versioning and diff tracking',
  'Team collaboration',
  'Live AWS Cost Explorer integration',
  'CI/CD pipeline generation',
  'Compliance profile templates (HIPAA, SOC 2, GDPR)',
];

export default function Landing() {
  return (
    <Layout>
      <Head>
        <title>ArchitectAI — Cloud architecture in under a minute</title>
        <meta
          name="description"
          content="Turn plain English requirements into production-ready AWS architectures — with diagrams, cost breakdowns, optimization suggestions, and implementation roadmaps. Powered by Amazon Nova."
        />
      </Head>

      {/* Hero */}
      <section className="border-b border-secondary-200/60">
        <div className="mx-auto max-w-5xl px-6 pt-28 pb-32 lg:pt-40 lg:pb-40">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 text-xs font-medium text-secondary-500 uppercase tracking-wider mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
              Powered by Amazon Nova
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-secondary-900 leading-[1.05]">
              Cloud architecture,
              <br />
              <span className="text-secondary-400">designed in seconds.</span>
            </h1>

            <p className="mt-8 text-lg sm:text-xl text-secondary-600 max-w-2xl leading-relaxed">
              Turn plain English requirements into production-ready AWS designs — with
              diagrams, cost breakdowns, optimization suggestions, and implementation
              roadmaps. What senior architects do in hours, done in under a minute.
            </p>

            <div className="mt-12 flex items-center gap-6 flex-wrap">
              <Link
                href="/app"
                className="inline-flex items-center gap-2 rounded-md bg-secondary-900 px-5 py-3 text-sm font-medium text-white hover:bg-secondary-800 transition-colors"
              >
                Start building
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <a
                href="#deliverables"
                className="text-sm font-medium text-secondary-600 hover:text-secondary-900 transition-colors"
              >
                See what you get →
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b border-secondary-200/60">
        <div className="mx-auto max-w-5xl px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8">
          {[
            { value: '~30s', label: 'to generate' },
            { value: '4', label: 'deliverables per run' },
            { value: '2', label: 'Nova models orchestrated' },
            { value: '0', label: 'mock data — all real' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-semibold text-secondary-900">{s.value}</div>
              <div className="mt-1 text-xs text-secondary-500 uppercase tracking-wider">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Deliverables */}
      <section id="deliverables" className="border-b border-secondary-200/60">
        <div className="mx-auto max-w-5xl px-6 py-28">
          <div className="mb-20 max-w-2xl">
            <div className="text-xs font-medium text-secondary-500 uppercase tracking-wider mb-4">
              What you get
            </div>
            <h2 className="text-4xl font-semibold tracking-tight text-secondary-900 leading-tight">
              Four deliverables from a single prompt.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-14">
            {deliverables.map((d, i) => (
              <motion.div
                key={d.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <div className="text-xs font-medium text-primary-600 mb-3">{d.label}</div>
                <h3 className="text-xl font-semibold text-secondary-900 mb-3">{d.title}</h3>
                <p className="text-secondary-600 leading-relaxed">{d.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mock preview */}
      <section className="border-b border-secondary-200/60 bg-secondary-50/50">
        <div className="mx-auto max-w-6xl px-6 py-28">
          <div className="mb-16 max-w-2xl">
            <div className="text-xs font-medium text-secondary-500 uppercase tracking-wider mb-4">
              Interactive
            </div>
            <h2 className="text-4xl font-semibold tracking-tight text-secondary-900 leading-tight">
              A canvas built for architects.
            </h2>
            <p className="mt-4 text-secondary-600 leading-relaxed">
              Drag nodes, edit connections, switch to Mermaid, export to Draw.io. No plugins.
            </p>
          </div>

          <div className="rounded-lg border border-secondary-200 bg-white shadow-sm overflow-hidden">
            {/* Faux window chrome */}
            <div className="flex items-center gap-1.5 border-b border-secondary-200 px-4 py-3">
              <div className="h-2.5 w-2.5 rounded-full bg-secondary-200" />
              <div className="h-2.5 w-2.5 rounded-full bg-secondary-200" />
              <div className="h-2.5 w-2.5 rounded-full bg-secondary-200" />
              <div className="ml-4 text-xs text-secondary-400 font-mono">architecture.tsx</div>
            </div>
            {/* Mock canvas */}
            <div className="relative h-80 sm:h-96 bg-white overflow-hidden"
              style={{
                backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            >
              <MockNode className="top-6 left-1/2 -translate-x-1/2" color="secondary" label="Internet / Users" />
              <MockNode className="top-28 left-[20%]" color="primary" label="CloudFront" />
              <MockNode className="top-28 left-1/2 -translate-x-1/2" color="primary" label="API Gateway" />
              <MockNode className="top-28 left-[80%] -translate-x-full" color="primary" label="ALB" />
              <MockNode className="top-52 left-[30%]" color="green" label="Lambda" />
              <MockNode className="top-52 left-[70%] -translate-x-full" color="green" label="ECS Fargate" />
              <MockNode className="bottom-6 left-1/2 -translate-x-1/2" color="orange" label="RDS Aurora" />

              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                <defs>
                  <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
                  </marker>
                </defs>
                <g stroke="#cbd5e1" strokeWidth="1.5" fill="none" markerEnd="url(#arr)">
                  <line x1="50%" y1="14%" x2="20%" y2="34%" strokeDasharray="4 4" />
                  <line x1="50%" y1="14%" x2="50%" y2="34%" strokeDasharray="4 4" />
                  <line x1="50%" y1="14%" x2="80%" y2="34%" strokeDasharray="4 4" />
                  <line x1="50%" y1="42%" x2="30%" y2="60%" />
                  <line x1="80%" y1="42%" x2="70%" y2="60%" />
                  <line x1="30%" y1="68%" x2="50%" y2="88%" />
                  <line x1="70%" y1="68%" x2="50%" y2="88%" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-b border-secondary-200/60">
        <div className="mx-auto max-w-5xl px-6 py-28">
          <div className="mb-20 max-w-2xl">
            <div className="text-xs font-medium text-secondary-500 uppercase tracking-wider mb-4">
              How it works
            </div>
            <h2 className="text-4xl font-semibold tracking-tight text-secondary-900 leading-tight">
              Three steps. No configuration.
            </h2>
          </div>

          <div className="space-y-14">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="grid grid-cols-12 gap-6 items-baseline"
              >
                <div className="col-span-12 sm:col-span-3">
                  <div className="text-sm text-secondary-400 font-mono">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="mt-1 text-xl font-semibold text-secondary-900">
                    {step.title}
                  </div>
                </div>
                <div className="col-span-12 sm:col-span-9">
                  <p className="text-secondary-600 leading-relaxed text-lg">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Built with */}
      <section className="border-b border-secondary-200/60">
        <div className="mx-auto max-w-5xl px-6 py-28">
          <div className="mb-16 max-w-2xl">
            <div className="text-xs font-medium text-secondary-500 uppercase tracking-wider mb-4">
              Built with
            </div>
            <h2 className="text-4xl font-semibold tracking-tight text-secondary-900 leading-tight">
              A modern, boring stack.
            </h2>
            <p className="mt-4 text-secondary-600 leading-relaxed">
              Chosen for reliability. Two Nova models orchestrated for speed and accuracy.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {stack.map((s) => (
              <div
                key={s.name}
                className="inline-flex items-center gap-2 rounded-md border border-secondary-200 bg-white px-3 py-1.5 text-sm"
              >
                <span className="text-xs text-secondary-400 font-mono">{s.kind}</span>
                <span className="text-secondary-900 font-medium">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="border-b border-secondary-200/60">
        <div className="mx-auto max-w-5xl px-6 py-28">
          <div className="mb-16 max-w-2xl">
            <div className="text-xs font-medium text-secondary-500 uppercase tracking-wider mb-4">
              What's next
            </div>
            <h2 className="text-4xl font-semibold tracking-tight text-secondary-900 leading-tight">
              Roadmap.
            </h2>
          </div>

          <ul className="divide-y divide-secondary-200/60 border-y border-secondary-200/60">
            {roadmap.map((item) => (
              <li key={item} className="py-4 flex items-center gap-4">
                <span className="text-xs text-secondary-400 font-mono w-16">Planned</span>
                <span className="text-secondary-800">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-5xl px-6 py-32 text-center">
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-secondary-900 leading-tight">
            Ready to skip the whiteboard?
          </h2>
          <p className="mt-6 text-secondary-600 max-w-lg mx-auto">
            Describe your project. Get a complete architecture in under a minute.
          </p>
          <div className="mt-10">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 rounded-md bg-secondary-900 px-6 py-3.5 text-sm font-medium text-white hover:bg-secondary-800 transition-colors"
            >
              Start building
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-secondary-200/60">
        <div className="mx-auto max-w-5xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-secondary-900 flex items-center justify-center">
              <CpuChipIcon className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-medium text-secondary-900">ArchitectAI</span>
          </div>
          <p className="text-xs text-secondary-500">
            © {new Date().getFullYear()} · Built by{' '}
            <a
              href="https://zagran.dev"
              target="_blank"
              rel="noreferrer"
              className="text-secondary-700 hover:text-secondary-900 underline underline-offset-2"
            >
              zagran.dev
            </a>
          </p>
        </div>
      </footer>
    </Layout>
  );
}

function MockNode({
  className,
  color,
  label,
}: {
  className?: string;
  color: 'primary' | 'green' | 'orange' | 'secondary';
  label: string;
}) {
  const colorMap = {
    primary: 'border-primary-300 bg-primary-50 text-primary-900',
    green: 'border-emerald-300 bg-emerald-50 text-emerald-900',
    orange: 'border-orange-300 bg-orange-50 text-orange-900',
    secondary: 'border-secondary-300 bg-white text-secondary-900',
  };
  return (
    <div
      className={`absolute z-10 rounded-md border px-3 py-2 text-xs font-medium shadow-sm whitespace-nowrap ${colorMap[color]} ${className || ''}`}
    >
      {label}
    </div>
  );
}
