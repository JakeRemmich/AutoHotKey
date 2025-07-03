import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isInitialized: boolean;
  login: (user: User, accessToken: string, refreshToken?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log('=== AUTH CONTEXT INITIALIZATION ===');
    
    const accessToken = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('userData');
    
    console.log('Access token exists:', !!accessToken);
    console.log('Access token value:', accessToken ? `${accessToken.substring(0, 20)}...` : 'null');
    console.log('User data exists:', !!userData);
    console.log('User data value:', userData);
    
    if (accessToken && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('Parsed user data:', parsedUser);
        
        setUser(parsedUser);
        setIsAuthenticated(true);
        console.log('User authenticated from localStorage');
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');
        console.log('Cleared invalid localStorage data');
      }
    } else {
      console.log('No valid authentication data found in localStorage');
    }
    
    setIsInitialized(true);
    console.log('AuthContext initialization complete');
    console.log('=== END AUTH CONTEXT INITIALIZATION ===');
  }, []);

  const login = (user: User, accessToken: string, refreshToken?: string) => {
    console.log('=== AUTH CONTEXT LOGIN ===');
    console.log('Login called with user:', user);
    console.log('Access token provided:', !!accessToken);
    console.log('Access token length:', accessToken ? accessToken.length : 0);
    console.log('Refresh token provided:', !!refreshToken);
    console.log('Refresh token length:', refreshToken ? refreshToken.length : 0);

    try {
      console.log('About to store tokens in localStorage...');
      
      // Store tokens and user data
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('userData', JSON.stringify(user));
      
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      console.log('Tokens stored, verifying...');

      // Verify storage immediately
      const storedToken = localStorage.getItem('accessToken');
      const storedUserData = localStorage.getItem('userData');
      const storedRefreshToken = localStorage.getItem('refreshToken');

      console.log('Verification results:');
      console.log('- Access token stored successfully:', !!storedToken);
      console.log('- User data stored successfully:', !!storedUserData);
      console.log('- Refresh token stored successfully:', !!storedRefreshToken);
      console.log('- Stored token matches provided:', storedToken === accessToken);
      console.log('- Stored user data:', storedUserData);

      console.log('About to update React state...');
      setUser(user);
      setIsAuthenticated(true);
      console.log('React state updated');

      console.log('Auth state updated - isAuthenticated: true');
      console.log('=== END AUTH CONTEXT LOGIN ===');
    } catch (error) {
      console.error('Error during login storage:', error);
      console.error('Error details:', error);
    }
  };

  const logout = () => {
    console.log('=== AUTH CONTEXT LOGOUT ===');
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    
    setUser(null);
    setIsAuthenticated(false);
    
    console.log('User logged out and localStorage cleared');
    console.log('=== END AUTH CONTEXT LOGOUT ===');
  };

  console.log('AuthContext render - isAuthenticated:', isAuthenticated, 'user:', user, 'isInitialized:', isInitialized);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isInitialized, login, logout }}>
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