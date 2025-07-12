import { AlgorithmData, AlgorithmBox, StorageConfig } from '@/types/warehouse';
import { hasOverlap } from '@/utils/gridUtils';

/**
 * Strategic box placement zones for optimal retrieval
 */
type PlacementZone = {
  name: string;
  priority: number; // Higher = placed first (easier to retrieve)
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
  retrievalDifficulty: number; // 1-5 scale
};

/**
 * Calculate strategic zones based on warehouse dimensions
 */
const calculateStrategicZones = (config: StorageConfig): PlacementZone[] => {
  const { storageWidth, storageLength } = config;
  const margin = Math.min(storageWidth, storageLength) * 0.1; // 10% margin

  return [
    // Edge zones (easiest to retrieve)
    {
      name: 'leftEdge',
      priority: 5,
      bounds: { minX: 0, maxX: margin, minY: 0, maxY: storageLength },
      retrievalDifficulty: 1
    },
    {
      name: 'rightEdge', 
      priority: 5,
      bounds: { minX: storageWidth - margin, maxX: storageWidth, minY: 0, maxY: storageLength },
      retrievalDifficulty: 1
    },
    {
      name: 'topEdge',
      priority: 4,
      bounds: { minX: margin, maxX: storageWidth - margin, minY: storageLength - margin, maxY: storageLength },
      retrievalDifficulty: 2
    },
    {
      name: 'bottomEdge',
      priority: 4,
      bounds: { minX: margin, maxX: storageWidth - margin, minY: 0, maxY: margin },
      retrievalDifficulty: 2
    },
    // Corner zones (moderate difficulty)
    {
      name: 'corners',
      priority: 3,
      bounds: { minX: margin, maxX: storageWidth - margin, minY: margin, maxY: storageLength - margin },
      retrievalDifficulty: 3
    },
    // Inner zones (hardest to retrieve)
    {
      name: 'inner',
      priority: 1,
      bounds: { 
        minX: storageWidth * 0.3, 
        maxX: storageWidth * 0.7, 
        minY: storageLength * 0.3, 
        maxY: storageLength * 0.7 
      },
      retrievalDifficulty: 5
    }
  ];
};

/**
 * Find a valid position within a specific zone
 */
const findValidPositionInZone = (
  width: number,
  height: number,
  zone: PlacementZone,
  config: StorageConfig,
  placedBoxes: { x: number; y: number; width: number; height: number }[],
  maxAttempts: number = 50
): { x: number; y: number } | null => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const x = Math.floor(
      Math.random() * Math.max(1, zone.bounds.maxX - zone.bounds.minX - width - config.clearance)
    ) + zone.bounds.minX;
    
    const y = Math.floor(
      Math.random() * Math.max(1, zone.bounds.maxY - zone.bounds.minY - height - config.clearance)
    ) + zone.bounds.minY;
    
    // Ensure box fits within warehouse bounds
    if (x + width > config.storageWidth || y + height > config.storageLength) {
      continue;
    }
    
    const newBox = { x, y, width, height };
    
    // Check if this position overlaps with any existing box (including clearance)
    const hasCollision = placedBoxes.some(placedBox => 
      hasOverlap(newBox, placedBox, config.clearance)
    );
    
    if (!hasCollision) {
      return { x, y };
    }
  }
  return null;
};

/**
 * Calculate distance to nearest exit point
 */
const calculateDistanceToExit = (
  box: { x: number; y: number; width: number; height: number },
  config: StorageConfig
): number => {
  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  
  const distanceToLeft = centerX;
  const distanceToRight = config.storageWidth - centerX;
  const distanceToTop = config.storageLength - centerY;
  const distanceToBottom = centerY;
  
  return Math.min(distanceToLeft, distanceToRight, distanceToTop, distanceToBottom);
};

/**
 * Generate optimal retrieval path based on box position and obstacles
 */
