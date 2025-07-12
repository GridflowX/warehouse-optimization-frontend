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

  // Initialize boxes when algorithm data changes
  useEffect(() => {
    if (algorithmData) {
      const boxes: AnimatedBox[] = algorithmData.map((box) => {
        const finalPos = box.path[box.path.length - 1] || { x: 0, y: 0 };
        return {
          id: `box-${box.index}`,
          x: finalPos.x,
          y: finalPos.y,
          isVisible: true,
          isAnimating: false,
          finalX: finalPos.x,
          finalY: finalPos.y,
          width: 40 + Math.random() * 20,
          height: 40 + Math.random() * 20,
          isRemoving: false,
          pathIndex: 0,
        };
      });
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
        setCurrentStep(prev => prev + 1);
      }
    }, animationSpeed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, algorithmData, animationSpeed, isRetrievalMode]);

  const animateBoxRetrieval = (box: AlgorithmBox) => {
    if (box.path.length === 0) {
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
      if (pathIndex < box.path.length) {
        const step = box.path[pathIndex];
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
      const resetBoxes: AnimatedBox[] = algorithmData.map((box) => {
        const finalPos = box.path[box.path.length - 1] || { x: 0, y: 0 };
        return {
          id: `box-${box.index}`,
          x: finalPos.x,
          y: finalPos.y,
          isVisible: true,
          isAnimating: false,
          finalX: finalPos.x,
          finalY: finalPos.y,
          width: 40 + Math.random() * 20,
          height: 40 + Math.random() * 20,
          isRemoving: false,
          pathIndex: 0,
        };
      });
      setAnimatedBoxes(resetBoxes);
    }
  };

  // Calculate viewBox based on algorithm data
  const getViewBox = () => {
    if (!algorithmData || algorithmData.length === 0) {
      return "0 0 1000 2000";
    }

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    
    algorithmData.forEach(box => {
      box.path.forEach(step => {
        minX = Math.min(minX, step.x);
        maxX = Math.max(maxX, step.x);
        minY = Math.min(minY, step.y);
        maxY = Math.max(maxY, step.y);
      });
    });

    const padding = 100;
    const width = maxX - minX + 2 * padding;
    const height = maxY - minY + 2 * padding;
    
    return `${minX - padding} ${minY - padding} ${width} ${height}`;
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
          
          {/* Animated boxes */}
          {animatedBoxes.filter(box => box.isVisible).map((box) => (
            <g key={box.id}>
              <rect
                x={box.x - box.width/2}
                y={box.y - box.height/2}
                width={box.width}
                height={box.height}
                fill={box.isRemoving ? "hsl(var(--destructive) / 0.8)" : "hsl(var(--primary) / 0.8)"}
                stroke={box.isRemoving ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                strokeWidth="2"
                rx="4"
                className={`transition-all duration-300 ${box.isAnimating ? 'animate-pulse' : ''}`}
              />
              <text
                x={box.x}
                y={box.y + 3}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="hsl(var(--primary-foreground))"
                fontSize="12"
                fontWeight="bold"
              >
                {box.id.split('-')[1]}
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