
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface OrderItem {
  id: string;
  assignment_code: string;
  topic: string | null;
  paper_type: string;
  subject: string;
  deadline: string;
  pages: number;
  final_price: number;
  status: string;
}

interface OrdersTableProps {
  orders: OrderItem[];
}

export const OrdersTable: React.FC<OrdersTableProps> = ({ orders }) => {
  const navigate = useNavigate();

  const determineLevel = (paperType: string): string => {
    // Map paper types to academic levels
    const levelMap: Record<string, string> = {
      'research_paper': 'Undergraduate',
      'essay': 'High School',
      'thesis': 'Master',
      'dissertation': 'Ph.D.',
      'case_study': 'Undergraduate',
      'term_paper': 'Undergraduate',
      'book_review': 'High School',
      'article_review': 'Undergraduate',
      'annotated_bibliography': 'Master',
      'reaction_paper': 'High School',
      'lab_report': 'Ph.D.',
    };
    
    return levelMap[paperType] || 'Undergraduate';
  };

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    const days = Math.floor((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (days > 0) {
      return `${days}d ${date.getHours()}h`;
    } else {
      const hours = Math.floor((date.getTime() - new Date().getTime()) / (1000 * 60 * 60));
      return `${hours}h`;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: string; label: string }> = {
      'pending': { variant: 'warning', label: 'Pending' },
      'in_progress': { variant: 'info', label: 'In Progress' },
      'completed': { variant: 'success', label: 'Completed' },
      'cancelled': { variant: 'destructive', label: 'Cancelled' },
    };
    
    const config = statusConfig[status] || { variant: 'secondary', label: status };
    
    return (
      <Badge variant={config.variant as any}>{config.label}</Badge>
    );
  };

  const viewOrderDetails = (id: string) => {
    navigate(`/client-dashboard/orders/${id}`);
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="py-3 px-4 text-left font-medium text-muted-foreground">Topic</th>
              <th className="py-3 px-4 text-left font-medium text-muted-foreground">Level</th>
              <th className="py-3 px-4 text-left font-medium text-muted-foreground">Deadline</th>
              <th className="py-3 px-4 text-left font-medium text-muted-foreground">Number of pages</th>
              <th className="py-3 px-4 text-right font-medium text-muted-foreground">Salary</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr 
                key={order.id} 
                className="border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => viewOrderDetails(order.id)}
              >
                <td className="py-3 px-4">
                  <div className="font-medium">{order.topic || order.paper_type}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {order.assignment_code}
                  </div>
                </td>
                <td className="py-3 px-4">
                  {determineLevel(order.paper_type)}
                </td>
                <td className="py-3 px-4">
                  {formatDeadline(order.deadline)}
                </td>
                <td className="py-3 px-4">
                  {order.pages}
                </td>
                <td className="py-3 px-4 text-right font-medium text-green-600">
                  ${order.final_price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
