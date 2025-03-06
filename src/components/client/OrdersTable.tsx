
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { DeadlineCountdown } from '@/components/shared/DeadlineCountdown';
import { OrderItem, getStatusBadgeVariant, getStatusLabel } from '@/types/order';

interface OrdersTableProps {
  orders: OrderItem[];
}

export const OrdersTable: React.FC<OrdersTableProps> = ({ orders }) => {
  const navigate = useNavigate();
  
  const handleRowClick = (orderId: string) => {
    navigate(`/client-dashboard/orders/${orderId}`);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Paper Type</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead className="hidden md:table-cell">Deadline</TableHead>
            <TableHead className="text-right hidden sm:table-cell">Pages</TableHead>
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
              <TableCell>{order.paper_type.replace('_', ' ')}</TableCell>
              <TableCell className="hidden sm:table-cell">{order.subject}</TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex flex-col space-y-1">
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(order.deadline), 'MMM d, yyyy')}
                  </span>
                  <DeadlineCountdown deadline={order.deadline} />
                </div>
              </TableCell>
              <TableCell className="text-right hidden sm:table-cell">{order.pages}</TableCell>
              <TableCell className="text-right">${order.final_price.toFixed(2)}</TableCell>
              <TableCell className="text-right">
                <Badge variant={getStatusBadgeVariant(order.status) as any}>
                  {getStatusLabel(order.status)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
