import React, { useState, useEffect } from 'react';
import { StorageConfig, AlgorithmData, GridBox, GridDimensions } from '@/types/warehouse';
import { transformY, calculateViewBox, calculateGridDimensions } from '@/utils/gridUtils';

interface PackagingGridProps {
  config: StorageConfig;
  algorithmData?: AlgorithmData | null;
}

export const PackagingGrid: React.FC<PackagingGridProps> = ({ config, algorithmData }) => {
  const [boxes, setBoxes] = useState<GridBox[]>([]);
  const [gridDimensions, setGridDimensions] = useState<GridDimensions>({ width: 0, height: 0 });

  useEffect(() => {
    // Calculate grid dimensions based on configuration
    const dimensions = calculateGridDimensions(config.storageWidth, config.storageLength);
    setGridDimensions(dimensions);

    // Initialize boxes from algorithm data
    if (algorithmData) {
      console.log('PackagingGrid received algorithm data length:', algorithmData.length);
      console.log('PackagingGrid received algorithm data:', algorithmData);
      
      const initialBoxes = algorithmData
        .filter((boxData) => {
          // Only show boxes with valid coordinates
          const isValid = boxData.x !== null && boxData.x !== undefined &&
                 boxData.y !== null && boxData.y !== undefined &&
                 !isNaN(boxData.x) && !isNaN(boxData.y) &&
                 boxData.width !== null && boxData.width !== undefined &&
                 boxData.height !== null && boxData.height !== undefined &&
                 !isNaN(boxData.width) && !isNaN(boxData.height);
          
          if (!isValid) {
            console.log('Filtered out box:', boxData);
          }
          return isValid;
        })
        .map((boxData) => ({
          id: `box-${boxData.index}`,
          x: boxData.x,
          y: boxData.y,
          width: boxData.width,
          height: boxData.height,
          index: boxData.index,
          packed: boxData.packed !== false // Default to true if not specified
        }))
        .sort((a, b) => a.index - b.index); // Sort by index for proper placement order
      
      console.log('PackagingGrid processed boxes count:', initialBoxes.length);
      console.log('PackagingGrid processed boxes:', initialBoxes);
      setBoxes(initialBoxes);
    } else {
      console.log('PackagingGrid: No algorithm data received');
      setBoxes([]);
    }
  }, [config, algorithmData]);

  const viewBox = calculateViewBox(boxes, gridDimensions);

  return (
    <div className="w-full h-full border border-border rounded-lg bg-card p-4">
      <h3 className="text-lg font-semibold mb-4">Packaging Grid - Coordinate System</h3>
      
      <div className="grid-container" style={{ width: '100%', height: '500px' }}>
        <svg
          width="100%"
          height="100%"
          viewBox={viewBox}
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
                y={transformY(box.y + box.height, gridDimensions.height)}
                width={box.width}
                height={box.height}
                fill="hsl(var(--primary) / 0.7)"
                stroke="hsl(var(--primary))"
                strokeWidth={boxes.length > 20 ? "1" : "2"}
                rx="4"
                className="transition-all duration-300 hover:fill-primary/90"
              />
              {/* Only show index text if there are fewer than 30 boxes */}
              {boxes.length <= 30 && (
                <text
                  x={box.x + box.width / 2}
                  y={transformY(box.y + box.height / 2, gridDimensions.height)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="hsl(var(--primary-foreground))"
                  fontSize={boxes.length > 15 ? "10" : "12"}
                  fontWeight="bold"
                >
                  {box.index}
                </text>
              )}
              {/* Only show coordinates for debugging if there are fewer than 10 boxes */}
              {boxes.length <= 10 && (
                <>
                  <text
                    x={box.x + 2}
                    y={transformY(box.y, gridDimensions.height) - 2}
                    fill="hsl(var(--muted-foreground))"
                    fontSize="10"
                  >
                    ({box.x},{box.y})
                  </text>
                  {/* Show box dimensions */}
                  <text
                    x={box.x + box.width / 2}
                    y={transformY(box.y + box.height, gridDimensions.height) + 15}
                    textAnchor="middle"
                    fill="hsl(var(--muted-foreground))"
                    fontSize="10"
                  >
                    {box.width}×{box.height}
                  </text>
                </>
              )}
            </g>
          ))}
          
          {/* Coordinate labels */}
          <text x="10" y={gridDimensions.height - 10} fill="hsl(var(--foreground))" fontSize="12" fontWeight="bold">
            (0,0)
          </text>
          <text x={gridDimensions.width - 50} y="25" fill="hsl(var(--foreground))" fontSize="12" fontWeight="bold">
            ({gridDimensions.width},{gridDimensions.height})
          </text>
        </svg>
      </div>
      
      <div className="mt-4 text-sm text-muted-foreground space-y-1">
        <p>• Container: {gridDimensions.width}×{gridDimensions.height} units</p>
        <p>• Boxes placed: {boxes.length}</p>
        <p>• Max box size: {config.maximumSideLength} units</p>
        <p>• Clearance: {config.clearance} units</p>
        {boxes.length > 0 && (
          <>
            <p>• Total area used: {boxes.reduce((sum, box) => sum + (box.width * box.height), 0)} units²</p>
            <p>• Container area: {gridDimensions.width * gridDimensions.height} units²</p>
            <p>• Utilization: {((boxes.reduce((sum, box) => sum + (box.width * box.height), 0) / (gridDimensions.width * gridDimensions.height)) * 100).toFixed(1)}%</p>
            {boxes.length > 10 && (
              <>
                <p>• Box size range: {Math.min(...boxes.map(b => Math.min(b.width, b.height)))} - {Math.max(...boxes.map(b => Math.max(b.width, b.height)))} units</p>
                <p>• Average box size: {Math.round(boxes.reduce((sum, box) => sum + (box.width + box.height) / 2, 0) / boxes.length)} units</p>
                <p>• Boxes with id 0-9: {boxes.filter(b => b.index < 10).length}</p>
                <p>• Boxes with id 10-19: {boxes.filter(b => b.index >= 10 && b.index < 20).length}</p>
                <p>• Boxes with id 20-29: {boxes.filter(b => b.index >= 20 && b.index < 30).length}</p>
                <p>• Boxes with id 30-39: {boxes.filter(b => b.index >= 30 && b.index < 40).length}</p>
                <p>• Boxes with id 40-49: {boxes.filter(b => b.index >= 40 && b.index < 50).length}</p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};