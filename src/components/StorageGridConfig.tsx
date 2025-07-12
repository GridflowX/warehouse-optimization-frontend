import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Save, Play, Package, FileText, Shuffle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchPackagingData, fetchRetrievalData, saveConfiguration, sendPackConfiguration } from '@/services/api';
import { StorageConfig, AlgorithmData, DataMode } from '@/types/warehouse';
import { useFileHandling } from '@/hooks/useFileHandling';
import { generateRandomWarehouseData, createDataFiles } from '@/services/dataGeneration';

interface StorageGridConfigProps {
  onConfigSave: (config: StorageConfig) => void;
  onAnimateRetrieval: () => void;
  onPackagingData?: (data: AlgorithmData) => void;
  onRetrievalData?: (data: AlgorithmData) => void;
}

export const StorageGridConfig: React.FC<StorageGridConfigProps> = ({
  onConfigSave,
  onAnimateRetrieval,
  onPackagingData,
  onRetrievalData
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
  const [dataMode, setDataMode] = useState<DataMode | '' | 'expanded'>('');
  const [isSaving, setIsSaving] = useState(false);

  const {
    packagingFile,
    retrievalFile,
    setPackagingFile,
    setRetrievalFile,
    handlePackagingFileChange,
    handleRetrievalFileChange
  } = useFileHandling(onPackagingData, onRetrievalData);

  const handleInputChange = (field: keyof StorageConfig, value: number) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const generateRandomData = () => {
    const { packagingData, retrievalData, packedCount } = generateRandomWarehouseData(config);
    const { packagingFile, retrievalFile } = createDataFiles(packagingData, retrievalData);
    
    setPackagingFile(packagingFile);
    setRetrievalFile(retrievalFile);
    setConfig(prev => ({ ...prev, boxData: packagingFile }));
    
    // Pass both datasets to the parent components
    onPackagingData?.(packagingData);
    onRetrievalData?.(retrievalData);
    
    toast({
      title: "Random data generated",
      description: `Generated ${packagingData.length} boxes, ${packedCount} successfully placed with optimized retrieval paths.`
    });
  };

  const handleDataModeChange = (value: DataMode) => {
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
    setIsSaving(true);
    try {
      // If no packaging file uploaded, fetch from server
      if (!packagingFile) {
        const packagingData = await fetchPackagingData();
        onPackagingData?.(packagingData);
        console.log('Fetched packaging data:', packagingData);
      }

      // Send configuration to server
      const configToSave = {
        ...config,
        packagingFile: packagingFile?.name,
        retrievalFile: retrievalFile?.name
      };
      
      await saveConfiguration(configToSave);
      
      // Send configuration to pack endpoint with required format
      const packConfig = {
        storage_width: config.storageWidth,
        storage_length: config.storageLength,
        num_rects: config.numberOfRectangles,
        min_side: config.minimumSideLength,
        max_side: config.maximumSideLength,
        clearance: config.clearance
      };
      
      const packResponse = await sendPackConfiguration(packConfig);
      
      console.log('Full pack response:', packResponse);
      
      // Handle the new response format - direct array of boxes
      if (packResponse && Array.isArray(packResponse)) {
        console.log('Pack response boxes count:', packResponse.length);
        console.log('Pack response boxes:', packResponse);
        
        // Transform the new format to match our expected AlgorithmData format
        const transformedBoxes = packResponse.map(box => ({
          index: box.id,
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
          packed: true, // All boxes in response are packed
          retrieval_order: null, // Not provided in new format
          path: box.retrieval_path || null
        }));
        
        onPackagingData?.(transformedBoxes);
        
        // For retrieval data, we can use the same transformed data
        // since retrieval_path is included in each box
        onRetrievalData?.(transformedBoxes);
      } else {
        console.log('No valid boxes found in pack response');
      }
      
      onConfigSave(config);
      
      toast({
        title: "Configuration Saved",
        description: `Storage grid configuration has been updated and sent to server. ${Array.isArray(packResponse) ? packResponse.length : 0} boxes processed with new format.`
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save configuration to server.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnimateRetrieval = async () => {
    try {
      // If no retrieval file uploaded, fetch from server
      if (!retrievalFile) {
        const retrievalData = await fetchRetrievalData();
        onRetrievalData?.(retrievalData);
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
        {/* Data Input Mode */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setDataMode(dataMode === '' ? 'expanded' : '')}>
            <Label>Data Input Mode</Label>
            <div className={`transition-transform ${dataMode === 'expanded' ? 'rotate-90' : ''}`}>
              ▶
            </div>
          </div>
          {dataMode === 'expanded' && (
            <div className="space-y-3 pl-4 border-l-2 border-muted">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleDataModeChange('upload-packaging')}
              >
                <Package className="w-4 h-4 mr-2" />
                Upload Packaging JSON
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleDataModeChange('upload-retrieval')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Upload Retrieval JSON
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleDataModeChange('random')}
              >
                <Shuffle className="w-4 h-4 mr-2" />
                Generate Random Data
              </Button>
              
              {/* File Status Display */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <div className="flex items-center gap-2">
                    <Package className="w-3 h-3" />
                    <span className="text-xs font-medium">Packaging:</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {packagingFile ? packagingFile.name : 'None'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3 h-3" />
                    <span className="text-xs font-medium">Retrieval:</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {retrievalFile ? retrievalFile.name : 'None'}
                  </span>
                </div>
              </div>
            </div>
          )}
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
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="ml-2">Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Configuration
              </>
            )}
          </Button>

          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Width and Length define the warehouse dimensions</p>
            <p>• Number of Rectangles determines storage bin count</p>
            <p>• Min/Max Side control individual bin sizes</p>
            <p>• Clearance ensures boxes do not touch</p>
          </div>

        </div>
      </CardContent>
    </Card>
  );
};