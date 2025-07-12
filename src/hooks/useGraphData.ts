// Custom hook for managing graph data and API interactions

import { useState, useEffect } from 'react';
import { GraphData, OptimizationRequest } from '@/types/api';
import { ApiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { saveGraphData, loadGraphData } from '@/hooks/useLocalStorage';

export const useGraphData = () => {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchGraphData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to load from localStorage first
      const cachedData = loadGraphData();
      if (cachedData) {
        setGraphData(cachedData);
        setLoading(false);
        return;
      }
      
      const data = await ApiService.getGraphData();
      setGraphData(data);
      saveGraphData(data); // Save to localStorage
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch graph data';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const optimizeParameters = async (params: OptimizationRequest) => {
    try {
      const response = await ApiService.optimizeParameters(params);
      if (response.success) {
        toast({
          title: "Optimization Successful",
          description: response.message || "Parameters optimized successfully",
        });
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
    loading,
    error,
    refetch: fetchGraphData,
    optimizeParameters,
  };
};