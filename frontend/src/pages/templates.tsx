import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  SparklesIcon,
  CloudIcon,
  CpuChipIcon,
  CircleStackIcon,
} from '@heroicons/react/24/outline';
import Layout from '@/components/Layout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

// Mock template data
const templates = [
  {
    id: 'web-app',
    name: 'Web Application',
    description: 'Scalable web application with load balancer, auto scaling, and database',
    category: 'Web Applications',
    complexity: 'intermediate',
    estimatedCost: '$200-800',
    useCases: ['E-commerce', 'Content Management', 'SaaS Applications'],
    components: 5,
    icon: CloudIcon,
    popular: true,
  },
  {
    id: 'microservices',
    name: 'Microservices',
    description: 'Container-based microservices with service discovery and API gateway',
    category: 'Microservices',
    complexity: 'advanced',
    estimatedCost: '$500-2000',
    useCases: ['Large Applications', 'Multi-team Development', 'Independent Deployments'],
    components: 8,
    icon: CpuChipIcon,
    popular: true,
  },
  {
    id: 'serverless',
    name: 'Serverless',
    description: 'Event-driven serverless architecture with Lambda functions',
    category: 'Serverless',
    complexity: 'intermediate',
    estimatedCost: '$50-300',
    useCases: ['Event Processing', 'API Backends', 'Data Processing'],
    components: 4,
    icon: SparklesIcon,
    popular: false,
  },
  {
    id: 'data-pipeline',
    name: 'Data Processing',
    description: 'Big data processing and analytics pipeline',
    category: 'Data Processing',
    complexity: 'advanced',
    estimatedCost: '$300-1500',
    useCases: ['ETL Pipelines', 'Real-time Analytics', 'Data Warehousing'],
    components: 6,
    icon: CircleStackIcon,
    popular: false,
  },
];

const categories = ['All', 'Web Applications', 'Microservices', 'Serverless', 'Data Processing'];
const complexityLevels = ['All', 'simple', 'intermediate', 'advanced'];

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedComplexity, setSelectedComplexity] = useState('All');
  const [filteredTemplates, setFilteredTemplates] = useState(templates);

  useEffect(() => {
    let filtered = templates;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.useCases.some(useCase => 
          useCase.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Filter by complexity
    if (selectedComplexity !== 'All') {
      filtered = filtered.filter(template => template.complexity === selectedComplexity);
    }

    setFilteredTemplates(filtered);
  }, [searchQuery, selectedCategory, selectedComplexity]);

  const complexityColors = {
    simple: 'bg-success-100 text-success-800',
    intermediate: 'bg-warning-100 text-warning-800',
    advanced: 'bg-error-100 text-error-800',
  };

  return (
    <Layout>
      <Head>
        <title>Architecture Templates - ArchitectAI</title>
        <meta name="description" content="Browse pre-built AWS architecture templates for common use cases." />
      </Head>

      <div className="min-h-screen bg-secondary-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-secondary-900 mb-4">
              Architecture Templates
            </h1>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Jump-start your architecture design with proven AWS patterns. 
              Each template includes best practices, cost estimates, and implementation guidance.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(value: any) => setSearchQuery(typeof value === 'string' ? value : value.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Select
                  value={selectedCategory}
                  onChange={(value: any) => setSelectedCategory(typeof value === 'string' ? value : value.target.value)}
                  options={categories.map(cat => ({ value: cat, label: cat }))}
                />
              </div>
              
              <div>
                <Select
                  value={selectedComplexity}
                  onChange={(value: any) => setSelectedComplexity(typeof value === 'string' ? value : value.target.value)}
                  options={complexityLevels.map(level => ({ 
                    value: level, 
                    label: level === 'All' ? 'All Complexity' : level.charAt(0).toUpperCase() + level.slice(1)
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-secondary-600">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
            </p>
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-4 w-4 text-secondary-400" />
              <span className="text-sm text-secondary-600">
                {selectedCategory !== 'All' && `${selectedCategory} • `}
                {selectedComplexity !== 'All' && `${selectedComplexity} • `}
                {searchQuery && `"${searchQuery}"`}
              </span>
            </div>
          </div>

          {/* Templates Grid */}
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <SparklesIcon className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">No templates found</h3>
              <p className="text-secondary-600 mb-6">
                Try adjusting your search criteria or browse all templates.
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedComplexity('All');
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template, index) => {
                const Icon = template.icon;
                return (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-sm border border-secondary-200 hover:shadow-md transition-shadow relative"
                  >
                    {template.popular && (
                      <div className="absolute -top-2 -right-2 z-10">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          Popular
                        </span>
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <Icon className="h-8 w-8 text-primary-600" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-lg font-semibold text-secondary-900">
                              {template.name}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${complexityColors[template.complexity as keyof typeof complexityColors]}`}>
                              {template.complexity}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-secondary-600 text-sm mb-4 line-clamp-2">
                        {template.description}
                      </p>

                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm text-secondary-500 mb-2">
                          <span>{template.components} components</span>
                          <span>{template.estimatedCost}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {template.useCases.slice(0, 2).map((useCase) => (
                            <span
                              key={useCase}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary-100 text-secondary-700"
                            >
                              {useCase}
                            </span>
                          ))}
                          {template.useCases.length > 2 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary-100 text-secondary-600">
                              +{template.useCases.length - 2} more
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Button variant="secondary" size="sm">
                          View Details
                        </Button>
                        <Link href={`/projects/new?template=${template.id}`}>
                          <Button variant="primary" size="sm">
                            Use Template
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* CTA Section */}
          <div className="mt-16 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg border border-primary-200 p-8">
            <div className="text-center">
              <SparklesIcon className="mx-auto h-12 w-12 text-primary-600 mb-4" />
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                Don't see what you need?
              </h2>
              <p className="text-secondary-700 mb-6 max-w-2xl mx-auto">
                Create a custom architecture from your requirements using our AI-powered generator. 
                Describe what you want to build, and Nova will design the perfect AWS architecture for you.
              </p>
              <Link href="/projects/new">
                <Button variant="primary" size="lg">
                  Generate Custom Architecture
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
