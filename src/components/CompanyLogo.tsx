// Company Logo Component with Dark/Light Mode Circle

import React from 'react';
import { cn } from '@/lib/utils';

export const CompanyLogo: React.FC = () => {
  return (
    <div className="fixed top-4 left-4 z-50">
      <div className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center",
        "border-2 border-foreground bg-background/80 backdrop-blur-sm"
      )}>
        {/* Temporary placeholder - replace with your logo */}
        <div className="w-6 h-4 border-2 border-current transform rotate-12 bg-current/20"></div>
      </div>
    </div>
  );
};