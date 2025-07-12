import { AlgorithmBox, GridDimensions } from '@/types/warehouse';

/**
 * Transform Y coordinate from bottom-left to top-left coordinate system
 */
export const transformY = (y: number, gridHeight: number): number => {
  return gridHeight - y;
};

/**
 * Calculate grid dimensions with padding
 */
export const calculateGridDimensions = (
  storageWidth: number,
  storageLength: number,
  boxes: AlgorithmBox[] = [],
  padding: number = 50
): GridDimensions => {
  let width = storageWidth;
  let height = storageLength;

  if (boxes.length > 0) {
    // Filter out boxes with null/undefined coordinates (unpacked boxes)
    const validBoxes = boxes.filter(box => 
      box.x !== null && box.x !== undefined && 
      box.y !== null && box.y !== undefined &&
      !isNaN(box.x) && !isNaN(box.y)
    );
    
    if (validBoxes.length > 0) {
      const maxX = Math.max(width, ...validBoxes.map(box => box.x + box.width)) + padding;
      const maxY = Math.max(height, ...validBoxes.map(box => box.y + box.height)) + padding;
      
      width = maxX;
      height = maxY;
    }
  }

  return { width, height };
};

/**
 * Calculate viewBox for SVG based on boxes and dimensions
 */
export const calculateViewBox = (
  boxes: any[],
  gridDimensions: GridDimensions,
  padding: number = 50
): string => {
  // Filter out boxes with null/undefined coordinates (unpacked boxes)
  const validBoxes = boxes.filter(box => 
    box.x !== null && box.x !== undefined && 
    box.y !== null && box.y !== undefined &&
    !isNaN(box.x) && !isNaN(box.y) &&
    box.width !== null && box.width !== undefined &&
    box.height !== null && box.height !== undefined &&
    !isNaN(box.width) && !isNaN(box.height)
  );
  
  if (validBoxes.length === 0) {
    return `0 0 ${gridDimensions.width} ${gridDimensions.height}`;
  }
  
  const minX = Math.min(0, ...validBoxes.map(box => box.x)) - padding;
  const minY = Math.min(0, ...validBoxes.map(box => box.y)) - padding;
  const maxX = Math.max(gridDimensions.width, ...validBoxes.map(box => box.x + box.width)) + padding;
  const maxY = Math.max(gridDimensions.height, ...validBoxes.map(box => box.y + box.height)) + padding;
  
  return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
};

/**
 * Check if two rectangles overlap with clearance
 */
export const hasOverlap = (
  box1: { x: number; y: number; width: number; height: number },
  box2: { x: number; y: number; width: number; height: number },
  clearance: number
): boolean => {
  return !(
    box1.x + box1.width + clearance <= box2.x ||
    box2.x + box2.width + clearance <= box1.x ||
    box1.y + box1.height + clearance <= box2.y ||
    box2.y + box2.height + clearance <= box1.y
  );
};

/**
 * Find shortest path to nearest edge
 */
export const calculateShortestPathToEdge = (
  box: { x: number; y: number; width: number; height: number },
  storageWidth: number,
  storageLength: number
): { x: number; y: number } => {
  const distanceToLeft = box.x;
  const distanceToRight = storageWidth - (box.x + box.width);
  const distanceToBottom = box.y;
  const distanceToTop = storageLength - (box.y + box.height);
  
  const minDistance = Math.min(distanceToLeft, distanceToRight, distanceToBottom, distanceToTop);
  
  if (minDistance === distanceToLeft) {
    return { x: -50, y: box.y + box.height / 2 }; // Exit left
  } else if (minDistance === distanceToRight) {
    return { x: storageWidth + 50, y: box.y + box.height / 2 }; // Exit right
  } else if (minDistance === distanceToBottom) {
    return { x: box.x + box.width / 2, y: -50 }; // Exit bottom
  } else {
    return { x: box.x + box.width / 2, y: storageLength + 50 }; // Exit top
  }
};