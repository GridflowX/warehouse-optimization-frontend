import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { NeomorphicIcon } from '@/components/NeomorphicIcon';
import { ArrowLeft, Package } from 'lucide-react';

interface WarehouseHeaderProps {
  warehouseId: string;
}

export const WarehouseHeader: React.FC<WarehouseHeaderProps> = ({ warehouseId }) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/');
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-start mb-6">
        <Button
          variant="outline"
          onClick={handleBackClick}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Network
        </Button>
      </div>
      
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <NeomorphicIcon>
            <Package className="w-6 h-6" />
          </NeomorphicIcon>
        </div>
        <h1 className="text-3xl font-bold mb-2">
          Warehouse {warehouseId}
        </h1>
        <p className="text-muted-foreground">
          Internal operations and routing visualization
        </p>
      </div>
    </div>
  );
};