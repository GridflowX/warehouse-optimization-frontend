import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Upload, Save, Play, Package, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchPackagingData, fetchRetrievalData, saveConfiguration } from '@/services/api';

// Types for the algorithm data
export interface AlgorithmStep {
  step: number;
  x: number;
  y: number;
}

export interface AlgorithmBox {
  index: number;
  width: number;
  height: number;
  x: number;
  y: number;
  packed: boolean;
  retrieval_order?: number;
  path?: AlgorithmStep[];
}

export type AlgorithmData = AlgorithmBox[];

interface StorageGridConfigProps {
  onConfigSave: (config: StorageConfig) => void;
  onAnimateRetrieval: () => void;
  onAlgorithmData?: (data: AlgorithmData) => void;
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
  onAnimateRetrieval,
  onAlgorithmData
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
  const [packagingFile, setPackagingFile] = useState<File | null>(null);
  const [retrievalFile, setRetrievalFile] = useState<File | null>(null);

  const handleInputChange = (field: keyof StorageConfig, value: number) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handlePackagingFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPackagingFile(file);
      setConfig(prev => ({ ...prev, boxData: file }));
      
      try {
        const text = await file.text();
        let data: any;
        
        if (file.name.endsWith('.json')) {
          data = JSON.parse(text);
        } else if (file.name.endsWith('.csv')) {
          toast({
            title: "CSV parsing not implemented",
            description: "Please use JSON format for packaging data.",
            variant: "destructive"
          });
          return;
        } else {
          throw new Error('Unsupported file format');
        }
        
        toast({
          title: "Packaging data loaded",
          description: `Successfully loaded packaging configuration.`
        });
      } catch (error) {
        console.error('Packaging file parsing error:', error);
        toast({
          title: "File parsing error",
          description: "Invalid JSON format or unsupported file type. Please check your packaging file.",
          variant: "destructive"
        });
      }
    }
  };

  const handleRetrievalFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setRetrievalFile(file);
      
      try {
        const text = await file.text();
        let data: AlgorithmData;
        
        if (file.name.endsWith('.json')) {
          data = JSON.parse(text);
        } else if (file.name.endsWith('.csv')) {
          toast({
            title: "CSV parsing not implemented",
            description: "Please use JSON format for retrieval data.",
            variant: "destructive"
          });
          return;
        } else {
          throw new Error('Unsupported file format');
        }
        
        // Validate the data structure
        if (Array.isArray(data) && data.every(item => 
          typeof item.index === 'number' && 
          typeof item.retrieval_order === 'number' && 
          Array.isArray(item.path) &&
          item.path.every(step => 
            typeof step.step === 'number' &&
            typeof step.x === 'number' &&
            typeof step.y === 'number'
          )
        )) {
          onAlgorithmData?.(data);
          toast({
            title: "Retrieval data loaded",
            description: `Successfully loaded ${data.length} boxes for animation.`
          });
        } else {
          throw new Error('Invalid retrieval data format');
        }
      } catch (error) {
        console.error('Retrieval file parsing error:', error);
        toast({
          title: "File parsing error",
          description: "Invalid retrieval data format. Expected array of boxes with index, retrieval_order, and path properties.",
          variant: "destructive"
        });
      }
    }
  };

  const handleSaveConfiguration = async () => {
    try {
      // If no packaging file uploaded, fetch from server
      if (!packagingFile) {
        const packagingData = await fetchPackagingData();
        // Process packaging data and set up grid
        console.log('Fetched packaging data:', packagingData);
      }

      // Send configuration to server
      const configToSave = {
        ...config,
        packagingFile: packagingFile?.name,
        retrievalFile: retrievalFile?.name
      };
      
      await saveConfiguration(configToSave);
      onConfigSave(config);
      
      toast({
        title: "Configuration Saved",
        description: "Storage grid configuration has been updated and sent to server."
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save configuration to server.",
        variant: "destructive"
      });
    }
  };

  const handleAnimateRetrieval = async () => {
    try {
      // If no retrieval file uploaded, fetch from server
      if (!retrievalFile) {
        const retrievalData = await fetchRetrievalData();
        onAlgorithmData?.(retrievalData);
        toast({
          title: "Retrieval data loaded",
          description: `Successfully loaded ${retrievalData.length} boxes for animation.`
        });
      }

      onAnimateRetrieval();
      toast({
        title: "Animation Started",
        description: "Retrieval path animation is now running."
      });
    } catch (error) {
      toast({
        title: "Animation Failed",
        description: "Failed to load retrieval data from server.",
        variant: "destructive"
      });
    }
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
        {/* Packaging File Upload */}
        <div className="space-y-2">
          <Label htmlFor="packaging-data" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Upload Packaging JSON or CSV:
          </Label>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => document.getElementById('packaging-data')?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Choose packaging file
            </Button>
            <span className="text-sm text-muted-foreground">
              {packagingFile ? packagingFile.name : 'No packaging file chosen'}
            </span>
            <input
              id="packaging-data"
              type="file"
              accept=".csv,.json"
              onChange={handlePackagingFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Retrieval File Upload */}
        <div className="space-y-2">
          <Label htmlFor="retrieval-data" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Upload Retrieval JSON or CSV:
          </Label>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => document.getElementById('retrieval-data')?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Choose retrieval file
            </Button>
            <span className="text-sm text-muted-foreground">
              {retrievalFile ? retrievalFile.name : 'No retrieval file chosen'}
            </span>
            <input
              id="retrieval-data"
              type="file"
              accept=".csv,.json"
              onChange={handleRetrievalFileChange}
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