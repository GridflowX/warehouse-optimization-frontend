import { AlgorithmData, AlgorithmBox, StorageConfig } from '@/types/warehouse';
import { hasOverlap, calculateShortestPathToEdge } from '@/utils/gridUtils';

/**
 * Find a valid position for a box without overlaps
 */
const findValidPosition = (
  width: number,
  height: number,
  config: StorageConfig,
  placedBoxes: { x: number; y: number; width: number; height: number }[],
  maxAttempts: number = 100
): { x: number; y: number } | null => {
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

/**
 * Generate random warehouse data with proper collision detection
 */
export const generateRandomWarehouseData = (config: StorageConfig): {
  packagingData: AlgorithmData;
  retrievalData: AlgorithmData;
  packedCount: number;
} => {
  const packagingData: AlgorithmData = [];
  const retrievalData: AlgorithmData = [];
  const placedBoxes: { x: number; y: number; width: number; height: number }[] = [];
  
  console.log(`Generating random data with ${config.clearance}mm clearance...`);
  
  let packedCount = 0;
  
  for (let i = 0; i < config.numberOfRectangles && packedCount < config.numberOfRectangles; i++) {
    const width = Math.floor(
      Math.random() * (config.maximumSideLength - config.minimumSideLength + 1)
    ) + config.minimumSideLength;
    
    const height = Math.floor(
      Math.random() * (config.maximumSideLength - config.minimumSideLength + 1)
    ) + config.minimumSideLength;
    
    const position = findValidPosition(width, height, config, placedBoxes);
    
    if (position) {
      const { x, y } = position;
      
      // Generate shortest path to nearest edge
      const exitPoint = calculateShortestPathToEdge(
        { x, y, width, height },
        config.storageWidth,
        config.storageLength
      );
      
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
          { step: 2, x: exitPoint.x, y: exitPoint.y }
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
  
  return { packagingData, retrievalData, packedCount };
};

/**
 * Create blob files from data
 */
export const createDataFiles = (
  packagingData: AlgorithmData,
  retrievalData: AlgorithmData
): { packagingFile: File; retrievalFile: File } => {
  const packagingBlob = new Blob([JSON.stringify(packagingData, null, 2)], { type: 'application/json' });
  const retrievalBlob = new Blob([JSON.stringify(retrievalData, null, 2)], { type: 'application/json' });
  
  const packagingFile = new File([packagingBlob], 'packaging.json', { type: 'application/json' });
  const retrievalFile = new File([retrievalBlob], 'retrieval.json', { type: 'application/json' });
  
  return { packagingFile, retrievalFile };
};