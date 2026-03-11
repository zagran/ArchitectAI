import { useState } from 'react';
import { OptimizationSuggestion } from '@/types';
import {
  LightBulbIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

interface OptimizationsListProps {
  optimizations: OptimizationSuggestion[];
}

const CATEGORIES = [
  { key: 'cost',        label: 'Cost',        Icon: CurrencyDollarIcon, color: 'text-success-600',  border: 'border-success-400'  },
  { key: 'performance', label: 'Performance',  Icon: ChartBarIcon,        color: 'text-primary-600',  border: 'border-primary-400'  },
  { key: 'security',    label: 'Security',     Icon: ShieldCheckIcon,     color: 'text-purple-600',   border: 'border-purple-400'   },
  { key: 'other',       label: 'Other',        Icon: LightBulbIcon,       color: 'text-warning-600',  border: 'border-warning-400'  },
];

const IMPACT_STYLES = {
  high:   'bg-error-50 text-error-700 border border-error-200',
  medium: 'bg-warning-50 text-warning-700 border border-warning-200',
  low:    'bg-secondary-100 text-secondary-600',
};

const EFFORT_STYLES = {
  low:    'bg-success-50 text-success-700',
  medium: 'bg-warning-50 text-warning-700',
  high:   'bg-error-50 text-error-700',
};

const IMPACT_BORDER = {
  high:   'border-l-error-400',
  medium: 'border-l-warning-400',
  low:    'border-l-secondary-300',
};

function OptimizationCard({ opt }: { opt: OptimizationSuggestion }) {
  const [open, setOpen] = useState(false);
  const hasSteps = opt.implementationSteps.length > 0;

  return (
    <div className={`border border-secondary-200 border-l-4 ${IMPACT_BORDER[opt.potentialImpact]} rounded-lg bg-white overflow-hidden`}>
      <button
        onClick={() => hasSteps && setOpen(o => !o)}
        className={`w-full text-left px-4 py-3 ${hasSteps ? 'cursor-pointer hover:bg-secondary-50' : 'cursor-default'} transition-colors`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-secondary-900 text-sm">{opt.title}</span>
              {opt.estimatedSavingsPercent && opt.estimatedSavingsPercent > 0 && opt.category === 'cost' && (
                <span className="text-xs font-semibold text-success-700 bg-success-50 border border-success-200 px-1.5 py-0.5 rounded">
                  ↓{Math.round(opt.estimatedSavingsPercent)}%
                </span>
              )}
            </div>
            <p className="text-xs text-secondary-500 mt-1 leading-relaxed">{opt.description}</p>
            {opt.affectedComponents.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {opt.affectedComponents.map((c, i) => (
                  <span key={i} className="text-xs bg-secondary-100 text-secondary-600 px-2 py-0.5 rounded-full">
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${IMPACT_STYLES[opt.potentialImpact]}`}>
              {opt.potentialImpact}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${EFFORT_STYLES[opt.implementationEffort]}`}>
              {opt.implementationEffort} effort
            </span>
            {hasSteps && (
              <ChevronDownIcon className={`h-3.5 w-3.5 text-secondary-400 transition-transform ml-1 ${open ? 'rotate-180' : ''}`} />
            )}
          </div>
        </div>
      </button>

      {open && hasSteps && (
        <div className="px-4 pb-3 border-t border-secondary-100 bg-secondary-50">
          <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mt-3 mb-2">Steps</p>
          <ol className="space-y-1.5">
            {opt.implementationSteps.map((step, i) => (
              <li key={i} className="flex gap-2.5 text-xs text-secondary-700">
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-primary-100 text-primary-700 font-semibold flex items-center justify-center text-[10px] mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export default function OptimizationsList({ optimizations }: OptimizationsListProps) {
  if (!optimizations || optimizations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-12 text-center">
        <CheckCircleIcon className="mx-auto h-12 w-12 text-success-500 mb-4" />
        <h3 className="text-lg font-medium text-secondary-900 mb-2">Architecture Already Optimized</h3>
        <p className="text-secondary-600">
          Your architecture follows AWS best practices with no immediate optimization opportunities.
        </p>
      </div>
    );
  }

  const highImpact = optimizations.filter(o => o.potentialImpact === 'high').length;
  const lowEffort  = optimizations.filter(o => o.implementationEffort === 'low').length;
  // Max single-optimization savings (not sum — summing % across different components is misleading)
  const maxSavings = Math.max(...optimizations.filter(o => o.category === 'cost' && o.estimatedSavingsPercent).map(o => o.estimatedSavingsPercent ?? 0));

  const grouped = CATEGORIES.map(cat => ({
    ...cat,
    items: cat.key === 'other'
      ? optimizations.filter(o => !['cost', 'performance', 'security'].includes(o.category))
      : optimizations.filter(o => o.category === cat.key),
  })).filter(g => g.items.length > 0);

  return (
    <div className="space-y-6">
      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-6 px-5 py-3.5 bg-white border border-secondary-200 rounded-lg shadow-sm text-sm">
        <div className="flex items-center gap-2 text-warning-600">
          <LightBulbIcon className="h-5 w-5" />
          <span className="font-semibold text-secondary-900">{optimizations.length} optimizations found</span>
        </div>
        <div className="h-4 w-px bg-secondary-200" />
        <span className="text-secondary-600">
          <span className="font-semibold text-error-600">{highImpact}</span> high-impact
        </span>
        <span className="text-secondary-600">
          <span className="font-semibold text-success-600">{lowEffort}</span> low-effort
        </span>
        {maxSavings > 0 && (
          <>
            <div className="h-4 w-px bg-secondary-200" />
            <span className="text-secondary-600">
              Up to <span className="font-semibold text-success-600">{Math.round(maxSavings)}%</span> cost savings on individual components
            </span>
          </>
        )}
      </div>

      {/* Category sections */}
      {grouped.map(({ key, label, Icon, color, items }) => (
        <div key={key}>
          <div className="flex items-center gap-2 mb-3">
            <Icon className={`h-4 w-4 ${color}`} />
            <h3 className="text-sm font-semibold text-secondary-700 uppercase tracking-wider">{label}</h3>
            <span className="text-xs text-secondary-400">({items.length})</span>
          </div>
          <div className="space-y-2">
            {items.map(opt => <OptimizationCard key={opt.id} opt={opt} />)}
          </div>
        </div>
      ))}
    </div>
  );
}
