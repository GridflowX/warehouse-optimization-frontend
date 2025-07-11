// Warehouse Detail Page - Algorithm and Configuration Interface

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { NeomorphicIcon } from '@/components/NeomorphicIcon';
import { StorageGridConfig, StorageConfig, AlgorithmData } from '@/components/StorageGridConfig';
import { AnimatedStorageGrid } from '@/components/AnimatedStorageGrid';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Truck, Route } from 'lucide-react';

const WarehouseDetail: React.FC = () => {
  const { warehouseId } = useParams<{ warehouseId: string }>();
  const navigate = useNavigate();
  const [currentConfig, setCurrentConfig] = useState<StorageConfig | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [algorithmData, setAlgorithmData] = useState<AlgorithmData | null>(null);

  const handleBackClick = () => {
    navigate('/');
  };

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

  const handleAlgorithmData = (data: AlgorithmData) => {
    setAlgorithmData(data);
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
          <div className="mb-8">
            <div className="flex items-center justify-start mb-6">
              <Button
                variant="outline"
                onClick={handleBackClick}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Network
              </Button>
            </div>
            
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <NeomorphicIcon>
                  <Package className="w-6 h-6" />
                </NeomorphicIcon>
              </div>
              <h1 className="text-3xl font-bold mb-2">
                Warehouse {warehouseId}
              </h1>
              <p className="text-muted-foreground">
                Internal operations and routing visualization
              </p>
            </div>
          </div>

          {/* Main Content - Grid and Configuration side by side */}
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

                {/* Animated Storage Grid */}
                <AnimatedStorageGrid 
                  algorithmData={algorithmData}
                  onAnimationComplete={() => console.log('Animation complete!')}
                />
              </div>
            </div>

            {/* Storage Grid Configuration - Right side on desktop */}
            <div className="flex-1 order-1 lg:order-2">
              <StorageGridConfig 
                onConfigSave={handleConfigSave}
                onAnimateRetrieval={handleAnimateRetrieval}
                onAlgorithmData={handleAlgorithmData}
              />
            </div>
          </div>

          {/* Warehouse Statistics */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg border bg-card">
              <NeomorphicIcon className="mx-auto mb-2">
                <Package className="w-5 h-5" />
              </NeomorphicIcon>
              <div className="text-xl font-bold">{gridPositions.length}</div>
              <div className="text-sm text-muted-foreground">Storage Bins</div>
            </div>
            <div className="text-center p-4 rounded-lg border bg-card">
              <NeomorphicIcon className="mx-auto mb-2">
                <Route className="w-5 h-5" />
              </NeomorphicIcon>
              <div className="text-xl font-bold">{routePath.length}</div>
              <div className="text-sm text-muted-foreground">Route Points</div>
            </div>
            <div className="text-center p-4 rounded-lg border bg-card">
              <NeomorphicIcon className="mx-auto mb-2">
                <Truck className="w-5 h-5" />
              </NeomorphicIcon>
              <div className="text-xl font-bold">1</div>
              <div className="text-sm text-muted-foreground">Active Pod</div>
            </div>
            <div className="text-center p-4 rounded-lg border bg-card">
              <div className="text-xl font-bold">95%</div>
              <div className="text-sm text-muted-foreground">Efficiency</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseDetail;