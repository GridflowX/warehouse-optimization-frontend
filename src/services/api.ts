// API Service Layer for FastAPI Backend Communication

import { GraphData, OptimizationRequest, OptimizationResponse } from '@/types/api';
import { useMockData } from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK !== 'false'; // Default to true for development

export class ApiService {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async getGraphData(): Promise<GraphData> {
    // Use mock data for development if backend is not available
    if (USE_MOCK_DATA) {
      return useMockData();
    }
    
    try {
      return this.request<GraphData>('/api/graph-data');
    } catch (error) {
      console.warn('Backend not available, using mock data:', error);
      return useMockData();
    }
  }

  static async optimizeParameters(params: OptimizationRequest): Promise<OptimizationResponse> {
    // Use mock response for development if backend is not available
    if (USE_MOCK_DATA) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            message: `Optimization completed with Alpha: ${params.alpha.toFixed(3)}, Beta: ${params.beta.toFixed(3)}`
          });
        }, 1500);
      });
    }
    
    try {
      return this.request<OptimizationResponse>('/api/optimize', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    } catch (error) {
      console.warn('Backend not available, using mock response:', error);
      return {
        success: true,
        message: `Optimization completed (mock) with Alpha: ${params.alpha.toFixed(3)}, Beta: ${params.beta.toFixed(3)}`
      };
    }
  }

  // Fetch packaging data from server
  static async fetchPackagingData(): Promise<any> {
    if (USE_MOCK_DATA) {
      // Return mock packaging data
      await new Promise(resolve => setTimeout(resolve, 500));
      return [];
    }
    
    try {
      return this.request<any>('/api/packaging.json');
    } catch (error) {
      console.error('Error fetching packaging data:', error);
      throw error;
    }
  }

  // Fetch retrieval data from server
  static async fetchRetrievalData(): Promise<any> {
    if (USE_MOCK_DATA) {
      // Return mock retrieval data
      await new Promise(resolve => setTimeout(resolve, 500));
      return [];
    }
    
    try {
      return this.request<any>('/api/retrieval.json');
    } catch (error) {
      console.error('Error fetching retrieval data:', error);
      throw error;
    }
  }

  // Send configuration to server
  static async saveConfiguration(config: any): Promise<any> {
    if (USE_MOCK_DATA) {
      // Mock save response
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, message: 'Configuration saved successfully' };
    }
    
    try {
      return this.request<any>('/api/configuration', {
        method: 'POST',
        body: JSON.stringify(config),
      });
    } catch (error) {
      console.error('Error saving configuration:', error);
      throw error;
    }
  }
}

// Export convenience functions
export const fetchPackagingData = ApiService.fetchPackagingData.bind(ApiService);
export const fetchRetrievalData = ApiService.fetchRetrievalData.bind(ApiService);
export const saveConfiguration = ApiService.saveConfiguration.bind(ApiService);