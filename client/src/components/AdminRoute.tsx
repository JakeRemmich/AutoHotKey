import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUserUsage } from '@/api/user';
import { useToast } from '@/hooks/useToast';

interface AdminRouteProps {
    children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
    const { isAuthenticated, user, isInitialized } = useAuth();
    const { toast } = useToast();
    const [isAdmin, setIsAdmin] = React.useState<boolean | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const checkAdminStatus = async () => {
            console.log('=== ADMIN ROUTE CHECK ===');
            console.log('AdminRoute - isAuthenticated:', isAuthenticated);
            console.log('AdminRoute - user:', user);
            console.log('AdminRoute - isInitialized:', isInitialized);

            if (!isInitialized) {
                console.log('AuthContext not initialized yet, waiting...');
                return;
            }

            if (!isAuthenticated || !user) {
                console.log('User not authenticated, redirecting to login');
                setIsLoading(false);
                return;
            }

            try {
                console.log('Fetching user data to check admin role...');
                const userData = await getUserUsage();
                console.log('User data received:', userData);

                const userIsAdmin = userData.role === 'admin';
                console.log('User is admin:', userIsAdmin);

                setIsAdmin(userIsAdmin);

                if (!userIsAdmin) {
                    toast({
                        title: "Access Denied",
                        description: "You don't have permission to access the admin panel",
                        variant: "destructive"
                    });
                }
            } catch (error) {
                console.error('Error checking admin status:', error);
                setIsAdmin(false);
                toast({
                    title: "Error",
                    description: "Failed to verify admin access",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }

            console.log('=== END ADMIN ROUTE CHECK ===');
        };

        checkAdminStatus();
    }, [isAuthenticated, user, isInitialized, toast]);

    // Show loading while checking authentication and admin status
    if (!isInitialized || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verifying access...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    // Redirect to dashboard if not admin
    if (isAdmin === false) {
        return <Navigate to="/dashboard" replace />;
    }

    // Render admin content if user is admin
    return <>{children}</>;
}