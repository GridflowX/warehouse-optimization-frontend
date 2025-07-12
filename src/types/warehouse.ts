// Centralized type definitions for warehouse system

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

export interface StorageConfig {
  storageWidth: number;
  storageLength: number;
  numberOfRectangles: number;
  minimumSideLength: number;
  maximumSideLength: number;
  clearance: number;
  boxData?: File;
}

export interface GridBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  packed: boolean;
}

export interface GridDimensions {
  width: number;
  height: number;
}

export interface AnimatedBox {
  id: string;
  x: number;
  y: number;
  isVisible: boolean;
  isAnimating: boolean;
  finalX: number;
  finalY: number;
  width: number;
  height: number;
  isRemoving: boolean;
  pathIndex: number;
  index: number;
  packed: boolean;
}

export type DataMode = 'upload-packaging' | 'upload-retrieval' | 'random';