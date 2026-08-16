import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  CpuChipIcon,
  ArrowRightIcon,
  BoltIcon,
  CommandLineIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import Layout from '@/components/Layout/Layout';

const deliverables = [
  {
    label: '01',
    title: 'Architecture diagram',
    description:
      'Interactive drag-and-drop canvas with color-coded AWS nodes and connection arrows. Editable Mermaid flowchart included.',
    accent: 'primary',
  },
  {
    label: '02',
    title: 'Cost breakdown',
    description:
      'Per-component monthly and annual estimates with category splits (compute, storage, I/O, transfer) and scenario comparisons.',
    accent: 'emerald',
  },
  {
    label: '03',
    title: 'Optimizations',
    description:
      'Recommendations ranked by impact and effort. Categorized by cost, performance, and security — with step-by-step guidance.',
    accent: 'amber',
  },
  {
    label: '04',
    title: 'Implementation roadmap',
    description:
      'Multi-phase delivery plan with tasks, risks, validation criteria, and Infrastructure-as-Code snippets ready to execute.',
    accent: 'violet',
  },
];

const stack = [
  { name: 'Amazon Nova Lite', kind: 'AI' },
  { name: 'Amazon Nova Micro', kind: 'AI' },
  { name: 'AWS Bedrock', kind: 'AI' },
  { name: 'Next.js 14', kind: 'Frontend' },
  { name: 'TypeScript', kind: 'Frontend' },
  { name: 'Tailwind CSS', kind: 'Frontend' },
  { name: 'Framer Motion', kind: 'Frontend' },
  { name: 'Recharts', kind: 'Frontend' },
  { name: 'Mermaid', kind: 'Frontend' },
  { name: 'FastAPI', kind: 'Backend' },
  { name: 'SQLAlchemy', kind: 'Backend' },
  { name: 'PostgreSQL', kind: 'Backend' },
  { name: 'Redis', kind: 'Backend' },
  { name: 'Docker', kind: 'Infra' },
  { name: 'ECS Fargate', kind: 'Infra' },
];

const roadmap = [
  'Multi-cloud support (Azure, GCP)',
  'Full IaC generation (Terraform, CloudFormation)',
  'Architecture versioning and diff tracking',
  'Team collaboration',
  'Live AWS Cost Explorer integration',
  'CI/CD pipeline generation',
  'Compliance profile templates (HIPAA, SOC 2, GDPR)',
  'Fine-tuning via human feedback loops',
];

const promptText = `Build a scalable e-commerce platform on AWS.
Expected traffic: 500k users/mo, EU region,
GDPR compliant, budget $2k/month.
Real-time inventory sync, image CDN,
async order processing.`;