const generateOptimalRetrievalPath = (
  box: AlgorithmBox,
  allBoxes: AlgorithmBox[],
  config: StorageConfig,
  retrievalOrder: number
): { step: number; x: number; y: number }[] => {
  if (!box.packed) return [];
  
  const path: { step: number; x: number; y: number }[] = [];
  const boxCenterX = box.x + box.width / 2;
  const boxCenterY = box.y + box.height / 2;
  
  // Determine optimal exit direction
  const distanceToLeft = box.x;
  const distanceToRight = config.storageWidth - (box.x + box.width);
  const distanceToTop = config.storageLength - (box.y + box.height);
  const distanceToBottom = box.y;
  
  const minDistance = Math.min(distanceToLeft, distanceToRight, distanceToTop, distanceToBottom);
  
  let targetX: number, targetY: number;
  let exitDirection: string;
  
  if (minDistance === distanceToLeft) {
    targetX = -50;
    targetY = boxCenterY;
    exitDirection = 'left';
  } else if (minDistance === distanceToRight) {
    targetX = config.storageWidth + 50;
    targetY = boxCenterY;
    exitDirection = 'right';
  } else if (minDistance === distanceToBottom) {
    targetX = boxCenterX;
    targetY = -50;
    exitDirection = 'bottom';
  } else {
    targetX = boxCenterX;
    targetY = config.storageLength + 50;
    exitDirection = 'top';
  }
  
  // Start at box position
  path.push({ step: 0, x: box.x, y: box.y });
  
  // For boxes on edges, create simple direct path
  if (minDistance < config.clearance * 2) {
    path.push({ step: 1, x: targetX, y: targetY });
    return path;
  }
  
  // For inner boxes, create more complex navigation path
  let currentX = box.x;
  let currentY = box.y;
  let step = 1;
  
  // Get boxes that might still be in the way (those with higher retrieval order)
  const remainingBoxes = allBoxes.filter(b => 
    b.packed && b.retrieval_order > retrievalOrder && b.index !== box.index
  );
  
  // Navigate to clear corridor first
  const corridorSpace = config.clearance * 3;
  
  if (exitDirection === 'left' || exitDirection === 'right') {
    // Move vertically to find clear horizontal corridor
    const corridorY = findClearHorizontalCorridor(box, remainingBoxes, config, corridorSpace);
    if (corridorY !== currentY) {
      const steps = Math.abs(corridorY - currentY) / 50;
      for (let i = 1; i <= steps; i++) {
        currentY = currentY + (corridorY > currentY ? 50 : -50);
        path.push({ step: step++, x: currentX, y: currentY });
      }
    }
    
    // Move horizontally to exit
    const horizontalSteps = Math.abs(targetX - currentX) / 50;
    for (let i = 1; i <= horizontalSteps; i++) {
      currentX = currentX + (targetX > currentX ? 50 : -50);
      path.push({ step: step++, x: currentX, y: currentY });
    }
  } else {
    // Move horizontally to find clear vertical corridor
    const corridorX = findClearVerticalCorridor(box, remainingBoxes, config, corridorSpace);
    if (corridorX !== currentX) {
      const steps = Math.abs(corridorX - currentX) / 50;
      for (let i = 1; i <= steps; i++) {
        currentX = currentX + (corridorX > currentX ? 50 : -50);
        path.push({ step: step++, x: currentX, y: currentY });
      }
    }
    
    // Move vertically to exit
    const verticalSteps = Math.abs(targetY - currentY) / 50;
    for (let i = 1; i <= verticalSteps; i++) {
      currentY = currentY + (targetY > currentY ? 50 : -50);
      path.push({ step: step++, x: currentX, y: currentY });
    }
  }
  
  return path;
};

/**
 * Find a clear horizontal corridor for navigation
 */
const findClearHorizontalCorridor = (
  box: AlgorithmBox,
  obstacles: AlgorithmBox[],
  config: StorageConfig,
  corridorSpace: number
): number => {
  const preferredY = box.y + box.height / 2;
  
  // Check if current Y position is clear
  if (isHorizontalCorridorClear(preferredY, box, obstacles, corridorSpace)) {
    return preferredY;
  }
  
  // Search for clear corridor above and below
  for (let offset = corridorSpace; offset < config.storageLength / 2; offset += 50) {
    const upperY = Math.min(config.storageLength - corridorSpace, preferredY + offset);
    const lowerY = Math.max(corridorSpace, preferredY - offset);
    
    if (isHorizontalCorridorClear(upperY, box, obstacles, corridorSpace)) {
      return upperY;
    }
    if (isHorizontalCorridorClear(lowerY, box, obstacles, corridorSpace)) {
      return lowerY;
    }
  }
  
  return preferredY; // Fallback to original position
};

