
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { OrderItem } from '@/types';

interface WriterOrdersTableProps {
  orders: OrderItem[];
  onTakeOrder?: (orderId: string) => void;
  showTakeButton?: boolean;
}

export const WriterOrdersTable: React.FC<WriterOrdersTableProps> = ({ 
  orders, 
  onTakeOrder,
  showTakeButton = false 
}) => {
  const navigate = useNavigate();
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'revision':
        return 'warning';
      default:
        return 'outline';
    }
  };
  
  const handleRowClick = (orderId: string) => {
    navigate(`/writer-dashboard/orders/${orderId}`);
  };

  const handleTakeOrderClick = (event: React.MouseEvent, orderId: string) => {
    event.stopPropagation(); // Prevent row click
    if (onTakeOrder) {
      onTakeOrder(orderId);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Topic</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead className="hidden md:table-cell">Deadline</TableHead>
            <TableHead className="text-right">Pages</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Status</TableHead>
            {showTakeButton && <TableHead className="text-right">Action</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow 
              key={order.id} 
              className="cursor-pointer hover:bg-accent/50"
              onClick={() => handleRowClick(order.id)}
            >
              <TableCell className="font-medium">#{order.assignment_code}</TableCell>
              <TableCell>{order.topic || order.paper_type}</TableCell>
              <TableCell>{order.subject}</TableCell>
              <TableCell className="hidden md:table-cell">
                {format(new Date(order.deadline), 'MMM d, yyyy')}
              </TableCell>
              <TableCell className="text-right">{order.pages}</TableCell>
              <TableCell className="text-right">${order.final_price.toFixed(2)}</TableCell>
              <TableCell className="text-right">
                <Badge variant={getStatusBadgeVariant(order.status) as any}>
                  {order.status.replace('_', ' ')}
                </Badge>
              </TableCell>
              {showTakeButton && (
                <TableCell className="text-right">
                  <Button 
                    size="sm" 
                    onClick={(e) => handleTakeOrderClick(e, order.id)}
                  >
                    Take Order
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
