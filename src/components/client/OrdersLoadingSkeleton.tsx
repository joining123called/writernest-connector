
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const OrdersLoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 gap-4 p-4 bg-muted/40">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
        
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="grid grid-cols-7 gap-4 p-4 border-t">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-6 w-8" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
};
