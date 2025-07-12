import { useState } from 'react';
import { AlgorithmData } from '@/types/warehouse';
import { useToast } from '@/hooks/use-toast';

export const useFileHandling = (onAlgorithmData?: (data: AlgorithmData) => void) => {
  const { toast } = useToast();
  const [packagingFile, setPackagingFile] = useState<File | null>(null);
  const [retrievalFile, setRetrievalFile] = useState<File | null>(null);

  const validatePackagingData = (data: any): boolean => {
    return Array.isArray(data) && data.every(item => 
      typeof item.index === 'number' && 
      typeof item.width === 'number' && 
      typeof item.height === 'number' && 
      typeof item.x === 'number' && 
      typeof item.y === 'number' && 
      typeof item.packed === 'boolean'
    );
  };

  const validateRetrievalData = (data: any): boolean => {
    return Array.isArray(data) && data.every(item => 
      typeof item.index === 'number' && 
      typeof item.retrieval_order === 'number' && 
      Array.isArray(item.path) &&
      item.path.every((step: any) => 
        typeof step.step === 'number' &&
        typeof step.x === 'number' &&
        typeof step.y === 'number'
      )
    );
  };

  const handlePackagingFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setPackagingFile(file);
    
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
      
      if (validatePackagingData(data)) {
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
  };

  const handleRetrievalFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
      
      if (validateRetrievalData(data)) {
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
  };

  return {
    packagingFile,
    retrievalFile,
    setPackagingFile,
    setRetrievalFile,
    handlePackagingFileChange,
    handleRetrievalFileChange
  };
};