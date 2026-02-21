import { useState } from 'react';
import { SystemArchitecture } from '@/types';
import { CloudIcon, ServerIcon, CircleStackIcon, ShieldCheckIcon, GlobeAltIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import APIClient from '@/lib/api';

interface ArchitectureDiagramProps {
  architecture: SystemArchitecture;
}

const serviceIcons: Record<string, any> = {
  alb: GlobeAltIcon, nlb: GlobeAltIcon, cloudfront: GlobeAltIcon,
  api_gateway: GlobeAltIcon, route53: GlobeAltIcon,
  ec2: ServerIcon, ecs: ServerIcon, eks: ServerIcon, fargate: ServerIcon,
  lambda: CloudIcon, s3: CloudIcon, ebs: CloudIcon, efs: CloudIcon,
  rds: CircleStackIcon, dynamodb: CircleStackIcon, elasticache: CircleStackIcon,
  aurora: CircleStackIcon, redshift: CircleStackIcon, documentdb: CircleStackIcon,
  default: ShieldCheckIcon,
};

const serviceColors: Record<string, string> = {
  alb: 'bg-orange-100 border-orange-300 text-orange-800',
  nlb: 'bg-orange-100 border-orange-300 text-orange-800',
  cloudfront: 'bg-indigo-100 border-indigo-300 text-indigo-800',
  api_gateway: 'bg-indigo-100 border-indigo-300 text-indigo-800',
  route53: 'bg-indigo-100 border-indigo-300 text-indigo-800',
  ec2: 'bg-blue-100 border-blue-300 text-blue-800',
  ecs: 'bg-blue-100 border-blue-300 text-blue-800',
  eks: 'bg-blue-100 border-blue-300 text-blue-800',
  fargate: 'bg-blue-100 border-blue-300 text-blue-800',
  lambda: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  rds: 'bg-purple-100 border-purple-300 text-purple-800',
  aurora: 'bg-purple-100 border-purple-300 text-purple-800',
  dynamodb: 'bg-purple-100 border-purple-300 text-purple-800',
  elasticache: 'bg-red-100 border-red-300 text-red-800',
  documentdb: 'bg-purple-100 border-purple-300 text-purple-800',
  redshift: 'bg-purple-100 border-purple-300 text-purple-800',
  s3: 'bg-green-100 border-green-300 text-green-800',
  ebs: 'bg-green-100 border-green-300 text-green-800',
  efs: 'bg-green-100 border-green-300 text-green-800',
  sqs: 'bg-pink-100 border-pink-300 text-pink-800',
  sns: 'bg-pink-100 border-pink-300 text-pink-800',
  kinesis: 'bg-pink-100 border-pink-300 text-pink-800',
  waf: 'bg-red-100 border-red-300 text-red-800',
  cognito: 'bg-red-100 border-red-300 text-red-800',
  cloudwatch: 'bg-pink-100 border-pink-300 text-pink-800',
  default: 'bg-secondary-100 border-secondary-300 text-secondary-800',
};

const EDGE_TYPES    = new Set(['alb', 'nlb', 'cloudfront', 'api_gateway', 'route53', 'internet_gateway', 'waf']);
const COMPUTE_TYPES = new Set(['ec2', 'ecs', 'eks', 'fargate', 'lambda', 'batch']);
const DATA_TYPES    = new Set(['rds', 'aurora', 'dynamodb', 'elasticache', 'documentdb', 'redshift', 's3', 'ebs', 'efs', 'glacier']);
const MSG_TYPES     = new Set(['sqs', 'sns', 'kinesis', 'eventbridge', 'mq', 'msk']);
const SEC_TYPES     = new Set(['iam', 'kms', 'secrets_manager', 'cognito', 'acm', 'shield', 'guardduty']);
const OPS_TYPES     = new Set(['cloudwatch', 'x_ray', 'cloudtrail', 'config', 'ssm']);

function ComponentCard({ component }: { component: SystemArchitecture['components'][0] }) {
  const st = component.serviceType ?? '';
  const Icon = serviceIcons[st] ?? serviceIcons.default;
  const colorClass = serviceColors[st] ?? serviceColors.default;
  return (
    <div className={`flex items-center px-4 py-3 border-2 rounded-lg ${colorClass} min-w-[180px]`}>
      <Icon className="h-6 w-6 mr-3 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{component.name}</p>
        <p className="text-xs opacity-75 uppercase">{st}</p>
        {component.estimatedMonthlyCost != null && (
          <p className="text-xs opacity-75">${component.estimatedMonthlyCost.toFixed(0)}/mo</p>
        )}
      </div>
    </div>
  );
}

function Layer({ title, components }: { title: string; components: SystemArchitecture['components'] }) {
  if (!components.length) return null;
  return (
    <div className="flex flex-col items-center">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-secondary-500 mb-3">{title}</h4>
      <div className="flex flex-wrap justify-center gap-3">
        {components.map(c => <ComponentCard key={c.id} component={c} />)}
      </div>
    </div>
  );
}

export default function ArchitectureDiagram({ architecture }: ArchitectureDiagramProps) {
  const [generating, setGenerating] = useState(false);
  const [diagramImage, setDiagramImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const edge    = architecture.components.filter(c => EDGE_TYPES.has(c.serviceType));
  const compute = architecture.components.filter(c => COMPUTE_TYPES.has(c.serviceType));
  const data    = architecture.components.filter(c => DATA_TYPES.has(c.serviceType));
  const msg     = architecture.components.filter(c => MSG_TYPES.has(c.serviceType));
  const sec     = architecture.components.filter(c => SEC_TYPES.has(c.serviceType));
  const ops     = architecture.components.filter(c => OPS_TYPES.has(c.serviceType));
  const other   = architecture.components.filter(c =>
    !EDGE_TYPES.has(c.serviceType) && !COMPUTE_TYPES.has(c.serviceType) &&
    !DATA_TYPES.has(c.serviceType) && !MSG_TYPES.has(c.serviceType) &&
    !SEC_TYPES.has(c.serviceType)  && !OPS_TYPES.has(c.serviceType)
  );

  const handleGenerateDiagram = async () => {
    setGenerating(true);
    setError(null);
    try {
      const result = await APIClient.generateDiagram(architecture.id, 'aws-professional');
      const imageData = result?.diagram?.image_data ?? result?.diagram?.imageData;
      if (!imageData) throw new Error('No image data returned');
      setDiagramImage(imageData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Diagram generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!diagramImage) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${diagramImage}`;
    link.download = `${architecture.name.replace(/\s+/g, '_')}_diagram.png`;
    link.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-secondary-900">Architecture Diagram</h3>
        <div className="text-sm text-secondary-500">
          {architecture.components.length} components · {architecture.connections.length} connections
        </div>
      </div>

      {/* Generated AI diagram */}
      {diagramImage && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-secondary-700">Nova Canvas — Generated Diagram</span>
            <button
              onClick={handleDownload}
              className="flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
              Download PNG
            </button>
          </div>
          <img
            src={`data:image/png;base64,${diagramImage}`}
            alt="AWS Architecture Diagram"
            className="w-full rounded-lg border border-secondary-200 shadow-sm"
          />
        </div>
      )}

      {/* Layer-based visual */}
      <div className="space-y-6">
        {/* Internet */}
        <div className="flex justify-center">
          <div className="flex items-center px-4 py-2 bg-secondary-100 border border-secondary-300 rounded-lg text-secondary-700 text-sm">
            <GlobeAltIcon className="h-5 w-5 mr-2" />
            Internet / Users
          </div>
        </div>

        {[
          { title: 'Edge / Gateway', items: edge },
          { title: 'Compute / Application', items: compute },
          { title: 'Messaging', items: msg },
          { title: 'Data & Storage', items: data },
          { title: 'Security', items: sec },
          { title: 'Operations & Monitoring', items: ops },
          { title: 'Other', items: other },
        ].map(({ title, items }) => items.length > 0 && (
          <div key={title}>
            <div className="flex justify-center mb-4">
              <div className="w-px h-6 bg-secondary-300" />
            </div>
            <Layer title={title} components={items} />
          </div>
        ))}
      </div>

      {/* Connections */}
      {architecture.connections.length > 0 && (
        <div className="mt-6 p-4 bg-secondary-50 rounded-lg">
          <h4 className="text-sm font-medium text-secondary-900 mb-2">Data Flow</h4>
          <div className="text-sm text-secondary-600 space-y-1">
            {architecture.connections.slice(0, 6).map((conn, i) => (
              <div key={i} className="flex items-center">
                <span className="inline-block w-2 h-2 bg-primary-500 rounded-full mr-2 flex-shrink-0" />
                {conn.from} → {conn.to}
                {conn.protocol && (
                  <span className="ml-2 text-xs bg-secondary-200 px-2 py-0.5 rounded">{conn.protocol}</span>
                )}
              </div>
            ))}
            {architecture.connections.length > 6 && (
              <p className="text-xs text-secondary-500">+{architecture.connections.length - 6} more</p>
            )}
          </div>
        </div>
      )}

      {/* Generate button */}
      <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
        {error && (
          <p className="text-sm text-red-600 mb-3">{error}</p>
        )}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-primary-900">
              {diagramImage ? 'Regenerate with Nova Canvas' : 'Generate Professional Diagram'}
            </p>
            <p className="text-xs text-primary-700 mt-0.5">
              Uses Nova Canvas to create a publication-ready AWS architecture diagram with official icons.
            </p>
          </div>
          <button
            onClick={handleGenerateDiagram}
            disabled={generating}
            className="ml-4 flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Generating…
              </>
            ) : (
              <>
                <CloudIcon className="h-4 w-4 mr-2" />
                {diagramImage ? 'Regenerate' : 'Generate Diagram'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
