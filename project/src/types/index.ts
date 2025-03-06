
export enum UserRole {
  ADMIN = 'admin',
  WRITER = 'writer',
  CLIENT = 'client',
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  referenceNumber?: string;  // Optional because it might not be present for all users
  avatarUrl?: string;        // Optional field for user's profile picture
}

export interface FormData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: UserRole;
  confirmPassword?: string;
}

// OrderItem interface for use in components
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
  writer_id?: string;  // Added writer_id as optional
  user_id?: string;    // Added user_id as optional
}
