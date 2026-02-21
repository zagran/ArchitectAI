import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout/Layout';
import { useAuth } from '@/hooks/useAPI';
import { ArchitectureListItem } from '@/types';
import APIClient from '@/lib/api';

export default function HistoryPage() {
  const router = useRouter();
  const { isAuthenticated, user, loading: authLoading, logout } = useAuth();

  const [architectures, setArchitectures] = useState<ArchitectureListItem[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace('/');
      return;
    }
    fetchArchitectures();
  }, [isAuthenticated, authLoading, router]);

  const fetchArchitectures = async () => {
    try {
      setPageLoading(true);
      const data = await APIClient.getArchitectures();
      setArchitectures(data.architectures || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setPageLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this architecture? This cannot be undone.')) return;
    try {
      setDeletingId(id);
      await APIClient.deleteArchitecture(id);
      setArchitectures((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert('Failed to delete architecture.');
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading || pageLoading) {
    return (
      <Layout user={user} isAuthenticated={isAuthenticated} onLogout={logout}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="spinner w-8 h-8" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} isAuthenticated={isAuthenticated} onLogout={logout}>
      <Head>
        <title>History — ArchitectAI</title>
      </Head>

      <div className="min-h-[calc(100vh-65px)] bg-secondary-50 py-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-secondary-900">Architecture History</h1>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              + Generate New
            </Link>
          </div>

          {error && (
            <div className="bg-error-50 border border-error-200 rounded-lg p-4 mb-6">
              <p className="text-error-800">{error}</p>
            </div>
          )}

          {architectures.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-12 text-center">
              <p className="text-secondary-500 text-lg mb-4">No architectures yet.</p>
              <Link
                href="/"
                className="text-primary-600 hover:underline font-medium"
              >
                Generate your first architecture →
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden">
              <table className="min-w-full divide-y divide-secondary-200">
                <thead className="bg-secondary-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Deployment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Est. Monthly Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Components
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-secondary-100">
                  {architectures.map((arch) => (
                    <tr key={arch.id} className="hover:bg-secondary-50 transition-colors">
                      <td className="px-6 py-4">
                        <Link
                          href={`/architecture/${arch.id}`}
                          className="text-primary-600 hover:underline font-medium"
                        >
                          {arch.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-600">
                        {arch.deploymentModel.replace(/_/g, ' ')}
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-900">
                        {arch.estimatedMonthlyCost != null
                          ? `$${arch.estimatedMonthlyCost.toFixed(0)}/mo`
                          : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-600">
                        {arch.componentsCount}
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-500">
                        {new Date(arch.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(arch.id)}
                          disabled={deletingId === arch.id}
                          className="text-sm text-error-600 hover:text-error-800 disabled:opacity-40 transition-colors"
                        >
                          {deletingId === arch.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
