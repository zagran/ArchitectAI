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
  SECRETS_MANAGER = 'secrets_manager',
}

export enum DeploymentModel {
  SINGLE_INSTANCE = 'single_instance',
  AUTO_SCALING = 'auto_scaling',
  MICROSERVICES = 'microservices',
  SERVERLESS = 'serverless',
  CONTAINERIZED = 'containerized',
  HYBRID = 'hybrid',
}

export interface RequirementsInput {
  description: string;
  uploadedDocs?: string[];
  diagrams?: string[];
  constraints?: Record<string, any>;
  preferences?: Record<string, any>;
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

export interface ArchitectureFeedback {
  rating: number | null;
  feedbackText?: string | null;
}

export interface ArchitectureListItem {
  id: string;
  name: string;
  createdAt: string;
  estimatedMonthlyCost?: number;
  componentsCount: number;
  deploymentModel: string;
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
