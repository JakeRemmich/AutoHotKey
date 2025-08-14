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

    console.log('Login API response received:');
    console.log('- Response status:', response.status);
    // console.log('- Response data keys:', Object.keys(response.data));
    // console.log('- Success:', response.data.success);
    // console.log('- Has user:', !!response.data.user);
    // console.log('- Has access token:', !!response.data.accessToken);
    // console.log('- Has refresh token:', !!response.data.refreshToken);
    // console.log('- User object:', response.data.user);
    // console.log('- Access token length:', response.data.accessToken ? response.data.accessToken.length : 0);
    // console.log('- Refresh token length:', response.data.refreshToken ? response.data.refreshToken.length : 0);

    if (response.data.success && response.data.accessToken) {
      console.log('Login successful, storing tokens in API layer...');

      // Store tokens in localStorage
      localStorage.setItem('accessToken', response.data.accessToken);
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }

      // Verify storage immediately
      const storedToken = localStorage.getItem('accessToken');
      console.log('API layer - Token stored and verified:', !!storedToken);
      console.log('API layer - Stored token matches response:', storedToken === response.data.accessToken);
    }

    console.log('=== END API LOGIN REQUEST ===');
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.message || error.message);
  }
};

// Description: Register new user
// Endpoint: POST /api/auth/register
// Request: { email: string, password: string }
// Response: { success: boolean, user: { id: string, email: string }, accessToken: string }
export const register = async (email: string, password: string) => {
  console.log('=== API REGISTER REQUEST ===');
  console.log('Register attempt for email:', email);

  try {
    const response = await api.post('/api/auth/register', { email, password });
    console.log('Register API response received:', {
      success: response.data.success,
      hasUser: !!response.data.user,
      hasAccessToken: !!response.data.accessToken
    });

    if (response.data.success && response.data.accessToken) {
      console.log('Registration successful, storing token...');

      // Store only access token for registration
      localStorage.setItem('accessToken', response.data.accessToken);

      // Verify storage immediately
      const storedToken = localStorage.getItem('accessToken');
      console.log('Token stored and verified:', !!storedToken);
      console.log('Stored token matches response:', storedToken === response.data.accessToken);
    }

    console.log('=== END API REGISTER REQUEST ===');
    return response.data;
  } catch (error) {
    console.error('Register API error:', error);
    console.error('Error response:', error?.response?.data);
    console.error('Error status:', error?.response?.status);
    console.error('Error message:', error?.response?.data?.message);
    console.log('=== END API REGISTER REQUEST (ERROR) ===');
    throw new Error(error?.response?.data?.message || error.message);
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
    const response = await api.post('/api/auth/logout');
    console.log('Logout API response:', response.data);

    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');

    console.log('LocalStorage cleared after logout');
    console.log('=== END API LOGOUT REQUEST ===');
    return response.data;
  } catch (error) {
    console.error('Logout API error:', error);

    // Clear localStorage even if API call fails
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');

    console.log('LocalStorage cleared after logout error');
    console.log('=== END API LOGOUT REQUEST (ERROR) ===');
    throw new Error(error?.response?.data?.message || error.message);
  }
};