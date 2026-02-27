import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RocketLaunchIcon,
  CheckCircleIcon,
  ClockIcon,
  ChevronDownIcon,
  CodeBracketIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import APIClient from '@/lib/api';

interface Task {
  name?: string;
  description?: string;
  estimated_duration_hours?: number;
  prerequisites?: string[];
  deliverables?: string[];
  risks?: string[];
  validation_criteria?: string[];
}

interface Phase {
  phase_number?: number;
  name: string;
  description?: string;
  estimated_duration_days?: number;
  tasks?: Array<string | Task>;
  prerequisites?: string[];
  deliverables?: string[];
  success_criteria?: string[];
}

interface Roadmap {
  phases?: Phase[];
  total_duration_days?: number;
  rollback_procedures?: string[];
  infrastructure_code?: Array<{ code_type?: string; file_name?: string; content?: string }>;
  monitoring_setup?: Record<string, any>;
  deployment_scripts?: Array<Record<string, string>>;
}

function taskName(t: string | Task): string {
  return typeof t === 'string' ? t : (t.name ?? 'Task');
}

function taskDetails(t: string | Task): Omit<Task, 'name'> | null {
  if (typeof t === 'string') return null;
  const { name, ...rest } = t;
  const hasDetail =
    (rest.description ?? rest.risks?.length ?? rest.deliverables?.length ?? rest.validation_criteria?.length);
  return hasDetail ? rest : null;
}

