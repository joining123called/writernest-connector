
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
  referenceNumber: string;
}

export interface FormData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: UserRole;
  confirmPassword?: string;
}
