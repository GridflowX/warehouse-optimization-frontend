// Individual Warehouse Node Component for Graph Visualization

import React from 'react';
import { Coordinate } from '@/types/api';
import { cn } from '@/lib/utils';

interface WarehouseNodeProps {
  warehouse: Coordinate;
  onClick: (warehouseId: string) => void;
  selected?: boolean;
}

export const WarehouseNode: React.FC<WarehouseNodeProps> = ({ 
  warehouse, 
  onClick, 
  selected = false 
}) => {
  return (
    <div
      className={cn(
        'warehouse-node',
        selected && 'ring-2 ring-primary ring-offset-2'
      )}
      style={{
        position: 'absolute',
        left: warehouse.x - 16, // Center the 32px node
        top: warehouse.y - 16,
        transform: 'translate(0, 0)'
      }}
      onClick={() => onClick(warehouse.id)}
      title={`Warehouse ${warehouse.id}`}
    >
      <span className="text-xs font-bold text-primary-foreground">
        {warehouse.id}
      </span>
    </div>
  );
};