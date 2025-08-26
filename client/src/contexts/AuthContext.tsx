import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  role: string;
  subscription_plan?: string;
  scripts_generated_count?: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isInitialized: boolean;
  login: (user: User, accessToken: string, refreshToken?: string) => void;
  logout: () => void;
  clearAuth: () => void; // For handling failed refresh attempts
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Centralized function to clear all auth data
  const clearAuth = useCallback(() => {
    console.log('=== CLEARING AUTH STATE ===');

    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');

    // Clear React state
    setUser(null);
    setIsAuthenticated(false);

    console.log('Auth state cleared completely');
    console.log('=== END CLEARING AUTH STATE ===');
  }, []);

  // Function to validate stored tokens
  const validateStoredAuth = useCallback(() => {
    const accessToken = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('userData');
    const refreshToken = localStorage.getItem('refreshToken');

    // All required data must be present
    if (!accessToken || !userData || !refreshToken) {
      console.log('Missing required auth data:', {
        hasAccessToken: !!accessToken,
        hasUserData: !!userData,
        hasRefreshToken: !!refreshToken
      });
      return null;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (!parsedUser.id || !parsedUser.email) {
        console.log('Invalid user data structure:', parsedUser);
        return null;
      }
      return parsedUser;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }, []);

  // Initialize auth state from localStorage
  useEffect(() => {
    console.log('=== AUTH CONTEXT INITIALIZATION ===');

    const validUser = validateStoredAuth();

    if (validUser) {
      console.log('Valid auth data found, setting authenticated state');
      setUser(validUser);
      setIsAuthenticated(true);
    } else {
      console.log('No valid auth data found, clearing any partial data');
      clearAuth();
    }

    setIsInitialized(true);
    console.log('AuthContext initialization complete');
    console.log('=== END AUTH CONTEXT INITIALIZATION ===');
  }, [validateStoredAuth, clearAuth]);

  const login = useCallback((user: User, accessToken: string, refreshToken?: string) => {
    console.log('=== AUTH CONTEXT LOGIN ===');
    console.log('Login called with user:', user);
    console.log('Tokens provided:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken
    });

    try {
      // Validate required data
      if (!user.id || !user.email || !accessToken) {
        throw new Error('Missing required login data');
      }

      // Store in localStorage atomically
      const userData = JSON.stringify(user);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('userData', userData);

      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      // Verify storage was successful
      const storedToken = localStorage.getItem('accessToken');
      const storedUserData = localStorage.getItem('userData');

      if (storedToken !== accessToken || storedUserData !== userData) {
        throw new Error('Failed to store auth data in localStorage');
      }

      // Update React state only after successful storage
      setUser(user);
      setIsAuthenticated(true);

      console.log('Login successful - auth state updated');
      console.log('=== END AUTH CONTEXT LOGIN ===');
    } catch (error) {
      console.error('Error during login:', error);
      // Clear any partial data on error
      clearAuth();
      throw error; // Re-throw so the caller can handle it
    }
  }, [clearAuth]);

  const logout = useCallback(() => {
    console.log('=== AUTH CONTEXT LOGOUT ===');
    clearAuth();
    console.log('=== END AUTH CONTEXT LOGOUT ===');
  }, [clearAuth]);

  // Listen for storage events from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (['accessToken', 'refreshToken', 'userData'].includes(e.key || '')) {
        console.log('Storage change detected, revalidating auth state');

        const validUser = validateStoredAuth();
        if (validUser) {
          setUser(validUser);
          setIsAuthenticated(true);
        } else {
          clearAuth();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [validateStoredAuth, clearAuth]);

  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
    isInitialized,
    login,
    logout,
    clearAuth
  };

  console.log('AuthContext render state:', {
    isAuthenticated,
    hasUser: !!user,
    isInitialized,
    userId: user?.id
  });

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}