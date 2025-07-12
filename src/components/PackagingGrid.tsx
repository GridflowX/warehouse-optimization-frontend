import React, { useState, useEffect } from 'react';
import { StorageConfig, AlgorithmData } from './StorageGridConfig';

interface PackagingGridProps {
  config: StorageConfig;
  algorithmData?: AlgorithmData | null;
}

interface GridBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  placed: boolean;
}

export const PackagingGrid: React.FC<PackagingGridProps> = ({ config, algorithmData }) => {
  const [boxes, setBoxes] = useState<GridBox[]>([]);
  const [gridDimensions, setGridDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Calculate grid dimensions based on configuration
    const gridWidth = config.storageWidth;
    const gridHeight = config.storageLength;
    setGridDimensions({ width: gridWidth, height: gridHeight });

    // Initialize boxes from algorithm data
    if (algorithmData) {
      const initialBoxes = algorithmData.map((boxData) => {
        const firstStep = boxData.path[0];
        const lastStep = boxData.path[boxData.path.length - 1];
        
        return {
          id: `box-${boxData.index}`,
          x: lastStep?.x || firstStep?.x || 0,
          y: lastStep?.y || firstStep?.y || 0,
          width: Math.min(config.maximumSideLength, config.minimumSideLength + Math.random() * (config.maximumSideLength - config.minimumSideLength)),
          height: Math.min(config.maximumSideLength, config.minimumSideLength + Math.random() * (config.maximumSideLength - config.minimumSideLength)),
          index: boxData.index,
          placed: true
        };
      });
      setBoxes(initialBoxes);
    }
  }, [config, algorithmData]);

  const calculateViewBox = () => {
    if (boxes.length === 0) {
      return `0 0 ${gridDimensions.width} ${gridDimensions.height}`;
    }
    
    const padding = 50;
    const minX = Math.min(0, ...boxes.map(box => box.x)) - padding;
    const minY = Math.min(0, ...boxes.map(box => box.y)) - padding;
    const maxX = Math.max(gridDimensions.width, ...boxes.map(box => box.x + box.width)) + padding;
    const maxY = Math.max(gridDimensions.height, ...boxes.map(box => box.y + box.height)) + padding;
    
    return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
  };

  return (
    <div className="w-full h-full border border-border rounded-lg bg-card p-4">
      <h3 className="text-lg font-semibold mb-4">Packaging Grid - Coordinate System</h3>
      
      <div className="grid-container" style={{ width: '100%', height: '500px' }}>
        <svg
          width="100%"
          height="100%"
          viewBox={calculateViewBox()}
          className="border border-muted"
        >
          {/* Grid background */}
          <defs>
            <pattern
              id="grid"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="1"
                opacity="0.3"
              />
            </pattern>
          </defs>
          
          {/* Grid pattern */}
          <rect
            width="100%"
            height="100%"
            fill="url(#grid)"
          />
          
          {/* Storage container boundary */}
          <rect
            x="0"
            y="0"
            width={gridDimensions.width}
            height={gridDimensions.height}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeDasharray="10,5"
          />
          
          {/* Placed boxes */}
          {boxes.map((box) => (
            <g key={box.id}>
              <rect
                x={box.x}
                y={box.y}
                width={box.width}
                height={box.height}
                fill="hsl(var(--primary) / 0.7)"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                rx="4"
                className="transition-all duration-300"
              />
              <text
                x={box.x + box.width / 2}
                y={box.y + box.height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="hsl(var(--primary-foreground))"
                fontSize="12"
                fontWeight="bold"
              >
                {box.index}
              </text>
            </g>
          ))}
          
          {/* Coordinate labels */}
          <text x="10" y="25" fill="hsl(var(--foreground))" fontSize="12" fontWeight="bold">
            (0,0)
          </text>
          <text x={gridDimensions.width - 50} y={gridDimensions.height - 10} fill="hsl(var(--foreground))" fontSize="12" fontWeight="bold">
            ({gridDimensions.width},{gridDimensions.height})
          </text>
        </svg>
      </div>
      
      <div className="mt-4 text-sm text-muted-foreground space-y-1">
        <p>• Container: {gridDimensions.width}×{gridDimensions.height} units</p>
        <p>• Boxes placed: {boxes.length}</p>
        <p>• Max box size: {config.maximumSideLength} units</p>
        <p>• Clearance: {config.clearance} units</p>
      </div>
    </div>
  );
};