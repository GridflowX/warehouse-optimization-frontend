import React, { useState, useEffect, useCallback } from 'react';
import { AlgorithmData, AlgorithmBox } from '@/components/StorageGridConfig';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Package } from 'lucide-react';

interface AnimatedStorageGridProps {
  algorithmData: AlgorithmData | null;
  onAnimationComplete?: () => void;
}

interface AnimatedBox {
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

export const AnimatedStorageGrid: React.FC<AnimatedStorageGridProps> = ({
  algorithmData,
  onAnimationComplete
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [animatedBoxes, setAnimatedBoxes] = useState<AnimatedBox[]>([]);
  const [animationSpeed, setAnimationSpeed] = useState(500); // milliseconds per step
  const [isRetrievalMode, setIsRetrievalMode] = useState(false);
  const [gridDimensions, setGridDimensions] = useState({ width: 1000, height: 2000 });

  // Transform coordinate system: (0,0) is bottom-left
  const transformY = (y: number) => gridDimensions.height - y;

  // Initialize boxes when algorithm data changes
  useEffect(() => {
    if (algorithmData) {
      // Calculate grid dimensions from the algorithm data
      let maxX = 1000, maxY = 2000;
      algorithmData.forEach(box => {
        maxX = Math.max(maxX, box.x + box.width + 100);
        maxY = Math.max(maxY, box.y + box.height + 100);
        if (box.path) {
          box.path.forEach(step => {
            maxX = Math.max(maxX, step.x + 100);
            maxY = Math.max(maxY, step.y + 100);
          });
        }
      });
      setGridDimensions({ width: maxX, height: maxY });

      const boxes: AnimatedBox[] = algorithmData
        .filter((box) => box.packed) // Only show packed boxes
        .map((box) => ({
          id: `box-${box.index}`,
          x: box.x,
          y: box.y,
          isVisible: true,
          isAnimating: false,
          finalX: box.x,
          finalY: box.y,
          width: box.width,
          height: box.height,
          isRemoving: false,
          pathIndex: 0,
          index: box.index,
          packed: box.packed,
        }))
        .sort((a, b) => a.index - b.index);
      setAnimatedBoxes(boxes);
      setCurrentStep(0);
    }
  }, [algorithmData]);

  // Animation logic for retrieval mode - moving boxes out of grid
  useEffect(() => {
    if (!isPlaying || !algorithmData || !isRetrievalMode || currentStep >= algorithmData.length) {
      if (currentStep >= (algorithmData?.length || 0)) {
        setIsPlaying(false);
        onAnimationComplete?.();
      }
      return;
    }

    const timer = setTimeout(() => {
      const boxToRetrieve = algorithmData.find(box => box.retrieval_order === currentStep);
      if (boxToRetrieve) {
        animateBoxRetrieval(boxToRetrieve);
      }
      setCurrentStep(prev => prev + 1);
    }, animationSpeed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, algorithmData, animationSpeed, isRetrievalMode]);

  const animateBoxRetrieval = (box: AlgorithmBox) => {
    if (!box.path || box.path.length === 0) {
      // If no path, just remove the box
      setAnimatedBoxes(prev => prev.map(animBox => {
        if (animBox.id === `box-${box.index}`) {
          return { ...animBox, isVisible: false };
        }
        return animBox;
      }));
      return;
    }

    setAnimatedBoxes(prev => prev.map(animBox => {
      if (animBox.id === `box-${box.index}`) {
        return {
          ...animBox,
          isRemoving: true,
          isAnimating: true,
        };
      }
      return animBox;
    }));

    // Animate through the retrieval path
    let pathIndex = 0;
    const pathInterval = setInterval(() => {
      if (pathIndex < box.path!.length) {
        const step = box.path![pathIndex];
        setAnimatedBoxes(prev => prev.map(animBox => {
          if (animBox.id === `box-${box.index}`) {
            return {
              ...animBox,
              x: step.x,
              y: step.y,
              pathIndex: pathIndex,
            };
          }
          return animBox;
        }));
        pathIndex++;
      } else {
        // Box has completed its path, remove it from grid
        clearInterval(pathInterval);
        setAnimatedBoxes(prev => prev.map(animBox => {
          if (animBox.id === `box-${box.index}`) {
            return {
              ...animBox,
              isVisible: false,
              isAnimating: false,
            };
          }
          return animBox;
        }));
      }
    }, 150);
  };

  const handlePlay = () => {
    setIsPlaying(true);
    if (!isRetrievalMode) {
      setIsRetrievalMode(true);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setIsRetrievalMode(false);
    if (algorithmData) {
      const resetBoxes: AnimatedBox[] = algorithmData
        .filter((box) => box.packed)
        .map((box) => ({
          id: `box-${box.index}`,
          x: box.x,
          y: box.y,
          isVisible: true,
          isAnimating: false,
          finalX: box.x,
          finalY: box.y,
          width: box.width,
          height: box.height,
          isRemoving: false,
          pathIndex: 0,
          index: box.index,
          packed: box.packed,
        }))
        .sort((a, b) => a.index - b.index);
      setAnimatedBoxes(resetBoxes);
    }
  };

  // Calculate viewBox based on grid dimensions
  const getViewBox = () => {
    const padding = 100;
    return `${-padding} ${-padding} ${gridDimensions.width + 2 * padding} ${gridDimensions.height + 2 * padding}`;
  };

  return (
    <div className="space-y-4">
      {/* Animation Controls */}
      <div className="flex items-center justify-between bg-muted p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <Button
            onClick={handlePlay}
            disabled={isPlaying || !algorithmData}
            size="sm"
            variant="outline"
          >
            <Play className="w-4 h-4" />
          </Button>
          <Button
            onClick={handlePause}
            disabled={!isPlaying}
            size="sm"
            variant="outline"
          >
            <Pause className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleReset}
            size="sm"
            variant="outline"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Step: {currentStep} / {algorithmData?.length || 0}
          </span>
          <span className="text-sm text-muted-foreground">
            Remaining: {animatedBoxes.filter(box => box.isVisible).length}
          </span>
          <span className="text-sm text-muted-foreground">
            Mode: {isRetrievalMode ? 'Retrieval' : 'Placement'}
          </span>
        </div>
      </div>

      {/* Grid Visualization */}
      <div className="border rounded-lg overflow-hidden bg-muted">
        <svg
          width="100%"
          height="400"
          viewBox={getViewBox()}
          className="w-full h-96"
          style={{ backgroundColor: 'hsl(var(--muted))' }}
        >
          {/* Grid background */}
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Storage container boundary */}
          <rect
            x="0"
            y="0"
            width={gridDimensions.width}
            height={gridDimensions.height}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeDasharray="10,5"
            opacity="0.5"
          />

          {/* Coordinate labels */}
          <text x="10" y={gridDimensions.height - 10} fill="hsl(var(--foreground))" fontSize="12" fontWeight="bold">
            (0,0)
          </text>
          <text x={gridDimensions.width - 50} y="25" fill="hsl(var(--foreground))" fontSize="12" fontWeight="bold">
            ({gridDimensions.width},{gridDimensions.height})
          </text>

          {/* Animated boxes */}
          {animatedBoxes.filter(box => box.isVisible).map((box) => (
            <g key={box.id}>
              <rect
                x={box.x}
                y={transformY(box.y + box.height)}
                width={box.width}
                height={box.height}
                fill={box.isRemoving ? "hsl(var(--destructive) / 0.8)" : "hsl(var(--primary) / 0.8)"}
                stroke={box.isRemoving ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                strokeWidth="2"
                rx="4"
                className={`transition-all duration-300 ${box.isAnimating ? 'animate-pulse' : ''}`}
              />
              <text
                x={box.x + box.width / 2}
                y={transformY(box.y + box.height / 2)}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="hsl(var(--primary-foreground))"
                fontSize="12"
                fontWeight="bold"
              >
                {box.index}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Status */}
      {!algorithmData && (
        <div className="text-center py-8 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Upload algorithm data to see the animated packaging visualization</p>
        </div>
      )}
    </div>
  );
};