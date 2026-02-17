import { CostAnalysis } from '@/types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CurrencyDollarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

interface CostBreakdownProps {
  costAnalysis: CostAnalysis;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function CostBreakdown({ costAnalysis }: CostBreakdownProps) {
  const chartData = costAnalysis.componentBreakdown.map((component, index) => ({
    name: component.componentName,
    cost: component.monthlyCost,
    color: COLORS[index % COLORS.length],
    percentage: (component.monthlyCost / costAnalysis.totalMonthlyCost * 100).toFixed(1),
  }));

  const scenarioData = costAnalysis.costScenarios.map((scenario) => ({
    name: scenario.scenarioName,
    cost: scenario.totalMonthlyCost,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-secondary-200 rounded-lg shadow-lg">
          <p className="font-medium text-secondary-900">{label}</p>
          <p className="text-primary-600">
            Cost: <span className="font-semibold">${payload[0].value.toFixed(2)}</span>
          </p>
          {payload[0].payload.percentage && (
            <p className="text-secondary-600 text-sm">
              {payload[0].payload.percentage}% of total
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Cost Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Total Monthly Cost</p>
              <p className="text-3xl font-bold text-secondary-900">
                ${costAnalysis.totalMonthlyCost.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-primary-100 rounded-full">
              <CurrencyDollarIcon className="w-6 h-6 text-primary-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center text-sm text-secondary-600">
              Confidence: {(costAnalysis.confidenceLevel * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Components</p>
              <p className="text-3xl font-bold text-secondary-900">
                {costAnalysis.componentBreakdown.length}
              </p>
            </div>
            <div className="p-3 bg-success-100 rounded-full">
              <ArrowTrendingUpIcon className="w-6 h-6 text-success-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center text-sm text-secondary-600">
              Average: ${(costAnalysis.totalMonthlyCost / costAnalysis.componentBreakdown.length).toFixed(2)}/component
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Optimization Potential</p>
              <p className="text-3xl font-bold text-warning-600">
                {costAnalysis.componentBreakdown.reduce((sum, comp) => sum + (comp.optimizationPotential || 0), 0) / costAnalysis.componentBreakdown.length}%
              </p>
            </div>
            <div className="p-3 bg-warning-100 rounded-full">
              <ArrowTrendingDownIcon className="w-6 h-6 text-warning-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="inline-flex items-center text-sm text-secondary-600">
              Est. savings available
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cost Breakdown Pie Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-6">Cost Breakdown by Component</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="cost"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Scenarios Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-6">Cost Scenarios Comparison</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scenarioData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis 
                  tickFormatter={(value) => `$${value}`}
                  fontSize={12}
                />
                <Tooltip 
                  formatter={(value: any) => [`$${value.toFixed(2)}`, 'Monthly Cost']}
                  labelFormatter={(label) => `Scenario: ${label}`}
                />
                <Bar dataKey="cost" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Component Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
        <h3 className="text-lg font-semibold text-secondary-900 mb-6">Component Cost Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary-200">
                <th className="text-left py-3 px-2 font-medium text-secondary-600">Component</th>
                <th className="text-left py-3 px-2 font-medium text-secondary-600">Service Type</th>
                <th className="text-right py-3 px-2 font-medium text-secondary-600">Monthly Cost</th>
                <th className="text-right py-3 px-2 font-medium text-secondary-600">% of Total</th>
                <th className="text-right py-3 px-2 font-medium text-secondary-600">Optimization</th>
              </tr>
            </thead>
            <tbody>
              {costAnalysis.componentBreakdown
                .sort((a, b) => b.monthlyCost - a.monthlyCost)
                .map((component, index) => (
                  <tr key={component.componentId} className="border-b border-secondary-100 hover:bg-secondary-50">
                    <td className="py-3 px-2">
                      <div className="font-medium text-secondary-900">{component.componentName}</div>
                      <div className="text-sm text-secondary-600">
                        {component.costDrivers.slice(0, 2).join(', ')}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {component.serviceType.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right font-medium text-secondary-900">
                      ${component.monthlyCost.toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-right text-secondary-600">
                      {((component.monthlyCost / costAnalysis.totalMonthlyCost) * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-2 text-right">
                      {component.optimizationPotential && component.optimizationPotential > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                          {component.optimizationPotential}% savings
                        </span>
                      ) : (
                        <span className="text-secondary-400 text-sm">Optimized</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost Scenarios Details */}
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
        <h3 className="text-lg font-semibold text-secondary-900 mb-6">Scenario Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {costAnalysis.costScenarios.map((scenario, index) => (
            <div key={index} className="border border-secondary-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-secondary-900">{scenario.scenarioName}</h4>
                <span className="text-lg font-bold text-primary-600">
                  ${scenario.totalMonthlyCost.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-secondary-600 mb-3">{scenario.description}</p>
              <div className="space-y-2">
                {scenario.costDrivers.map((driver, driverIndex) => (
                  <div key={driverIndex} className="flex items-center text-xs text-secondary-600">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2"></div>
                    {driver}
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-secondary-100">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-secondary-600">vs. Current:</span>
                  <span className={`font-medium ${
                    scenario.totalMonthlyCost < costAnalysis.totalMonthlyCost 
                      ? 'text-success-600' 
                      : scenario.totalMonthlyCost > costAnalysis.totalMonthlyCost 
                      ? 'text-error-600' 
                      : 'text-secondary-600'
                  }`}>
                    {scenario.totalMonthlyCost < costAnalysis.totalMonthlyCost ? '-' : '+'}
                    ${Math.abs(scenario.totalMonthlyCost - costAnalysis.totalMonthlyCost).toFixed(2)}
                    {' '}
                    ({Math.abs(((scenario.totalMonthlyCost - costAnalysis.totalMonthlyCost) / costAnalysis.totalMonthlyCost) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Disclaimer */}
      <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-secondary-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-secondary-700">
              <strong>Cost estimates</strong> are based on AWS pricing as of {costAnalysis.pricingDataVersion} 
              with {(costAnalysis.confidenceLevel * 100).toFixed(0)}% confidence level. 
              Actual costs may vary based on usage patterns, regional pricing, and AWS pricing updates. 
              Consider Reserved Instances and Savings Plans for long-term cost optimization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