/**
 * Find a clear vertical corridor for navigation
 */
const findClearVerticalCorridor = (
  box: AlgorithmBox,
  obstacles: AlgorithmBox[],
  config: StorageConfig,
  corridorSpace: number
): number => {
  const preferredX = box.x + box.width / 2;
  
  // Check if current X position is clear
  if (isVerticalCorridorClear(preferredX, box, obstacles, corridorSpace)) {
    return preferredX;
  }
  
  // Search for clear corridor left and right
  for (let offset = corridorSpace; offset < config.storageWidth / 2; offset += 50) {
    const rightX = Math.min(config.storageWidth - corridorSpace, preferredX + offset);
    const leftX = Math.max(corridorSpace, preferredX - offset);
    
    if (isVerticalCorridorClear(rightX, box, obstacles, corridorSpace)) {
      return rightX;
    }
    if (isVerticalCorridorClear(leftX, box, obstacles, corridorSpace)) {
      return leftX;
    }
  }
  
  return preferredX; // Fallback to original position
};

/**
 * Check if horizontal corridor is clear of obstacles
 */
const isHorizontalCorridorClear = (
  y: number,
  movingBox: AlgorithmBox,
  obstacles: AlgorithmBox[],
  corridorSpace: number
): boolean => {
  const corridorBounds = {
    x: 0,
    y: y - corridorSpace / 2,
    width: movingBox.x + movingBox.width,
    height: corridorSpace
  };
  
  return !obstacles.some(obstacle => 
    hasOverlap(corridorBounds, obstacle, 0)
  );
};

/**
 * Check if vertical corridor is clear of obstacles
 */
const isVerticalCorridorClear = (
  x: number,
  movingBox: AlgorithmBox,
  obstacles: AlgorithmBox[],
  corridorSpace: number
): boolean => {
  const corridorBounds = {
    x: x - corridorSpace / 2,
    y: 0,
    width: corridorSpace,
    height: movingBox.y + movingBox.height
  };
  
  return !obstacles.some(obstacle => 
    hasOverlap(corridorBounds, obstacle, 0)
  );
};

/**
 * Optimize retrieval order based on accessibility
 */
const optimizeRetrievalOrder = (
  boxes: AlgorithmBox[],
  config: StorageConfig
): AlgorithmBox[] => {
  const packedBoxes = boxes.filter(box => box.packed);
  
  // Score each box based on retrieval difficulty
  const scoredBoxes = packedBoxes.map(box => {
    const distanceToExit = calculateDistanceToExit(box, config);
    const accessibilityScore = 1 / (distanceToExit + 1);
    
    // Count how many other boxes would block this box
    const blockingBoxes = packedBoxes.filter(otherBox => {
      if (otherBox.index === box.index) return false;
      
      // Simple blocking check: if other box is between this box and nearest exit
      const boxCenterX = box.x + box.width / 2;
      const boxCenterY = box.y + box.height / 2;
      const otherCenterX = otherBox.x + otherBox.width / 2;
      const otherCenterY = otherBox.y + otherBox.height / 2;
      
      // Check if other box is in the path to exit
      const isBlocking = 
        (box.x < config.storageWidth / 2 && otherCenterX < boxCenterX) ||
        (box.x >= config.storageWidth / 2 && otherCenterX > boxCenterX) ||
        (box.y < config.storageLength / 2 && otherCenterY < boxCenterY) ||
        (box.y >= config.storageLength / 2 && otherCenterY > boxCenterY);
        
      return isBlocking;
    });
    
    const blockingPenalty = blockingBoxes.length * 0.1;
    const finalScore = accessibilityScore - blockingPenalty;
    
    return { box, score: finalScore };
  });
  
  // Sort by score (highest first = easiest to retrieve)
  scoredBoxes.sort((a, b) => b.score - a.score);
  
  // Assign optimized retrieval order
  return scoredBoxes.map((item, index) => ({
    ...item.box,
    retrieval_order: index + 1
  }));
};

