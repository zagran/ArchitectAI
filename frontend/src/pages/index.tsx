import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  CloudIcon, 
  CpuChipIcon, 
  ChartBarIcon, 
  SparklesIcon,
  RocketLaunchIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import Layout from '@/components/Layout/Layout';

const features = [
  {
    name: 'AI-Powered Architecture Design',
    description: 'Transform business requirements into complete AWS architectures using Amazon Nova\'s advanced reasoning capabilities.',
    icon: SparklesIcon,
  },
  {
    name: 'Visual Diagram Generation',
    description: 'Generate professional AWS architecture diagrams automatically using Nova Canvas with industry-standard formatting.',
    icon: CloudIcon,
  },
  {
    name: 'Real-time Cost Analysis',
    description: 'Get accurate cost estimates and optimization suggestions with live AWS pricing data integration.',
    icon: ChartBarIcon,
  },
  {
    name: 'Implementation Roadmaps',
    description: 'Receive step-by-step implementation plans with Infrastructure as Code generation and deployment scripts.',
    icon: RocketLaunchIcon,
  },
  {
    name: 'Multi-modal Input Processing',
    description: 'Process text descriptions, documents, and existing architecture diagrams using Nova\'s multimodal capabilities.',
    icon: CpuChipIcon,
  },
  {
    name: 'Enterprise Security',
    description: 'Built-in security best practices, compliance checks, and audit trails for enterprise requirements.',
    icon: ShieldCheckIcon,
  },
];

