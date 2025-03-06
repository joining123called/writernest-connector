
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { OrderItem } from '@/types';

interface OrdersTableProps {
  orders: OrderItem[];
}

export const OrdersTable: React.FC<OrdersTableProps> = ({ orders }) => {
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
    navigate(`/client-dashboard/orders/${orderId}`);
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
