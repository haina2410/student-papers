import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { UserRole } from "@/lib/auth-utils";

export interface UseAuthorizationOptions {
  requiredRole?: UserRole | UserRole[];
  redirectTo?: string;
  allowUnauthenticated?: boolean;
}

/**
 * Custom hook for client-side authorization and route protection
 */
export function useAuthorization(options: UseAuthorizationOptions = {}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  
  const {
    requiredRole,
    redirectTo = "/login",
    allowUnauthenticated = false
  } = options;

  // Check if user has required role
  const hasRequiredRole = () => {
    if (!session?.user?.role) {
      return allowUnauthenticated;
    }

    if (!requiredRole) {
      return true; // No specific role required
    }

    const userRole = session.user.role as UserRole;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userRole);
    }
    
    return userRole === requiredRole;
  };

  // Check if user is authenticated
  const isAuthenticated = Boolean(session?.user);
  
  // Check if user is authorized (authenticated + has required role)
  const isAuthorized = isAuthenticated && hasRequiredRole();
  
  // Check if user is a teacher
  const isTeacher = session?.user?.role === UserRole.TEACHER;
  
  // Check if user is a student
  const isStudent = session?.user?.role === UserRole.STUDENT;
  
  // Check if user is an admin
  const isAdmin = session?.user?.role === UserRole.ADMIN;

  useEffect(() => {
    // Don't redirect while session is loading
    if (isPending) return;

    const checkAuth = () => {
      const userRole = session?.user?.role as UserRole;
      const isAuthenticated = Boolean(session?.user);
      
      // Check if user has required role
      const hasRole = () => {
        if (!session?.user?.role) {
          return allowUnauthenticated;
        }

        if (!requiredRole) {
          return true; // No specific role required
        }
        
        if (Array.isArray(requiredRole)) {
          return requiredRole.includes(userRole);
        }
        
        return userRole === requiredRole;
      };

      // If authentication is required but user is not authenticated
      if (!allowUnauthenticated && !isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      // If specific role is required but user doesn't have it
      if (requiredRole && isAuthenticated && !hasRole()) {
        // Redirect based on user's actual role
        if (userRole === UserRole.TEACHER) {
          router.push("/dashboard/gv");
        } else if (userRole === UserRole.STUDENT) {
          router.push("/dashboard/student");
        } else {
          router.push("/");
        }
        return;
      }
    };

    checkAuth();
  }, [session, isPending, router, requiredRole, redirectTo, allowUnauthenticated]);

  return {
    session,
    isLoading: isPending,
    isAuthenticated,
    isAuthorized,
    isTeacher,
    isStudent,
    isAdmin,
    userRole: session?.user?.role as UserRole | undefined,
    hasRequiredRole: hasRequiredRole()
  };
}

/**
 * Hook specifically for teacher-only pages
 */
export function useTeacherAuth() {
  return useAuthorization({
    requiredRole: UserRole.TEACHER,
    redirectTo: "/login"
  });
}

/**
 * Hook specifically for student-only pages
 */
export function useStudentAuth() {
  return useAuthorization({
    requiredRole: UserRole.STUDENT,
    redirectTo: "/login"
  });
}

/**
 * Hook for pages that require authentication but no specific role
 */
export function useRequireAuth() {
  return useAuthorization({
    allowUnauthenticated: false,
    redirectTo: "/login"
  });
}
