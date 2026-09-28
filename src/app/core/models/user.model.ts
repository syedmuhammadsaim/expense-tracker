export interface User {
  id: string;
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  profileImage?: string;
  createdAt: string;
}

export interface AuthSession {
  userId: string;
  email: string;
  fullName: string;
  loginAt: string;
}