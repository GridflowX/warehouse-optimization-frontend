// Main Graph Visualization Page (Homepage)

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGraphData } from '@/hooks/useGraphData';
import { GraphCanvas } from '@/components/GraphCanvas';
import { OptimizationControls } from '@/components/OptimizationControls';
import { NeomorphicIcon } from '@/components/NeomorphicIcon';
import { Loader2, Network, AlertCircle } from 'lucide-react';
import { OptimizationRequest } from '@/types/api';

const GraphVisualization: React.FC = () => {
  const navigate = useNavigate();
  const { graphData, loading, error, optimizeParameters } = useGraphData();
  const [optimizing, setOptimizing] = useState(false);

  const handleWarehouseClick = useCallback((warehouseId: string) => {
    navigate(`/warehouse/${warehouseId}`);
  }, [navigate]);

  const handleOptimization = useCallback(async (params: OptimizationRequest) => {
    setOptimizing(true);
    try {
      await optimizeParameters(params);
    } finally {
      setOptimizing(false);
    }
  }, [optimizeParameters]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background graph-grid-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <NeomorphicIcon size="lg">
            <Loader2 className="w-8 h-8 animate-spin" />
          </NeomorphicIcon>
          <p className="text-lg font-medium">Loading warehouse network...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background graph-grid-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <NeomorphicIcon size="lg">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </NeomorphicIcon>
          <div>
            <h2 className="text-xl font-bold mb-2">Connection Error</h2>
            <p className="text-muted-foreground">{error}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Please ensure the FastAPI backend is running and accessible.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!graphData) {
    return (
      <div className="min-h-screen bg-background graph-grid-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <NeomorphicIcon size="lg">
            <Network className="w-8 h-8" />
          </NeomorphicIcon>
          <p className="text-lg font-medium">No graph data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background grid pattern */}
      <div className="fixed inset-0 graph-grid-background pointer-events-none" />
      
      {/* Main content */}
      <div className="relative z-10 section-padding">
        <div className="container mx-auto px-4 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <NeomorphicIcon size="lg" className="mx-auto">
              <Network className="w-8 h-8" />
            </NeomorphicIcon>
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Warehouse Optimization Research Platform
              </h1>
              <p className="text-lg text-muted-foreground">
                Interactive visualization and analysis of warehouse network optimization
              </p>
            </div>
          </div>

          {/* Graph Visualization */}
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Network Topology</h2>
              <p className="text-muted-foreground">
                Click on any warehouse to view detailed internal operations
              </p>
            </div>
            
            <GraphCanvas
              warehouses={graphData.coordinates}
              edges={graphData.edges}
              onWarehouseClick={handleWarehouseClick}
            />
          </div>

          {/* Optimization Controls */}
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Optimization Parameters</h2>
              <p className="text-muted-foreground">
                Adjust Alpha and Beta values to optimize the warehouse network
              </p>
            </div>
            
            <OptimizationControls
              onOptimize={handleOptimization}
              loading={optimizing}
            />
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="text-center p-4 rounded-lg border bg-card">
              <div className="text-2xl font-bold">{graphData.coordinates.length}</div>
              <div className="text-sm text-muted-foreground">Warehouses</div>
            </div>
            <div className="text-center p-4 rounded-lg border bg-card">
              <div className="text-2xl font-bold">{graphData.edges.length}</div>
              <div className="text-sm text-muted-foreground">Direct Routes</div>
            </div>
            <div className="text-center p-4 rounded-lg border bg-card">
              <div className="text-2xl font-bold">{graphData.initialDistance.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Initial Distance</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphVisualization;