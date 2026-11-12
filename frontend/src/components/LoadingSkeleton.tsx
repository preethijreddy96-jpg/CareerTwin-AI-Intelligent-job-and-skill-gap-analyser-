import React from 'react';

export const LoadingSkeleton: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      <div className="h-5 bg-slate-200 rounded w-1/3"></div>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-slate-100 rounded"
          style={{ width: `${Math.max(45, 95 - i * 15)}%` }}
        ></div>
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-xl border border-slate-200/80 shadow-sm animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-6 bg-slate-200 rounded w-1/3"></div>
        <div className="h-8 w-8 bg-slate-100 rounded-full"></div>
      </div>
      <div className="h-10 bg-slate-100 rounded w-1/2"></div>
      <div className="h-4 bg-slate-100 rounded w-3/4"></div>
    </div>
  );
};

