// Reusable Neumorphic Icon Wrapper Component

import React from 'react';
import { cn } from '@/lib/utils';

interface NeomorphicIconProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

export const NeomorphicIcon: React.FC<NeomorphicIconProps> = ({ 
  children, 
  size = 'md', 
  className 
}) => {
  return (
    <div className={cn('neomorphic-icon', sizeClasses[size], className)}>
      {children}
    </div>
  );
};