import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout/Layout';
import RequirementsInputComponent from '@/components/RequirementsInput/RequirementsInput';
import ArchitectureViewer from '@/components/ArchitectureViewer/ArchitectureViewer';
import { RequirementsInput, ArchitectureResponse } from '@/types';
import { APIClient } from '@/lib/api';

type Step = 'requirements' | 'generating' | 'results';

export default function NewProjectPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('requirements');
  const [requirements, setRequirements] = useState<RequirementsInput | null>(null);
  const [architectureResult, setArchitectureResult] = useState<ArchitectureResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRequirementsSubmit = async (data: RequirementsInput) => {
    try {
      setRequirements(data);
      setCurrentStep('generating');
      setError(null);

      // Simulate API call for demo
      await simulateArchitectureGeneration(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Architecture generation failed');
      setCurrentStep('requirements');
    }
  };

  const simulateArchitectureGeneration = async (data: RequirementsInput) => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Generate mock architecture result
    const mockResult: ArchitectureResponse = {
      success: true,
      architecture: {
        id: 'arch-1',
        name: 'Generated Architecture',
        components: [
          {
            id: 'comp-1',
            name: 'Application Load Balancer',
            serviceType: 'alb' as any,
            configuration: {
              scheme: 'internet-facing',
              listeners: ['HTTPS:443', 'HTTP:80']
            },
            dependencies: [],
            estimatedMonthlyCost: 16.2
          },
          {
            id: 'comp-2',
            name: 'Auto Scaling Group',
            serviceType: 'ec2' as any,
            configuration: {
              instanceType: 't3.medium',
              minSize: 2,
              maxSize: 10,
              desiredCapacity: 3
            },
            dependencies: ['comp-1'],
            estimatedMonthlyCost: 97.2
          },
          {
            id: 'comp-3',
            name: 'RDS PostgreSQL',
            serviceType: 'rds' as any,
            configuration: {
              engine: 'postgres',
              instanceClass: 'db.t3.medium',
              multiAZ: true,
              storageGB: 100
            },
            dependencies: [],
            estimatedMonthlyCost: 68.4
          },
          {
            id: 'comp-4',
            name: 'ElastiCache Redis',
            serviceType: 'elasticache' as any,
            configuration: {
              nodeType: 'cache.t3.medium',
              numNodes: 2
            },
            dependencies: [],
            estimatedMonthlyCost: 48.6
          },
          {
            id: 'comp-5',
            name: 'S3 Storage',
            serviceType: 's3' as any,
            configuration: {
              storageClass: 'STANDARD',
              versioning: true,
              lifecyclePolicies: true
            },
            dependencies: [],
            estimatedMonthlyCost: 23.0
          }
        ],
        connections: [
          { from: 'Internet', to: 'comp-1', protocol: 'HTTPS' },
          { from: 'comp-1', to: 'comp-2', protocol: 'HTTP' },
          { from: 'comp-2', to: 'comp-3', protocol: 'PostgreSQL' },
          { from: 'comp-2', to: 'comp-4', protocol: 'Redis' },
          { from: 'comp-2', to: 'comp-5', protocol: 'S3 API' }
        ],
        deploymentModel: 'auto_scaling' as any,
        estimatedMonthlyCost: 253.4,
        securityFeatures: [
          'AWS WAF for web application protection',
          'VPC with private subnets',
          'Security groups with least privilege access',
          'RDS encryption at rest',
          'S3 bucket policies and encryption'
        ],
        scalabilityFeatures: [
          'Auto Scaling Groups for compute resources',
          'Application Load Balancer for traffic distribution',
          'ElastiCache for session and data caching',
          'RDS Multi-AZ for high availability',
          'CloudFront CDN integration ready'
        ],
        metadata: {
          generatedBy: 'nova-lite',
          generationTime: '2.3 seconds',
          confidence: 0.92
        },
        createdAt: new Date().toISOString(),
        novaReasoning: {
          requirementsAnalysis: 'High-traffic e-commerce platform requiring scalability and reliability',
          architectureDecision: 'Multi-tier architecture with auto-scaling for variable load',
          costOptimization: 'Balanced approach between performance and cost efficiency'
        }
      },
      costAnalysis: {
        architectureId: 'arch-1',
        totalMonthlyCost: 253.4,
        componentBreakdown: [
          {
            componentId: 'comp-1',
            componentName: 'Application Load Balancer',
            serviceType: 'alb',
            monthlyCost: 16.2,
            costBreakdown: { fixed: 16.2 },
            costDrivers: ['Fixed ALB cost'],
            optimizationPotential: 5
          },
          {
            componentId: 'comp-2',
            componentName: 'Auto Scaling Group',
            serviceType: 'ec2',
            monthlyCost: 97.2,
            costBreakdown: { compute: 97.2 },
            costDrivers: ['3 t3.medium instances', '24/7 operation'],
            optimizationPotential: 30
          }
        ],
        costScenarios: [
          {
            scenarioName: 'Current Configuration',
            description: 'Based on provided requirements',
            totalMonthlyCost: 253.4,
            usageAssumptions: { baseline: true },
            costDrivers: ['Standard pricing', 'On-demand instances']
          },
          {
            scenarioName: 'Reserved Instances',
            description: '1-year Reserved Instance commitment',
            totalMonthlyCost: 177.4,
            usageAssumptions: { reserved: '1-year' },
            costDrivers: ['Reserved Instance pricing', '30% savings on compute']
          }
        ],
        optimizationSuggestions: ['Consider Reserved Instances for 30% savings'],
        confidenceLevel: 0.87,
        pricingDataVersion: '2024-01',
        calculatedAt: new Date().toISOString()
      },
      optimizationSuggestions: [
        {
          id: 'opt-1',
          category: 'cost',
          title: 'Reserved Instance Savings',
          description: 'Purchase 1-year Reserved Instances for EC2 to save approximately 30% on compute costs',
          potentialImpact: 'high',
          implementationEffort: 'low',
          estimatedSavingsPercent: 30,
          affectedComponents: ['comp-2'],
          implementationSteps: [
            'Analyze usage patterns over 2-4 weeks',
            'Purchase Reserved Instances for consistent workloads',
            'Monitor utilization and adjust as needed'
          ]
        },
        {
          id: 'opt-2',
          category: 'performance',
          title: 'Add CloudFront CDN',
          description: 'Implement CloudFront CDN for static assets to improve performance and reduce costs',
          potentialImpact: 'medium',
          implementationEffort: 'medium',
          estimatedSavingsPercent: 15,
          affectedComponents: ['comp-5'],
          implementationSteps: [
            'Set up CloudFront distribution',
            'Configure caching policies',
            'Update application to use CDN URLs'
          ]
        }
      ],
      processingTimeMs: 3000,
      novaUsage: {
        modelsUsed: ['nova-lite', 'nova-micro'],
        totalTokens: 2547,
        processingTime: '3.2s'
      }
    };

    setArchitectureResult(mockResult);
    setCurrentStep('results');
  };

  const handleStartOver = () => {
    setCurrentStep('requirements');
    setRequirements(null);
    setArchitectureResult(null);
    setError(null);
  };

  const handleSaveProject = async () => {
    if (!architectureResult?.architecture) return;

    try {
      // Save project and architecture
      console.log('Saving project...');
      // Redirect to projects list
      router.push('/projects');
    } catch (err) {
      setError('Failed to save project');
    }
  };

  return (
    <Layout>
      <Head>
        <title>New Project - ArchitectAI</title>
        <meta name="description" content="Create a new architecture project using AI-powered generation." />
      </Head>

      <div className="min-h-screen bg-secondary-50">
        {/* Progress Steps */}
        <div className="bg-white border-b border-secondary-200">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <nav aria-label="Progress">
              <ol className="flex items-center">
                <li className={`pr-8 ${currentStep !== 'requirements' ? 'text-primary-600' : 'text-secondary-900'}`}>
                  <div className="flex items-center">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold ${
                      currentStep !== 'requirements' 
                        ? 'border-primary-600 bg-primary-600 text-white' 
                        : 'border-secondary-300 text-secondary-500'
                    }`}>
                      1
                    </span>
                    <span className="ml-3 text-sm font-medium">Requirements</span>
                  </div>
                </li>
                
                <li className={`px-8 ${currentStep === 'generating' ? 'text-primary-600' : currentStep === 'results' ? 'text-primary-600' : 'text-secondary-500'}`}>
                  <div className="flex items-center">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold ${
                      currentStep === 'results'
                        ? 'border-primary-600 bg-primary-600 text-white'
                        : currentStep === 'generating'
                        ? 'border-primary-600 text-primary-600'
                        : 'border-secondary-300 text-secondary-500'
                    }`}>
                      {currentStep === 'generating' ? (
                        <div className="spinner w-4 h-4" />
                      ) : (
                        '2'
                      )}
                    </span>
                    <span className="ml-3 text-sm font-medium">Generation</span>
                  </div>
                </li>
                
                <li className={`pl-8 ${currentStep === 'results' ? 'text-primary-600' : 'text-secondary-500'}`}>
                  <div className="flex items-center">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold ${
                      currentStep === 'results'
                        ? 'border-primary-600 bg-primary-600 text-white'
                        : 'border-secondary-300 text-secondary-500'
                    }`}>
                      3
                    </span>
                    <span className="ml-3 text-sm font-medium">Results</span>
                  </div>
                </li>
              </ol>
            </nav>
          </div>
        </div>

        {/* Content */}
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

          {currentStep === 'results' && architectureResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ArchitectureViewer
                architecture={architectureResult.architecture!}
                costAnalysis={architectureResult.costAnalysis}
                optimizations={architectureResult.optimizationSuggestions}
                onSave={handleSaveProject}
                onStartOver={handleStartOver}
              />
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}
