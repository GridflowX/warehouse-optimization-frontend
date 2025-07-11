// Custom hook for managing graph data and API interactions

import { useState, useEffect } from 'react';
import { GraphData, OptimizationRequest } from '@/types/api';
import { ApiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export const useGraphData = () => {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchGraphData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getGraphData();
      setGraphData(data);
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