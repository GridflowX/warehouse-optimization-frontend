// Main Graph Visualization Page (Homepage)

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGraphData } from '@/hooks/useGraphData';
import { GraphCanvas } from '@/components/GraphCanvas';
import { OptimizationControls } from '@/components/OptimizationControls';
import { NeomorphicIcon } from '@/components/NeomorphicIcon';
import { CompanyLogo } from '@/components/CompanyLogo';
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
          {/* Professional loading spinner */}
          <div className="flex justify-center">
            <span className="relative flex h-16 w-16">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-40"></span>
              <span className="relative inline-flex rounded-full h-16 w-16 border-4 border-primary border-t-transparent animate-spin"></span>
            </span>
          </div>
          <p className="text-lg font-medium animate-fade-in">Loading warehouse network...</p>
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
            <CompanyLogo />
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Warehouse Optimization Research Platform
              </h1>
              <p className="text-lg text-muted-foreground">
                Interactive visualization and analysis of warehouse network optimization
              </p>
            </div>
          </div>

          {/* Graph and Optimization Controls Side by Side (Responsive) */}
          <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-center w-full">
            {/* Graph Visualization */}
            <div className="w-full lg:flex-1 lg:min-w-0">
              <div className="text-center mb-4">
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
            {/* Optimization Controls and Statistics */}
            <div className="w-full lg:w-[400px] flex-shrink-0 flex flex-col gap-6">
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold mb-2">Optimization Parameters</h2>
                <p className="text-muted-foreground">
                  Adjust Alpha and Beta values to optimize the warehouse network
                </p>
              </div>
              <OptimizationControls
                onOptimize={handleOptimization}
                loading={optimizing}
              />
              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto w-full">
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
      </div>
    </div>
  );
};

export default GraphVisualization;