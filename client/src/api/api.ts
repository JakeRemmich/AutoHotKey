import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  // baseURL: 'https://auto-hot-key-rzo3.vercel.app',
  timeout: 10000,
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}> = [];

// Process queued requests after successful token refresh
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Function to clear all auth data consistently
const clearAuthData = () => {
  console.log('API: Clearing all auth data');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('userData');

  // Dispatch custom event to notify AuthContext
  window.dispatchEvent(new CustomEvent('authCleared'));
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Don't trigger token refresh for auth endpoints
    const isAuthEndpoint = originalRequest.url?.includes('/api/auth/');

    // Check if this is a token-related error
    const isTokenError = error.response?.status === 401 &&
      (error.response?.data?.code === 'TOKEN_EXPIRED' ||
        error.response?.data?.message?.includes('token'));

    if (isTokenError && !originalRequest._retry && !isAuthEndpoint) {
      console.log('=== TOKEN REFRESH ATTEMPT ===');

      // If already refreshing, queue this request
      if (isRefreshing) {
        console.log('Token refresh in progress, queuing request');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        console.log('No refresh token available');
        isRefreshing = false;
        processQueue(new Error('No refresh token'), null);
        clearAuthData();
        return Promise.reject(error);
      }

      try {
        console.log('Attempting token refresh...');

        // Create a new axios instance to avoid interceptor loops
        const refreshResponse = await axios.post(
          `${api.defaults.baseURL}/api/auth/refresh`,
          { refreshToken },
          { timeout: 5000 } // Shorter timeout for refresh requests
        );

        const { accessToken, refreshToken: newRefreshToken, user } = refreshResponse.data;

        if (!accessToken) {
          throw new Error('No access token in refresh response');
        }

        // Update localStorage atomically
        localStorage.setItem('accessToken', accessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }
        if (user) {
          localStorage.setItem('userData', JSON.stringify(user));
        }

        console.log('Token refresh successful');

        // Process queued requests
        processQueue(null, accessToken);

        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Retry the original request
        return api(originalRequest);

      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);

        // Process queued requests with error
        processQueue(refreshError, null);

        // Clear all auth data
        clearAuthData();

        // Only redirect if we're not already on auth pages
        const currentPath = window.location.pathname;
        if (!['/login', '/register'].includes(currentPath)) {
          console.log('Redirecting to login due to auth failure');
          // Use replace to avoid back button issues
          window.location.replace('/login');
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other 401/403 errors that aren't token-related
    if ((error.response?.status === 401 || error.response?.status === 403) && !isAuthEndpoint) {
      console.log('Non-token auth error, clearing auth data');
      clearAuthData();

      const currentPath = window.location.pathname;
      if (!['/login', '/register'].includes(currentPath)) {
        window.location.replace('/login');
      }
    }

    return Promise.reject(error);
  }
);

export default api;