
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
