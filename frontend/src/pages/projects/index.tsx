import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  PlusIcon,
  FolderIcon,
  CalendarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChevronRightIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import Layout from '@/components/Layout/Layout';
import Button from '@/components/ui/Button';
import { Project, ProjectStatus } from '@/types';
import { APIClient } from '@/lib/api';

const statusColors = {
  [ProjectStatus.DRAFT]: 'bg-secondary-100 text-secondary-800',
  [ProjectStatus.IN_PROGRESS]: 'bg-primary-100 text-primary-800',
  [ProjectStatus.COMPLETED]: 'bg-success-100 text-success-800',
  [ProjectStatus.ARCHIVED]: 'bg-secondary-100 text-secondary-600',
};

const statusIcons = {
  [ProjectStatus.DRAFT]: '📝',
  [ProjectStatus.IN_PROGRESS]: '🚧',
  [ProjectStatus.COMPLETED]: '✅',
  [ProjectStatus.ARCHIVED]: '📦',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ProjectStatus | 'all'>('all');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      // For demo, use mock data
      const mockProjects: Project[] = [
        {
          id: '1',
          userId: 'user1',
          name: 'E-commerce Platform',
          description: 'Scalable e-commerce solution for 100,000 concurrent users',
          status: ProjectStatus.COMPLETED,
          architectures: [],
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-15T00:00:00Z',
          tags: ['e-commerce', 'scalable', 'aws'],
        },
        {
          id: '2',
          userId: 'user1',
          name: 'Data Analytics Pipeline',
          description: 'Real-time data processing and analytics for IoT sensors',
          status: ProjectStatus.IN_PROGRESS,
          architectures: [],
          createdAt: '2026-01-10T00:00:00Z',
          updatedAt: '2026-01-20T00:00:00Z',
          tags: ['data', 'analytics', 'iot'],
        },
        {
          id: '3',
          userId: 'user1',
          name: 'Mobile App Backend',
          description: 'Serverless backend for mobile application',
          status: ProjectStatus.DRAFT,
          architectures: [],
          createdAt: '2026-01-20T00:00:00Z',
          updatedAt: '2026-01-20T00:00:00Z',
          tags: ['mobile', 'serverless', 'api'],
        },
      ];
      setProjects(mockProjects);
    } catch (err) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(
    project => filter === 'all' || project.status === filter
  );

  const getProjectStats = (project: Project) => {
    return {
      architectures: project.architectures.length,
      estimatedCost: Math.random() * 1000 + 100, // Mock cost
      lastUpdated: new Date(project.updatedAt).toLocaleDateString(),
    };
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="spinner mx-auto mb-4 w-8 h-8" />
            <p className="text-secondary-600">Loading projects...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Projects - ArchitectAI</title>
        <meta name="description" content="Manage your architecture projects with AI-powered generation and analysis." />
      </Head>

      <div className="min-h-screen bg-secondary-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-secondary-900">Projects</h1>
              <p className="mt-2 text-secondary-600">
                Create and manage your architecture projects. Each project can contain multiple architecture variations.
              </p>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0">
              <Link href="/projects/new">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  New Project
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FolderIcon className="h-6 w-6 text-secondary-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-secondary-500 truncate">Total Projects</dt>
                      <dd className="text-lg font-medium text-secondary-900">{projects.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-primary-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-secondary-500 truncate">In Progress</dt>
                      <dd className="text-lg font-medium text-secondary-900">
                        {projects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CalendarIcon className="h-6 w-6 text-success-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-secondary-500 truncate">Completed</dt>
                      <dd className="text-lg font-medium text-secondary-900">
                        {projects.filter(p => p.status === ProjectStatus.COMPLETED).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CurrencyDollarIcon className="h-6 w-6 text-warning-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-secondary-500 truncate">Est. Monthly Cost</dt>
                      <dd className="text-lg font-medium text-secondary-900">
                        ${(Math.random() * 10000 + 1000).toFixed(0)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="mt-8">
            <div className="border-b border-secondary-200">
              <nav className="-mb-px flex space-x-8">
                {(['all', ...Object.values(ProjectStatus)] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      filter === status
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                    }`}
                  >
                    {status === 'all' ? 'All Projects' : status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    <span className="ml-2 inline-block py-0.5 px-2 text-xs rounded-full bg-secondary-100 text-secondary-600">
                      {status === 'all' ? projects.length : projects.filter(p => p.status === status).length}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Projects List */}
          <div className="mt-8">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <FolderIcon className="mx-auto h-12 w-12 text-secondary-400" />
                <h3 className="mt-2 text-sm font-medium text-secondary-900">No projects</h3>
                <p className="mt-1 text-sm text-secondary-500">
                  {filter === 'all' 
                    ? "Get started by creating your first project." 
                    : `No projects with status "${filter}".`
                  }
                </p>
                <div className="mt-6">
                  <Link href="/projects/new">
                    <Button variant="primary">
                      <PlusIcon className="h-5 w-5 mr-2" />
                      New Project
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {filteredProjects.map((project, index) => {
                  const stats = getProjectStats(project);
                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-lg shadow-sm border border-secondary-200 hover:shadow-md transition-shadow"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <span className="text-2xl mr-2">{statusIcons[project.status]}</span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                                {project.status.replace('_', ' ')}
                              </span>
                            </div>
                            <h3 className="mt-3 text-lg font-semibold text-secondary-900 line-clamp-1">
                              {project.name}
                            </h3>
                            <p className="mt-2 text-sm text-secondary-600 line-clamp-2">
                              {project.description}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between text-sm text-secondary-500">
                          <span>{stats.architectures} architectures</span>
                          <span>${stats.estimatedCost.toFixed(0)}/mo</span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-1">
                          {project.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-50 text-primary-700"
                            >
                              {tag}
                            </span>
                          ))}
                          {project.tags.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary-100 text-secondary-600">
                              +{project.tags.length - 3} more
                            </span>
                          )}
                        </div>

                        <div className="mt-6 flex items-center justify-between">
                          <span className="text-xs text-secondary-500">
                            Updated {stats.lastUpdated}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Link href={`/projects/${project.id}`}>
                              <Button variant="ghost" size="sm">
                                <EyeIcon className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/projects/${project.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button variant="ghost" size="sm" className="text-error-600 hover:text-error-700">
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
