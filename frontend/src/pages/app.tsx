import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout/Layout';
import AuthForm from '@/components/Auth/AuthForm';
import RequirementsInputComponent from '@/components/RequirementsInput/RequirementsInput';
import { useAuth } from '@/hooks/useAPI';
import { RequirementsInput } from '@/types';
import APIClient from '@/lib/api';

type Step = 'requirements' | 'generating';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, loading, login, register, logout } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('requirements');
  const [error, setError] = useState<string | null>(null);

  const handleRequirementsSubmit = async (data: RequirementsInput) => {
    try {
      setCurrentStep('generating');
      setError(null);

      const result = await APIClient.generateArchitecture(data);

      if (!result.success || !result.architecture) {
        throw new Error('Architecture generation failed. Please try again.');
      }

      router.push(`/architecture/${result.architecture.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Architecture generation failed');
      setCurrentStep('requirements');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="spinner w-8 h-8" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} isAuthenticated={isAuthenticated} onLogout={logout}>
      <Head>
        <title>ArchitectAI - AI-Powered Architecture Generator</title>
        <meta name="description" content="Transform business requirements into complete AWS architectures using AI." />
      </Head>

      {!isAuthenticated ? (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-65px)] px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-secondary-900 sm:text-4xl">
              ArchitectAI
            </h1>
            <p className="mt-2 text-secondary-600">
              AI-Powered Architecture Generator
            </p>
          </div>
          <AuthForm onLogin={login} onRegister={register} />
        </div>
      ) : (
        <div className="min-h-[calc(100vh-65px)] bg-secondary-50">
          <div className="py-8">
            {error && (
              <div className="mx-auto max-w-4xl px-4 mb-8">
                <div className="bg-error-50 border border-error-200 rounded-lg p-4">
                  <p className="text-error-800">{error}</p>
                </div>
              </div>
            )}

            {currentStep === 'requirements' && (
              <RequirementsInputComponent
                onSubmit={handleRequirementsSubmit}
                loading={false}
              />
            )}

            {currentStep === 'generating' && (
              <div className="mx-auto max-w-4xl px-4">
                <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-12">
                  <div className="text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="mx-auto w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full mb-6"
                    />
                    <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                      Generating Your Architecture
                    </h2>
                    <div className="max-w-lg mx-auto space-y-4">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex items-center text-left"
                      >
                        <div className="w-2 h-2 bg-primary-600 rounded-full mr-3" />
                        <span className="text-secondary-600">
                          Nova 2 Lite is analyzing your requirements...
                        </span>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5 }}
                        className="flex items-center text-left"
                      >
                        <div className="w-2 h-2 bg-primary-600 rounded-full mr-3" />
                        <span className="text-secondary-600">
                          Designing optimal AWS architecture...
                        </span>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.5 }}
                        className="flex items-center text-left"
                      >
                        <div className="w-2 h-2 bg-primary-600 rounded-full mr-3" />
                        <span className="text-secondary-600">
                          Nova Micro is calculating costs and optimizations...
                        </span>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </Layout>
  );
}
