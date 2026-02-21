// Type definitions for ArchitectAI Frontend

export interface User {
  id: string;
  email: string;
  fullName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserCreate {
  email: string;
  password: string;
  fullName?: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export enum ProjectStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

export enum ServiceType {
  EC2 = 'ec2',
  ECS = 'ecs',
  FARGATE = 'fargate',
  LAMBDA = 'lambda',
  EKS = 'eks',
  S3 = 's3',
  EBS = 'ebs',
  EFS = 'efs',
  RDS = 'rds',
  DYNAMODB = 'dynamodb',
  ELASTICACHE = 'elasticache',
  DOCUMENTDB = 'documentdb',
  VPC = 'vpc',
  ALB = 'alb',
  NLB = 'nlb',
  CLOUDFRONT = 'cloudfront',
  API_GATEWAY = 'api_gateway',
  CLOUDWATCH = 'cloudwatch',
  X_RAY = 'x_ray',
  IAM = 'iam',
  KMS = 'kms',
  SECRETS_MANAGER = 'secrets_manager'
}

export enum DeploymentModel {
  SINGLE_INSTANCE = 'single_instance',
  AUTO_SCALING = 'auto_scaling',
  MICROSERVICES = 'microservices',
  SERVERLESS = 'serverless',
  CONTAINERIZED = 'containerized',
  HYBRID = 'hybrid'
}

export interface RequirementsInput {
  description: string;
  uploadedDocs?: string[];
  diagrams?: string[];
  constraints?: Record<string, any>;
  preferences?: Record<string, any>;
}

export interface ArchitectureRequirements {
  functionalRequirements: string[];
  nonFunctionalRequirements: string[];
  constraints: Record<string, any>;
  scaleRequirements: Record<string, any>;
  integrationRequirements?: string[];
  complianceRequirements?: string[];
}

export interface ArchitectureComponent {
  id: string;
  name: string;
  serviceType: ServiceType;
  configuration: Record<string, any>;
  dependencies: string[];
  estimatedMonthlyCost?: number;
  performanceCharacteristics?: Record<string, any>;
  securityConfiguration?: Record<string, any>;
}

export interface SystemArchitecture {
  id: string;
  name: string;
  components: ArchitectureComponent[];
  connections: Array<{ from: string; to: string; protocol?: string }>;
  deploymentModel: DeploymentModel;
  diagramUrl?: string;
  estimatedMonthlyCost?: number;
  performanceMetrics?: Record<string, any>;
  securityFeatures: string[];
  scalabilityFeatures: string[];
  metadata: Record<string, any>;
  createdAt: string;
  novaReasoning?: Record<string, any>;
}

export interface ComponentCost {
  componentId: string;
  componentName: string;
  serviceType: string;
  monthlyCost: number;
  costBreakdown: Record<string, number>;
  costDrivers: string[];
  optimizationPotential?: number;
}

export interface CostScenario {
  scenarioName: string;
  description: string;
  totalMonthlyCost: number;
  usageAssumptions: Record<string, any>;
  costDrivers: string[];
}

export interface CostAnalysis {
  architectureId: string;
  totalMonthlyCost: number;
  componentBreakdown: ComponentCost[];
  costScenarios: CostScenario[];
  optimizationSuggestions: string[];
  confidenceLevel: number;
  pricingDataVersion: string;
  calculatedAt: string;
}

export interface OptimizationSuggestion {
  id: string;
  category: string;
  title: string;
  description: string;
  potentialImpact: 'low' | 'medium' | 'high';
  implementationEffort: 'low' | 'medium' | 'high';
  estimatedSavingsPercent?: number;
  estimatedSavingsDollars?: number;
  affectedComponents: string[];
  implementationSteps: string[];
}

export interface ImplementationTask {
  id: string;
  name: string;
  description: string;
  estimatedDurationHours: number;
  prerequisites: string[];
  deliverables: string[];
  risks: string[];
  validationCriteria: string[];
}

export interface ImplementationPhase {
  phaseNumber: number;
  name: string;
  description: string;
  tasks: ImplementationTask[];
  estimatedDurationDays: number;
  prerequisites: string[];
  deliverables: string[];
  successCriteria: string[];
}

export interface InfrastructureCode {
  codeType: string;
  fileName: string;
  content: string;
  dependencies: Record<string, any>;
  variables: Record<string, any>;
  outputs: Record<string, any>;
}

export interface ImplementationRoadmap {
  architectureId: string;
  phases: ImplementationPhase[];
  totalEstimatedDurationDays: number;
  prerequisites: string[];
  infrastructureCode: InfrastructureCode[];
  deploymentScripts: Array<Record<string, string>>;
  monitoringSetup: Record<string, any>;
  rollbackProcedures: string[];
  generatedAt: string;
}

export interface ArchitectureResponse {
  success: boolean;
  architecture?: SystemArchitecture;
  costAnalysis?: CostAnalysis;
  optimizationSuggestions: OptimizationSuggestion[];
  implementationRoadmap?: ImplementationRoadmap;
  processingTimeMs: number;
  novaUsage: Record<string, any>;
  requirementsInput?: RequirementsInput;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  requirements?: ArchitectureRequirements;
  status: ProjectStatus;
  architectures: SystemArchitecture[];
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface ArchitectureTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  templateSpec: Record<string, any>;
  useCases: string[];
  complexityLevel: 'simple' | 'intermediate' | 'advanced';
  estimatedCostRange: string;
  isPublic: boolean;
  createdBy?: string;
  createdAt: string;
  tags: string[];
}

export interface ArchitectureListItem {
  id: string;
  name: string;
  createdAt: string;
  estimatedMonthlyCost?: number;
  componentsCount: number;
  deploymentModel: string;
}

export interface UsagePatterns {
  dailyActiveUsers?: number;
  peakConcurrentUsers?: number;
  dataGrowthRateGbMonth?: number;
  requestRatePerSecond?: number;
  geographicRegions: string[];
  usageSeasonality?: Record<string, number>;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// UI Component Props
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps {
  label?: string;
  error?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  error?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

// Chart data types
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface CostChartData {
  name: string;
  cost: number;
  percentage: number;
  color?: string;
}

// Architecture diagram types
export interface DiagramNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    serviceType: ServiceType;
    cost?: number;
    configuration?: Record<string, any>;
  };
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  label?: string;
  data?: {
    protocol?: string;
    bandwidth?: string;
  };
}

// Form types
export interface RequirementsFormData {
  description: string;
  constraints: {
    budget?: string;
    timeline?: string;
    region?: string;
    compliance?: string[];
  };
  preferences: {
    cloudProvider?: string;
    deploymentModel?: string;
    scalingApproach?: string;
  };
  files?: File[];
}

export interface ProjectFormData {
  name: string;
  description?: string;
  tags?: string[];
}

// Navigation types
export interface NavigationItem {
  name: string;
  href: string;
  icon?: React.ComponentType<any>;
  current?: boolean;
  children?: NavigationItem[];
}

// Search and filter types
export interface FilterOption {
  key: string;
  label: string;
  value: string;
  count?: number;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  status?: string;
  tags?: string[];
  dateRange?: {
    from: string;
    to: string;
  };
}

// Error types
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error?: string;
  data?: any;
}

// WebSocket message types
export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
}

// Export all types for easy importing
export type {
  // Re-export common types
  ComponentType,
  ReactNode,
  MouseEvent,
  ChangeEvent,
  FormEvent
} from 'react';
