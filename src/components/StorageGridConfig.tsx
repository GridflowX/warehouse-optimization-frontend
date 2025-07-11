import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Upload, Save, Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StorageGridConfigProps {
  onConfigSave: (config: StorageConfig) => void;
  onAnimateRetrieval: () => void;
}

export interface StorageConfig {
  storageWidth: number;
  storageLength: number;
  numberOfRectangles: number;
  minimumSideLength: number;
  maximumSideLength: number;
  clearance: number;
  boxData?: File;
}

export const StorageGridConfig: React.FC<StorageGridConfigProps> = ({
  onConfigSave,
  onAnimateRetrieval
}) => {
  const { toast } = useToast();
  const [config, setConfig] = useState<StorageConfig>({
    storageWidth: 1000,
    storageLength: 2000,
    numberOfRectangles: 50,
    minimumSideLength: 50,
    maximumSideLength: 200,
    clearance: 20
  });
  const [boxDataFile, setBoxDataFile] = useState<File | null>(null);

  const handleInputChange = (field: keyof StorageConfig, value: number) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBoxDataFile(file);
      setConfig(prev => ({ ...prev, boxData: file }));
    }
  };

  const handleSaveConfiguration = () => {
    onConfigSave(config);
    toast({
      title: "Configuration Saved",
      description: "Storage grid configuration has been updated successfully."
    });
  };

  const handleAnimateRetrieval = () => {
    onAnimateRetrieval();
    toast({
      title: "Animation Started",
      description: "Retrieval path animation is now running."
    });
  };

  const maxAllowed = Math.floor((config.storageWidth * config.storageLength) / 
    (config.minimumSideLength * config.minimumSideLength));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Storage Grid Configuration
        </CardTitle>
        <CardDescription>
          Configure warehouse storage parameters and run optimization algorithms
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="box-data">Upload CSV or JSON with box data:</Label>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => document.getElementById('box-data')?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Choose file
            </Button>
            <span className="text-sm text-muted-foreground">
              {boxDataFile ? boxDataFile.name : 'No file chosen'}
            </span>
            <input
              id="box-data"
              type="file"
              accept=".csv,.json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Storage Width */}
        <div className="space-y-2">
          <Label htmlFor="storage-width">Storage Width (cm)</Label>
          <Input
            id="storage-width"
            type="number"
            value={config.storageWidth}
            onChange={(e) => handleInputChange('storageWidth', Number(e.target.value))}
            className="bg-muted"
          />
        </div>

        {/* Storage Length */}
        <div className="space-y-2">
          <Label htmlFor="storage-length">Storage Length (cm)</Label>
          <Input
            id="storage-length"
            type="number"
            value={config.storageLength}
            onChange={(e) => handleInputChange('storageLength', Number(e.target.value))}
            className="bg-muted"
          />
        </div>

        {/* Number of Rectangles */}
        <div className="space-y-2">
          <Label htmlFor="num-rectangles">Number of Rectangles</Label>
          <Input
            id="num-rectangles"
            type="number"
            value={config.numberOfRectangles}
            onChange={(e) => handleInputChange('numberOfRectangles', Number(e.target.value))}
            className="bg-muted"
          />
          <p className="text-sm text-muted-foreground">
            Max allowed: {maxAllowed}
          </p>
        </div>

        {/* Minimum Side Length */}
        <div className="space-y-2">
          <Label htmlFor="min-side">Minimum Side Length (cm)</Label>
          <Input
            id="min-side"
            type="number"
            value={config.minimumSideLength}
            onChange={(e) => handleInputChange('minimumSideLength', Number(e.target.value))}
            className="bg-muted"
          />
        </div>

        {/* Maximum Side Length */}
        <div className="space-y-2">
          <Label htmlFor="max-side">Maximum Side Length (cm)</Label>
          <Input
            id="max-side"
            type="number"
            value={config.maximumSideLength}
            onChange={(e) => handleInputChange('maximumSideLength', Number(e.target.value))}
            className="bg-muted"
          />
        </div>

        {/* Clearance */}
        <div className="space-y-2">
          <Label htmlFor="clearance">Clearance (cm)</Label>
          <Input
            id="clearance"
            type="number"
            value={config.clearance}
            onChange={(e) => handleInputChange('clearance', Number(e.target.value))}
            className="bg-muted"
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleSaveConfiguration}
            className="w-full"
            size="lg"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Width and Length define the warehouse dimensions</p>
            <p>• Number of Rectangles determines storage bin count</p>
            <p>• Min/Max Side control individual bin sizes</p>
            <p>• Clearance ensures boxes do not touch</p>
          </div>

          <Button 
            onClick={handleAnimateRetrieval}
            variant="secondary"
            className="w-full"
            size="lg"
          >
            <Play className="w-4 h-4 mr-2" />
            Animate Retrieval Path
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};