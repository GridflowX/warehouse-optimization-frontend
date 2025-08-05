# Warehouse Optimization Frontend

**Warehouse Optimization Frontend** is a React TypeScript application that provides interactive visualization and analysis of warehouse network optimization. It enables users to optimize warehouse operations through real-time parameter adjustment, storage grid configuration, and network topology visualization for better operational efficiency.

This project focuses on providing an intuitive interface for warehouse optimization research, combining 3D visualization, data analysis, and real-time optimization algorithms to help users make informed decisions about warehouse network configurations.

## Features

- **Interactive Network Topology Visualization**: Dynamic graph showing warehouse connections with optimization flows
- **Individual Warehouse Management**: Detailed storage grid configuration with box packing algorithms  
- **Real-time Optimization**: Alpha/Beta parameter adjustment with live network updates
- **Data Persistence**: Local storage for configurations and generated data
- **File Import/Export**: JSON file support for custom warehouse data
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/warehouse-optimization-frontend.git
cd warehouse-optimization-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Architecture

### Key Technologies

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS
- **State Management**: React Query (@tanstack/react-query) for server state
- **Routing**: React Router DOM
- **Charts**: Recharts for data visualization
- **3D Graphics**: Three.js for advanced visualizations

### API Integration

The application communicates with optimization APIs:
- Main optimization API: `https://guideway-optimisation.onrender.com`
- Packaging API: `https://infra-optimization.onrender.com`

The app gracefully falls back to mock data when APIs are unavailable.

## Contributing

Our project welcomes contributions from any member of our community. To get started contributing, please see our [Contributor Guide](CONTRIBUTING.md).

## Scope

### In Scope

**Warehouse Optimization Frontend** is intended to provide comprehensive warehouse optimization visualization and management capabilities. As such, the project implements:

- Interactive network graph visualization for warehouse topology
- Real-time optimization parameter controls (Alpha/Beta parameters)
- Individual warehouse storage grid configuration and management
- Data persistence and file import/export functionality
- Responsive web interface for desktop and mobile devices
- Integration with external optimization APIs

### Out of Scope

**Warehouse Optimization Frontend** is designed to work with external optimization services and APIs. The following functionality is not incorporated:

- Backend optimization algorithms (handled by external APIs)
- User authentication and authorization systems
- Database management and persistence beyond local storage
- Real-time collaboration features between multiple users

## Development Commands

- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview production build locally

## Communications

- **GitHub Issues**: [Project Issues](https://github.com/your-org/warehouse-optimization-frontend/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/warehouse-optimization-frontend/discussions)

## Resources

- [Project Documentation](docs/)
- [API Documentation](docs/api.md)
- [Development Guide](docs/development.md)

## License

This project is licensed under the [MIT License](LICENSE)

## Conduct

We follow the [Code of Conduct](CODE_OF_CONDUCT.md) to ensure a welcoming and inclusive environment for all contributors.