export default function Landing() {
  return (
    <Layout>
      <Head>
        <title>ArchitectAI — Cloud architecture in under a minute</title>
        <meta
          name="description"
          content="Turn plain English requirements into production-ready AWS architectures — diagrams, cost breakdowns, optimization suggestions, and implementation roadmaps. Powered by Amazon Nova."
        />
      </Head>

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-secondary-950 text-white">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(148,163,184,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.4) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
            maskImage:
              'radial-gradient(ellipse at center, black 40%, transparent 75%)',
            WebkitMaskImage:
              'radial-gradient(ellipse at center, black 40%, transparent 75%)',
          }}
        />
        {/* Glow orbs */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary-500/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 pt-24 pb-32 lg:pt-32">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* Left: Copy */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur px-3 py-1 text-xs font-mono text-secondary-300 mb-8">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                nova-lite · nova-micro · online
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.02]">
                Prompt in.
                <br />
                <span className="bg-gradient-to-r from-primary-300 via-violet-300 to-primary-300 bg-clip-text text-transparent">
                  Architecture out.
                </span>
              </h1>

              <p className="mt-8 text-lg text-secondary-300 max-w-xl leading-relaxed">
                Turn plain English into production-ready AWS designs — diagrams, cost
                breakdowns, optimizations, and roadmaps. What senior architects spend hours
                on, done in <span className="font-mono text-white">~30s</span>.
              </p>

              <div className="mt-10 flex items-center gap-6 flex-wrap">
                <Link
                  href="/app"
                  className="group inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 text-sm font-semibold text-secondary-950 hover:bg-secondary-100 transition-colors"
                >
                  <SparklesIcon className="h-4 w-4" />
                  Start building
                  <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <a
                  href="#demo"
                  className="inline-flex items-center gap-2 text-sm font-medium text-secondary-300 hover:text-white transition-colors"
                >
                  <CommandLineIcon className="h-4 w-4" />
                  See it in action
                </a>
              </div>
            </motion.div>

            {/* Right: Terminal */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-5"
            >
              <TerminalMock />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <section className="border-b border-secondary-200/60 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-14 grid grid-cols-2 sm:grid-cols-4 gap-8">
          {[
            { value: '~30s', label: 'generation time' },
            { value: '4', label: 'deliverables per run' },
            { value: '2', label: 'Nova models orchestrated' },
            { value: '0', label: 'mock data — 100% real' },
          ].map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-3xl sm:text-4xl font-semibold text-secondary-900 tracking-tight font-mono">
                {s.value}
              </div>
              <div className="mt-1.5 text-xs text-secondary-500 uppercase tracking-wider">
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============ DEMO: PROMPT → OUTPUT ============ */}
      <section id="demo" className="border-b border-secondary-200/60 bg-secondary-50/60">
        <div className="mx-auto max-w-6xl px-6 py-28">
          <div className="mb-16 max-w-2xl">
            <div className="text-xs font-mono text-primary-600 uppercase tracking-wider mb-4">
              // demo
            </div>
            <h2 className="text-4xl font-semibold tracking-tight text-secondary-900 leading-tight">
              You describe. It builds.
            </h2>
            <p className="mt-4 text-secondary-600 leading-relaxed">
              A single prompt becomes a structured, schema-validated architecture spec.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Input panel */}
            <PanelCard label="INPUT" title="Your prompt" accent="primary">
              <div className="font-mono text-sm text-secondary-700 whitespace-pre-line leading-relaxed">
                {promptText}
              </div>
              <div className="mt-6 pt-4 border-t border-secondary-200 flex items-center justify-between text-xs">
                <span className="font-mono text-secondary-400">requirements.md</span>
                <span className="inline-flex items-center gap-1.5 text-secondary-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Ready
                </span>
              </div>
            </PanelCard>

            {/* Output panel */}
            <PanelCard label="OUTPUT" title="Generated architecture" accent="violet">
              <div className="space-y-2 font-mono text-xs">
                <JsonLine k='"name"' v='"E-commerce Platform EU"' />
                <JsonLine k='"components"' v='[' bracket />
                <div className="pl-4 space-y-1">
                  <JsonLine k='"CloudFront"' v='"cdn"' />
                  <JsonLine k='"ALB"' v='"load_balancer"' />
                  <JsonLine k='"ECS Fargate"' v='"compute"' />
                  <JsonLine k='"Aurora Serverless"' v='"database"' />
                  <JsonLine k='"ElastiCache"' v='"cache"' />
                  <JsonLine k='"SQS"' v='"messaging"' />
                  <JsonLine k='"S3"' v='"storage"' />
                </div>
                <div className="text-secondary-400">]</div>
                <JsonLine k='"monthly_cost"' v='"$1,847"' />
                <JsonLine k='"compliance"' v='["GDPR"]' />
                <JsonLine k='"region"' v='"eu-west-1"' />
              </div>
              <div className="mt-6 pt-4 border-t border-secondary-200 flex items-center justify-between text-xs">
                <span className="font-mono text-secondary-400">architecture.json</span>
                <span className="inline-flex items-center gap-1.5 text-secondary-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                  200 OK · 28.4s
                </span>
              </div>
            </PanelCard>
          </div>
        </div>
      </section>

      {/* ============ DELIVERABLES ============ */}
      <section id="deliverables" className="border-b border-secondary-200/60 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-28">
          <div className="mb-20 max-w-2xl">
            <div className="text-xs font-mono text-primary-600 uppercase tracking-wider mb-4">
              // deliverables
            </div>
            <h2 className="text-4xl font-semibold tracking-tight text-secondary-900 leading-tight">
              Four artifacts. One prompt.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {deliverables.map((d, i) => {
              const accentClasses = {
                primary: { bar: 'bg-primary-500', text: 'text-primary-600' },
                emerald: { bar: 'bg-emerald-500', text: 'text-emerald-600' },
                amber: { bar: 'bg-amber-500', text: 'text-amber-600' },
                violet: { bar: 'bg-violet-500', text: 'text-violet-600' },
              }[d.accent as 'primary' | 'emerald' | 'amber' | 'violet'];
              return (
                <motion.div
                  key={d.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="group relative rounded-lg border border-secondary-200 bg-white p-8 hover:border-secondary-300 transition-colors"
                >
                  <div className={`absolute top-0 left-0 h-0.5 w-12 ${accentClasses.bar} group-hover:w-24 transition-all duration-300`} />
                  <div className="flex items-baseline justify-between mb-4">
                    <div className={`text-xs font-mono ${accentClasses.text}`}>{d.label}</div>
                    <MiniPreview type={d.label} />
                  </div>
                  <h3 className="text-xl font-semibold text-secondary-900 mb-3">{d.title}</h3>
                  <p className="text-secondary-600 leading-relaxed text-sm">{d.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ MOCK CANVAS ============ */}
      <section className="border-b border-secondary-200/60 bg-secondary-950 text-white overflow-hidden relative">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6 py-28">
          <div className="mb-16 max-w-2xl">
            <div className="text-xs font-mono text-primary-400 uppercase tracking-wider mb-4">
              // interactive
            </div>
            <h2 className="text-4xl font-semibold tracking-tight leading-tight">
              A canvas built for architects.
            </h2>
            <p className="mt-4 text-secondary-400 leading-relaxed">
              Drag nodes. Edit connections. Switch to Mermaid. Export to Draw.io. No plugins.
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-secondary-900/50 backdrop-blur shadow-2xl overflow-hidden">
            {/* Faux window chrome */}
            <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
              <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
              <div className="ml-4 text-xs text-secondary-500 font-mono">
                architectai · e-commerce-platform-eu · main
              </div>
              <div className="ml-auto flex gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-500/20 text-primary-300 border border-primary-500/30">
                  Interactive
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-secondary-400 border border-white/10">
                  Mermaid
                </span>
              </div>
            </div>
            <div className="relative h-[420px] bg-secondary-900/30 overflow-hidden"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.15) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            >
              <DarkNode className="top-6 left-1/2 -translate-x-1/2" color="secondary" label="Internet / Users" delay={0} />
              <DarkNode className="top-28 left-[15%]" color="primary" label="CloudFront" delay={0.1} />
              <DarkNode className="top-28 left-1/2 -translate-x-1/2" color="primary" label="API Gateway" delay={0.15} />
              <DarkNode className="top-28 right-[15%]" color="primary" label="ALB" delay={0.2} />
              <DarkNode className="top-56 left-[25%]" color="emerald" label="Lambda" delay={0.3} />
              <DarkNode className="top-56 left-1/2 -translate-x-1/2" color="emerald" label="ECS Fargate" delay={0.35} />
              <DarkNode className="top-56 right-[25%]" color="emerald" label="SQS" delay={0.4} />
              <DarkNode className="bottom-16 left-[30%]" color="amber" label="Aurora Serverless" delay={0.5} />
              <DarkNode className="bottom-16 right-[30%]" color="amber" label="ElastiCache" delay={0.55} />
              <DarkNode className="bottom-6 left-1/2 -translate-x-1/2" color="violet" label="S3 / Media" delay={0.6} />

              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                <defs>
                  <marker id="arr-d" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(148,163,184,0.6)" />
                  </marker>
                </defs>
                <g stroke="rgba(148,163,184,0.35)" strokeWidth="1.5" fill="none" markerEnd="url(#arr-d)">
                  <line x1="50%" y1="10%" x2="15%" y2="28%" strokeDasharray="4 4" />
                  <line x1="50%" y1="10%" x2="50%" y2="28%" strokeDasharray="4 4" />
                  <line x1="50%" y1="10%" x2="85%" y2="28%" strokeDasharray="4 4" />
                  <line x1="15%" y1="36%" x2="25%" y2="56%" />
                  <line x1="50%" y1="36%" x2="50%" y2="56%" />
                  <line x1="85%" y1="36%" x2="75%" y2="56%" />
                  <line x1="25%" y1="64%" x2="30%" y2="85%" />
                  <line x1="50%" y1="64%" x2="70%" y2="85%" />
                  <line x1="75%" y1="64%" x2="70%" y2="85%" />
                  <line x1="50%" y1="94%" x2="50%" y2="98%" />
                </g>
              </svg>

              {/* Corner metrics */}
              <div className="absolute top-4 right-4 flex flex-col gap-1 text-[10px] font-mono text-right">
                <div className="text-secondary-500">10 nodes · 10 connections</div>
                <div className="text-emerald-400">$1,847/mo</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ IaC OUTPUT ============ */}
      <section className="border-b border-secondary-200/60 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-28">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <div className="text-xs font-mono text-primary-600 uppercase tracking-wider mb-4">
                // roadmap output
              </div>
              <h2 className="text-4xl font-semibold tracking-tight text-secondary-900 leading-tight">
                Ready-to-ship implementation plan.
              </h2>
              <p className="mt-4 text-secondary-600 leading-relaxed">
                Each phase includes tasks, deliverables, risks, validation criteria, and
                Infrastructure-as-Code snippets. Copy, paste, execute.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs font-mono">
                <span className="px-2 py-1 rounded border border-secondary-200 text-secondary-700">Terraform</span>
                <span className="px-2 py-1 rounded border border-secondary-200 text-secondary-700">CloudFormation</span>
                <span className="px-2 py-1 rounded border border-secondary-200 text-secondary-700">Bash</span>
                <span className="px-2 py-1 rounded border border-secondary-200 text-secondary-700">AWS CLI</span>
              </div>
            </div>

            <div className="lg:col-span-7">
              <CodeBlock
                filename="phase-2-networking.tf"
                language="hcl"
                lines={[
                  { text: 'resource "aws_vpc" "main" {', color: 'text-violet-600' },
                  { text: '  cidr_block           = "10.0.0.0/16"' },
                  { text: '  enable_dns_hostnames = true' },
                  { text: '  tags = { Name = "ecom-vpc-eu" }' },
                  { text: '}' },
                  { text: '' },
                  { text: 'resource "aws_subnet" "private" {', color: 'text-violet-600' },
                  { text: '  count             = 2' },
                  { text: '  vpc_id            = aws_vpc.main.id' },
                  { text: '  cidr_block        = "10.0.${count.index}.0/24"' },
                  { text: '  availability_zone = data.aws_availability_zones.available.names[count.index]' },
                  { text: '}' },
                  { text: '' },
                  { text: '# Phase 2 · 3 days · 4 tasks', color: 'text-secondary-400' },
                  { text: '# Risk: quota limits on eu-west-1', color: 'text-secondary-400' },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how-it-works" className="border-b border-secondary-200/60 bg-secondary-50/60">
        <div className="mx-auto max-w-6xl px-6 py-28">
          <div className="mb-20 max-w-2xl">
            <div className="text-xs font-mono text-primary-600 uppercase tracking-wider mb-4">
              // pipeline
            </div>
            <h2 className="text-4xl font-semibold tracking-tight text-secondary-900 leading-tight">
              Three stages. Zero config.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                num: '01',
                title: 'describe()',
                desc: 'Enter your project requirements in plain English. Add budget, region, and compliance constraints.',
                icon: CommandLineIcon,
              },
              {
                num: '02',
                title: 'generate()',
                desc: 'Nova Lite designs the architecture. Nova Micro handles optimizations and cost modeling in parallel.',
                icon: BoltIcon,
              },
              {
                num: '03',
                title: 'refine()',
                desc: 'Review, edit on the canvas, apply optimizations, export to Draw.io or Mermaid. Iterate freely.',
                icon: SparklesIcon,
              },
            ].map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="relative rounded-lg border border-secondary-200 bg-white p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-9 w-9 rounded-md bg-secondary-900 flex items-center justify-center">
                    <s.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-xs font-mono text-secondary-400">{s.num}</div>
                </div>
                <div className="font-mono text-base font-semibold text-secondary-900 mb-2">
                  {s.title}
                </div>
                <p className="text-sm text-secondary-600 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ STACK ============ */}
      <section className="border-b border-secondary-200/60 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-28">
          <div className="mb-14 max-w-2xl">
            <div className="text-xs font-mono text-primary-600 uppercase tracking-wider mb-4">
              // stack.json
            </div>
            <h2 className="text-4xl font-semibold tracking-tight text-secondary-900 leading-tight">
              A boring stack. On purpose.
            </h2>
            <p className="mt-4 text-secondary-600 leading-relaxed">
              Chosen for reliability. Two Nova models orchestrated for speed and precision.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {stack.map((s) => (
              <div
                key={s.name}
                className="group inline-flex items-center gap-2 rounded-md border border-secondary-200 bg-white px-3 py-2 text-sm hover:border-secondary-400 transition-colors"
              >
                <span className="text-[10px] font-mono text-secondary-400 uppercase tracking-wider">
                  {s.kind}
                </span>
                <span className="text-secondary-900 font-medium">{s.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ ROADMAP ============ */}
      <section className="border-b border-secondary-200/60 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-28">
          <div className="mb-14 max-w-2xl">
            <div className="text-xs font-mono text-primary-600 uppercase tracking-wider mb-4">
              // TODO
            </div>
            <h2 className="text-4xl font-semibold tracking-tight text-secondary-900 leading-tight">
              What's next.
            </h2>
          </div>

          <ul className="divide-y divide-secondary-200/60 border-y border-secondary-200/60">
            {roadmap.map((item, i) => (
              <li key={item} className="py-4 flex items-center gap-6 group">
                <span className="text-xs text-secondary-400 font-mono w-10">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="inline-flex items-center gap-2 text-xs font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary-300 group-hover:bg-primary-500 transition-colors" />
                  <span className="text-secondary-400 uppercase tracking-wider w-16">Planned</span>
                </span>
                <span className="text-secondary-800 flex-1">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative overflow-hidden bg-secondary-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-500/10 via-transparent to-violet-500/10" />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="relative mx-auto max-w-4xl px-6 py-32 text-center">
          <h2 className="text-5xl font-semibold tracking-tight leading-tight">
            Skip the whiteboard.
          </h2>
          <p className="mt-6 text-secondary-400 max-w-lg mx-auto">
            Describe your project. Get a complete architecture in under a minute.
          </p>
          <div className="mt-10 flex items-center justify-center gap-6 flex-wrap">
            <Link
              href="/app"
              className="group inline-flex items-center gap-2 rounded-md bg-white px-6 py-3.5 text-sm font-semibold text-secondary-950 hover:bg-secondary-100 transition-colors"
            >
              <SparklesIcon className="h-4 w-4" />
              Start building
              <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <span className="text-xs font-mono text-secondary-500">
              $ architectai generate --prompt "..."
            </span>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-secondary-950 border-t border-white/5 text-secondary-400">
        <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-white flex items-center justify-center">
              <CpuChipIcon className="h-3.5 w-3.5 text-secondary-950" />
            </div>
            <span className="text-sm font-medium text-white">ArchitectAI</span>
          </div>
          <p className="text-xs font-mono">
            © {new Date().getFullYear()} · built by{' '}
            <a
              href="https://zagran.dev"
              target="_blank"
              rel="noreferrer"
              className="text-white hover:text-primary-300 transition-colors underline underline-offset-2"
            >
              zagran.dev
            </a>
          </p>
        </div>
      </footer>
    </Layout>
  );
}

/* ============ COMPONENTS ============ */

function TerminalMock() {
  const [typed, setTyped] = useState('');
  const fullPrompt = 'Build a scalable e-commerce platform on AWS...';

  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setTyped(fullPrompt.slice(0, i));
      if (i >= fullPrompt.length) clearInterval(iv);
    }, 45);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="rounded-lg border border-white/10 bg-secondary-900/70 backdrop-blur shadow-2xl overflow-hidden">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-3">
        <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
        <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/60" />
        <div className="ml-4 text-xs text-secondary-400 font-mono">~/architectai</div>
      </div>
      <div className="p-5 font-mono text-sm leading-relaxed">
        <div className="text-secondary-500">$ architectai generate</div>
        <div className="mt-2 text-primary-300">
          <span className="text-secondary-500">prompt {'>'}</span> {typed}
          <span className="inline-block w-1.5 h-4 bg-primary-400 ml-0.5 animate-pulse align-middle" />
        </div>
        <div className="mt-4 space-y-1.5 text-xs text-secondary-400">
          <TerminalLog color="emerald" delay={1200}>[nova-lite] analyzing requirements...</TerminalLog>
          <TerminalLog color="primary" delay={1800}>[nova-lite] designing architecture...</TerminalLog>
          <TerminalLog color="violet" delay={2400}>[nova-micro] calculating costs...</TerminalLog>
          <TerminalLog color="amber" delay={3000}>[nova-micro] generating roadmap...</TerminalLog>
          <TerminalLog color="emerald" delay={3600}>✓ done · 28.4s · 10 components</TerminalLog>
        </div>
      </div>
    </div>
  );
}

function TerminalLog({
  children,
  color,
  delay,
}: {
  children: React.ReactNode;
  color: 'emerald' | 'primary' | 'violet' | 'amber';
  delay: number;
}) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const colorMap = {
    emerald: 'text-emerald-400',
    primary: 'text-primary-300',
    violet: 'text-violet-300',
    amber: 'text-amber-300',
  };

  return (
    <div
      className={`transition-opacity duration-300 ${show ? 'opacity-100' : 'opacity-0'}`}
    >
      <span className={colorMap[color]}>{children}</span>
    </div>
  );
}

function PanelCard({
  label,
  title,
  accent,
  children,
}: {
  label: string;
  title: string;
  accent: 'primary' | 'violet';
  children: React.ReactNode;
}) {
  const accentMap = {
    primary: 'bg-primary-500 text-primary-600',
    violet: 'bg-violet-500 text-violet-600',
  };
  const [bg, text] = accentMap[accent].split(' ');
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="relative rounded-lg border border-secondary-200 bg-white p-6 shadow-sm"
    >
      <div className={`absolute top-0 left-0 h-0.5 w-16 ${bg}`} />
      <div className="flex items-baseline justify-between mb-4">
        <span className={`text-[10px] font-mono ${text} uppercase tracking-wider`}>{label}</span>
        <span className="text-xs text-secondary-400 font-medium">{title}</span>
      </div>
      {children}
    </motion.div>
  );
}

function JsonLine({
  k,
  v,
  bracket,
}: {
  k: string;
  v: string;
  bracket?: boolean;
}) {
  return (
    <div>
      <span className="text-primary-600">{k}</span>
      <span className="text-secondary-400">: </span>
      <span className="text-violet-700">{v}</span>
      {!bracket && <span className="text-secondary-400">,</span>}
    </div>
  );
}

function MiniPreview({ type }: { type: string }) {
  if (type === '01') {
    return (
      <svg width="60" height="24" viewBox="0 0 60 24">
        <circle cx="12" cy="12" r="4" fill="#818cf8" opacity="0.6" />
        <circle cx="30" cy="6" r="3" fill="#818cf8" opacity="0.4" />
        <circle cx="30" cy="18" r="3" fill="#818cf8" opacity="0.4" />
        <circle cx="48" cy="12" r="4" fill="#818cf8" opacity="0.6" />
        <line x1="16" y1="12" x2="27" y2="7" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="16" y1="12" x2="27" y2="17" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="33" y1="7" x2="44" y2="11" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="33" y1="17" x2="44" y2="13" stroke="#cbd5e1" strokeWidth="1" />
      </svg>
    );
  }
  if (type === '02') {
    return (
      <svg width="60" height="24" viewBox="0 0 60 24">
        <rect x="4" y="14" width="8" height="10" fill="#10b981" opacity="0.7" />
        <rect x="16" y="8" width="8" height="16" fill="#10b981" opacity="0.9" />
        <rect x="28" y="4" width="8" height="20" fill="#10b981" />
        <rect x="40" y="10" width="8" height="14" fill="#10b981" opacity="0.7" />
        <rect x="52" y="16" width="8" height="8" fill="#10b981" opacity="0.5" />
      </svg>
    );
  }
  if (type === '03') {
    return (
      <svg width="60" height="24" viewBox="0 0 60 24">
        <rect x="4" y="4" width="52" height="4" rx="2" fill="#f59e0b" opacity="0.9" />
        <rect x="4" y="12" width="36" height="4" rx="2" fill="#f59e0b" opacity="0.6" />
        <rect x="4" y="20" width="20" height="4" rx="2" fill="#f59e0b" opacity="0.4" />
      </svg>
    );
  }
  // 04 - roadmap
  return (
    <svg width="60" height="24" viewBox="0 0 60 24">
      <line x1="4" y1="12" x2="56" y2="12" stroke="#c4b5fd" strokeWidth="1.5" />
      <circle cx="8" cy="12" r="4" fill="#8b5cf6" />
      <circle cx="24" cy="12" r="4" fill="#8b5cf6" opacity="0.7" />
      <circle cx="40" cy="12" r="4" fill="#8b5cf6" opacity="0.5" />
      <circle cx="56" cy="12" r="4" fill="#8b5cf6" opacity="0.3" />
    </svg>
  );
}

function DarkNode({
  className,
  color,
  label,
  delay,
}: {
  className?: string;
  color: 'primary' | 'emerald' | 'amber' | 'violet' | 'secondary';
  label: string;
  delay: number;
}) {
  const colorMap = {
    primary: 'border-primary-400/50 bg-primary-500/10 text-primary-100',
    emerald: 'border-emerald-400/50 bg-emerald-500/10 text-emerald-100',
    amber: 'border-amber-400/50 bg-amber-500/10 text-amber-100',
    violet: 'border-violet-400/50 bg-violet-500/10 text-violet-100',
    secondary: 'border-white/20 bg-white/5 text-white',
  };
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className={`absolute z-10 rounded-md border backdrop-blur px-3 py-2 text-xs font-mono font-medium shadow-lg whitespace-nowrap ${colorMap[color]} ${className || ''}`}
    >
      {label}
    </motion.div>
  );
}

function CodeBlock({
  filename,
  language,
  lines,
}: {
  filename: string;
  language: string;
  lines: { text: string; color?: string }[];
}) {
  return (
    <div className="rounded-lg border border-secondary-200 bg-secondary-950 overflow-hidden shadow-lg">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs font-mono text-secondary-400">
          <span className="text-secondary-500">▸</span>
          {filename}
        </div>
        <span className="text-[10px] font-mono text-secondary-500 uppercase">{language}</span>
      </div>
      <div className="p-5 font-mono text-xs leading-relaxed">
        {lines.map((line, i) => (
          <div key={i} className="flex">
            <span className="w-6 text-right pr-3 text-secondary-600 select-none">{i + 1}</span>
            <span className={line.color || 'text-secondary-300'}>{line.text || ' '}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
