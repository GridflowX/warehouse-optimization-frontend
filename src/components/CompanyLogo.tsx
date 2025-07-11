// Company Logo Component with PNG in a Circle and Solid Blurred Fill

import React from 'react';
import { cn } from '@/lib/utils';

export const CompanyLogo: React.FC = () => {
  return (
    <div className="relative w-24 h-24 flex items-center justify-center mx-auto rounded-full border-4 border-black bg-transparent overflow-hidden shadow-md">
      {/* Solid blurred background fill */}
      <div className="absolute inset-0 rounded-full bg-yellow-200 blur-2xl opacity-100 z-0" />
      <img
        src="/gridflow_logo.png"
        alt="GridFlow Logo"
        className="relative z-10 object-contain w-20 h-20"
        draggable={false}
      />
    </div>
  );
};