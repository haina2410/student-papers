import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";
import type { Session } from "better-auth/types";

// Define user roles enum for type safety
export enum UserRole {
  STUDENT = "STUDENT",
  TEACHER = "TEACHER",
  ADMIN = "ADMIN"
}

// Define the session with role information
export interface AuthSession extends Session {
  user: {
    id: string;
    name: string;
    email: string;
    role?: string;
    cccd?: string;
  };
}

/**
 * Get the current session from request headers
 * This is used in API routes to get the authenticated user session
 */
export async function getSessionFromRequest(request: NextRequest): Promise<AuthSession | null> {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    return session as AuthSession | null;
  } catch (error) {
    console.error("Error getting session from request:", error);
    return null;
  }
}

/**
 * Check if a user has the required role
 */
export function hasRole(session: AuthSession | null, requiredRole: UserRole | UserRole[]): boolean {
  if (!session?.user?.role) {
    return false;
  }

  const userRole = session.user.role as UserRole;
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(userRole);
  }
  
  return userRole === requiredRole;
}

/**
 * Check if a user is a teacher
 */
export function isTeacher(session: AuthSession | null): boolean {
  return hasRole(session, UserRole.TEACHER);
}

/**
 * Check if a user is a student
 */
export function isStudent(session: AuthSession | null): boolean {
  return hasRole(session, UserRole.STUDENT);
}

/**
 * Check if a user is an admin
 */
export function isAdmin(session: AuthSession | null): boolean {
  return hasRole(session, UserRole.ADMIN);
}

/**
 * Verify authorization for API routes
 * Returns session if authorized, throws error if not
 */
export async function verifyAuthorization(
  request: NextRequest,
  requiredRole: UserRole | UserRole[]
): Promise<AuthSession> {
  const session = await getSessionFromRequest(request);
  
  if (!session) {
    throw new Error("Authentication required");
  }
  
  if (!hasRole(session, requiredRole)) {
    throw new Error("Insufficient permissions");
  }
  
  return session;
}

/**
 * Authorization error types
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401,
    public code: string = "UNAUTHORIZED"
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export class ForbiddenError extends AuthError {
  constructor(message: string = "Forbidden - insufficient permissions") {
    super(message, 403, "FORBIDDEN");
  }
}

export class UnauthorizedError extends AuthError {
  constructor(message: string = "Unauthorized - authentication required") {
    super(message, 401, "UNAUTHORIZED");
  }
}

/**
 * Handle authorization errors in API routes
 */
export function handleAuthError(error: unknown) {
  if (error instanceof AuthError) {
    return {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode
    };
  }
  
  if (error instanceof Error) {
    if (error.message === "Authentication required") {
      return {
        error: "Authentication required",
        code: "UNAUTHORIZED",
        statusCode: 401
      };
    }
    
    if (error.message === "Insufficient permissions") {
      return {
        error: "Forbidden - insufficient permissions",
        code: "FORBIDDEN", 
        statusCode: 403
      };
    }
  }
  
  return {
    error: "Internal server error",
    code: "INTERNAL_ERROR",
    statusCode: 500
  };
}
