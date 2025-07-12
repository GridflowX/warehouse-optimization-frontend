import { AlgorithmBox, AlgorithmStep } from '@/types/warehouse';

// KD-Tree implementation for efficient nearest neighbor search
class KDNode {
  point: [number, number];
  left: KDNode | null = null;
  right: KDNode | null = null;
  dimension: number;

  constructor(point: [number, number], dimension: number) {
    this.point = point;
    this.dimension = dimension;
  }
}

class KDTree {
  root: KDNode | null = null;

  constructor(points: [number, number][]) {
    this.root = this.buildTree(points, 0);
  }

  private buildTree(points: [number, number][], depth: number): KDNode | null {
    if (points.length === 0) return null;

    const dimension = depth % 2;
    points.sort((a, b) => a[dimension] - b[dimension]);

    const medianIndex = Math.floor(points.length / 2);
    const node = new KDNode(points[medianIndex], dimension);

    node.left = this.buildTree(points.slice(0, medianIndex), depth + 1);
    node.right = this.buildTree(points.slice(medianIndex + 1), depth + 1);

    return node;
  }

  findNearestNeighbors(target: [number, number], k: number, maxDistance: number): [number, number][] {
    const neighbors: { point: [number, number], distance: number }[] = [];

    const search = (node: KDNode | null, depth: number) => {
      if (!node) return;

      const distance = this.euclideanDistance(target, node.point);
      
      if (distance <= maxDistance) {
        neighbors.push({ point: node.point, distance });
        neighbors.sort((a, b) => a.distance - b.distance);
        if (neighbors.length > k) neighbors.pop();
      }

      const dimension = depth % 2;
      const goLeft = target[dimension] < node.point[dimension];
      const primarySide = goLeft ? node.left : node.right;
      const secondarySide = goLeft ? node.right : node.left;

      search(primarySide, depth + 1);

      const dimensionDistance = Math.abs(target[dimension] - node.point[dimension]);
      if (neighbors.length < k || dimensionDistance < neighbors[neighbors.length - 1]?.distance) {
        search(secondarySide, depth + 1);
      }
    };

    search(this.root, 0);
    return neighbors.map(n => n.point);
  }

  private euclideanDistance(a: [number, number], b: [number, number]): number {
    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
  }
}

// A* Node for pathfinding
class AStarNode {
  x: number;
  y: number;
  g: number = 0; // Cost from start
  h: number = 0; // Heuristic cost to goal
  f: number = 0; // Total cost
  parent: AStarNode | null = null;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  equals(other: AStarNode): boolean {
    return this.x === other.x && this.y === other.y;
  }
}

// Probabilistic Roadmap + A* Pathfinding System
export class PRMPathPlanner {
  private gridWidth: number;
  private gridHeight: number;
  private obstacles: AlgorithmBox[];
  private clearance: number;
  private roadmapNodes: [number, number][] = [];
  private roadmapEdges: Map<string, [number, number][]> = new Map();
  private kdTree: KDTree | null = null;

