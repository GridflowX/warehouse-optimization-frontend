import React from 'react';
import { StorageGridConfig } from '@/components/StorageGridConfig';
import { AnimatedStorageGrid } from '@/components/AnimatedStorageGrid';
import { PackagingGrid } from '@/components/PackagingGrid';
import { StorageConfig, AlgorithmData } from '@/types/warehouse';

interface WarehouseLayoutProps {
  packagingData: AlgorithmData | null;
  retrievalData: AlgorithmData | null;
  onConfigSave: (config: StorageConfig) => void;
  onAnimateRetrieval: () => void;
  onPackagingData: (data: AlgorithmData) => void;
  onRetrievalData: (data: AlgorithmData) => void;
  currentConfig: StorageConfig | null;
}

export const WarehouseLayout: React.FC<WarehouseLayoutProps> = ({
  packagingData,
  retrievalData,
  onConfigSave,
  onAnimateRetrieval,
  onPackagingData,
  onRetrievalData,
  currentConfig
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Storage Grid Visualization - Left side on desktop */}
      <div className="flex-1 order-2 lg:order-1">
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Storage Grid</h2>
            <p className="text-muted-foreground">
              Single storage grid layout
            </p>
          </div>

          {/* Packaging Grid - Show placed boxes */}
          {currentConfig && (
            <div className="mb-6">
              <PackagingGrid 
                config={currentConfig}
                algorithmData={packagingData}
              />
            </div>
          )}
          
          {/* Animated Retrieval Grid */}
          <AnimatedStorageGrid 
            packagingData={packagingData}
            retrievalData={retrievalData}
            onAnimationComplete={() => console.log('Animation complete!')}
          />
        </div>
      </div>

      {/* Storage Grid Configuration - Right side on desktop */}
      <div className="flex-1 order-1 lg:order-2">
        <StorageGridConfig 
          onConfigSave={onConfigSave}
          onAnimateRetrieval={onAnimateRetrieval}
          onPackagingData={onPackagingData}
          onRetrievalData={onRetrievalData}
        />
      </div>
    </div>
  );
};