const stats = [
  { id: 1, name: 'Architecture Generation Time', value: '<30 seconds' },
  { id: 2, name: 'Cost Accuracy', value: '85%+' },
  { id: 3, name: 'Time Savings', value: '95%+' },
  { id: 4, name: 'Nova Models Used', value: 'All 4' },
];

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGetStarted = () => {
    setIsGenerating(true);
    // Simulate navigation delay
    setTimeout(() => {
      window.location.href = '/projects/new';
    }, 500);
  };

  return (
    <Layout>
      <Head>
        <title>ArchitectAI - AI-Powered System Architecture Generator</title>
        <meta
          name="description"
          content="Transform business requirements into complete AWS architectures using Amazon Nova AI. Generate diagrams, calculate costs, and get implementation roadmaps in seconds."
        />
      </Head>

      {/* Hero section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary-400 to-primary-600 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>

        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="hidden sm:mb-8 sm:flex sm:justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-secondary-600 ring-1 ring-secondary-900/10 hover:ring-secondary-900/20">
              Powered by Amazon Nova AI Models.{' '}
              <Link href="#features" className="font-semibold text-primary-600">
                <span className="absolute inset-0" aria-hidden="true" />
                Learn more <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>

          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold tracking-tight text-secondary-900 sm:text-6xl"
            >
              Transform Ideas into 
              <span className="text-primary-600"> AWS Architectures</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 text-lg leading-8 text-secondary-600"
            >
              AI-powered system architecture generator that creates complete AWS solutions 
              from your business requirements. Generate professional diagrams, calculate costs, 
              and get implementation roadmaps in seconds.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-10 flex items-center justify-center gap-x-6"
            >
              <button
                onClick={handleGetStarted}
                disabled={isGenerating}
                className="btn btn-primary text-lg px-8 py-3 relative"
              >
                {isGenerating ? (
                  <>
                    <div className="spinner mr-2" />
                    Generating...
                  </>
                ) : (
                  'Get Started'
                )}
              </button>
              
              <Link href="#demo" className="text-sm font-semibold leading-6 text-secondary-900">
                View Demo <span aria-hidden="true">→</span>
              </Link>
            </motion.div>
          </div>
        </div>

        <div
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary-400 to-primary-600 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
      </div>

      {/* Stats section */}
      <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-40 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl">
            Built for the Amazon Nova Hackathon
          </h2>
          <p className="mt-6 text-base leading-7 text-secondary-600">
            Showcasing the full potential of Amazon Nova AI models in real-world cloud architecture generation.
          </p>
        </div>
        <div className="mx-auto mt-16 flex max-w-2xl flex-col gap-8 lg:mx-0 lg:mt-20 lg:max-w-none lg:flex-row lg:items-end">
          <div className="flex flex-col-reverse justify-between gap-x-16 gap-y-8 rounded-2xl bg-secondary-50 p-8 sm:w-3/5 sm:max-w-md sm:flex-row-reverse sm:items-end lg:w-72 lg:max-w-none lg:flex-none lg:flex-col lg:items-start">
            <p className="flex-none text-3xl font-bold tracking-tight text-secondary-900">
              All Nova Models
            </p>
            <div className="sm:w-80 sm:shrink lg:w-auto lg:flex-none">
              <p className="text-lg font-semibold sm:text-xl text-secondary-900">
                Complete Integration
              </p>
              <p className="mt-2 text-base leading-7 text-secondary-600">
                Nova Lite, Canvas, Micro, and Multimodal working together for comprehensive architecture generation.
              </p>
            </div>
          </div>
          <div className="sm:w-2/5 lg:w-auto lg:flex-auto">
            <div className="-mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
              {stats.map((stat) => (
                <motion.div
                  key={stat.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: stat.id * 0.1 }}
                  viewport={{ once: true }}
                  className="flex flex-col-reverse gap-y-4"
                >
                  <dt className="text-base leading-7 text-secondary-600">{stat.name}</dt>
                  <dd className="text-4xl font-semibold text-secondary-900">{stat.value}</dd>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div id="features" className="mx-auto mt-32 max-w-7xl px-6 sm:mt-56 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary-600">
            Powered by Amazon Nova
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl">
            Everything you need to design cloud architectures
          </p>
          <p className="mt-6 text-lg leading-8 text-secondary-600">
            From requirements to implementation, ArchitectAI leverages all four Amazon Nova models 
            to provide comprehensive architecture solutions with unprecedented speed and accuracy.
          </p>
        </div>
        
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative pl-16"
              >
                <dt className="text-base font-semibold leading-7 text-secondary-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
                    <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-secondary-600">{feature.description}</dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>

      {/* Demo section */}
      <div id="demo" className="mx-auto mt-32 max-w-7xl px-6 sm:mt-56 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-secondary-900 sm:text-4xl">
            See ArchitectAI in Action
          </h2>
          <p className="mt-6 text-lg leading-8 text-secondary-600">
            Watch how ArchitectAI transforms a simple business requirement into a complete AWS architecture 
            with diagrams, cost analysis, and implementation roadmap.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="mt-16 flow-root sm:mt-24"
        >
          <div className="relative -m-2 rounded-xl bg-secondary-900/5 p-2 ring-1 ring-inset ring-secondary-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
            <div className="aspect-video rounded-md bg-secondary-800 shadow-2xl ring-1 ring-secondary-900/10">
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary-600/10 flex items-center justify-center">
                    <SparklesIcon className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Interactive Demo</h3>
                  <p className="text-secondary-300 mb-4">
                    Experience the full power of Nova-powered architecture generation
                  </p>
                  <Link
                    href="/projects/new"
                    className="btn btn-primary"
                  >
                    Try Live Demo
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* CTA section */}
      <div className="mx-auto mt-32 max-w-7xl sm:mt-56 sm:px-6 lg:px-8">
        <div className="relative isolate overflow-hidden bg-secondary-900 px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to revolutionize your cloud architecture process?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-secondary-300">
            Join the future of cloud architecture design. Generate production-ready AWS solutions 
            in seconds, not days.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/projects/new" className="btn btn-primary text-lg px-8 py-3">
              Start Building
            </Link>
            <Link href="/templates" className="text-sm font-semibold leading-6 text-white">
              Browse Templates <span aria-hidden="true">→</span>
            </Link>
          </div>
          <svg
            viewBox="0 0 1024 1024"
            className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
            aria-hidden="true"
          >
            <circle cx={512} cy={512} r={512} fill="url(#827591b1-ce8c-4110-b064-7cb85a0b1217)" fillOpacity="0.7" />
            <defs>
              <radialGradient id="827591b1-ce8c-4110-b064-7cb85a0b1217">
                <stop stopColor="#3b82f6" />
                <stop offset={1} stopColor="#1d4ed8" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>
    </Layout>
  );
}
