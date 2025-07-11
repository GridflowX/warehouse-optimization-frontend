// API Type Definitions for Warehouse Optimization Platform

export interface Coordinate {
  id: string;
  x: number;
  y: number;
}

export interface Edge {
  from: string;
  to: string;
}

export interface GraphData {
  coordinates: Coordinate[];
  edges: Edge[];
  initialDistance: number;
}

export interface OptimizationRequest {
  alpha: number;
  beta: number;
}

export interface OptimizationResponse {
  success: boolean;
  message?: string;
  optimizedRoutes?: any;
}