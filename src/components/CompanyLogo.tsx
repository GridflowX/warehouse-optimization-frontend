// Company Logo Component with Dark/Light Mode Circle

import React from 'react';
import { cn } from '@/lib/utils';

export const CompanyLogo: React.FC = () => {
  return (
    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-background border-2 border-foreground mx-auto">
      <svg width="40" height="40" viewBox="0 0 100 100" className="text-primary">
        <path 
          d="M20 20 L80 20 L80 40 L60 40 L60 80 L40 80 L40 40 L20 40 Z" 
          fill="currentColor" 
          stroke="currentColor" 
          strokeWidth="3"
        />
        <path 
          d="M20 20 L15 15 M80 20 L85 15 M40 80 L35 85 M60 80 L65 85" 
          stroke="currentColor" 
          strokeWidth="3" 
          fill="none"
        />
      </svg>
    </div>
  );
};