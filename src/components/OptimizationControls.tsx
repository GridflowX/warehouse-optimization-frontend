// Optimization Controls with Alpha/Beta Sliders

import React, { useState, useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OptimizationRequest } from '@/types/api';

interface OptimizationControlsProps {
  onOptimize: (params: OptimizationRequest) => Promise<void>;
  loading?: boolean;
}

export const OptimizationControls: React.FC<OptimizationControlsProps> = ({
  onOptimize,
  loading = false
}) => {
  const [alpha, setAlpha] = useState(0.500);
  const [beta, setBeta] = useState(0.500);

  const handleAlphaChange = useCallback((value: number[]) => {
    const newAlpha = value[0];
    setAlpha(newAlpha);
    setBeta(1 - newAlpha); // Ensure alpha + beta = 1
  }, []);

  const handleBetaChange = useCallback((value: number[]) => {
    const newBeta = value[0];
    setBeta(newBeta);
    setAlpha(1 - newBeta); // Ensure alpha + beta = 1
  }, []);

  const handleOptimize = useCallback(async () => {
    await onOptimize({ alpha, beta });
  }, [alpha, beta, onOptimize]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Optimization Parameters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Alpha Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="alpha-slider" className="text-sm font-medium">
              Alpha (Construction Cost)
            </Label>
            <span className="text-sm text-muted-foreground font-mono">
              {alpha.toFixed(3)}
            </span>
          </div>
          <Slider
            id="alpha-slider"
            min={0.001}
            max={1.000}
            step={0.001}
            value={[alpha]}
            onValueChange={handleAlphaChange}
            className="w-full"
          />
        </div>

        {/* Beta Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label htmlFor="beta-slider" className="text-sm font-medium">
              Beta (Time Efficiency)
            </Label>
            <span className="text-sm text-muted-foreground font-mono">
              {beta.toFixed(3)}
            </span>
          </div>
          <Slider
            id="beta-slider"
            min={0.001}
            max={1.000}
            step={0.001}
            value={[beta]}
            onValueChange={handleBetaChange}
            className="w-full"
          />
        </div>

        {/* Constraint Validation */}
        <div className="text-xs text-muted-foreground text-center">
          Constraint: α + β = {(alpha + beta).toFixed(3)} 
          {Math.abs(alpha + beta - 1) > 0.001 && (
            <span className="text-destructive ml-1">(Must equal 1.000)</span>
          )}
        </div>

        {/* Optimize Button */}
        <Button
          onClick={handleOptimize}
          disabled={loading || Math.abs(alpha + beta - 1) > 0.001}
          className="w-full"
        >
          {loading ? 'Optimizing...' : 'Apply Optimization'}
        </Button>
      </CardContent>
    </Card>
  );
};