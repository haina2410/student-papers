import { auth } from "@/lib/auth";

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

export type Session = typeof auth.$Infer.Session;
export type User = Session["user"];