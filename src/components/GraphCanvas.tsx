// Main Graph Canvas Component with SVG connections

import React, { useMemo } from 'react';
import { Coordinate, Edge } from '@/types/api';
import { WarehouseNode } from './WarehouseNode';

interface GraphCanvasProps {
  warehouses: Coordinate[];
  edges: Edge[];
  onWarehouseClick: (warehouseId: string) => void;
  selectedWarehouse?: string;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  warehouses,
  edges,
  onWarehouseClick,
  selectedWarehouse
}) => {
  // Calculate canvas bounds with proper coordinate system starting at (0,0)
  const bounds = useMemo(() => {
    if (warehouses.length === 0) return { width: 800, height: 600, minX: 0, minY: 0, maxX: 800, maxY: 600 };
    
    const xs = warehouses.map(w => w.x);
    const ys = warehouses.map(w => w.y);
    const minX = 0; // Start at (0,0)
    const minY = 0; // Start at (0,0)
    const maxX = Math.max(Math.max(...xs) + 100, 800); // Ensure minimum canvas size
    const maxY = Math.max(Math.max(...ys) + 100, 600); // Ensure minimum canvas size
    
    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY
    };
  }, [warehouses]);

  // Grid scale: 1cm = ~37.8 pixels (96 DPI standard)
  const gridSpacing = 38; // pixels per cm

  // Generate all possible connections (dense graph)
  const allConnections = useMemo(() => {
    const connections: Array<{ from: Coordinate; to: Coordinate }> = [];
    
    for (let i = 0; i < warehouses.length; i++) {
      for (let j = i + 1; j < warehouses.length; j++) {
        connections.push({
          from: warehouses[i],
          to: warehouses[j]
        });
      }
    }
    
    return connections;
  }, [warehouses]);

  return (
    <div 
      className="relative bg-background border border-border rounded-lg overflow-hidden"
      style={{ 
        width: '100%',
        height: '70vh',
        minHeight: '500px'
      }}
    >
      {/* SVG for grid and connections */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width={gridSpacing} height={gridSpacing} patternUnits="userSpaceOnUse">
            <path d={`M ${gridSpacing} 0 L 0 0 0 ${gridSpacing}`} fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary/30"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Draw all possible connections as dotted lines */}
        {allConnections.map((connection, index) => (
          <line
            key={`connection-${index}`}
            x1={connection.from.x}
            y1={connection.from.y}
            x2={connection.to.x}
            y2={connection.to.y}
            stroke="hsl(var(--primary))"
            strokeWidth="1"
            strokeDasharray="3,3"
            opacity="0.4"
          />
        ))}
        {warehouses.map((warehouse) => (
          <WarehouseNode
            key={warehouse.id}
            warehouse={warehouse}
            onClick={onWarehouseClick}
            selected={selectedWarehouse === warehouse.id}
            bounds={bounds}
            containerSize={{ width: 800, height: 600 }}
          />
        ))}
      </svg>
    </div>
  );
};