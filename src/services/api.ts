// API Service Layer for FastAPI Backend Communication

import { GraphData, OptimizationRequest, OptimizationResponse } from '@/types/api';
import { useMockData } from './mockData';

const API_BASE_URL = import.meta.env.DEV ? '/api' : 'http://34.93.81.16';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK === 'true'; // Default to false for production backend

export class ApiService {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
        mode: 'cors',
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (error.message?.includes('CORS')) {
        throw new Error('CORS error - API server needs to allow cross-origin requests');
      }
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        throw new Error('Network error - Unable to connect to API server');
      }
      if (error.message?.includes('ERR_NETWORK')) {
        throw new Error('Network error - Unable to reach the API server');
      }
      // Log the actual error for debugging
      console.error('API request failed:', error);
      throw error;
    }
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
    // If mock data is enabled, return mock response in Beckn format
    if (USE_MOCK_DATA) {
      console.log('Using mock data for optimization');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
      return {
        status: 'success',
        success: true,
        message: `Mock optimization with Alpha: ${params.alpha.toFixed(3)}, Beta: ${params.beta.toFixed(3)}`,
        output: {
          nodes: [
            {"id":0,"x":0,"y":1,"type":"station"},
            {"id":1,"x":1,"y":2,"type":"station"},
            {"id":2,"x":1,"y":0,"type":"station"},
            {"id":3,"x":2,"y":2,"type":"station"},
            {"id":4,"x":2,"y":0,"type":"station"},
            {"id":5,"x":3,"y":2,"type":"station"},
            {"id":6,"x":3,"y":0,"type":"station"},
            {"id":7,"x":1,"y":1,"type":"steiner"},
            {"id":8,"x":2,"y":1,"type":"steiner"},
            {"id":9,"x":3,"y":1,"type":"steiner"}
          ],
          edges: [
            {"source":0,"target":2,"length":1.41},
            {"source":1,"target":3,"length":1.0},
            {"source":3,"target":5,"length":1.0},
            {"source":2,"target":4,"length":1.0},
            {"source":0,"target":7,"length":1.0},
            {"source":7,"target":1,"length":1.0},
            {"source":8,"target":3,"length":1.0},
            {"source":9,"target":6,"length":1.0},
            {"source":3,"target":1,"length":1.0},
            {"source":4,"target":8,"length":1.0},
            {"source":5,"target":9,"length":1.0}
          ],
          flows: [
            {"commodity":3,"source":0,"target":2,"flow":40.0 * params.alpha},
            {"commodity":0,"source":1,"target":3,"flow":52.0 * params.beta},
            {"commodity":1,"source":3,"target":5,"flow":12.0 * params.alpha},
            {"commodity":4,"source":2,"target":4,"flow":30.0 * params.beta},
            {"commodity":0,"source":0,"target":7,"flow":52.0 * params.alpha},
            {"commodity":0,"source":7,"target":1,"flow":52.0 * params.beta},
            {"commodity":5,"source":8,"target":3,"flow":115.0 * params.alpha},
            {"commodity":2,"source":9,"target":6,"flow":25.0 * params.beta},
            {"commodity":5,"source":3,"target":1,"flow":115.0 * params.alpha},
            {"commodity":5,"source":4,"target":8,"flow":115.0 * params.beta},
            {"commodity":2,"source":5,"target":9,"flow":25.0 * params.alpha}
          ]
        }
      };
    }

    try {
      // Create Beckn protocol request structure
      const becknRequest = {
        context: {
          domain: "warehouse-optimization",
          action: "on_search",
          bap_id: `bap_${Math.random().toString(36).substring(2, 15)}`,
          bpp_id: `bpp_${Math.random().toString(36).substring(2, 15)}`,
          transaction_id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          message_id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          timestamp: new Date().toISOString()
        },
        message: {
          alpha: params.alpha,
          beta: params.beta
        }
      };

      console.log('Sending Beckn request:', JSON.stringify(becknRequest, null, 2));

      const response = await this.request<any>('/search', {
        method: 'POST',
        body: JSON.stringify(becknRequest),
      });
      
      console.log('Raw API response:', response);
      
      // Parse Beckn protocol response format
      let optimizationOutput = null;
      if (response.message && response.message.output) {
        optimizationOutput = response.message.output;
      } else if (response.message && response.message.status === 'success' && response.message.output) {
        optimizationOutput = response.message.output;
      }
      
      if (optimizationOutput) {
        return {
          status: 'success',
          success: true,
          message: `Optimization completed with Alpha: ${params.alpha.toFixed(3)}, Beta: ${params.beta.toFixed(3)}`,
          output: optimizationOutput
        };
      } else {
        console.error('Invalid response format:', response);
        throw new Error('Invalid response format: expected message.output field');
      }
    } catch (error) {
      console.error('Error sending optimization parameters:', error);
      
      // Provide helpful error message based on the error type
      if (error.message?.includes('CORS')) {
        throw new Error('CORS Error: The API server needs to allow cross-origin requests. Check your backend CORS configuration.');
      }
      if (error.message?.includes('Network error')) {
        throw new Error('Network Error: Unable to connect to the optimization server. Please check if the server is running.');
      }
      if (error.message?.includes('Failed to fetch')) {
        throw new Error('Connection Failed: Unable to reach the optimization server. Please check your network connection and server status.');
      }
      
      // Re-throw the original error if we don't have a specific handler
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