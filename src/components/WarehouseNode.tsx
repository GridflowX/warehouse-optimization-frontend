// Individual Warehouse Node Component for Graph Visualization

import React from 'react';
import { Coordinate } from '@/types/api';
import { cn } from '@/lib/utils';

interface WarehouseNodeProps {
  warehouse: Coordinate;
  onClick: (warehouseId: string) => void;
  selected?: boolean;
  bounds: { minX: number; minY: number; width: number; height: number };
  containerSize: { width: number; height: number };
}

export const WarehouseNode: React.FC<WarehouseNodeProps> = ({ 
  warehouse, 
  onClick, 
  selected = false,
  bounds,
  containerSize
}) => {
  // Calculate the position based on the SVG viewBox coordinate system
  const nodeSize = 32;
  const screenX = warehouse.x - (nodeSize / 2);
  const screenY = warehouse.y - (nodeSize / 2);

  return (
    <g transform={`translate(${warehouse.x}, ${warehouse.y})`}>
      <circle
        r="16"
        className={cn(
          'warehouse-node cursor-pointer',
          selected ? 'fill-primary stroke-primary-foreground stroke-2' : 'fill-primary stroke-primary-foreground stroke-1'
        )}
        onClick={() => onClick(warehouse.id)}
      />
      <text
        x="0"
        y="0"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-bold fill-primary-foreground pointer-events-none"
        onClick={() => onClick(warehouse.id)}
      >
        {warehouse.id}
      </text>
      <title>{`Warehouse ${warehouse.id} (${warehouse.x}, ${warehouse.y})`}</title>
    </g>
  );
};