
export enum OrderStatus {
  AWAITING_PAYMENT = 'awaiting_payment',
  PAYMENT_CONFIRMED = 'payment_confirmed',
  WRITER_ASSIGNED = 'writer_assigned',
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  AWAITING_CLIENT_FEEDBACK = 'awaiting_client_feedback',
  REVISION_IN_PROGRESS = 'revision_in_progress',
  REVISIONS_REQUESTED = 'revisions_requested',
  QUALITY_CHECK = 'quality_check',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  // Writer-specific statuses
  AVAILABLE = 'available',
  CLAIMED = 'claimed',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  RESUBMITTED = 'resubmitted'
}

export interface OrderItem {
  id: string;
  assignment_code: string;
  topic: string | null;
  paper_type: string;
  subject: string;
  deadline: string;
  pages: number;
  final_price: number;
  status: string;
  instructions?: string | null;
  citation_style?: string | null;
  sources?: number | null;
  created_at: string;
  user_id: string;
  writer_id?: string | null;
}

export interface OrderFile {
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  created_at: string;
}

export const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case OrderStatus.COMPLETED:
      return 'success';
    case OrderStatus.IN_PROGRESS:
    case OrderStatus.WRITER_ASSIGNED:
    case OrderStatus.SUBMITTED:
    case OrderStatus.RESUBMITTED:
      return 'default';
    case OrderStatus.AWAITING_PAYMENT:
    case OrderStatus.PAYMENT_CONFIRMED:
    case OrderStatus.NOT_STARTED:
    case OrderStatus.AVAILABLE:
    case OrderStatus.CLAIMED:
      return 'secondary';
    case OrderStatus.REVISION_IN_PROGRESS:
    case OrderStatus.REVISIONS_REQUESTED:
    case OrderStatus.QUALITY_CHECK:
    case OrderStatus.UNDER_REVIEW:
      return 'warning';
    case OrderStatus.DISPUTED:
    case OrderStatus.CANCELLED:
    case OrderStatus.REFUNDED:
      return 'destructive';
    case OrderStatus.ON_HOLD:
    case OrderStatus.AWAITING_CLIENT_FEEDBACK:
      return 'outline';
    case OrderStatus.DELIVERED:
      return 'premium';
    default:
      return 'outline';
  }
};

export const getStatusLabel = (status: string): string => {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};
