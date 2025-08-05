// Custom hook for managing graph data and API interactions

import { useState, useEffect } from 'react';
import { GraphData, OptimizationRequest } from '@/types/api';
import { ApiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { saveGraphData, loadGraphData, saveOptimizationData, loadOptimizationData } from '@/hooks/useLocalStorage';

// Mockup data for initial load
const INITIAL_MOCKUP_DATA = {
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
    {"source":3,"target":5,"length":1.0},
    {"source":2,"target":4,"length":1.0},
    {"source":0,"target":7,"length":1.0},
    {"source":7,"target":1,"length":1.0},
    {"source":7,"target":8,"length":1.0},
    {"source":8,"target":3,"length":1.0},
    {"source":9,"target":6,"length":1.0},
    {"source":4,"target":2,"length":1.0},
    {"source":2,"target":7,"length":1.0},
    {"source":5,"target":9,"length":1.0}
  ],
  flows: [
    {"commodity":3,"source":0,"target":2,"flow":40.0},
    {"commodity":1,"source":3,"target":5,"flow":12.0},
    {"commodity":4,"source":2,"target":4,"flow":30.0},
    {"commodity":0,"source":0,"target":7,"flow":52.0},
    {"commodity":5,"source":7,"target":1,"flow":115.0},
    {"commodity":0,"source":7,"target":8,"flow":52.0},
    {"commodity":0,"source":8,"target":3,"flow":52.0},
    {"commodity":2,"source":9,"target":6,"flow":25.0},
    {"commodity":5,"source":4,"target":2,"flow":115.0},
    {"commodity":5,"source":2,"target":7,"flow":115.0},
    {"commodity":2,"source":5,"target":9,"flow":25.0}
  ]
};

export const useGraphData = () => {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [optimizationData, setOptimizationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchGraphData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to load optimization data from localStorage first
      const cachedOptimizationData = loadOptimizationData();
      if (cachedOptimizationData) {
        setOptimizationData(cachedOptimizationData);
        setLoading(false);
        return;
      }
      
      // If no cached optimization data, use mockup data for first load
      setOptimizationData(INITIAL_MOCKUP_DATA);
      saveOptimizationData(INITIAL_MOCKUP_DATA);
      setLoading(false);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch graph data';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const optimizeParameters = async (params: OptimizationRequest) => {
    try {
      // Check if we're using mock data
      const useMockData = import.meta.env.VITE_USE_MOCK === 'true';
      
      if (useMockData) {
        toast({
          title: "Using Mock Data",
          description: "Running with simulated data since backend is not connected.",
        });
      } else {
        toast({
          title: "Optimization Started",
          description: "Processing optimization... This may take several minutes. Please wait and do not refresh the page.",
        });
      }

      const response = await ApiService.optimizeParameters(params);
      
      // Handle different response formats from the new Beckn API
      let optimizationOutput = null;
      if (response.output) {
        optimizationOutput = response.output;
      } else if (response.message && typeof response.message === 'object') {
        // Check if the response structure is in the message field
        optimizationOutput = response.message;
      } else if (response.nodes || response.edges) {
        // Direct response format
        optimizationOutput = response;
      }

      if (optimizationOutput && (optimizationOutput.nodes || optimizationOutput.edges)) {
        // Debug log to verify data structure
        console.log('Setting optimization data:', optimizationOutput);
        
        // Save the new optimization data to localStorage
        setOptimizationData(optimizationOutput);
        saveOptimizationData(optimizationOutput);
        
        const useMockData = import.meta.env.VITE_USE_MOCK === 'true';
        toast({
          title: useMockData ? "Mock Optimization Complete" : "Optimization Successful",
          description: useMockData 
            ? `Simulated optimization with Alpha: ${params.alpha.toFixed(3)}, Beta: ${params.beta.toFixed(3)}` 
            : `Network optimized with Alpha: ${params.alpha.toFixed(3)}, Beta: ${params.beta.toFixed(3)}`,
        });
      } else {
        console.error('Invalid optimization output:', optimizationOutput);
        throw new Error('Invalid response format: no optimization data received');
      }
      
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to optimize parameters';
      toast({
        title: "Optimization Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchGraphData();
  }, []);

  return {
    graphData,
    optimizationData,
    loading,
    error,
    refetch: fetchGraphData,
    optimizeParameters,
  };
};