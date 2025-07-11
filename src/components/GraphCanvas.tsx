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
  // Calculate canvas bounds
  const bounds = useMemo(() => {
    if (warehouses.length === 0) return { width: 800, height: 600, minX: 0, minY: 0, maxX: 800, maxY: 600 };
    
    const xs = warehouses.map(w => w.x);
    const ys = warehouses.map(w => w.y);
    const minX = Math.min(...xs) - 50;
    const maxX = Math.max(...xs) + 50;
    const minY = Math.min(...ys) - 50;
    const maxY = Math.max(...ys) + 50;
    
    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY
    };
  }, [warehouses]);

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
      {/* Grid background */}
      <div className="absolute inset-0 graph-grid-background" />
      
      {/* SVG for connections */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Draw all possible connections as dotted lines */}
        {allConnections.map((connection, index) => (
          <line
            key={`connection-${index}`}
            x1={connection.from.x}
            y1={connection.from.y}
            x2={connection.to.x}
            y2={connection.to.y}
            className="connection-line"
          />
        ))}
      </svg>
      
      {/* Warehouse nodes container */}
      <div 
        className="absolute inset-0"
        style={{
          transform: `scale(${Math.min(1, 800 / bounds.width, 600 / bounds.height)})`,
          transformOrigin: 'top left'
        }}
      >
        {warehouses.map((warehouse) => (
          <WarehouseNode
            key={warehouse.id}
            warehouse={warehouse}
            onClick={onWarehouseClick}
            selected={selectedWarehouse === warehouse.id}
          />
        ))}
      </div>
    </div>
  );
};