// Main Graph Canvas Component with SVG connections

import React, { useMemo } from 'react';
import { Coordinate, Edge } from '@/types/api';
import { WarehouseNode } from './WarehouseNode';
import { TrafficPod } from './TrafficPod';

// Component for rendering Steiner nodes
const SteinerNode: React.FC<{
  node: OptimizationNode;
  normalizedX: number;
  normalizedY: number;
}> = ({ node, normalizedX, normalizedY }) => {
  return (
    <g transform={`translate(${normalizedX}, ${normalizedY})`}>
      <rect
        x="-8"
        y="-8"
        width="16"
        height="16"
        className="fill-muted stroke-border stroke-1"
        rx="2"
      />
      <text
        x="0"
        y="0"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium fill-muted-foreground pointer-events-none"
      >
        {node.id}
      </text>
      <title>{`Steiner ${node.id} (${node.x}, ${node.y})`}</title>
    </g>
  );
};

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
  // Calculate canvas bounds with normalized coordinate system (0,0) to (1,1)
  const canvasSize = { width: 800, height: 600 };
  const margin = 50;
  
  // Normalize coordinates from API data to canvas coordinates
  const normalizeCoordinates = (x: number, y: number, maxX: number, maxY: number) => {
    const normalizedX = margin + (x / maxX) * (canvasSize.width - 2 * margin);
    // Flip Y coordinate so (0,0) is bottom-left
    const normalizedY = canvasSize.height - margin - (y / maxY) * (canvasSize.height - 2 * margin);
    return { x: normalizedX, y: normalizedY };
  };

  // Calculate bounds for optimization data
  const optimizationBounds = useMemo(() => {
    if (!optimizationData?.nodes) return null;
    
    const xs = optimizationData.nodes.map(n => n.x);
    const ys = optimizationData.nodes.map(n => n.y);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);
    
    return { maxX, maxY };
  }, [optimizationData]);

  // Generate all possible connections (light dotted lines)
  const allPossibleConnections = useMemo(() => {
    if (!optimizationData?.nodes || !optimizationBounds) return [];
    
    const connections = [];
    const nodes = optimizationData.nodes;
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const fromCoords = normalizeCoordinates(nodes[i].x, nodes[i].y, optimizationBounds.maxX, optimizationBounds.maxY);
        const toCoords = normalizeCoordinates(nodes[j].x, nodes[j].y, optimizationBounds.maxX, optimizationBounds.maxY);
        
        connections.push({
          from: fromCoords,
          to: toCoords,
          isBackground: true
        });
      }
    }
    return connections;
  }, [optimizationData, optimizationBounds]);

  // Generate edge connections (bold lines from API)
  const edgeConnections = useMemo(() => {
    if (!optimizationData?.edges || !optimizationData?.nodes || !optimizationBounds) return [];
    
    return optimizationData.edges.map(edge => {
      const sourceNode = optimizationData.nodes.find(n => n.id === edge.source);
      const targetNode = optimizationData.nodes.find(n => n.id === edge.target);
      
      if (!sourceNode || !targetNode) return null;
      
      const fromCoords = normalizeCoordinates(sourceNode.x, sourceNode.y, optimizationBounds.maxX, optimizationBounds.maxY);
      const toCoords = normalizeCoordinates(targetNode.x, targetNode.y, optimizationBounds.maxX, optimizationBounds.maxY);
      
      return {
        from: fromCoords,
        to: toCoords,
        isEdge: true
      };
    }).filter(Boolean);
  }, [optimizationData, optimizationBounds]);

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
        viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Draw all possible connections (light dotted lines) */}
        {allPossibleConnections.map((connection, index) => (
          <line
            key={`background-${index}`}
            x1={connection.from.x}
            y1={connection.from.y}
            x2={connection.to.x}
            y2={connection.to.y}
            stroke="hsl(var(--primary))"
            strokeWidth="1"
            strokeDasharray="5,5"
            opacity="0.2"
          />
        ))}
        
        {/* Draw edge connections (bold lines from API) */}
        {edgeConnections.map((connection, index) => (
          <line
            key={`edge-${index}`}
            x1={connection.from.x}
            y1={connection.from.y}
            x2={connection.to.x}
            y2={connection.to.y}
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            opacity="0.8"
          />
        ))}

        {/* Traffic pods for flows */}
        {optimizationData?.flows?.map((flow, index) => {
          const sourceNode = optimizationData.nodes?.find(n => n.id === flow.source);
          const targetNode = optimizationData.nodes?.find(n => n.id === flow.target);
          
          if (!sourceNode || !targetNode || !optimizationBounds) return null;
          
          const sourceCoords = normalizeCoordinates(sourceNode.x, sourceNode.y, optimizationBounds.maxX, optimizationBounds.maxY);
          const targetCoords = normalizeCoordinates(targetNode.x, targetNode.y, optimizationBounds.maxX, optimizationBounds.maxY);
          
          return (
            <TrafficPod
              key={`${flow.commodity}-${flow.source}-${flow.target}-${index}`}
              source={sourceCoords}
              target={targetCoords}
              flow={flow.flow}
              commodity={flow.commodity}
              pathId={`${flow.source}-${flow.target}`}
            />
          );
        })}

        {/* Render optimization nodes if available */}
        {optimizationData?.nodes && optimizationBounds && optimizationData.nodes.map((node) => {
          const coords = normalizeCoordinates(node.x, node.y, optimizationBounds.maxX, optimizationBounds.maxY);
          
          if (node.type === 'station') {
            // Convert to warehouse format for WarehouseNode component
            const warehouseData: Coordinate = {
              id: node.id.toString(),
              x: coords.x,
              y: coords.y
            };
            
            return (
              <WarehouseNode
                key={`station-${node.id}`}
                warehouse={warehouseData}
                onClick={onWarehouseClick}
                selected={selectedWarehouse === node.id.toString()}
                bounds={{ minX: 0, minY: 0, width: canvasSize.width, height: canvasSize.height }}
                containerSize={canvasSize}
              />
            );
          } else {
            // Render Steiner node
            return (
              <SteinerNode
                key={`steiner-${node.id}`}
                node={node}
                normalizedX={coords.x}
                normalizedY={coords.y}
              />
            );
          }
        })}

        {/* Fallback: Render original warehouses if no optimization data */}
        {!optimizationData?.nodes && warehouses.map((warehouse) => (
          <WarehouseNode
            key={warehouse.id}
            warehouse={warehouse}
            onClick={onWarehouseClick}
            selected={selectedWarehouse === warehouse.id}
            bounds={{ minX: 0, minY: 0, width: canvasSize.width, height: canvasSize.height }}
            containerSize={canvasSize}
          />
        ))}
      </svg>
    </div>
  );
};