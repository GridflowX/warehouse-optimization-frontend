// API Service Layer for FastAPI Backend Communication

import { GraphData, OptimizationRequest, OptimizationResponse } from '@/types/api';
import { useMockData } from './mockData';

const API_BASE_URL = 'https://guideway-optimisation.onrender.com';
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
    try {
      await this.request<any>('/inputs', {
        method: 'POST',
        body: JSON.stringify({ alpha: params.alpha, beta: params.beta }),
      });
      
      return {
        success: true,
        message: `Optimization completed with Alpha: ${params.alpha.toFixed(3)}, Beta: ${params.beta.toFixed(3)}`
      };
    } catch (error) {
      console.error('Error sending optimization parameters:', error);
      throw error;
    }
  }

  static async getOptimizationOutput(): Promise<any> {
    try {
      return this.request<any>('/output');
    } catch (error) {
      console.error('Error fetching optimization output:', error);
      throw error;
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

  // Send packing configuration to server
  static async sendPackConfiguration(config: {
    storage_width: number;
    storage_length: number;
    num_rects: number;
    min_side: number;
    max_side: number;
    clearance: number;
  }): Promise<any> {
    if (USE_MOCK_DATA) {
      // Mock pack response with 50 boxes in new format
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate 50 boxes with random positions and sizes
      const boxes = [];
      
      for (let i = 0; i < 50; i++) {
        const width = Math.floor(Math.random() * (config.max_side - config.min_side)) + config.min_side;
        const height = Math.floor(Math.random() * (config.max_side - config.min_side)) + config.min_side;
        const x = Math.floor(Math.random() * (config.storage_width - width - config.clearance));
        const y = Math.floor(Math.random() * (config.storage_length - height - config.clearance));
        
        const box = {
          id: i,
          x: x,
          y: y,
          width: width,
          height: height,
          exit_edge: null,
          path_length: null,
          retrieval_path: null
        };
        
        boxes.push(box);
      }
      
      return boxes; // Return direct array instead of object with boxes property
    }
    
    try {
      // Use the external API URL for the pack endpoint
      const response = await fetch('https://infra-optimization.onrender.com/pack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error sending pack configuration:', error);
      throw error;
    }
  }
}

// Export convenience functions
export const fetchPackagingData = ApiService.fetchPackagingData.bind(ApiService);
export const fetchRetrievalData = ApiService.fetchRetrievalData.bind(ApiService);
export const saveConfiguration = ApiService.saveConfiguration.bind(ApiService);
export const sendPackConfiguration = ApiService.sendPackConfiguration.bind(ApiService);