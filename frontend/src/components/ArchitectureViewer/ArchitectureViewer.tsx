import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChartPieIcon,
  CpuChipIcon,
  CurrencyDollarIcon,
  LightBulbIcon,
  DocumentArrowDownIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { SystemArchitecture, CostAnalysis, OptimizationSuggestion } from '@/types';
import Button from '@/components/ui/Button';
import ArchitectureDiagram from './ArchitectureDiagram';
import CostBreakdown from './CostBreakdown';
import OptimizationsList from './OptimizationsList';

interface ArchitectureViewerProps {
  architecture: SystemArchitecture;
  costAnalysis?: CostAnalysis;
  optimizations?: OptimizationSuggestion[];
  onSave?: () => void;
  onStartOver?: () => void;
}

type Tab = 'overview' | 'diagram' | 'costs' | 'optimizations' | 'implementation';

export default function ArchitectureViewer({
  architecture,
  costAnalysis,
  optimizations = [],
  onSave,
  onStartOver,
}: ArchitectureViewerProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: CheckCircleIcon },
    { id: 'diagram', name: 'Architecture', icon: CpuChipIcon },
    { id: 'costs', name: 'Cost Analysis', icon: CurrencyDollarIcon },
    { id: 'optimizations', name: 'Optimizations', icon: LightBulbIcon },
  ];

  const totalMonthlyCost = costAnalysis?.totalMonthlyCost || architecture.estimatedMonthlyCost || 0;
  const potentialSavings = optimizations.reduce((sum, opt) => 
    sum + (opt.estimatedSavingsPercent || 0), 0
  ) / optimizations.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-success-500 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-secondary-900">
                  Architecture Generated Successfully!
                </h1>
                <p className="text-secondary-600 mt-1">
                  Your AWS architecture has been designed using Amazon Nova AI models.
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CpuChipIcon className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-secondary-500">Components</p>
                  <p className="text-xl font-semibold text-secondary-900">
                    {architecture.components.length}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-6 w-6 text-success-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-secondary-500">Est. Monthly Cost</p>
                  <p className="text-xl font-semibold text-secondary-900">
                    ${totalMonthlyCost.toFixed(0)}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <LightBulbIcon className="h-6 w-6 text-warning-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-secondary-500">Optimization Potential</p>
                  <p className="text-xl font-semibold text-secondary-900">
                    {potentialSavings.toFixed(0)}% savings
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 ml-6">
            <Button
              variant="secondary"
              onClick={onStartOver}
              className="flex items-center"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Start Over
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              loading={saving}
              className="flex items-center"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Save Project
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-secondary-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                }`}
              >
                <Icon className={`-ml-0.5 mr-2 h-5 w-5 ${
                  activeTab === tab.id ? 'text-primary-500' : 'text-secondary-400 group-hover:text-secondary-500'
                }`} />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && (
          <ArchitectureOverview
            architecture={architecture}
            costAnalysis={costAnalysis}
            optimizations={optimizations}
          />
        )}

        {activeTab === 'diagram' && (
          <ArchitectureDiagram architecture={architecture} />
        )}

        {activeTab === 'costs' && costAnalysis && (
          <CostBreakdown costAnalysis={costAnalysis} />
        )}

        {activeTab === 'optimizations' && (
          <OptimizationsList optimizations={optimizations} />
        )}
      </motion.div>
    </div>
  );
}

// Overview Tab Component
function ArchitectureOverview({
  architecture,
  costAnalysis,
  optimizations,
}: {
  architecture: SystemArchitecture;
  costAnalysis?: CostAnalysis;
  optimizations: OptimizationSuggestion[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Architecture Details */}
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Architecture Details</h3>
        
        <div className="space-y-4">
          <div>
            <dt className="text-sm font-medium text-secondary-500">Deployment Model</dt>
            <dd className="mt-1 text-sm text-secondary-900">
              {architecture.deploymentModel.replace('_', ' ').toUpperCase()}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-secondary-500">Components</dt>
            <dd className="mt-1">
              <div className="space-y-2">
                {architecture.components.slice(0, 5).map((component) => (
                  <div key={component.id} className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mr-2" />
                    <span className="text-secondary-900">
                      {component.name} ({component.serviceType.toUpperCase()})
                    </span>
                    {component.estimatedMonthlyCost && (
                      <span className="ml-auto text-secondary-500">
                        ${component.estimatedMonthlyCost.toFixed(0)}/mo
                      </span>
                    )}
                  </div>
                ))}
                {architecture.components.length > 5 && (
                  <div className="text-sm text-secondary-500">
                    +{architecture.components.length - 5} more components
                  </div>
                )}
              </div>
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-secondary-500">Security Features</dt>
            <dd className="mt-1">
              <ul className="space-y-1">
                {architecture.securityFeatures.slice(0, 3).map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-secondary-900">
                    <CheckCircleIcon className="h-4 w-4 text-success-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </div>
      </div>

      {/* Cost Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Cost Summary</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-success-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-success-800">Estimated Monthly Cost</p>
              <p className="text-2xl font-bold text-success-900">
                ${costAnalysis?.totalMonthlyCost.toFixed(0) || architecture.estimatedMonthlyCost?.toFixed(0) || '0'}
              </p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-success-600" />
          </div>

          {costAnalysis?.componentBreakdown && (
            <div>
              <p className="text-sm font-medium text-secondary-500 mb-2">Top Cost Components</p>
              <div className="space-y-2">
                {costAnalysis.componentBreakdown
                  .sort((a, b) => b.monthlyCost - a.monthlyCost)
                  .slice(0, 3)
                  .map((component) => (
                    <div key={component.componentId} className="flex items-center justify-between">
                      <span className="text-sm text-secondary-900">{component.componentName}</span>
                      <span className="text-sm font-medium text-secondary-900">
                        ${component.monthlyCost.toFixed(0)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {optimizations.length > 0 && (
            <div className="p-4 bg-warning-50 rounded-lg border border-warning-200">
              <div className="flex items-center">
                <LightBulbIcon className="h-5 w-5 text-warning-600 mr-2" />
                <span className="text-sm font-medium text-warning-800">
                  {optimizations.length} optimization{optimizations.length > 1 ? 's' : ''} available
                </span>
              </div>
              <p className="text-sm text-warning-700 mt-1">
                Potential savings of up to{' '}
                {Math.round(Math.max(...optimizations.map(o => o.estimatedSavingsPercent || 0)))}%
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Nova AI Insights */}
      <div className="lg:col-span-2 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg border border-primary-200 p-6">
        <div className="flex items-center mb-4">
          <div className="flex items-center justify-center w-8 h-8 bg-primary-600 rounded-lg mr-3">
            <CpuChipIcon className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-secondary-900">Nova AI Insights</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-secondary-900 mb-2">Requirements Analysis</h4>
            <p className="text-sm text-secondary-700">
              {architecture.novaReasoning?.requirementsAnalysis || 
               'Nova 2 Lite analyzed your requirements to identify key functional and non-functional needs.'}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-secondary-900 mb-2">Architecture Decision</h4>
            <p className="text-sm text-secondary-700">
              {architecture.novaReasoning?.architectureDecision || 
               'Selected optimal AWS services and patterns based on scalability and performance requirements.'}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-secondary-900 mb-2">Cost Optimization</h4>
            <p className="text-sm text-secondary-700">
              {architecture.novaReasoning?.costOptimization || 
               'Nova Micro identified cost optimization opportunities while maintaining performance targets.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
