
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const EmptyOrdersState: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center p-8 border rounded-lg bg-card shadow-sm">
      <div className="flex flex-col items-center gap-4">
        <FileText className="h-12 w-12 text-muted-foreground" />
        <h3 className="text-xl font-semibold">No orders yet</h3>
        <p className="text-muted-foreground">
          You haven't placed any orders yet. Get started by creating your first order.
        </p>
        <Button onClick={() => navigate('/client-dashboard/order')} className="mt-2">
          Create New Order
        </Button>
      </div>
    </div>
  );
};
