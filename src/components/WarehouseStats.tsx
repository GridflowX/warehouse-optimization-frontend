import React from 'react';
import { NeomorphicIcon } from '@/components/NeomorphicIcon';
import { Package, Route, Truck } from 'lucide-react';

interface WarehouseStatsProps {
  gridPositions: Array<{ id: string; x: number; y: number; side: string }>;
  routePath: Array<{ x: number; y: number }>;
}

export const WarehouseStats: React.FC<WarehouseStatsProps> = ({ 
  gridPositions, 
  routePath 
}) => {
  return (
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
  );
};