/**
 * Generate random warehouse data with strategic placement and optimized retrieval
 */
export const generateRandomWarehouseData = (config: StorageConfig): {
  packagingData: AlgorithmData;
  retrievalData: AlgorithmData;
  packedCount: number;
} => {
  const packagingData: AlgorithmData = [];
  const retrievalData: AlgorithmData = [];
  const placedBoxes: { x: number; y: number; width: number; height: number }[] = [];
  
  console.log(`Generating strategic warehouse layout with ${config.clearance}mm clearance...`);
  
  // Calculate strategic zones
  const zones = calculateStrategicZones(config);
  zones.sort((a, b) => a.priority - b.priority); // Start with easier zones
  
  let packedCount = 0;
  let zoneIndex = 0;
  
  for (let i = 0; i < config.numberOfRectangles && packedCount < config.numberOfRectangles; i++) {
    const width = Math.floor(
      Math.random() * (config.maximumSideLength - config.minimumSideLength + 1)
    ) + config.minimumSideLength;
    
    const height = Math.floor(
      Math.random() * (config.maximumSideLength - config.minimumSideLength + 1)
    ) + config.minimumSideLength;
    
    let position: { x: number; y: number } | null = null;
    
    // Try to place in current zone first, then try others
    for (let j = 0; j < zones.length && !position; j++) {
      const currentZone = zones[(zoneIndex + j) % zones.length];
      position = findValidPositionInZone(width, height, currentZone, config, placedBoxes);
    }
    
    if (position) {
      const { x, y } = position;
      
      const box: AlgorithmBox = {
        index: i,
        width,
        height,
        x,
        y,
        packed: true,
        retrieval_order: 0, // Will be optimized later
        path: []
      };
      
      packagingData.push(box);
      placedBoxes.push({ x, y, width, height });
      packedCount++;
      
      console.log(`Strategically placed box ${i}: ${width}x${height} at (${x},${y})`);
      
      // Move to next zone after placing some boxes
      if (packedCount % Math.ceil(config.numberOfRectangles / zones.length) === 0) {
        zoneIndex = (zoneIndex + 1) % zones.length;
      }
    } else {
      // Could not place box - mark as unpacked
      const box: AlgorithmBox = {
        index: i,
        width,
        height,
        x: null,
        y: null,
        packed: false,
        retrieval_order: 0,
        path: []
      };
      
      packagingData.push(box);
      console.log(`Could not place box ${i}: ${width}x${height} - marked as unpacked`);
    }
  }
  
  console.log(`Successfully placed ${packedCount} out of ${config.numberOfRectangles} boxes`);
  
  if (packedCount > 0) {
    console.log('Optimizing retrieval order and generating intelligent paths...');
    
    // Optimize retrieval order
    const optimizedBoxes = optimizeRetrievalOrder(packagingData, config);
    
    // Generate optimal retrieval paths
    optimizedBoxes.forEach((box, index) => {
      if (box.packed) {
        packagingData[box.index] = box; // Update with optimized retrieval order
        
        const optimalPath = generateOptimalRetrievalPath(box, optimizedBoxes, config, box.retrieval_order);
        box.path = optimalPath;
        
        // Create retrieval data entry
        const retrievalBox: AlgorithmBox = {
          index: box.index,
          width: box.width,
          height: box.height,
          x: box.x,
          y: box.y,
          packed: box.packed,
          retrieval_order: box.retrieval_order,
          path: optimalPath
        };
        
        retrievalData.push(retrievalBox);
        console.log(`Generated optimized ${optimalPath.length}-step path for box ${box.index} (retrieval order: ${box.retrieval_order})`);
      }
    });
    
    // Sort retrieval data by retrieval order
    retrievalData.sort((a, b) => a.retrieval_order - b.retrieval_order);
  }
  
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