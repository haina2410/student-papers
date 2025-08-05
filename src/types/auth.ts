export interface RegisterData {
  email: string;
  password: string;
  cccd: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export type UserRole = "STUDENT" | "TEACHER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  name: string;
  cccd: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}