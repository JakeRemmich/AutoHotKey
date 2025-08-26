import api from './api';

// Description: Login user with email and password
// Endpoint: POST /api/auth/login
// Request: { email: string, password: string }
// Response: { success: boolean, user: { id: string, email: string }, accessToken: string, refreshToken: string }
export const login = async (email: string, password: string) => {
  console.log('=== API LOGIN REQUEST ===');
  console.log('Login attempt for email:', email);

  try {
    console.log('Making API call to /api/auth/login...');
    const response = await api.post('/api/auth/login', { email, password });
    console.log('API call completed successfully');

    const { success, user, accessToken, refreshToken } = response.data;

    if (!success || !accessToken || !user) {
      throw new Error('Invalid login response format');
    }

    console.log('Login API response validated:', {
      success,
      hasUser: !!user,
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken
    });

    console.log('=== END API LOGIN REQUEST ===');
    return response.data;
  } catch (error: any) {
    console.error('Login API error:', error);
    console.log('=== END API LOGIN REQUEST (ERROR) ===');
    throw new Error(error?.response?.data?.message || error.message || 'Login failed');
  }
};

// Description: Register new user
// Endpoint: POST /api/auth/register
// Request: { email: string, password: string }
// Response: { success: boolean, user: { id: string, email: string }, accessToken: string, refreshToken: string }
export const register = async (email: string, password: string) => {
  console.log('=== API REGISTER REQUEST ===');
  console.log('Register attempt for email:', email);

  try {
    const response = await api.post('/api/auth/register', { email, password });

    const { success, user, accessToken, refreshToken } = response.data;

    if (!success || !accessToken || !user) {
      throw new Error('Invalid registration response format');
    }

    console.log('Register API response validated:', {
      success,
      hasUser: !!user,
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken
    });

    console.log('=== END API REGISTER REQUEST ===');
    return response.data;
  } catch (error: any) {
    console.error('Register API error:', error);
    console.log('=== END API REGISTER REQUEST (ERROR) ===');
    throw new Error(error?.response?.data?.message || error.message || 'Registration failed');
  }
};

// For backward compatibility
export const registerUser = register;

// Description: Logout user
// Endpoint: POST /api/auth/logout
// Request: {}
// Response: { success: boolean, message: string }
export const logout = async () => {
  console.log('=== API LOGOUT REQUEST ===');

  try {
    const refreshToken = localStorage.getItem('refreshToken');

    // Call logout endpoint with refresh token
    const response = await api.post('/api/auth/logout', {
      refreshToken
    });

    console.log('Logout API response:', response.data);
    console.log('=== END API LOGOUT REQUEST ===');
    return response.data;
  } catch (error: any) {
    console.error('Logout API error:', error);
    console.log('=== END API LOGOUT REQUEST (ERROR) ===');

    // Don't throw error for logout - always succeed locally
    // The server-side cleanup is best effort
    return { success: true, message: 'Logged out locally' };
  }
};