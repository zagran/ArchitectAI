import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  PhotoIcon,
  XMarkIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { RequirementsInput } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';

const requirementsSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  constraints: z.object({
    budget: z.string().optional(),
    timeline: z.string().optional(),
    region: z.string().optional(),
    compliance: z.array(z.string()).optional(),
  }).optional(),
  preferences: z.object({
    cloudProvider: z.string().optional(),
    deploymentModel: z.string().optional(),
    scalingApproach: z.string().optional(),
  }).optional(),
});

type RequirementsFormData = z.infer<typeof requirementsSchema>;

interface RequirementsInputComponentProps {
  onSubmit: (data: RequirementsInput) => void;
  loading?: boolean;
  initialData?: Partial<RequirementsInput>;
}

export default function RequirementsInputComponent({
  onSubmit,
  loading = false,
  initialData,
}: RequirementsInputComponentProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [processingFiles, setProcessingFiles] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<RequirementsFormData>({
    resolver: zodResolver(requirementsSchema),
    defaultValues: {
      description: initialData?.description || '',
      constraints: {
        budget: '',
        timeline: '',
        region: 'us-east-1',
        compliance: [],
      },
      preferences: {
        cloudProvider: 'aws',
        deploymentModel: 'auto_scaling',
        scalingApproach: 'horizontal',
      },
    },
    mode: 'onChange',
  });

  const description = watch('description');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setProcessingFiles(true);
    try {
      const newFiles = acceptedFiles.filter(file => {
        const isValidType = file.type.startsWith('image/') || 
                           file.type === 'application/pdf' ||
                           file.type.startsWith('text/');
        const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
        return isValidType && isValidSize;
      });

      setUploadedFiles(prev => [...prev, ...newFiles]);
    } catch (error) {
      console.error('Error processing files:', error);
    } finally {
      setProcessingFiles(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.svg'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt', '.md'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: true,
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const convertFilesToBase64 = async (files: File[]): Promise<string[]> => {
    return Promise.all(
      files.map(file => 
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result as string;
            resolve(base64.split(',')[1]); // Remove data:type;base64, prefix
          };
          reader.readAsDataURL(file);
        })
      )
    );
  };

  const onFormSubmit = async (data: RequirementsFormData) => {
    try {
      const uploadedDocs: string[] = [];
      const diagrams: string[] = [];

      if (uploadedFiles.length > 0) {
        const base64Files = await convertFilesToBase64(uploadedFiles);
        
        uploadedFiles.forEach((file, index) => {
          if (file.type.startsWith('image/')) {
            diagrams.push(base64Files[index]);
          } else {
            uploadedDocs.push(base64Files[index]);
          }
        });
      }

      const requirementsData: RequirementsInput = {
        description: data.description,
        uploadedDocs: uploadedDocs.length > 0 ? uploadedDocs : undefined,
        diagrams: diagrams.length > 0 ? diagrams : undefined,
        constraints: data.constraints,
        preferences: data.preferences,
      };

      onSubmit(requirementsData);
    } catch (error) {
      console.error('Error submitting requirements:', error);
    }
  };

  const examplePrompts = [
    "Build a scalable e-commerce platform for 100,000 concurrent users with real-time inventory management, payment processing, and order tracking.",
    "Design a data analytics pipeline that processes 1TB of IoT sensor data daily from manufacturing equipment with real-time anomaly detection.",
    "Create a serverless microservices architecture for a social media application with user authentication, content management, and real-time messaging.",
  ];

  const complianceOptions = [
    { value: 'hipaa', label: 'HIPAA' },
    { value: 'gdpr', label: 'GDPR' },
    { value: 'sox', label: 'SOX' },
    { value: 'pci_dss', label: 'PCI DSS' },
    { value: 'iso_27001', label: 'ISO 27001' },
  ];

  const regionOptions = [
    { value: 'us-east-1', label: 'US East (N. Virginia)' },
    { value: 'us-west-2', label: 'US West (Oregon)' },
    { value: 'eu-west-1', label: 'Europe (Ireland)' },
    { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
    { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' },
  ];

  const deploymentModelOptions = [
    { value: 'single_instance', label: 'Single Instance' },
    { value: 'auto_scaling', label: 'Auto Scaling' },
    { value: 'microservices', label: 'Microservices' },
    { value: 'serverless', label: 'Serverless' },
    { value: 'containerized', label: 'Containerized' },
    { value: 'hybrid', label: 'Hybrid' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <SparklesIcon className="h-8 w-8 text-primary-600 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-secondary-900">
                Describe Your Architecture Requirements
              </h2>
              <p className="text-secondary-600 mt-1">
                Tell us what you want to build, and our AI will create a complete AWS architecture for you.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
            {/* Main Requirements Section */}
            <div>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    label="Project Description"
                    placeholder="Describe what you want to build, including functional requirements, expected usage, and any specific needs..."
                    rows={6}
                    error={errors.description?.message}
                    className="text-base"
                  />
                )}
              />
              
              <div className="mt-3">
                <p className="text-sm text-secondary-600 mb-2">Need inspiration? Try one of these examples:</p>
                <div className="grid gap-2">
                  {examplePrompts.map((prompt, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setValue('description', prompt)}
                      className="text-left p-3 text-sm border border-secondary-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* File Upload Section */}
            <div>
              <label className="form-label">Supporting Documents & Diagrams</label>
              <div
                {...getRootProps()}
                className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-primary-400 bg-primary-50'
                    : 'border-secondary-300 hover:border-primary-400 hover:bg-secondary-50'
                }`}
              >
                <input {...getInputProps()} />
                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-secondary-400" />
                <div className="mt-4">
                  <p className="text-base font-medium text-secondary-900">
                    {isDragActive ? 'Drop files here' : 'Upload documents or diagrams'}
                  </p>
                  <p className="text-sm text-secondary-600 mt-1">
                    PDF, Word docs, images up to 10MB each
                  </p>
                </div>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        {file.type.startsWith('image/') ? (
                          <PhotoIcon className="h-5 w-5 text-secondary-500 mr-2" />
                        ) : (
                          <DocumentTextIcon className="h-5 w-5 text-secondary-500 mr-2" />
                        )}
                        <span className="text-sm font-medium text-secondary-900">
                          {file.name}
                        </span>
                        <span className="text-xs text-secondary-500 ml-2">
                          ({(file.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-secondary-400 hover:text-secondary-600"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Constraints Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Constraints</h3>
                <div className="space-y-4">
                  <Controller
                    name="constraints.budget"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Monthly Budget"
                        placeholder="e.g., $5,000/month"
                      />
                    )}
                  />
                  
                  <Controller
                    name="constraints.timeline"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        label="Timeline"
                        placeholder="e.g., 3 months to launch"
                      />
                    )}
                  />
                  
                  <Controller
                    name="constraints.region"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        label="Primary AWS Region"
                        options={regionOptions}
                      />
                    )}
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">Preferences</h3>
                <div className="space-y-4">
                  <Controller
                    name="preferences.deploymentModel"
                    control={control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        label="Preferred Deployment Model"
                        options={deploymentModelOptions}
                      />
                    )}
                  />

                  <div>
                    <label className="form-label">Compliance Requirements</label>
                    <div className="mt-2 space-y-2">
                      {complianceOptions.map((option) => (
                        <label key={option.value} className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="ml-2 text-sm text-secondary-900">
                            {option.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Character Count */}
            <div className="flex justify-between items-center text-sm text-secondary-600">
              <span>
                {description.length} / 5,000 characters
              </span>
              <span className={description.length < 10 ? 'text-warning-600' : 'text-success-600'}>
                {description.length < 10 ? 'Minimum 10 characters required' : 'Looking good!'}
              </span>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading || processingFiles}
                disabled={!isValid || loading || processingFiles}
                className="px-8"
              >
                {loading ? 'Generating Architecture...' : 'Generate Architecture'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
