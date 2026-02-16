import { OptimizationSuggestion } from '@/types';
import { 
  LightBulbIcon, 
  CurrencyDollarIcon, 
  ShieldCheckIcon, 
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface OptimizationsListProps {
  optimizations: OptimizationSuggestion[];
}

const categoryIcons: Record<string, any> = {
  cost: CurrencyDollarIcon,
  performance: ChartBarIcon,
  security: ShieldCheckIcon,
  reliability: CheckCircleIcon,
  default: LightBulbIcon,
};

const impactColors = {
  high: 'bg-error-100 text-error-800 border-error-200',
  medium: 'bg-warning-100 text-warning-800 border-warning-200',
  low: 'bg-success-100 text-success-800 border-success-200',
};

const effortColors = {
  high: 'bg-error-100 text-error-700',
  medium: 'bg-warning-100 text-warning-700',
  low: 'bg-success-100 text-success-700',
};

export default function OptimizationsList({ optimizations }: OptimizationsListProps) {
  if (!optimizations || optimizations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-12 text-center">
        <CheckCircleIcon className="mx-auto h-12 w-12 text-success-500 mb-4" />
        <h3 className="text-lg font-medium text-secondary-900 mb-2">
          Architecture Already Optimized
        </h3>
        <p className="text-secondary-600 mb-6">
          Your architecture follows AWS best practices and doesn't have any immediate optimization opportunities.
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-success-50 border border-success-200 rounded-lg">
          <CheckCircleIcon className="h-5 w-5 text-success-600 mr-2" />
          <span className="text-success-800 font-medium">Well-designed architecture</span>
        </div>
      </div>
    );
  }

  const totalPotentialSavings = optimizations.reduce((sum, opt) => 
    sum + (opt.estimatedSavingsPercent || 0), 0
  );

  const costOptimizations = optimizations.filter(opt => opt.category === 'cost');
  const performanceOptimizations = optimizations.filter(opt => opt.category === 'performance');
  const securityOptimizations = optimizations.filter(opt => opt.category === 'security');
  const otherOptimizations = optimizations.filter(opt => 
    !['cost', 'performance', 'security'].includes(opt.category)
  );

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="bg-gradient-to-r from-warning-50 to-orange-50 border border-warning-200 rounded-lg p-6">
        <div className="flex items-start">
          <LightBulbIcon className="h-8 w-8 text-warning-600 mr-4 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-secondary-900 mb-2">
              {optimizations.length} Optimization{optimizations.length > 1 ? 's' : ''} Available
            </h3>
            <p className="text-secondary-700 mb-4">
              Nova Micro has identified opportunities to improve your architecture's cost efficiency, 
              performance, and security posture.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-white rounded-lg p-4 border border-warning-200">
                <div className="text-2xl font-bold text-warning-600">
                  {totalPotentialSavings.toFixed(0)}%
                </div>
                <div className="text-sm text-secondary-600">
                  Total potential savings
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-warning-200">
                <div className="text-2xl font-bold text-primary-600">
                  {optimizations.filter(opt => opt.potentialImpact === 'high').length}
                </div>
                <div className="text-sm text-secondary-600">
                  High-impact optimizations
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-warning-200">
                <div className="text-2xl font-bold text-success-600">
                  {optimizations.filter(opt => opt.implementationEffort === 'low').length}
                </div>
                <div className="text-sm text-secondary-600">
                  Low-effort implementations
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cost Optimizations */}
      {costOptimizations.length > 0 && (
        <OptimizationCategory
          title="Cost Optimizations"
          description="Reduce your monthly AWS spend while maintaining performance"
          icon={CurrencyDollarIcon}
          iconColor="text-success-600"
          optimizations={costOptimizations}
        />
      )}

      {/* Performance Optimizations */}
      {performanceOptimizations.length > 0 && (
        <OptimizationCategory
          title="Performance Optimizations"
          description="Improve response times and system throughput"
          icon={ChartBarIcon}
          iconColor="text-primary-600"
          optimizations={performanceOptimizations}
        />
      )}

      {/* Security Optimizations */}
      {securityOptimizations.length > 0 && (
        <OptimizationCategory
          title="Security Optimizations"
          description="Strengthen your security posture and compliance"
          icon={ShieldCheckIcon}
          iconColor="text-purple-600"
          optimizations={securityOptimizations}
        />
      )}

      {/* Other Optimizations */}
      {otherOptimizations.length > 0 && (
        <OptimizationCategory
          title="Additional Optimizations"
          description="Other improvements for reliability and maintainability"
          icon={LightBulbIcon}
          iconColor="text-warning-600"
          optimizations={otherOptimizations}
        />
      )}

      {/* Implementation Priority */}
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">
          Recommended Implementation Order
        </h3>
        <p className="text-secondary-600 mb-6">
          Based on impact vs. effort analysis, here's the suggested order for implementing optimizations:
        </p>
        
        <div className="space-y-4">
          {optimizations
            .sort((a, b) => {
              // Sort by impact (high first) then effort (low first)
              const impactScore = { high: 3, medium: 2, low: 1 };
              const effortScore = { low: 3, medium: 2, high: 1 };
              
              const aScore = impactScore[a.potentialImpact] + effortScore[a.implementationEffort];
              const bScore = impactScore[b.potentialImpact] + effortScore[b.implementationEffort];
              
              return bScore - aScore;
            })
            .map((optimization, index) => (
              <div key={optimization.id} className="flex items-start p-4 border border-secondary-200 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-sm font-semibold text-primary-600">{index + 1}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-secondary-900">{optimization.title}</h4>
                    <div className="flex items-center space-x-2 ml-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${impactColors[optimization.potentialImpact]}`}>
                        {optimization.potentialImpact} impact
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${effortColors[optimization.implementationEffort]}`}>
                        {optimization.implementationEffort} effort
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-secondary-600 mt-1">{optimization.description}</p>
                  
                  {optimization.estimatedSavingsPercent && (
                    <div className="mt-2 text-sm text-success-600 font-medium">
                      Potential savings: {optimization.estimatedSavingsPercent}%
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Nova AI Context */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex items-center justify-center w-8 h-8 bg-primary-600 rounded-lg mr-3">
            <LightBulbIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-2">
              Powered by Nova Micro
            </h3>
            <p className="text-secondary-700">
              These optimization suggestions are generated by Amazon Nova Micro, which specializes in 
              rapid analysis and cost-effective recommendations. Each suggestion includes detailed 
              implementation steps and impact assessments based on AWS best practices and your 
              specific architecture requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Category component for grouping optimizations
function OptimizationCategory({
  title,
  description,
  icon: Icon,
  iconColor,
  optimizations,
}: {
  title: string;
  description: string;
  icon: any;
  iconColor: string;
  optimizations: OptimizationSuggestion[];
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
      <div className="flex items-center mb-4">
        <Icon className={`h-6 w-6 ${iconColor} mr-3`} />
        <div>
          <h3 className="text-lg font-semibold text-secondary-900">{title}</h3>
          <p className="text-sm text-secondary-600">{description}</p>
        </div>
      </div>

      <div className="space-y-6">
        {optimizations.map((optimization) => (
          <div key={optimization.id} className="border-l-4 border-primary-200 pl-6">
            <div className="flex items-start justify-between mb-3">
              <h4 className="text-base font-medium text-secondary-900">{optimization.title}</h4>
              <div className="flex items-center space-x-2 ml-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${impactColors[optimization.potentialImpact]}`}>
                  {optimization.potentialImpact} impact
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${effortColors[optimization.implementationEffort]}`}>
                  {optimization.implementationEffort} effort
                </span>
              </div>
            </div>

            <p className="text-sm text-secondary-700 mb-4">{optimization.description}</p>

            {optimization.estimatedSavingsPercent && (
              <div className="mb-4 p-3 bg-success-50 border border-success-200 rounded-lg">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 text-success-600 mr-2" />
                  <span className="text-sm font-medium text-success-800">
                    Estimated savings: {optimization.estimatedSavingsPercent}%
                    {optimization.estimatedSavingsDollars && (
                      <span className="ml-2">
                        (${optimization.estimatedSavingsDollars.toFixed(0)}/month)
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )}

            {optimization.affectedComponents.length > 0 && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-secondary-700 mb-2">Affected Components:</h5>
                <div className="flex flex-wrap gap-2">
                  {optimization.affectedComponents.map((component, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800">
                      {component}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h5 className="text-sm font-medium text-secondary-700 mb-2 flex items-center">
                <ClockIcon className="h-4 w-4 mr-1" />
                Implementation Steps:
              </h5>
              <ol className="text-sm text-secondary-600 space-y-1">
                {optimization.implementationSteps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-5 h-5 bg-primary-100 text-primary-600 rounded-full text-xs font-medium mr-2 mt-0.5 flex-shrink-0 text-center leading-5">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
