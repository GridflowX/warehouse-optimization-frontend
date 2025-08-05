# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview production build locally

### Testing
No specific test commands are configured. Check if any testing framework is added later.

## Architecture Overview

This is a React TypeScript application built with Vite for warehouse optimization research. The application provides interactive visualization and analysis of warehouse network optimization.

### Key Technologies
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS
- **State Management**: React Query (@tanstack/react-query) for server state
- **Routing**: React Router DOM
- **Theming**: next-themes for dark/light mode
- **Charts**: Recharts for data visualization
- **3D Graphics**: Three.js for advanced visualizations

### Application Structure

#### Pages (`src/pages/`)
- `GraphVisualization.tsx` - Main homepage showing warehouse network topology
- `WarehouseDetail.tsx` - Detailed view of individual warehouses with storage grid configuration
- `NotFound.tsx` - 404 error page

#### Core Components (`src/components/`)
- `GraphCanvas.tsx` - Interactive network graph visualization
- `WarehouseLayout.tsx` - Main warehouse detail layout component
- `OptimizationControls.tsx` - Alpha/Beta parameter controls for optimization
- `StorageGridConfig.tsx` - Configuration interface for warehouse storage parameters
- `AnimatedStorageGrid.tsx` - Animated visualization of storage operations
- `WarehouseStats.tsx` - Statistics and metrics display

#### Data Management (`src/hooks/`)
- `useGraphData.ts` - Main hook for graph data and optimization API calls
- `useLocalStorage.ts` - Persistent storage for warehouse configurations and data
- `useFileHandling.ts` - File upload/download functionality for warehouse data

#### Services (`src/services/`)
- `api.ts` - API service layer for FastAPI backend communication
- `dataGeneration.ts` - Random data generation for testing and demos
- `mockData.ts` - Mock data when backend is unavailable
- `pathPlanning.ts` - Warehouse path optimization algorithms

#### Types (`src/types/`)
- `warehouse.ts` - Core warehouse and storage types
- `api.ts` - API request/response types

### API Integration

The application communicates with two external APIs:
- Main optimization API: `https://guideway-optimisation.onrender.com`
- Packaging API: `https://infra-optimization.onrender.com`

The app gracefully falls back to mock data when APIs are unavailable (controlled by `VITE_USE_MOCK` environment variable).

### Key Features

1. **Network Topology Visualization**: Interactive graph showing warehouse connections with optimization flows
2. **Individual Warehouse Management**: Detailed storage grid configuration with box packing algorithms
3. **Real-time Optimization**: Alpha/Beta parameter adjustment with live network updates
4. **Data Persistence**: Local storage for configurations and generated data
5. **File Import/Export**: JSON file support for custom warehouse data
6. **Responsive Design**: Works on desktop and mobile devices

### State Management Pattern

- **Server State**: Managed by React Query for API calls and caching
- **Local State**: Component-level useState for UI interactions
- **Persistent State**: Custom localStorage hooks for user data
- **Global State**: Context providers for theme and toasts

### Development Notes

- The app uses mock data by default for development when backend APIs are unavailable
- All warehouse data is stored in localStorage with warehouse ID as the key
- The application supports both packaging (storage) and retrieval operations
- Graph visualization uses custom canvas rendering for performance
- UI follows a neomorphic design pattern with subtle shadows and depth