  constructor(gridWidth: number, gridHeight: number, obstacles: AlgorithmBox[], clearance: number) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.obstacles = obstacles.filter(box => box.packed);
    this.clearance = clearance;
    this.buildRoadmap();
  }

  // Build the probabilistic roadmap
  private buildRoadmap(): void {
    console.log('Building PRM roadmap...');
    const numSamples = Math.max(200, this.obstacles.length * 10);
    const connectionRadius = Math.min(this.gridWidth, this.gridHeight) * 0.15;

    // Sample collision-free nodes
    for (let i = 0; i < numSamples; i++) {
      const x = Math.random() * this.gridWidth;
      const y = Math.random() * this.gridHeight;
      
      if (this.isPointCollisionFree(x, y)) {
        this.roadmapNodes.push([x, y]);
      }
    }

    // Add edge connection points
    const edgePoints: [number, number][] = [
      [0, this.gridHeight / 2], // Left edge
      [this.gridWidth, this.gridHeight / 2], // Right edge
      [this.gridWidth / 2, 0], // Bottom edge
      [this.gridWidth / 2, this.gridHeight] // Top edge
    ];

    edgePoints.forEach(point => {
      if (this.isPointCollisionFree(point[0], point[1])) {
        this.roadmapNodes.push(point);
      }
    });

    // Build KD-Tree for efficient neighbor search
    this.kdTree = new KDTree([...this.roadmapNodes]);

    // Connect nearby nodes
    this.roadmapNodes.forEach(node => {
      const neighbors = this.kdTree!.findNearestNeighbors(node, 8, connectionRadius);
      const validConnections: [number, number][] = [];

      neighbors.forEach(neighbor => {
        if (neighbor[0] !== node[0] || neighbor[1] !== node[1]) {
          if (this.isPathCollisionFree(node[0], node[1], neighbor[0], neighbor[1])) {
            validConnections.push(neighbor);
          }
        }
      });

      this.roadmapEdges.set(`${node[0]},${node[1]}`, validConnections);
    });

    console.log(`Built roadmap with ${this.roadmapNodes.length} nodes and ${Array.from(this.roadmapEdges.values()).reduce((sum, edges) => sum + edges.length, 0)} edges`);
  }

  // Check if a point is collision-free
  private isPointCollisionFree(x: number, y: number): boolean {
    for (const obstacle of this.obstacles) {
      const minX = obstacle.x - this.clearance;
      const maxX = obstacle.x + obstacle.width + this.clearance;
      const minY = obstacle.y - this.clearance;
      const maxY = obstacle.y + obstacle.height + this.clearance;

      if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
        return false;
      }
    }
    return x >= 0 && x <= this.gridWidth && y >= 0 && y <= this.gridHeight;
  }

  // Check if a straight-line path between two points is collision-free
  private isPathCollisionFree(x1: number, y1: number, x2: number, y2: number): boolean {
    const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
    const dx = (x2 - x1) / steps;
    const dy = (y2 - y1) / steps;

    for (let i = 0; i <= steps; i++) {
      const x = x1 + dx * i;
      const y = y1 + dy * i;
      
      if (!this.isPointCollisionFree(x, y)) {
        return false;
      }
    }
    return true;
  }

  // Find optimal retrieval path for a box using A* to all edges
  findOptimalRetrievalPath(box: AlgorithmBox): AlgorithmStep[] {
    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    // Define exit points for all four edges with priority
    const exitTargets = [
      { x: -50, y: startY, edge: 'left', priority: this.getEdgePriority(box, 'left') },
      { x: this.gridWidth + 50, y: startY, edge: 'right', priority: this.getEdgePriority(box, 'right') },
      { x: startX, y: -50, edge: 'bottom', priority: this.getEdgePriority(box, 'bottom') },
      { x: startX, y: this.gridHeight + 50, edge: 'top', priority: this.getEdgePriority(box, 'top') }
    ];

    // Sort by priority (lower is better)
    exitTargets.sort((a, b) => a.priority - b.priority);

    let bestPath: AlgorithmStep[] = [];
    let shortestDistance = Infinity;

    // Try each edge exit in priority order
    for (const target of exitTargets) {
      const path = this.findAStarPath(startX, startY, target.x, target.y);
      
      if (path.length > 0) {
        const pathDistance = this.calculatePathDistance(path);
        
        if (pathDistance < shortestDistance) {
          shortestDistance = pathDistance;
          bestPath = path;
        }

        // If we found a good path with high priority edge, use it
        if (target.priority === 1 && pathDistance < shortestDistance * 1.2) {
          break;
        }
      }
    }

    return bestPath.length > 0 ? bestPath : this.generateFallbackPath(box);
  }

  // Calculate edge priority based on box position and natural movement direction
  private getEdgePriority(box: AlgorithmBox, edge: string): number {
    const centerX = box.x + box.width / 2;
    const centerY = box.y + box.height / 2;

    switch (edge) {
      case 'left':
        return centerX / this.gridWidth; // Closer to left = higher priority (lower number)
      case 'right':
        return (this.gridWidth - centerX) / this.gridWidth;
      case 'bottom':
        return centerY / this.gridHeight;
      case 'top':
        return (this.gridHeight - centerY) / this.gridHeight;
      default:
        return 1;
    }
  }

  // A* pathfinding implementation
  private findAStarPath(startX: number, startY: number, goalX: number, goalY: number): AlgorithmStep[] {
    const openSet: AStarNode[] = [];
    const closedSet: AStarNode[] = [];
    
    const startNode = new AStarNode(startX, startY);
    openSet.push(startNode);

    // Connect start point to roadmap
    const startConnections = this.findNearestRoadmapNodes(startX, startY, 3);
    
    // Connect goal point to roadmap
    const goalConnections = this.findNearestRoadmapNodes(goalX, goalY, 3);

    while (openSet.length > 0) {
      // Find node with lowest f score
      let current = openSet[0];
      let currentIndex = 0;
      
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < current.f) {
          current = openSet[i];
          currentIndex = i;
        }
      }

      // Move current from open to closed set
      openSet.splice(currentIndex, 1);
      closedSet.push(current);

      // Check if we reached the goal area
      const distanceToGoal = Math.sqrt(Math.pow(current.x - goalX, 2) + Math.pow(current.y - goalY, 2));
      if (distanceToGoal < 50) {
        return this.reconstructPath(current, goalX, goalY);
      }

      // Get neighbors from roadmap
      const neighbors = this.getAStarNeighbors(current, startConnections, goalConnections);

      for (const neighbor of neighbors) {
        // Skip if in closed set
        if (closedSet.some(node => node.equals(neighbor))) continue;

        const tentativeG = current.g + this.euclideanDistance(
          [current.x, current.y], 
          [neighbor.x, neighbor.y]
        );

        const openNode = openSet.find(node => node.equals(neighbor));
        
        if (!openNode) {
          neighbor.g = tentativeG;
          neighbor.h = this.euclideanDistance([neighbor.x, neighbor.y], [goalX, goalY]);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.parent = current;
          openSet.push(neighbor);
        } else if (tentativeG < openNode.g) {
          openNode.g = tentativeG;
          openNode.f = openNode.g + openNode.h;
          openNode.parent = current;
        }
      }
    }

    return []; // No path found
  }

  // Find nearest roadmap nodes that can be connected to a point
  private findNearestRoadmapNodes(x: number, y: number, maxNodes: number): [number, number][] {
    if (!this.kdTree) return [];
    
    const maxDistance = Math.min(this.gridWidth, this.gridHeight) * 0.3;
    const nearestNodes = this.kdTree.findNearestNeighbors([x, y], maxNodes * 2, maxDistance);
    
    return nearestNodes.filter(node => 
      this.isPathCollisionFree(x, y, node[0], node[1])
    ).slice(0, maxNodes);
  }

  // Get A* neighbors for current node
  private getAStarNeighbors(current: AStarNode, startConnections: [number, number][], goalConnections: [number, number][]): AStarNode[] {
    const neighbors: AStarNode[] = [];
    const currentKey = `${current.x},${current.y}`;
    
    // Add roadmap connections
    const connections = this.roadmapEdges.get(currentKey) || [];
    connections.forEach(connection => {
      neighbors.push(new AStarNode(connection[0], connection[1]));
    });

    // Add start connections if current is start
    if (Math.abs(current.x - startConnections[0]?.[0]) < 1 && Math.abs(current.y - startConnections[0]?.[1]) < 1) {
      startConnections.forEach(connection => {
        neighbors.push(new AStarNode(connection[0], connection[1]));
      });
    }

    // Add goal connections if current is near goal connections
    goalConnections.forEach(connection => {
      const distance = this.euclideanDistance([current.x, current.y], connection);
      if (distance < 100) {
        neighbors.push(new AStarNode(connection[0], connection[1]));
      }
    });

    return neighbors;
  }

  // Reconstruct path from A* result
  private reconstructPath(endNode: AStarNode, goalX: number, goalY: number): AlgorithmStep[] {
    const path: AlgorithmStep[] = [];
    let current: AStarNode | null = endNode;
    let step = 0;

    while (current !== null) {
      path.unshift({
        step: step++,
        x: current.x,
        y: current.y
      });
      current = current.parent;
    }

    // Add final goal point
    path.push({
      step: step,
      x: goalX,
      y: goalY
    });

    return path;
  }

  // Calculate total path distance
  private calculatePathDistance(path: AlgorithmStep[]): number {
    let distance = 0;
    for (let i = 1; i < path.length; i++) {
      distance += this.euclideanDistance(
        [path[i-1].x, path[i-1].y],
        [path[i].x, path[i].y]
      );
    }
    return distance;
  }

  // Generate fallback path if A* fails
  private generateFallbackPath(box: AlgorithmBox): AlgorithmStep[] {
    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    // Simple straight line to nearest edge
    const distanceToLeft = startX;
    const distanceToRight = this.gridWidth - startX;
    const distanceToBottom = startY;
    const distanceToTop = this.gridHeight - startY;

    const minDistance = Math.min(distanceToLeft, distanceToRight, distanceToBottom, distanceToTop);

    let exitX, exitY;
    if (minDistance === distanceToLeft) {
      exitX = -50;
      exitY = startY;
    } else if (minDistance === distanceToRight) {
      exitX = this.gridWidth + 50;
      exitY = startY;
    } else if (minDistance === distanceToBottom) {
      exitX = startX;
      exitY = -50;
    } else {
      exitX = startX;
      exitY = this.gridHeight + 50;
    }

    return [
      { step: 0, x: startX, y: startY },
      { step: 1, x: exitX, y: exitY }
    ];
  }

  private euclideanDistance(a: [number, number], b: [number, number]): number {
    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
  }
}