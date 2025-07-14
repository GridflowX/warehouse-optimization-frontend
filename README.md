# Warehouse Optimization Research Platform

This project is an interactive platform for visualizing and optimizing warehouse storage and retrieval operations. It allows users to:

- Explore a network of warehouses and view detailed layouts for each.
- Simulate and analyze storage grid configurations, box packing, and retrieval paths.
- Adjust optimization parameters (such as construction cost and time efficiency) and see their impact in real time.
- Upload, generate, or modify warehouse data for custom scenarios.
- Visualize key metrics like space and time efficiency, packed boxes, and solution times.

## Features

- **Graph Visualization:**  
  View and interact with a network of warehouses.

- **Warehouse Detail:**  
  Dive into individual warehouse layouts, configure storage grids, and animate retrieval operations.

- **Optimization Controls:**  
  Fine-tune optimization parameters (alpha, beta) and apply them to see immediate results.

- **Data Handling:**  
  Upload or generate random packaging/retrieval data, with support for JSON files.

- **Metrics Dashboard:**  
  See statistics on packing efficiency, retrieval times, and more.

## Tech Stack

- **Vite** (build tool)
- **React** (UI framework)
- **TypeScript** (type safety)
- **shadcn/ui** (UI components)
- **Tailwind CSS** (styling)
- **@tanstack/react-query** (data fetching/caching)
- **Radix UI** (accessible primitives)

## Getting Started

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Start the development server:**
   ```sh
   npm run dev
   ```
3. **Open your browser:**  
   Visit `http://localhost:5173` (or as indicated in your terminal).

## Project Structure

- `src/pages/` – Main pages (GraphVisualization, WarehouseDetail)
- `src/components/` – UI components (grids, controls, stats, etc.)
- `src/services/` – API and data generation logic
- `src/hooks/` – Custom React hooks for data and state management
- `src/types/` – TypeScript type definitions

## License

This project is for research and demonstration purposes.
