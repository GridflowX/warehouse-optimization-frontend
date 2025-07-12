import React from 'react';
import { NeomorphicIcon } from '@/components/NeomorphicIcon';
import { Package, Route, Truck } from 'lucide-react';

interface WarehouseStatsProps {
  gridPositions: Array<{ id: string; x: number; y: number; side: string }>;
  routePath: Array<{ x: number; y: number }>;
  solveTime?: number;
  totalBoxes?: number;
  spaceEfficiency?: number;
  timeEfficiency?: number;
}

export const WarehouseStats: React.FC<WarehouseStatsProps> = ({ 
  gridPositions, 
  routePath,
  solveTime = 2.5,
  totalBoxes = 0,
  spaceEfficiency = 85,
  timeEfficiency = 92
}) => {
  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="text-center p-4 rounded-lg border bg-card">
        <NeomorphicIcon className="mx-auto mb-2">
          <Package className="w-5 h-5" />
        </NeomorphicIcon>
        <div className="text-xl font-bold">{solveTime}s</div>
        <div className="text-sm text-muted-foreground">Solved in</div>
      </div>
      <div className="text-center p-4 rounded-lg border bg-card">
        <NeomorphicIcon className="mx-auto mb-2">
          <Route className="w-5 h-5" />
        </NeomorphicIcon>
        <div className="text-xl font-bold">{totalBoxes || gridPositions.length}</div>
        <div className="text-sm text-muted-foreground">Boxes Packed</div>
      </div>
      <div className="text-center p-4 rounded-lg border bg-card">
        <NeomorphicIcon className="mx-auto mb-2">
          <Truck className="w-5 h-5" />
        </NeomorphicIcon>
        <div className="text-xl font-bold">{spaceEfficiency}%</div>
        <div className="text-sm text-muted-foreground">Space Efficiency</div>
      </div>
      <div className="text-center p-4 rounded-lg border bg-card">
        <div className="text-xl font-bold">{timeEfficiency}%</div>
        <div className="text-sm text-muted-foreground">Time Efficiency</div>
      </div>
    </div>
  );
};