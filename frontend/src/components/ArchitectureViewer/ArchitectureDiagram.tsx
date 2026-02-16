import { SystemArchitecture } from '@/types';
import { CloudIcon, ServerIcon, CircleStackIcon, ShieldCheckIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

interface ArchitectureDiagramProps {
  architecture: SystemArchitecture;
}

const serviceIcons: Record<string, any> = {
  alb: GlobeAltIcon,
  nlb: GlobeAltIcon,
  ec2: ServerIcon,
  ecs: ServerIcon,
  rds: CircleStackIcon,
  dynamodb: CircleStackIcon,
  elasticache: CircleStackIcon,
  s3: CloudIcon,
  lambda: CloudIcon,
  cloudfront: GlobeAltIcon,
  default: ShieldCheckIcon,
};

const serviceColors: Record<string, string> = {
  alb: 'bg-orange-100 border-orange-300 text-orange-800',
  nlb: 'bg-orange-100 border-orange-300 text-orange-800',
  ec2: 'bg-blue-100 border-blue-300 text-blue-800',
  ecs: 'bg-blue-100 border-blue-300 text-blue-800',
  rds: 'bg-purple-100 border-purple-300 text-purple-800',
  dynamodb: 'bg-purple-100 border-purple-300 text-purple-800',
  elasticache: 'bg-red-100 border-red-300 text-red-800',
  s3: 'bg-green-100 border-green-300 text-green-800',
  lambda: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  cloudfront: 'bg-indigo-100 border-indigo-300 text-indigo-800',
  default: 'bg-secondary-100 border-secondary-300 text-secondary-800',
};

export default function ArchitectureDiagram({ architecture }: ArchitectureDiagramProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-secondary-900">Architecture Diagram</h3>
        <div className="text-sm text-secondary-500">
          {architecture.components.length} components • {architecture.connections.length} connections
        </div>
      </div>

      {/* Simple visual representation */}
      <div className="relative">
        {/* Internet/Users */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center px-4 py-2 bg-secondary-100 border border-secondary-300 rounded-lg text-secondary-800">
            <GlobeAltIcon className="h-5 w-5 mr-2" />
            Internet / Users
          </div>
        </div>

        {/* Architecture layers */}
        <div className="space-y-8">
          {/* Load Balancer layer */}
          <div className="flex flex-col items-center">
            <h4 className="text-sm font-medium text-secondary-600 mb-4">Load Balancing</h4>
            <div className="flex flex-wrap justify-center gap-4">
              {architecture.components
                .filter(comp => ['alb', 'nlb', 'cloudfront', 'api_gateway'].includes(comp.serviceType))
                .map((component) => {
                  const Icon = serviceIcons[component.serviceType] || serviceIcons.default;
                  const colorClass = serviceColors[component.serviceType] || serviceColors.default;
                  
                  return (
                    <div
                      key={component.id}
                      className={`flex items-center px-4 py-3 border-2 rounded-lg ${colorClass} min-w-[200px]`}
                    >
                      <Icon className="h-6 w-6 mr-3 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{component.name}</p>
                        <p className="text-xs opacity-75">{component.serviceType.toUpperCase()}</p>
                        {component.estimatedMonthlyCost && (
                          <p className="text-xs opacity-75">${component.estimatedMonthlyCost.toFixed(0)}/mo</p>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="w-0.5 h-8 bg-secondary-300"></div>
          </div>

          {/* Compute layer */}
          <div className="flex flex-col items-center">
            <h4 className="text-sm font-medium text-secondary-600 mb-4">Compute</h4>
            <div className="flex flex-wrap justify-center gap-4">
              {architecture.components
                .filter(comp => ['ec2', 'ecs', 'lambda', 'eks'].includes(comp.serviceType))
                .map((component) => {
                  const Icon = serviceIcons[component.serviceType] || serviceIcons.default;
                  const colorClass = serviceColors[component.serviceType] || serviceColors.default;
                  
                  return (
                    <div
                      key={component.id}
                      className={`flex items-center px-4 py-3 border-2 rounded-lg ${colorClass} min-w-[200px]`}
                    >
                      <Icon className="h-6 w-6 mr-3 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{component.name}</p>
                        <p className="text-xs opacity-75">{component.serviceType.toUpperCase()}</p>
                        {component.estimatedMonthlyCost && (
                          <p className="text-xs opacity-75">${component.estimatedMonthlyCost.toFixed(0)}/mo</p>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="w-0.5 h-8 bg-secondary-300"></div>
          </div>

          {/* Data layer */}
          <div className="flex flex-col items-center">
            <h4 className="text-sm font-medium text-secondary-600 mb-4">Data & Storage</h4>
            <div className="flex flex-wrap justify-center gap-4">
              {architecture.components
                .filter(comp => ['rds', 'dynamodb', 'elasticache', 's3', 'efs'].includes(comp.serviceType))
                .map((component) => {
                  const Icon = serviceIcons[component.serviceType] || serviceIcons.default;
                  const colorClass = serviceColors[component.serviceType] || serviceColors.default;
                  
                  return (
                    <div
                      key={component.id}
                      className={`flex items-center px-4 py-3 border-2 rounded-lg ${colorClass} min-w-[200px]`}
                    >
                      <Icon className="h-6 w-6 mr-3 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{component.name}</p>
                        <p className="text-xs opacity-75">{component.serviceType.toUpperCase()}</p>
                        {component.estimatedMonthlyCost && (
                          <p className="text-xs opacity-75">${component.estimatedMonthlyCost.toFixed(0)}/mo</p>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Connection summary */}
        <div className="mt-8 p-4 bg-secondary-50 rounded-lg">
          <h4 className="text-sm font-medium text-secondary-900 mb-2">Data Flow</h4>
          <div className="text-sm text-secondary-600 space-y-1">
            {architecture.connections.slice(0, 5).map((connection, index) => (
              <div key={index} className="flex items-center">
                <span className="inline-block w-2 h-2 bg-primary-500 rounded-full mr-2"></span>
                {connection.from} → {connection.to}
                {connection.protocol && (
                  <span className="ml-2 text-xs bg-secondary-200 px-2 py-0.5 rounded">
                    {connection.protocol}
                  </span>
                )}
              </div>
            ))}
            {architecture.connections.length > 5 && (
              <div className="text-xs text-secondary-500">
                +{architecture.connections.length - 5} more connections
              </div>
            )}
          </div>
        </div>

        {/* Professional diagram note */}
        <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
          <div className="flex items-start">
            <CloudIcon className="h-5 w-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-primary-900">
                Professional AWS Architecture Diagram
              </p>
              <p className="text-sm text-primary-700 mt-1">
                Nova Canvas can generate detailed, publication-ready architecture diagrams with official AWS icons, proper spacing, and professional formatting. Click "Generate Diagram" to create a downloadable version.
              </p>
              <button className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700">
                Generate Professional Diagram →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
