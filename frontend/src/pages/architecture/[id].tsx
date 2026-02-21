import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import Layout from '@/components/Layout/Layout';
import ArchitectureViewer from '@/components/ArchitectureViewer/ArchitectureViewer';
import { useAuth } from '@/hooks/useAPI';
import { ArchitectureResponse, RequirementsInput } from '@/types';
import APIClient from '@/lib/api';

function RequirementsPanel({ req }: { req: RequirementsInput }) {
  const constraints = req.constraints || {};
  const preferences = req.preferences || {};

  const constraintRows = [
    { label: 'Budget', value: constraints.budget },
    { label: 'Timeline', value: constraints.timeline },
    { label: 'Region', value: constraints.region },
    { label: 'Compliance', value: Array.isArray(constraints.compliance) ? constraints.compliance.join(', ') : constraints.compliance },
  ].filter((r) => r.value);

  const preferenceRows = [
    { label: 'Cloud Provider', value: preferences.cloudProvider },
    { label: 'Deployment Model', value: preferences.deploymentModel },
    { label: 'Scaling Approach', value: preferences.scalingApproach },
  ].filter((r) => r.value);

  return (
    <div className="px-5 pb-5 border-t border-secondary-100 space-y-4">
      <div className="pt-4">
        <p className="text-xs font-medium text-secondary-500 uppercase tracking-wider mb-1">Description</p>
        <p className="text-sm text-secondary-800 whitespace-pre-wrap">{req.description}</p>
      </div>

      {constraintRows.length > 0 && (
        <div>
          <p className="text-xs font-medium text-secondary-500 uppercase tracking-wider mb-2">Constraints</p>
          <div className="flex flex-wrap gap-2">
            {constraintRows.map(({ label, value }) => (
              <span key={label} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary-100 text-xs text-secondary-700">
                <span className="font-medium">{label}:</span> {value}
              </span>
            ))}
          </div>
        </div>
      )}

      {preferenceRows.length > 0 && (
        <div>
          <p className="text-xs font-medium text-secondary-500 uppercase tracking-wider mb-2">Preferences</p>
          <div className="flex flex-wrap gap-2">
            {preferenceRows.map(({ label, value }) => (
              <span key={label} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary-50 text-xs text-primary-700">
                <span className="font-medium">{label}:</span> {value}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ArchitecturePage() {
  const router = useRouter();
  const { id } = router.query;
  const { isAuthenticated, user, loading: authLoading, logout } = useAuth();

  const [result, setResult] = useState<ArchitectureResponse | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reqOpen, setReqOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace('/');
      return;
    }
    if (!id || typeof id !== 'string') return;

    const fetchArchitecture = async () => {
      try {
        setPageLoading(true);
        const data = await APIClient.getArchitecture(id);
        if (!data.success || !data.architecture) {
          throw new Error('Architecture not found');
        }
        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load architecture');
      } finally {
        setPageLoading(false);
      }
    };

    fetchArchitecture();
  }, [id, isAuthenticated, authLoading, router]);

  if (authLoading || pageLoading) {
    return (
      <Layout user={user} isAuthenticated={isAuthenticated} onLogout={logout}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="spinner w-8 h-8" />
        </div>
      </Layout>
    );
  }

  if (error || !result?.architecture) {
    return (
      <Layout user={user} isAuthenticated={isAuthenticated} onLogout={logout}>
        <div className="mx-auto max-w-4xl px-4 py-12 text-center">
          <p className="text-error-700 text-lg mb-4">{error || 'Architecture not found.'}</p>
          <Link href="/history" className="text-primary-600 hover:underline">
            ← Back to History
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} isAuthenticated={isAuthenticated} onLogout={logout}>
      <Head>
        <title>{result.architecture.name} — ArchitectAI</title>
      </Head>

      <div className="min-h-[calc(100vh-65px)] bg-secondary-50">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center gap-x-4">
          <Link href="/history" className="text-sm text-secondary-500 hover:text-secondary-800">
            ← History
          </Link>
        </div>

        {result.requirementsInput && (
          <div className="mx-auto max-w-7xl px-4 pb-4">
            <div className="bg-white border border-secondary-200 rounded-lg shadow-sm overflow-hidden">
              <button
                onClick={() => setReqOpen((o) => !o)}
                className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-secondary-50 transition-colors"
              >
                <span className="text-sm font-medium text-secondary-700">Original Requirements</span>
                <ChevronDownIcon
                  className={`h-4 w-4 text-secondary-400 transition-transform duration-200 ${reqOpen ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence initial={false}>
                {reqOpen && (
                  <motion.div
                    key="req-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <RequirementsPanel req={result.requirementsInput} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <ArchitectureViewer
            architecture={result.architecture}
            costAnalysis={result.costAnalysis}
            optimizations={result.optimizationSuggestions}
            onStartOver={() => router.push('/')}
          />
        </motion.div>
      </div>
    </Layout>
  );
}
