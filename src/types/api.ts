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
  status: string;
  output?: {
    nodes: Array<{
      id: number;
      x: number;
      y: number;
      type: string;
    }>;
    edges: Array<{
      source: number;
      target: number;
      length: number;
    }>;
    flows: Array<{
      commodity: number;
      source: number;
      target: number;
      flow: number;
    }>;
  };
  success?: boolean;
  message?: string;
}