import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useEffect } from 'react';

interface GuestRouteProps {
    children: React.ReactNode;
    redirectTo?: string; // Where to redirect authenticated users
}

export function GuestRoute({ children, redirectTo = '/dashboard' }: GuestRouteProps) {
    const { isAuthenticated, isInitialized, clearAuth } = useAuth();

    // Listen for auth cleared events from API layer
    useEffect(() => {
        const handleAuthCleared = () => {
            console.log('GuestRoute: Received auth cleared event');
            clearAuth();
        };

        window.addEventListener('authCleared', handleAuthCleared);
        return () => window.removeEventListener('authCleared', handleAuthCleared);
    }, [clearAuth]);

    // Wait for auth context to initialize
    if (!isInitialized) {
        console.log('GuestRoute: Auth context not yet initialized');
        return <div>Loading...</div>; // Or your loading component
    }

    // If user is authenticated, redirect to dashboard or specified route
    if (isAuthenticated) {
        console.log('GuestRoute: User is authenticated, redirecting to:', redirectTo);
        return <Navigate to={redirectTo} replace />;
    }

    console.log('GuestRoute: User not authenticated, rendering auth pages');
    return <>{children}</>;
}