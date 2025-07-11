import React, { useState, useEffect, useCallback } from 'react';
import { AlgorithmData, AlgorithmBox } from '@/components/StorageGridConfig';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Package } from 'lucide-react';

interface AnimatedStorageGridProps {
  algorithmData: AlgorithmData | null;
  onAnimationComplete?: () => void;
}

interface AnimatedBox {
  id: number;
  x: number;
  y: number;
  isVisible: boolean;
  isAnimating: boolean;
  finalPosition: { x: number; y: number };
}

export const AnimatedStorageGrid: React.FC<AnimatedStorageGridProps> = ({
  algorithmData,
  onAnimationComplete
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [animatedBoxes, setAnimatedBoxes] = useState<AnimatedBox[]>([]);
  const [animationSpeed, setAnimationSpeed] = useState(500); // milliseconds per step

  // Initialize boxes when algorithm data changes
  useEffect(() => {
    if (algorithmData) {
      const boxes: AnimatedBox[] = algorithmData.map((box) => {
        const finalPos = box.path[box.path.length - 1] || { x: 0, y: 0 };
        return {
          id: box.index,
          x: 0,
          y: 0,
          isVisible: false,
          isAnimating: false,
          finalPosition: { x: finalPos.x, y: finalPos.y }
        };
      });
      setAnimatedBoxes(boxes);
      setCurrentStep(0);
    }
  }, [algorithmData]);

  // Animation logic
  useEffect(() => {
    if (!isPlaying || !algorithmData || currentStep >= algorithmData.length) {
      if (currentStep >= (algorithmData?.length || 0)) {
        setIsPlaying(false);
        onAnimationComplete?.();
      }
      return;
    }

    const timer = setTimeout(() => {
      const currentBox = algorithmData[currentStep];
      animateBox(currentBox);
      setCurrentStep(prev => prev + 1);
    }, animationSpeed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, algorithmData, animationSpeed]);

  const animateBox = (box: AlgorithmBox) => {
    setAnimatedBoxes(prev => 
      prev.map(animBox => 
        animBox.id === box.index 
          ? { 
              ...animBox, 
              isVisible: true, 
              isAnimating: true,
              x: box.path[0]?.x || 0,
              y: box.path[0]?.y || 0
            }
          : animBox
      )
    );

    // Animate through the path
    if (box.path.length > 1) {
      let pathIndex = 0;
      const pathTimer = setInterval(() => {
        pathIndex++;
        if (pathIndex >= box.path.length) {
          clearInterval(pathTimer);
          // Mark animation complete and move to final position
          setAnimatedBoxes(prev => 
            prev.map(animBox => 
              animBox.id === box.index 
                ? { 
                    ...animBox, 
                    isAnimating: false,
                    x: animBox.finalPosition.x,
                    y: animBox.finalPosition.y
                  }
                : animBox
            )
          );
          return;
        }

        const step = box.path[pathIndex];
        setAnimatedBoxes(prev => 
          prev.map(animBox => 
            animBox.id === box.index 
              ? { ...animBox, x: step.x, y: step.y }
              : animBox
          )
        );
      }, 100); // Path step speed
    } else {
      // If no path, just place at final position
      setTimeout(() => {
        setAnimatedBoxes(prev => 
          prev.map(animBox => 
            animBox.id === box.index 
              ? { 
                  ...animBox, 
                  isAnimating: false,
                  x: animBox.finalPosition.x,
                  y: animBox.finalPosition.y
                }
              : animBox
          )
        );
      }, 200);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    if (algorithmData) {
      const resetBoxes: AnimatedBox[] = algorithmData.map((box) => {
        const finalPos = box.path[box.path.length - 1] || { x: 0, y: 0 };
        return {
          id: box.index,
          x: 0,
          y: 0,
          isVisible: false,
          isAnimating: false,
          finalPosition: { x: finalPos.x, y: finalPos.y }
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
            Boxes: {animatedBoxes.filter(box => box.isVisible).length}
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
          {animatedBoxes.map((box) => (
            box.isVisible && (
              <g key={box.id}>
                {/* Box path trail (if animating) */}
                {box.isAnimating && algorithmData && (
                  (() => {
                    const currentBoxData = algorithmData.find(b => b.index === box.id);
                    return currentBoxData?.path.map((step, index) => (
                      <circle
                        key={`trail-${index}`}
                        cx={step.x}
                        cy={step.y}
                        r="2"
                        fill="hsl(var(--primary))"
                        opacity={0.3}
                      />
                    ));
                  })()
                )}
                
                {/* Main box */}
                <g transform={`translate(${box.x}, ${box.y})`}>
                  <rect
                    x="-15"
                    y="-15"
                    width="30"
                    height="30"
                    fill={box.isAnimating ? "hsl(var(--primary))" : "hsl(var(--accent))"}
                    stroke="hsl(var(--border))"
                    strokeWidth="1"
                    rx="3"
                    className={box.isAnimating ? "animate-pulse" : ""}
                  />
                  <text
                    x="0"
                    y="5"
                    textAnchor="middle"
                    fontSize="10"
                    fill="hsl(var(--primary-foreground))"
                    fontWeight="bold"
                  >
                    {box.id}
                  </text>
                </g>
              </g>
            )
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