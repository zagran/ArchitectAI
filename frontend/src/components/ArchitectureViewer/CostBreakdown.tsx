import { useState } from 'react';
import { CostAnalysis } from '@/types';
import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import {
  CurrencyDollarIcon,
  ArrowTrendingDownIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

interface CostBreakdownProps {
  costAnalysis: CostAnalysis;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];

const BREAKDOWN_LABELS: Record<string, string> = {
  compute: 'Compute',
  storage: 'Storage',
  data_transfer: 'Data Transfer',
  instance: 'Instance',
  requests: 'Requests',
  base: 'Base fee',
  processing: 'Processing',
  nova_estimate: 'AI Estimate',
  estimate: 'Estimate',
};

function fmt(n: number) {
  return n < 1 ? `$${n.toFixed(2)}` : `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export default function CostBreakdown({ costAnalysis }: CostBreakdownProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [period, setPeriod] = useState<'monthly' | 'annual'>('monthly');

  const multiplier = period === 'annual' ? 12 : 1;
  const totalCost = costAnalysis.totalMonthlyCost * multiplier;
  const annualCost = costAnalysis.totalMonthlyCost * 12;

  const chartData = costAnalysis.componentBreakdown.map((c, i) => ({
    name: c.componentName,
    cost: +(c.monthlyCost * multiplier).toFixed(2),
    color: COLORS[i % COLORS.length],
    percentage: ((c.monthlyCost / costAnalysis.totalMonthlyCost) * 100).toFixed(1),
  }));

  const scenarioData = costAnalysis.costScenarios.map((s) => ({
    name: s.scenarioName,
    cost: +(s.totalMonthlyCost * multiplier).toFixed(2),
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-secondary-200 rounded-lg shadow-lg">
          <p className="font-medium text-secondary-900 text-sm">{label}</p>
          <p className="text-primary-600 text-sm">
            {fmt(payload[0].value)}
            {payload[0].payload.percentage && (
              <span className="text-secondary-500 ml-1">({payload[0].payload.percentage}%)</span>
            )}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Period toggle */}
      <div className="flex justify-end">
        <div className="inline-flex rounded-lg border border-secondary-200 overflow-hidden text-sm">
          <button
            onClick={() => setPeriod('monthly')}
            className={`px-4 py-2 font-medium transition-colors ${
              period === 'monthly'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-secondary-600 hover:bg-secondary-50'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setPeriod('annual')}
            className={`px-4 py-2 font-medium transition-colors ${
              period === 'annual'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-secondary-600 hover:bg-secondary-50'
            }`}
          >
            Annual
          </button>
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
              <p className="text-sm font-medium text-secondary-600">Avg per Component</p>
              <p className="text-3xl font-bold text-secondary-900">
                {fmt(totalCost / Math.max(costAnalysis.componentBreakdown.length, 1))}
              </p>
            </div>
            <div className="p-3 bg-warning-100 rounded-full">
              <ArrowTrendingDownIcon className="w-6 h-6 text-warning-600" />
            </div>
          </div>
          <p className="mt-3 text-sm text-secondary-500">
            {costAnalysis.componentBreakdown.length} components
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <h3 className="text-base font-semibold text-secondary-900 mb-6">Cost by Component</h3>
          <div style={{ height: Math.max(180, chartData.length * 36) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[...chartData].sort((a, b) => b.cost - a.cost)}
                layout="vertical"
                margin={{ top: 0, right: 60, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `$${v}`} fontSize={11} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={130}
                  fontSize={11}
                  tickLine={false}
                  tick={{ fill: '#4b5563' }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
                <Bar dataKey="cost" radius={[0, 4, 4, 0]} label={{ position: 'right', fontSize: 11, formatter: (v: number) => `${chartData.find(d => d.cost === v)?.percentage ?? ''}%`, fill: '#6b7280' }}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <h3 className="text-base font-semibold text-secondary-900 mb-6">Cost Scenarios</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scenarioData} margin={{ top: 5, right: 20, left: 10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  angle={-40}
                  textAnchor="end"
                  height={70}
                  fontSize={11}
                />
                <YAxis tickFormatter={(v) => `$${v}`} fontSize={11} />
                <Tooltip formatter={(v: any) => [fmt(v), 'Cost']} />
                <Bar dataKey="cost" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed component table with expandable rows */}
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200">
        <div className="px-6 py-4 border-b border-secondary-200">
          <h3 className="text-base font-semibold text-secondary-900">Component Breakdown</h3>
          <p className="text-xs text-secondary-500 mt-0.5">Click a row to see the cost sub-items</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-secondary-100 bg-secondary-50">
                <th className="text-left py-3 px-4 font-medium text-secondary-600">Component</th>
                <th className="text-left py-3 px-4 font-medium text-secondary-600">Service</th>
                <th className="text-right py-3 px-4 font-medium text-secondary-600">
                  {period === 'monthly' ? 'Monthly' : 'Annual'}
                </th>
                <th className="text-right py-3 px-4 font-medium text-secondary-600">Share</th>
                <th className="w-8 py-3 px-4" />
              </tr>
            </thead>
            <tbody>
              {costAnalysis.componentBreakdown
                .slice()
                .sort((a, b) => b.monthlyCost - a.monthlyCost)
                .map((component) => {
                  const isOpen = expandedRow === component.componentId;
                  const displayCost = component.monthlyCost * multiplier;
                  const pct = ((component.monthlyCost / costAnalysis.totalMonthlyCost) * 100).toFixed(1);
                  const breakdownEntries = Object.entries(component.costBreakdown || {});

                  return (
                    <>
                      <tr
                        key={component.componentId}
                        onClick={() => setExpandedRow(isOpen ? null : component.componentId)}
                        className="border-b border-secondary-100 hover:bg-secondary-50 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="font-medium text-secondary-900">{component.componentName}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                            {component.serviceType.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-secondary-900">
                          {fmt(displayCost)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 bg-secondary-100 rounded-full h-1.5 hidden sm:block">
                              <div
                                className="bg-primary-500 h-1.5 rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-secondary-600 tabular-nums">{pct}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <ChevronDownIcon
                            className={`h-4 w-4 text-secondary-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                          />
                        </td>
                      </tr>

                      {isOpen && (
                        <tr key={`${component.componentId}-detail`} className="bg-secondary-50 border-b border-secondary-100">
                          <td colSpan={5} className="px-6 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              {/* Cost sub-items */}
                              <div>
                                <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-2">
                                  Cost Items
                                </p>
                                <div className="space-y-2">
                                  {breakdownEntries.map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between">
                                      <span className="text-sm text-secondary-700">
                                        {BREAKDOWN_LABELS[key] ?? key.replace(/_/g, ' ')}
                                      </span>
                                      <span className="text-sm font-medium text-secondary-900 tabular-nums">
                                        {fmt((value as number) * multiplier)}
                                        <span className="text-secondary-400 font-normal">
                                          /{period === 'monthly' ? 'mo' : 'yr'}
                                        </span>
                                      </span>
                                    </div>
                                  ))}
                                  {period === 'annual' && (
                                    <div className="flex items-center justify-between pt-2 border-t border-secondary-200">
                                      <span className="text-sm font-semibold text-secondary-700">Total</span>
                                      <span className="text-sm font-bold text-secondary-900 tabular-nums">
                                        {fmt(displayCost)}/yr
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Cost drivers */}
                              {component.costDrivers.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-2">
                                    Cost Drivers
                                  </p>
                                  <ul className="space-y-1.5">
                                    {component.costDrivers.map((driver, i) => (
                                      <li key={i} className="flex items-start gap-2 text-sm text-secondary-700">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary-400 flex-shrink-0" />
                                        {driver}
                                      </li>
                                    ))}
                                  </ul>
                                  {component.optimizationPotential && component.optimizationPotential > 0 && (
                                    <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-warning-700 bg-warning-50 border border-warning-200 px-2.5 py-1 rounded-full">
                                      <ArrowTrendingDownIcon className="h-3.5 w-3.5" />
                                      {component.optimizationPotential}% savings potential
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
            </tbody>
            <tfoot>
              <tr className="bg-secondary-50">
                <td colSpan={2} className="py-3 px-4 font-semibold text-secondary-900">Total</td>
                <td className="py-3 px-4 text-right font-bold text-secondary-900">{fmt(totalCost)}</td>
                <td className="py-3 px-4 text-right font-medium text-secondary-600">100%</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Scenarios */}
      {costAnalysis.costScenarios.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <h3 className="text-base font-semibold text-secondary-900 mb-4">Scenario Comparison</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {costAnalysis.costScenarios.map((scenario, i) => {
              const scenarioCost = scenario.totalMonthlyCost * multiplier;
              const diff = scenarioCost - totalCost;
              const diffPct = ((diff / totalCost) * 100).toFixed(1);
              const isLower = diff < 0;
              return (
                <div key={i} className="border border-secondary-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-secondary-900">{scenario.scenarioName}</h4>
                    <span className="text-base font-bold text-primary-600">{fmt(scenarioCost)}</span>
                  </div>
                  <p className="text-xs text-secondary-500 mb-3">{scenario.description}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-secondary-100">
                    <span className="text-xs text-secondary-500">vs. baseline</span>
                    <span className={`text-xs font-semibold ${isLower ? 'text-success-600' : 'text-error-600'}`}>
                      {isLower ? '−' : '+'}{fmt(Math.abs(diff))} ({Math.abs(+diffPct)}%)
                    </span>
                  </div>
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
