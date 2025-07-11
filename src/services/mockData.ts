// Mock data for development and testing

import { GraphData } from '@/types/api';

export const mockGraphData: GraphData = {
  coordinates: [
    { id: 'W1', x: 150, y: 100 },
    { id: 'W2', x: 400, y: 150 },
    { id: 'W3', x: 250, y: 300 },
    { id: 'W4', x: 500, y: 280 },
    { id: 'W5', x: 100, y: 400 },
    { id: 'W6', x: 350, y: 450 },
    { id: 'W7', x: 600, y: 200 },
    { id: 'W8', x: 300, y: 180 },
  ],
  edges: [
    { from: 'W1', to: 'W2' },
    { from: 'W2', to: 'W3' },
    { from: 'W3', to: 'W4' },
    { from: 'W4', to: 'W7' },
    { from: 'W1', to: 'W5' },
    { from: 'W5', to: 'W6' },
    { from: 'W6', to: 'W4' },
    { from: 'W2', to: 'W8' },
    { from: 'W8', to: 'W3' },
  ],
  initialDistance: 1250.5
};

// Function to use mock data when backend is not available
export const useMockData = () => {
  return new Promise<GraphData>((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      resolve(mockGraphData);
    }, 1000);
  });
};