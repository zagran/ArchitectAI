import { useState } from 'react';
import { CostAnalysis } from '@/types';
import {
  CurrencyDollarIcon,
  ArrowTrendingDownIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

interface CostBreakdownProps {
  costAnalysis: CostAnalysis;
}

// Color per component (for dot + share bar)
const COMPONENT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];

// Color per cost category (for stacked breakdown bar)
const CATEGORY_COLORS: Record<string, string> = {
  compute:       '#3B82F6',
  instance:      '#3B82F6',
  storage:       '#10B981',
  backup:        '#34D399',
  data_transfer: '#F59E0B',
  requests:      '#8B5CF6',
  processing:    '#06B6D4',
  fixed:         '#64748B',
  lcu:           '#94A3B8',
  nodes:         '#3B82F6',
  base:          '#6B7280',
  estimate:      '#9CA3AF',
};

const CATEGORY_LABELS: Record<string, string> = {
  compute:       'Compute',
  instance:      'Instance',
  storage:       'Storage',
  backup:        'Backup',
  data_transfer: 'Data Transfer',
  requests:      'Requests',
  processing:    'Processing',
  fixed:         'Fixed fee',
  lcu:           'LCU',
  nodes:         'Nodes',
  base:          'Base fee',
  estimate:      'Estimate',
};

function fmt(n: number) {
  return n < 1 ? `$${n.toFixed(2)}` : `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function CostBar({ breakdown, total, multiplier }: {
  breakdown: Record<string, number>;
  total: number;
  multiplier: number;
}) {
  const entries = Object.entries(breakdown)
    .filter(([, v]) => (v as number) > 0)
    .sort(([, a], [, b]) => (b as number) - (a as number));

  if (entries.length === 0) return <span className="text-xs text-secondary-400">—</span>;

  return (
    <div className="space-y-1.5">
      {/* Stacked bar */}
      <div className="flex h-2 rounded-full overflow-hidden bg-secondary-100 w-full max-w-[160px]">
        {entries.map(([key, value]) => {
          const pct = ((value as number) / total) * 100;
          return (
            <div
              key={key}
              style={{ width: `${pct}%`, backgroundColor: CATEGORY_COLORS[key] ?? '#94A3B8' }}
              title={`${CATEGORY_LABELS[key] ?? key}: ${fmt((value as number) * multiplier)}`}
            />
          );
        })}
      </div>
      {/* Legend chips */}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {entries.map(([key, value]) => (
          <span key={key} className="flex items-center gap-1 text-xs text-secondary-600 whitespace-nowrap">
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: CATEGORY_COLORS[key] ?? '#94A3B8' }}
            />
            {CATEGORY_LABELS[key] ?? key.replace(/_/g, ' ')}
            <span className="font-medium text-secondary-900">{fmt((value as number) * multiplier)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function CostBreakdown({ costAnalysis }: CostBreakdownProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [period, setPeriod] = useState<'monthly' | 'annual'>('monthly');

  const multiplier = period === 'annual' ? 12 : 1;
  const totalCost = costAnalysis.totalMonthlyCost * multiplier;
  const annualCost = costAnalysis.totalMonthlyCost * 12;

  const sorted = [...costAnalysis.componentBreakdown].sort((a, b) => b.monthlyCost - a.monthlyCost);

  return (
    <div className="space-y-8">
      {/* Period toggle */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-lg border border-secondary-200 overflow-hidden text-sm">
          {(['monthly', 'annual'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 font-medium transition-colors capitalize ${
                period === p
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-secondary-600 hover:bg-secondary-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">
                {period === 'monthly' ? 'Monthly Cost' : 'Annual Cost'}
              </p>
              <p className="text-3xl font-bold text-secondary-900">{fmt(totalCost)}</p>
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <CurrencyDollarIcon className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <p className="mt-3 text-sm text-secondary-500">
            Confidence: {(costAnalysis.confidenceLevel * 100).toFixed(0)}%
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">
                {period === 'monthly' ? 'Annual Projection' : 'Monthly Equivalent'}
              </p>
              <p className="text-3xl font-bold text-secondary-900">
                {fmt(period === 'monthly' ? annualCost : costAnalysis.totalMonthlyCost)}
              </p>
            </div>
            <div className="p-3 bg-secondary-100 rounded-full">
              <CalendarDaysIcon className="w-6 h-6 text-secondary-600" />
            </div>
          </div>
          <p className="mt-3 text-sm text-secondary-500">
            {period === 'monthly' ? '12-month forecast' : 'Per month'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Top Cost Driver</p>
              <p className="text-xl font-bold text-secondary-900 mt-1 truncate">
                {sorted[0]?.componentName ?? '—'}
              </p>
            </div>
            <div className="p-3 bg-warning-100 rounded-full">
              <ArrowTrendingDownIcon className="w-6 h-6 text-warning-600" />
            </div>
          </div>
          <p className="mt-3 text-sm text-secondary-500">
            {sorted[0] ? `${((sorted[0].monthlyCost / costAnalysis.totalMonthlyCost) * 100).toFixed(0)}% of total spend` : ''}
          </p>
        </div>
      </div>

      {/* Main table */}
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-secondary-200 flex items-center gap-2">
          <h3 className="text-base font-semibold text-secondary-900">Component Breakdown</h3>
          <span className="text-xs text-secondary-400 flex items-center gap-1">
            <InformationCircleIcon className="h-3.5 w-3.5" />
            Hover bar segments for details · click row for cost drivers
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-secondary-100 bg-secondary-50 text-secondary-600 font-medium">
                <th className="text-left py-3 px-4 w-6">#</th>
                <th className="text-left py-3 px-4">Component</th>
                <th className="text-left py-3 px-4">Cost Composition</th>
                <th className="text-right py-3 px-4">{period === 'monthly' ? 'Monthly' : 'Annual'}</th>
                <th className="text-right py-3 px-4 hidden md:table-cell">Annual</th>
                <th className="text-right py-3 px-4">Share</th>
                <th className="w-8 py-3 px-4" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((component, idx) => {
                const isOpen = expandedRow === component.componentId;
                const displayCost = component.monthlyCost * multiplier;
                const pct = (component.monthlyCost / costAnalysis.totalMonthlyCost) * 100;
                const hasDrivers = component.costDrivers.length > 0;
                const highSavings = (component.optimizationPotential ?? 0) >= 20;
                const color = COMPONENT_COLORS[idx % COMPONENT_COLORS.length];

                return (
                  <>
                    <tr
                      key={component.componentId}
                      onClick={() => hasDrivers && setExpandedRow(isOpen ? null : component.componentId)}
                      className={`border-b border-secondary-100 transition-colors align-top ${
                        hasDrivers ? 'cursor-pointer hover:bg-secondary-50' : ''
                      } ${isOpen ? 'bg-secondary-50' : ''}`}
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-4 text-secondary-400 tabular-nums text-xs">{idx + 1}</td>

                      {/* Component name + service */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2.5">
                          <span
                            className="mt-0.5 w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <div className="min-w-0">
                            <p className="font-medium text-secondary-900 leading-tight">{component.componentName}</p>
                            <p className="text-xs text-secondary-400 mt-0.5">{component.serviceType.toUpperCase()}</p>
                            {highSavings && (
                              <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-warning-700 bg-warning-50 border border-warning-200 px-2 py-0.5 rounded-full">
                                <ArrowTrendingDownIcon className="h-3 w-3" />
                                {component.optimizationPotential}% savings potential
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Cost composition */}
                      <td className="py-3.5 px-4">
                        <CostBar
                          breakdown={component.costBreakdown}
                          total={component.monthlyCost}
                          multiplier={multiplier}
                        />
                      </td>

                      {/* Cost */}
                      <td className="py-3.5 px-4 text-right font-semibold text-secondary-900 tabular-nums">
                        {fmt(displayCost)}
                      </td>

                      {/* Annual (hidden on small) */}
                      <td className="py-3.5 px-4 text-right text-secondary-500 tabular-nums hidden md:table-cell">
                        {period === 'monthly'
                          ? fmt(component.monthlyCost * 12)
                          : fmt(component.monthlyCost)}
                      </td>

                      {/* Share bar */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-14 bg-secondary-100 rounded-full h-1.5 hidden sm:block">
                            <div
                              className="h-1.5 rounded-full"
                              style={{ width: `${pct}%`, backgroundColor: color }}
                            />
                          </div>
                          <span className="text-secondary-700 tabular-nums text-xs font-medium w-10 text-right">
                            {pct.toFixed(1)}%
                          </span>
                        </div>
                      </td>

                      {/* Expand toggle */}
                      <td className="py-3.5 px-3">
                        {hasDrivers && (
                          <ChevronDownIcon
                            className={`h-4 w-4 text-secondary-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                          />
                        )}
                      </td>
                    </tr>

                    {isOpen && hasDrivers && (
                      <tr key={`${component.componentId}-detail`} className="bg-secondary-50 border-b border-secondary-200">
                        <td />
                        <td colSpan={6} className="px-4 py-4 pl-9">
                          <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-2">
                            Cost Drivers
                          </p>
                          <ul className="space-y-1.5">
                            {component.costDrivers.map((driver, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-secondary-700">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                                {driver}
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-secondary-50 border-t border-secondary-200">
                <td className="py-3 px-4" />
                <td className="py-3 px-4 font-semibold text-secondary-900">Total</td>
                <td className="py-3 px-4" />
                <td className="py-3 px-4 text-right font-bold text-secondary-900 tabular-nums">{fmt(totalCost)}</td>
                <td className="py-3 px-4 text-right text-secondary-500 tabular-nums hidden md:table-cell">
                  {period === 'monthly' ? fmt(annualCost) : fmt(costAnalysis.totalMonthlyCost)}
                </td>
                <td className="py-3 px-4 text-right text-xs font-medium text-secondary-600">100%</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Scenario comparison */}
      {costAnalysis.costScenarios.length > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <h3 className="text-base font-semibold text-secondary-900 mb-4">Scenario Comparison</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {costAnalysis.costScenarios.map((scenario, i) => {
              const scenarioCost = scenario.totalMonthlyCost * multiplier;
              const baseline = costAnalysis.costScenarios[0].totalMonthlyCost * multiplier;
              const diff = scenarioCost - baseline;
              const diffPct = ((diff / baseline) * 100).toFixed(1);
              const isBaseline = i === 0;
              const isLower = diff < 0;

              return (
                <div
                  key={i}
                  className={`rounded-lg p-4 border ${isBaseline ? 'border-primary-200 bg-primary-50' : 'border-secondary-200'}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-secondary-900 leading-tight">{scenario.scenarioName}</h4>
                    {isBaseline && (
                      <span className="text-xs font-medium text-primary-700 bg-primary-100 px-2 py-0.5 rounded-full flex-shrink-0">
                        Baseline
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-secondary-900 mt-2">{fmt(scenarioCost)}</p>
                  <p className="text-xs text-secondary-500 mt-1 mb-3">{scenario.description}</p>
                  {!isBaseline && (
                    <div className="flex items-center gap-1.5 pt-2 border-t border-secondary-200">
                      <span className={`text-sm font-semibold ${isLower ? 'text-success-600' : 'text-error-600'}`}>
                        {isLower ? '−' : '+'}{fmt(Math.abs(diff))}
                      </span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${isLower ? 'bg-success-50 text-success-700' : 'bg-error-50 text-error-700'}`}>
                        {Math.abs(+diffPct)}%
                      </span>
                      <span className="text-xs text-secondary-400">vs baseline</span>
                    </div>
                  )}
                  {scenario.costDrivers.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {scenario.costDrivers.slice(0, 2).map((d, j) => (
                        <li key={j} className="text-xs text-secondary-500 flex gap-1.5">
                          <span className="mt-1 w-1 h-1 rounded-full bg-secondary-400 flex-shrink-0" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="flex gap-3 p-4 bg-secondary-50 border border-secondary-200 rounded-lg text-sm text-secondary-600">
        <svg className="h-5 w-5 text-secondary-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <p>
          Estimates based on AWS on-demand pricing ({costAnalysis.pricingDataVersion}), confidence{' '}
          {(costAnalysis.confidenceLevel * 100).toFixed(0)}%. Actual costs vary with usage, Reserved Instances, and regional pricing.
        </p>
      </div>
    </div>
  );
}
