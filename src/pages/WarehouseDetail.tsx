// Warehouse Detail Page - Algorithm and Configuration Interface

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { NeomorphicIcon } from '@/components/NeomorphicIcon';
import { StorageGridConfig, StorageConfig } from '@/components/StorageGridConfig';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Truck, Route } from 'lucide-react';

const WarehouseDetail: React.FC = () => {
  const { warehouseId } = useParams<{ warehouseId: string }>();
  const navigate = useNavigate();
  const [currentConfig, setCurrentConfig] = useState<StorageConfig | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

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
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="outline"
              onClick={handleBackClick}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Network
            </Button>
            
            <div className="text-center">
              <NeomorphicIcon>
                <Package className="w-6 h-6" />
              </NeomorphicIcon>
              <h1 className="text-3xl font-bold mt-2">
                Warehouse {warehouseId}
              </h1>
              <p className="text-muted-foreground">
                Internal operations and routing visualization
              </p>
            </div>
            
            <div /> {/* Spacer for centering */}
          </div>

          {/* Main Content - Configuration and Visualization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Storage Grid Configuration */}
            <div>
              <StorageGridConfig 
                onConfigSave={handleConfigSave}
                onAnimateRetrieval={handleAnimateRetrieval}
              />
            </div>

            {/* Warehouse Layout Visualization */}
            <div className="bg-card border rounded-lg p-6 shadow-sm">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Warehouse Layout</h2>
                <p className="text-muted-foreground">
                  Central alleyway with storage grids and optimized pod routing
                </p>
                {isAnimating && (
                  <div className="mt-2 text-sm text-primary font-medium animate-pulse">
                    Running retrieval animation...
                  </div>
                )}
              </div>

              {/* SVG Warehouse Layout */}
              <div className="flex justify-center">
                <svg
                  width="100%"
                  height="400"
                  viewBox="0 0 700 400"
                  className="border rounded max-w-full"
                  style={{ backgroundColor: 'hsl(var(--muted))' }}
                >
                  {/* Storage bin grid */}
                  {gridPositions.map((position) => (
                    <rect
                      key={position.id}
                      x={position.x}
                      y={position.y}
                      width="30"
                      height="30"
                      fill="hsl(var(--background))"
                      stroke="hsl(var(--border))"
                      strokeWidth="1"
                      rx="2"
                      className={isAnimating ? "animate-pulse" : ""}
                    />
                  ))}

                  {/* Central alleyway */}
                  <rect
                    x="300"
                    y="0"
                    width="100"
                    height="400"
                    fill="hsl(var(--card))"
                    stroke="hsl(var(--border))"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />

                  {/* Alleyway center line */}
                  <line
                    x1="350"
                    y1="0"
                    x2="350"
                    y2="400"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    opacity="0.5"
                  />

                  {/* Pod route path */}
                  <g>
                    <polyline
                      points={routePath.slice(0, Math.min(routePath.length, 8)).map(p => `${p.x},${Math.min(p.y, 350)}`).join(' ')}
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="3"
                      strokeDasharray="8,4"
                      opacity={isAnimating ? "1" : "0.8"}
                      className={isAnimating ? "animate-pulse" : ""}
                    />
                    
                    {/* Route waypoints */}
                    {routePath.slice(0, Math.min(routePath.length, 8)).map((point, index) => (
                      <circle
                        key={index}
                        cx={point.x}
                        cy={Math.min(point.y, 350)}
                        r="4"
                        fill="hsl(var(--primary))"
                        opacity={isAnimating ? "1" : "0.8"}
                        className={isAnimating ? "animate-bounce" : ""}
                        style={{ animationDelay: `${index * 0.2}s` }}
                      />
                    ))}

                    {/* Start marker */}
                    <circle
                      cx={routePath[0].x}
                      cy={Math.min(routePath[0].y, 350)}
                      r="8"
                      fill="hsl(var(--background))"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                    />
                    <text
                      x={routePath[0].x}
                      y={Math.min(routePath[0].y, 350) + 5}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill="hsl(var(--primary))"
                    >
                      S
                    </text>
                  </g>

                  {/* Labels */}
                  <text
                    x="150"
                    y="30"
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="bold"
                    fill="hsl(var(--foreground))"
                  >
                    Storage Grid A
                  </text>
                  <text
                    x="550"
                    y="30"
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="bold"
                    fill="hsl(var(--foreground))"
                  >
                    Storage Grid B
                  </text>
                  <text
                    x="350"
                    y="380"
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="bold"
                    fill="hsl(var(--foreground))"
                  >
                    Central Alleyway
                  </text>
                </svg>
              </div>

              {/* Legend */}
              <div className="mt-4 flex justify-center">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-background border rounded"></div>
                    <span>Storage Bins</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-card border-2 border-dashed rounded"></div>
                    <span>Alleyway</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-primary rounded"></div>
                    <span>Pod Route</span>
                  </div>
                </div>
              </div>
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