function PhaseCard({ phase, index }: { phase: Phase; index: number }) {
  const [open, setOpen] = useState(index === 0);
  const [expandedTask, setExpandedTask] = useState<number | null>(null);
  const tasks = phase.tasks ?? [];

  return (
    <div className="bg-white rounded-lg border border-secondary-200 shadow-sm overflow-hidden">
      {/* Phase header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-secondary-50 transition-colors"
      >
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm">
          {phase.phase_number ?? index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-secondary-900">{phase.name}</p>
          {phase.description && (
            <p className="text-sm text-secondary-500 truncate">{phase.description}</p>
          )}
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          {phase.estimated_duration_days && (
            <span className="hidden sm:flex items-center gap-1 text-sm text-secondary-500">
              <ClockIcon className="h-4 w-4" />
              {phase.estimated_duration_days}d
            </span>
          )}
          {tasks.length > 0 && (
            <span className="text-xs text-secondary-400">{tasks.length} tasks</span>
          )}
          <ChevronDownIcon
            className={`h-4 w-4 text-secondary-400 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 space-y-5 border-t border-secondary-100">
              {/* Tasks */}
              {tasks.length > 0 && (
                <div className="pt-4">
                  <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-3">Tasks</p>
                  <div className="space-y-2">
                    {tasks.map((task, ti) => {
                      const detail = taskDetails(task);
                      const isExpanded = expandedTask === ti;
                      return (
                        <div key={ti} className="rounded-md border border-secondary-100 overflow-hidden">
                          <button
                            onClick={() => detail && setExpandedTask(isExpanded ? null : ti)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors ${detail ? 'hover:bg-secondary-50 cursor-pointer' : 'cursor-default'}`}
                          >
                            <CheckCircleIcon className="h-4 w-4 text-primary-400 flex-shrink-0" />
                            <span className="flex-1 text-secondary-800">{taskName(task)}</span>
                            {typeof task !== 'string' && task.estimated_duration_hours && (
                              <span className="text-xs text-secondary-400 flex-shrink-0">
                                {task.estimated_duration_hours}h
                              </span>
                            )}
                            {detail && (
                              <ChevronDownIcon
                                className={`h-3.5 w-3.5 text-secondary-300 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                              />
                            )}
                          </button>
                          <AnimatePresence initial={false}>
                            {isExpanded && detail && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                exit={{ height: 0 }}
                                transition={{ duration: 0.15 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-3 pt-1 bg-secondary-50 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                  {detail.description && (
                                    <p className="text-secondary-600 col-span-full">{detail.description}</p>
                                  )}
                                  {detail.deliverables && detail.deliverables.length > 0 && (
                                    <div>
                                      <p className="font-semibold text-secondary-500 uppercase mb-1">Deliverables</p>
                                      <ul className="space-y-1">
                                        {detail.deliverables.map((d, i) => (
                                          <li key={i} className="flex gap-1.5 text-secondary-700">
                                            <span className="text-success-500 mt-0.5">✓</span> {d}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {detail.risks && detail.risks.length > 0 && (
                                    <div>
                                      <p className="font-semibold text-secondary-500 uppercase mb-1">Risks</p>
                                      <ul className="space-y-1">
                                        {detail.risks.map((r, i) => (
                                          <li key={i} className="flex gap-1.5 text-warning-700">
                                            <ExclamationTriangleIcon className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" /> {r}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {detail.validation_criteria && detail.validation_criteria.length > 0 && (
                                    <div className="col-span-full">
                                      <p className="font-semibold text-secondary-500 uppercase mb-1">Validation</p>
                                      <ul className="space-y-1">
                                        {detail.validation_criteria.map((v, i) => (
                                          <li key={i} className="flex gap-1.5 text-secondary-700">
                                            <span className="text-primary-400 mt-0.5">→</span> {v}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Success criteria */}
              {phase.success_criteria && phase.success_criteria.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-2">Success Criteria</p>
                  <ul className="space-y-1.5">
                    {phase.success_criteria.map((c, i) => (
                      <li key={i} className="flex gap-2 text-sm text-secondary-700">
                        <ShieldCheckIcon className="h-4 w-4 text-success-500 flex-shrink-0 mt-0.5" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Deliverables */}
              {phase.deliverables && phase.deliverables.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-secondary-500 uppercase tracking-wider mb-2">Phase Deliverables</p>
                  <div className="flex flex-wrap gap-2">
                    {phase.deliverables.map((d, i) => (
                      <span key={i} className="text-xs bg-primary-50 text-primary-700 border border-primary-200 rounded-full px-3 py-1">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface Props {
  architectureId: string;
}

export default function ImplementationRoadmapViewer({ architectureId }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async (force = false) => {
    setStatus('loading');
    setError(null);
    try {
      const data = await APIClient.generateRoadmap(architectureId, force);
      setRoadmap(data);
      setStatus('done');
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Roadmap generation failed.');
      setStatus('error');
    }
  };

  const phases = roadmap?.phases ?? [];
  const totalDays = roadmap?.total_duration_days ?? phases.reduce((s, p) => s + (p.estimated_duration_days ?? 0), 0);
  const totalTasks = phases.reduce((s, p) => s + (p.tasks?.length ?? 0), 0);

  // Idle — show prompt
  if (status === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-5">
          <RocketLaunchIcon className="h-8 w-8 text-primary-600" />
        </div>
        <h3 className="text-lg font-semibold text-secondary-900 mb-2">Generate Implementation Roadmap</h3>
        <p className="text-secondary-500 text-sm max-w-md mb-6">
          Nova will create a detailed phase-by-phase plan — tasks, deliverables, IaC snippets, and rollback procedures — tailored to this architecture.
        </p>
        <button
          onClick={() => generate()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          <RocketLaunchIcon className="h-4 w-4" />
          Generate Roadmap
        </button>
        <p className="text-xs text-secondary-400 mt-3">Takes ~30–60 seconds</p>
      </div>
    );
  }

  // Loading
  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="spinner w-10 h-10 mb-5" />
        <p className="text-secondary-600 font-medium">Nova is generating your roadmap…</p>
        <p className="text-secondary-400 text-sm mt-1">This usually takes 30–60 seconds</p>
      </div>
    );
  }

  // Error
  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ExclamationTriangleIcon className="h-10 w-10 text-error-500 mb-4" />
        <p className="text-secondary-700 font-medium mb-1">Generation failed</p>
        <p className="text-secondary-400 text-sm mb-5">{error}</p>
        <button
          onClick={() => generate()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-secondary-300 rounded-lg text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Try again
        </button>
      </div>
    );
  }

  // Done — show roadmap
  return (
    <div className="space-y-8">
      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-secondary-200 shadow-sm p-5">
          <p className="text-xs font-medium text-secondary-500 uppercase tracking-wider">Phases</p>
          <p className="text-3xl font-bold text-secondary-900 mt-1">{phases.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-secondary-200 shadow-sm p-5">
          <p className="text-xs font-medium text-secondary-500 uppercase tracking-wider">Total Duration</p>
          <p className="text-3xl font-bold text-secondary-900 mt-1">{totalDays}<span className="text-base font-normal text-secondary-400 ml-1">days</span></p>
        </div>
        <div className="bg-white rounded-lg border border-secondary-200 shadow-sm p-5 col-span-2 sm:col-span-1">
          <p className="text-xs font-medium text-secondary-500 uppercase tracking-wider">Tasks</p>
          <p className="text-3xl font-bold text-secondary-900 mt-1">{totalTasks}</p>
        </div>
      </div>

      {/* Timeline / phases */}
      {phases.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-secondary-700 uppercase tracking-wider mb-4">Implementation Phases</h3>
          <div className="relative space-y-3">
            {/* Vertical connector line */}
            <div className="absolute left-[2.6rem] top-10 bottom-4 w-px bg-secondary-200 -z-0 hidden sm:block" />
            {phases.map((phase, i) => (
              <PhaseCard key={i} phase={phase} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Infrastructure code */}
      {roadmap?.infrastructure_code && roadmap.infrastructure_code.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-secondary-700 uppercase tracking-wider mb-4 flex items-center gap-2">
            <CodeBracketIcon className="h-4 w-4" /> Infrastructure as Code
          </h3>
          <div className="space-y-4">
            {roadmap.infrastructure_code.map((code, i) => (
              <div key={i} className="bg-white rounded-lg border border-secondary-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-secondary-800">
                  <span className="text-xs font-mono text-secondary-300">{code.file_name ?? code.code_type ?? 'code'}</span>
                  <span className="text-xs text-secondary-500 uppercase">{code.code_type}</span>
                </div>
                {code.content && (
                  <pre className="p-4 text-xs text-secondary-100 bg-secondary-900 overflow-x-auto max-h-72">
                    <code>{code.content}</code>
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rollback procedures */}
      {roadmap?.rollback_procedures && roadmap.rollback_procedures.length > 0 && (
        <div className="bg-white rounded-lg border border-secondary-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-secondary-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <ArrowPathIcon className="h-4 w-4" /> Rollback Procedures
          </h3>
          <ol className="space-y-2">
            {roadmap.rollback_procedures.map((proc, i) => (
              <li key={i} className="flex gap-3 text-sm text-secondary-700">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary-100 text-secondary-500 text-xs flex items-center justify-center font-medium">
                  {i + 1}
                </span>
                {proc}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Regenerate */}
      <div className="flex justify-end">
        <button
          onClick={() => generate(true)}
          className="inline-flex items-center gap-1.5 text-sm text-secondary-400 hover:text-secondary-600 transition-colors"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Regenerate
        </button>
      </div>
    </div>
  );
}
