import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  console.log('=== PROTECTED ROUTE CHECK ===');
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);
  console.log('ProtectedRoute - user:', user);
  console.log('ProtectedRoute - localStorage accessToken exists:', !!localStorage.getItem('accessToken'));
  console.log('ProtectedRoute - localStorage userData exists:', !!localStorage.getItem('userData'));

  // Check localStorage directly as a fallback during initialization
  const hasTokens = localStorage.getItem('accessToken') && localStorage.getItem('userData');

  if (!isAuthenticated && !hasTokens) {
    console.log('ProtectedRoute - User not authenticated, redirecting to login');
    console.log('=== END PROTECTED ROUTE CHECK ===');
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute - User authenticated, rendering children');
  console.log('=== END PROTECTED ROUTE CHECK ===');
  return <>{children}</>;
}