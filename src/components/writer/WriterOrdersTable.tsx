
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { OrderItem } from '@/types';

export interface WriterOrdersTableProps {
  orders: OrderItem[];
}

const WriterOrdersTable = ({ orders }: WriterOrdersTableProps) => {
  const navigate = useNavigate();

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <p className="text-muted-foreground mb-4">No assignments found</p>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'outline';
      case 'in_progress':
        return 'secondary';
      case 'under_review':
        return 'default';
      case 'completed':
        return 'success';
      default:
        return 'outline';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleViewOrder = (orderId: string) => {
    navigate(`/writer-dashboard/orders/${orderId}`);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Assignment #</TableHead>
            <TableHead>Topic</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Pages</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.assignment_code}</TableCell>
              <TableCell>{order.topic || "No topic specified"}</TableCell>
              <TableCell>{order.paper_type}</TableCell>
              <TableCell>{order.pages}</TableCell>
              <TableCell>
                {format(new Date(order.deadline), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(order.status)}>
                  {formatStatus(order.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewOrder(order.id)}
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default WriterOrdersTable;
