import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isInitialized, clearAuth } = useAuth();

  // Listen for auth cleared events from API layer
  useEffect(() => {
    const handleAuthCleared = () => {
      console.log('ProtectedRoute: Received auth cleared event');
      clearAuth();
    };

    window.addEventListener('authCleared', handleAuthCleared);
    return () => window.removeEventListener('authCleared', handleAuthCleared);
  }, [clearAuth]);

  // Wait for auth context to initialize
  if (!isInitialized) {
    console.log('ProtectedRoute: Auth context not yet initialized');
    return <div>Loading...</div>; // Or your loading component
  }

  // Check authentication state
  if (!isAuthenticated) {
    console.log('ProtectedRoute: User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute: User authenticated, rendering children');
  return <>{children}</>;
}