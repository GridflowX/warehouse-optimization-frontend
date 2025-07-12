// Warehouse Detail Page - Algorithm and Configuration Interface

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { StorageConfig, AlgorithmData } from '@/types/warehouse';
import { WarehouseHeader } from '@/components/WarehouseHeader';
import { WarehouseLayout } from '@/components/WarehouseLayout';
import { WarehouseStats } from '@/components/WarehouseStats';
import { generateRandomWarehouseData, createDataFiles } from '@/services/dataGeneration';
import { saveWarehouseData, loadWarehouseData } from '@/hooks/useLocalStorage';

const WarehouseDetail: React.FC = () => {
  const { warehouseId } = useParams<{ warehouseId: string }>();
  const [currentConfig, setCurrentConfig] = useState<StorageConfig | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [packagingData, setPackagingData] = useState<AlgorithmData | null>(null);
  const [retrievalData, setRetrievalData] = useState<AlgorithmData | null>(null);

  // Load data from localStorage or generate new data
  useEffect(() => {
    if (!warehouseId) return;
    
    // Try to load from localStorage first
    const cachedData = loadWarehouseData(warehouseId);
    
    if (cachedData) {
      setPackagingData(cachedData.packagingData);
      setRetrievalData(cachedData.retrievalData);
      setCurrentConfig(cachedData.config);
    } else {
      // Generate new data if not in cache
      const defaultConfig: StorageConfig = {
        storageWidth: 1000,
        storageLength: 2000,
        numberOfRectangles: 50,
        minimumSideLength: 50,
        maximumSideLength: 200,
        clearance: 20
      };
      
      const { packagingData: initialPackaging, retrievalData: initialRetrieval } = generateRandomWarehouseData(defaultConfig);
      setPackagingData(initialPackaging);
      setRetrievalData(initialRetrieval);
      setCurrentConfig(defaultConfig);
      
      // Save to localStorage
      saveWarehouseData(warehouseId, {
        packagingData: initialPackaging,
        retrievalData: initialRetrieval,
        config: defaultConfig
      });
    }
  }, [warehouseId]);

  const handleConfigSave = (config: StorageConfig) => {
    setCurrentConfig(config);
    // Here you would implement the packaging algorithm with the configuration
    console.log('Configuration saved:', config);
  };

  const handleAnimateRetrieval = () => {
    setIsAnimating(true);
    // Here you would implement the retrieval path animation
    console.log('Starting retrieval animation...');
    
    // Simulate animation duration
    setTimeout(() => {
      setIsAnimating(false);
    }, 3000);
  };

  const handlePackagingData = (data: AlgorithmData) => {
    setPackagingData(data);
    if (warehouseId && retrievalData && currentConfig) {
      saveWarehouseData(warehouseId, {
        packagingData: data,
        retrievalData,
        config: currentConfig
      });
    }
  };

  const handleRetrievalData = (data: AlgorithmData) => {
    setRetrievalData(data);
    if (warehouseId && packagingData && currentConfig) {
      saveWarehouseData(warehouseId, {
        packagingData,
        retrievalData: data,
        config: currentConfig
      });
    }
  };

  // Generate grid positions for storage bins
  const generateGrid = () => {
    const grid = [];
    const rows = 8;
    const cols = 12;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Skip center alleyway (cols 5-6)
        if (col >= 5 && col <= 6) continue;
        
        grid.push({
          id: `${row}-${col}`,
          x: col * 60 + (col > 6 ? 40 : 0), // Add gap for alleyway
          y: row * 60,
          side: col < 5 ? 'left' : 'right'
        });
      }
    }
    return grid;
  };

  const gridPositions = generateGrid();
  
  // Generate a sample route path
  const routePath = [
    { x: 350, y: 50 },   // Start at top of alleyway
    { x: 350, y: 200 },  // Move down
    { x: 250, y: 200 },  // Move left to storage area
    { x: 250, y: 300 },  // Move down in storage
    { x: 350, y: 300 },  // Return to alleyway
    { x: 350, y: 450 },  // Continue down alleyway
    { x: 450, y: 450 },  // Move right to storage area
    { x: 450, y: 350 },  // Move up in storage
    { x: 350, y: 350 },  // Return to alleyway
    { x: 350, y: 500 },  // End at bottom
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle grid background */}
      <div className="fixed inset-0 grid-background opacity-20 pointer-events-none" />
      
      <div className="relative z-10 section-padding">
        <div className="container mx-auto px-4">
          {/* Header */}
          <WarehouseHeader warehouseId={warehouseId || 'Unknown'} />

          {/* Main Content - Grid and Configuration side by side */}
          <WarehouseLayout
            packagingData={packagingData}
            retrievalData={retrievalData}
            onConfigSave={handleConfigSave}
            onAnimateRetrieval={handleAnimateRetrieval}
            onPackagingData={handlePackagingData}
            onRetrievalData={handleRetrievalData}
            currentConfig={currentConfig}
          />

          {/* Warehouse Statistics */}
          <WarehouseStats 
            gridPositions={gridPositions}
            routePath={routePath}
          />
        </div>
      </div>
    </div>
  );
};

export default WarehouseDetail;