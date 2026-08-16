// API client and utilities for ArchitectAI Frontend

import axios, { AxiosInstance } from 'axios';
import {
  User,
  UserLogin,
  UserCreate,
  AuthResponse,
  ArchitectureResponse,
  ArchitectureListItem,
  ArchitectureFeedback,
  RequirementsInput,
} from '@/types';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Deep transform snake_case object keys to camelCase
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function transformToCamel(obj: any): any {
  if (Array.isArray(obj)) return obj.map(transformToCamel);
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [snakeToCamel(key), transformToCamel(value)])
    );
  }
  return obj;
}

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
class TokenManager {
  private static readonly TOKEN_KEY = 'architectai_token';

  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  static setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  static removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }
}

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = TokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const url: string = error.config?.url ?? '';
      const isAuthEndpoint = url.includes('/users/login') || url.includes('/users/register');
      if (!isAuthEndpoint) {
        TokenManager.removeToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);

// API wrapper class
export class APIClient {
  // Authentication
  static async login(credentials: UserLogin): Promise<AuthResponse> {
    const response = await apiClient.post('/api/v1/users/login', credentials);
    const data = response.data;
    const token = data.accessToken || data.access_token;

    if (data.success && token) {
      TokenManager.setToken(token);
    }

    return { ...data, accessToken: token };
  }

  static async register(userData: UserCreate): Promise<AuthResponse> {
    const response = await apiClient.post('/api/v1/users/register', {
      email: userData.email,
      password: userData.password,
      full_name: userData.fullName ?? null,
    });
    const data = response.data;
    const token = data.accessToken || data.access_token;

    if (data.success && token) {
      TokenManager.setToken(token);
    }

    return { ...data, accessToken: token };
  }

  static async logout(): Promise<void> {
    try {
      await apiClient.post('/api/v1/users/logout');
    } finally {
      TokenManager.removeToken();
    }
  }

  static async getUserProfile(): Promise<User> {
    const response = await apiClient.get('/api/v1/users/profile');
    return response.data.profile || response.data.data;
  }

  // Architecture
  static async generateArchitecture(requirements: RequirementsInput): Promise<ArchitectureResponse> {
    const requestBody = {
      description: requirements.description,
      uploaded_docs: requirements.uploadedDocs || [],
      diagrams: requirements.diagrams || [],
      constraints: requirements.constraints || {},
      preferences: requirements.preferences || {},
    };
    const response = await apiClient.post('/api/v1/architectures/generate', requestBody, {
      timeout: 180000, // 3 minutes — Nova Lite calls can be slow
    });
    return transformToCamel(response.data) as ArchitectureResponse;
  }

  static async getArchitecture(id: string): Promise<ArchitectureResponse> {
    const response = await apiClient.get(`/api/v1/architectures/${id}`);
    return transformToCamel(response.data) as ArchitectureResponse;
  }

  static async getArchitectures(params?: {
    limit?: number;
    offset?: number;
  }): Promise<{ architectures: ArchitectureListItem[]; total: number }> {
    const response = await apiClient.get('/api/v1/architectures/', { params });
    return transformToCamel(response.data) as { architectures: ArchitectureListItem[]; total: number };
  }

  static async deleteArchitecture(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/architectures/${id}`);
  }

  // Roadmap
  static async getRoadmap(architectureId: string): Promise<any | null> {
    const response = await apiClient.get(`/api/v1/architectures/${architectureId}/roadmap`);
    return response.data.roadmap ?? null;
  }

  static async generateRoadmap(architectureId: string, force = false): Promise<any> {
    const response = await apiClient.post(
      `/api/v1/architectures/${architectureId}/roadmap`,
      {},
      { timeout: 120000, params: force ? { force: true } : undefined }
    );
    return response.data.roadmap;
  }

  // Feedback
  static async submitFeedback(architectureId: string, rating: number, feedbackText?: string): Promise<void> {
    await apiClient.post(`/api/v1/architectures/${architectureId}/feedback`, {
      rating,
      feedback_text: feedbackText ?? null,
    });
  }

  static async getFeedback(architectureId: string): Promise<ArchitectureFeedback> {
    const response = await apiClient.get(`/api/v1/architectures/${architectureId}/feedback`);
    return { rating: response.data.rating, feedbackText: response.data.feedback_text };
  }
}

// Error handling utility
export class APIError extends Error {
  public status: number;
  public code: string;

  constructor(message: string, status: number = 500, code: string = 'UNKNOWN_ERROR') {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
  }

  static fromResponse(error: any): APIError {
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || data?.detail || 'An error occurred';
      const code = data?.code || 'API_ERROR';
      return new APIError(message, status, code);
    }

    if (error.request) {
      return new APIError('Network error - please check your connection', 0, 'NETWORK_ERROR');
    }

    return new APIError(error.message || 'Unknown error', 500, 'UNKNOWN_ERROR');
  }
}

export { TokenManager };
export { apiClient };
export default APIClient;
