import React, { useEffect, useState } from 'react';

interface TrafficPodProps {
  source: { x: number; y: number };
  target: { x: number; y: number };
  flow: number;
  commodity: number;
  pathId: string;
}

export const TrafficPod: React.FC<TrafficPodProps> = ({ 
  source, 
  target, 
  flow, 
  commodity,
  pathId 
}) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const speed = Math.max(0.5, Math.min(3, flow / 20)); // Speed based on flow
    const interval = setInterval(() => {
      setProgress(prev => (prev + speed / 100) % 1);
    }, 50);
    
    return () => clearInterval(interval);
  }, [flow]);
  
  const x = source.x + (target.x - source.x) * progress;
  const y = source.y + (target.y - source.y) * progress;
  
  const podSize = Math.max(3, Math.min(8, flow / 10));
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
  const color = colors[commodity % colors.length];
  
  return (
    <circle
      cx={x}
      cy={y}
      r={podSize}
      fill={color}
      stroke="#fff"
      strokeWidth="1"
      opacity="0.8"
    >
      <title>{`Commodity ${commodity}: Flow ${flow}`}</title>
    </circle>
  );
};