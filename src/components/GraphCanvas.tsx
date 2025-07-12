// Main Graph Canvas Component with SVG connections

import React, { useMemo } from 'react';
import { Coordinate, Edge } from '@/types/api';
import { WarehouseNode } from './WarehouseNode';
import { TrafficPod } from './TrafficPod';

interface OptimizationNode {
  id: number;
  x: number;
  y: number;
  type: 'station' | 'steiner';
}

interface OptimizationEdge {
  source: number;
  target: number;
  length: number;
}

interface Flow {
  commodity: number;
  source: number;
  target: number;
  flow: number;
}

interface GraphCanvasProps {
  warehouses: Coordinate[];
  edges: Edge[];
  onWarehouseClick: (warehouseId: string) => void;
  selectedWarehouse?: string;
  optimizationData?: {
    nodes: OptimizationNode[];
    edges: OptimizationEdge[];
    flows: Flow[];
  };
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  warehouses,
  edges,
  onWarehouseClick,
  selectedWarehouse,
  optimizationData
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

  // Generate connections based on optimization data or default warehouse connections
  const gridSpacing = 50;
  const allConnections = useMemo(() => {
    if (optimizationData?.edges && optimizationData?.nodes) {
      return optimizationData.edges.map(edge => {
        const sourceNode = optimizationData.nodes.find(n => n.id === edge.source);
        const targetNode = optimizationData.nodes.find(n => n.id === edge.target);
        return {
          from: sourceNode ? { id: sourceNode.id.toString(), x: sourceNode.x * 100, y: sourceNode.y * 100 } : null,
          to: targetNode ? { id: targetNode.id.toString(), x: targetNode.x * 100, y: targetNode.y * 100 } : null,
          isBold: true
        };
      }).filter(conn => conn.from && conn.to);
    }
    
    // Default warehouse connections
    const connections = [];
    for (let i = 0; i < warehouses.length; i++) {
      for (let j = i + 1; j < warehouses.length; j++) {
        connections.push({
          from: warehouses[i],
          to: warehouses[j],
          isBold: false
        });
      }
    }
    return connections;
  }, [warehouses, optimizationData]);

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
            <path d={`M ${gridSpacing} 0 L 0 0 0 ${gridSpacing}`} fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Draw connections - bold for optimization data, dotted for default */}
        {allConnections.map((connection, index) => (
          <line
            key={index}
            x1={connection.from.x}
            y1={connection.from.y}
            x2={connection.to.x}
            y2={connection.to.y}
            stroke={connection.isBold ? "hsl(var(--primary))" : "hsl(var(--primary))"}
            strokeWidth={connection.isBold ? "3" : "1"}
            strokeDasharray={connection.isBold ? "none" : "5,5"}
            opacity={connection.isBold ? "0.8" : "0.3"}
          />
        ))}

        {/* Traffic pods for flows */}
        {optimizationData?.flows?.map((flow, index) => {
          const sourceNode = optimizationData.nodes.find(n => n.id === flow.source);
          const targetNode = optimizationData.nodes.find(n => n.id === flow.target);
          
          if (!sourceNode || !targetNode) return null;
          
          return (
            <TrafficPod
              key={`${flow.commodity}-${flow.source}-${flow.target}-${index}`}
              source={{ x: sourceNode.x * 100, y: sourceNode.y * 100 }}
              target={{ x: targetNode.x * 100, y: targetNode.y * 100 }}
              flow={flow.flow}
              commodity={flow.commodity}
              pathId={`${flow.source}-${flow.target}`}
            />
          );
        })}

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