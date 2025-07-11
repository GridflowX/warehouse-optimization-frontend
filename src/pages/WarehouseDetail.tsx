// Warehouse Detail Page - Internal Operations View

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { NeomorphicIcon } from '@/components/NeomorphicIcon';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Truck, Route } from 'lucide-react';

const WarehouseDetail: React.FC = () => {
  const { warehouseId } = useParams<{ warehouseId: string }>();
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/');
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

          {/* Warehouse Layout Visualization */}
          <div className="bg-card border rounded-lg p-8 shadow-sm">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Warehouse Layout</h2>
              <p className="text-muted-foreground">
                Central alleyway with storage grids and optimized pod routing
              </p>
            </div>

            {/* SVG Warehouse Layout */}
            <div className="flex justify-center">
              <svg
                width="700"
                height="550"
                viewBox="0 0 700 550"
                className="border rounded"
                style={{ backgroundColor: 'hsl(var(--muted))' }}
              >
                {/* Storage bin grid */}
                {gridPositions.map((position) => (
                  <rect
                    key={position.id}
                    x={position.x}
                    y={position.y}
                    width="40"
                    height="40"
                    fill="hsl(var(--background))"
                    stroke="hsl(var(--border))"
                    strokeWidth="1"
                    rx="2"
                  />
                ))}

                {/* Central alleyway */}
                <rect
                  x="300"
                  y="0"
                  width="100"
                  height="550"
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
                  y2="550"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                  opacity="0.5"
                />

                {/* Pod route path */}
                <g>
                  <polyline
                    points={routePath.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="3"
                    strokeDasharray="8,4"
                    opacity="0.8"
                  />
                  
                  {/* Route waypoints */}
                  {routePath.map((point, index) => (
                    <circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r="4"
                      fill="hsl(var(--primary))"
                      opacity="0.8"
                    />
                  ))}

                  {/* Start and end markers */}
                  <circle
                    cx={routePath[0].x}
                    cy={routePath[0].y}
                    r="8"
                    fill="hsl(var(--background))"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                  />
                  <text
                    x={routePath[0].x}
                    y={routePath[0].y + 5}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fill="hsl(var(--primary))"
                  >
                    S
                  </text>

                  <circle
                    cx={routePath[routePath.length - 1].x}
                    cy={routePath[routePath.length - 1].y}
                    r="8"
                    fill="hsl(var(--background))"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                  />
                  <text
                    x={routePath[routePath.length - 1].x}
                    y={routePath[routePath.length - 1].y + 5}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="bold"
                    fill="hsl(var(--primary))"
                  >
                    E
                  </text>
                </g>

                {/* Labels */}
                <text
                  x="150"
                  y="30"
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="bold"
                  fill="hsl(var(--foreground))"
                >
                  Storage Grid A
                </text>
                <text
                  x="550"
                  y="30"
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="bold"
                  fill="hsl(var(--foreground))"
                >
                  Storage Grid B
                </text>
                <text
                  x="350"
                  y="530"
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="bold"
                  fill="hsl(var(--foreground))"
                >
                  Central Alleyway
                </text>
              </svg>
            </div>

            {/* Legend */}
            <div className="mt-6 flex justify-center">
              <div className="flex flex-wrap gap-6 text-sm">
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