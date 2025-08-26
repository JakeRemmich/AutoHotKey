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



export const updatePassword = async (currentPassword: string, newPassword: string) => {
  console.log('=== API UPDATE PASSWORD REQUEST ===');
  console.log('Password update attempt for current user');

  try {
    console.log('Making API call to /api/auth/update-password...');
    const response = await api.put('/api/auth/update-password', {
      currentPassword,
      newPassword
    });
    console.log('API call completed successfully');

    const { success, message } = response.data;

    if (!success) {
      throw new Error(message || 'Password update failed');
    }

    console.log('Update password API response validated:', {
      success,
      message
    });

    console.log('=== END API UPDATE PASSWORD REQUEST ===');
    return response.data;
  } catch (error: any) {
    console.error('Update password API error:', error);
    console.log('=== END API UPDATE PASSWORD REQUEST (ERROR) ===');
    throw new Error(error?.response?.data?.message || error.message || 'Password update failed');
  }
};


export const updateEmail = async (newEmail: string, password: string) => {
  console.log('=== API UPDATE EMAIL REQUEST ===');
  console.log('Email update attempt for current user to:', newEmail);

  try {
    console.log('Making API call to /api/auth/update-email...');
    const response = await api.put('/api/auth/update-email', {
      newEmail,
      password
    });
    console.log('API call completed successfully');

    const { success, message, user } = response.data;

    if (!success) {
      throw new Error(message || 'Email update failed');
    }

    console.log('Update email API response validated:', {
      success,
      message,
      hasUser: !!user
    });

    console.log('=== END API UPDATE EMAIL REQUEST ===');
    return response.data;
  } catch (error: any) {
    console.error('Update email API error:', error);
    console.log('=== END API UPDATE EMAIL REQUEST (ERROR) ===');
    throw new Error(error?.response?.data?.message || error.message || 'Email update failed');
  }
}
