import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Upload, Save, Play, Package, FileText, Shuffle } from 'lucide-react';
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
  const [dataMode, setDataMode] = useState<string>('');

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
        
        // Validate the data structure for packaging
        if (Array.isArray(data) && data.every(item => 
          typeof item.index === 'number' && 
          typeof item.width === 'number' && 
          typeof item.height === 'number' && 
          typeof item.x === 'number' && 
          typeof item.y === 'number' && 
          typeof item.packed === 'boolean'
        )) {
          onAlgorithmData?.(data);
          toast({
            title: "Packaging data loaded",
            description: `Successfully loaded ${data.length} boxes.`
          });
        } else {
          throw new Error('Invalid packaging data format');
        }
        
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

  const generateRandomData = () => {
    const packagingData: AlgorithmData = [];
    const retrievalData: AlgorithmData = [];
    const placedBoxes: { x: number; y: number; width: number; height: number }[] = [];
    
    // Helper function to check if two rectangles overlap with clearance
    const hasOverlap = (box1: any, box2: any, clearance: number) => {
      return !(
        box1.x + box1.width + clearance <= box2.x ||
        box2.x + box2.width + clearance <= box1.x ||
        box1.y + box1.height + clearance <= box2.y ||
        box2.y + box2.height + clearance <= box1.y
      );
    };
    
    // Helper function to find a valid position for a box
    const findValidPosition = (width: number, height: number, maxAttempts = 100) => {
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const x = Math.floor(Math.random() * Math.max(1, config.storageWidth - width - config.clearance));
        const y = Math.floor(Math.random() * Math.max(1, config.storageLength - height - config.clearance));
        
        const newBox = { x, y, width, height };
        
        // Check if this position overlaps with any existing box (including clearance)
        const hasCollision = placedBoxes.some(placedBox => 
          hasOverlap(newBox, placedBox, config.clearance)
        );
        
        if (!hasCollision) {
          return { x, y };
        }
      }
      return null; // Could not find valid position
    };
    
    console.log(`Generating random data with ${config.clearance}mm clearance...`);
    
    let packedCount = 0;
    for (let i = 0; i < config.numberOfRectangles && packedCount < config.numberOfRectangles; i++) {
      const width = Math.floor(Math.random() * (config.maximumSideLength - config.minimumSideLength + 1)) + config.minimumSideLength;
      const height = Math.floor(Math.random() * (config.maximumSideLength - config.minimumSideLength + 1)) + config.minimumSideLength;
      
      const position = findValidPosition(width, height);
      
      if (position) {
        const { x, y } = position;
        
        // Generate shortest path to nearest edge
        const distanceToLeft = x;
        const distanceToRight = config.storageWidth - (x + width);
        const distanceToBottom = y;
        const distanceToTop = config.storageLength - (y + height);
        
        const minDistance = Math.min(distanceToLeft, distanceToRight, distanceToBottom, distanceToTop);
        
        let exitX, exitY;
        if (minDistance === distanceToLeft) {
          exitX = -50; // Exit left
          exitY = y + height / 2;
        } else if (minDistance === distanceToRight) {
          exitX = config.storageWidth + 50; // Exit right
          exitY = y + height / 2;
        } else if (minDistance === distanceToBottom) {
          exitX = x + width / 2;
          exitY = -50; // Exit bottom
        } else {
          exitX = x + width / 2;
          exitY = config.storageLength + 50; // Exit top
        }
        
        const box: AlgorithmBox = {
          index: i,
          width,
          height,
          x,
          y,
          packed: true,
          retrieval_order: packedCount + 1,
          path: [
            { step: 0, x, y },
            { step: 1, x: x + width / 2, y: y + height / 2 },
            { step: 2, x: exitX, y: exitY }
          ]
        };
        
        packagingData.push(box);
        retrievalData.push(box);
        placedBoxes.push({ x, y, width, height });
        packedCount++;
        
        console.log(`Placed box ${i}: ${width}x${height} at (${x},${y})`);
      } else {
        // Could not place box - mark as unpacked
        const box: AlgorithmBox = {
          index: i,
          width,
          height,
          x: 0,
          y: 0,
          packed: false,
          retrieval_order: 0,
          path: []
        };
        
        packagingData.push(box);
        console.log(`Could not place box ${i}: ${width}x${height} - marked as unpacked`);
      }
    }
    
    console.log(`Successfully placed ${packedCount} out of ${config.numberOfRectangles} boxes`);
    
    // Create blob files
    const packagingBlob = new Blob([JSON.stringify(packagingData, null, 2)], { type: 'application/json' });
    const retrievalBlob = new Blob([JSON.stringify(retrievalData, null, 2)], { type: 'application/json' });
    
    const packagingFile = new File([packagingBlob], 'packaging.json', { type: 'application/json' });
    const retrievalFile = new File([retrievalBlob], 'retrieval.json', { type: 'application/json' });
    
    setPackagingFile(packagingFile);
    setRetrievalFile(retrievalFile);
    setConfig(prev => ({ ...prev, boxData: packagingFile }));
    
    onAlgorithmData?.(packagingData);
    
    toast({
      title: "Random data generated",
      description: `Generated ${packagingData.length} boxes, ${packedCount} successfully placed with ${config.clearance}mm clearance.`
    });
  };

  const handleDataModeChange = (value: string) => {
    setDataMode(value);
    
    if (value === 'upload-packaging') {
      document.getElementById('packaging-data')?.click();
    } else if (value === 'upload-retrieval') {
      document.getElementById('retrieval-data')?.click();
    } else if (value === 'random') {
      generateRandomData();
    }
  };

  const handleSaveConfiguration = async () => {
    try {
      // If no packaging file uploaded, fetch from server
      if (!packagingFile) {
        const packagingData = await fetchPackagingData();
        onAlgorithmData?.(packagingData);
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
        {/* Data Mode Selection */}
        <div className="space-y-2">
          <Label htmlFor="data-mode">Data Input Mode</Label>
          <Select value={dataMode} onValueChange={handleDataModeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select how to input data" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upload-packaging">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Upload Packaging JSON
                </div>
              </SelectItem>
              <SelectItem value="upload-retrieval">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Upload Retrieval JSON
                </div>
              </SelectItem>
              <SelectItem value="random">
                <div className="flex items-center gap-2">
                  <Shuffle className="w-4 h-4" />
                  Generate Random Data
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* File Status Display */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span className="text-sm font-medium">Packaging File:</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {packagingFile ? packagingFile.name : 'No file selected'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">Retrieval File:</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {retrievalFile ? retrievalFile.name : 'No file selected'}
            </span>
          </div>
        </div>

        {/* Hidden file inputs */}
        <input
          id="packaging-data"
          type="file"
          accept=".csv,.json"
          onChange={handlePackagingFileChange}
          className="hidden"
        />
        <input
          id="retrieval-data"
          type="file"
          accept=".csv,.json"
          onChange={handleRetrievalFileChange}
          className="hidden"
        />

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