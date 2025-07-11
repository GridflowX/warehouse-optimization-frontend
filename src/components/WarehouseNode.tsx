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
  // Convert warehouse coordinates to screen coordinates
  const scaleX = containerSize.width / bounds.width;
  const scaleY = containerSize.height / bounds.height;
  const scale = Math.min(scaleX, scaleY);
  
  const screenX = (warehouse.x - bounds.minX) * scale;
  const screenY = (warehouse.y - bounds.minY) * scale;

  return (
    <div
      className={cn(
        'warehouse-node',
        selected && 'ring-2 ring-primary ring-offset-2'
      )}
      style={{
        position: 'absolute',
        left: screenX - 16, // Center the 32px node
        top: screenY - 16,
        transform: 'translate(0, 0)'
      }}
      onClick={() => onClick(warehouse.id)}
      title={`Warehouse ${warehouse.id} (${warehouse.x}, ${warehouse.y})`}
    >
      <span className="text-xs font-bold text-primary-foreground">
        {warehouse.id}
      </span>
    </div>
  );
};