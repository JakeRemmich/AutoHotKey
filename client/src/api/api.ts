import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 10000,
});

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

    // If the error is 401 or 403 and we haven't already tried to refresh
    // and it's not an auth endpoint (login/register/refresh)
    if ((error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry &&
      !isAuthEndpoint) {

      originalRequest._retry = true;

      console.log('=== TOKEN REFRESH ATTEMPT ===');
      const refreshToken = localStorage.getItem('refreshToken');
      console.log('Refresh token exists:', !!refreshToken);

      if (refreshToken) {
        try {
          console.log('Attempting to refresh token...');

          // Create a new axios instance to avoid interceptor loops
          const refreshResponse = await axios.post(`${api.defaults.baseURL}/api/auth/refresh`, {
            refreshToken: refreshToken
          });

          const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data;

          // Update tokens in localStorage
          localStorage.setItem('accessToken', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          // Update the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;


          // Retry the original request
          return api(originalRequest);
        } catch (refreshError) {


          // Refresh failed, clear tokens and redirect to login
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userData');

          // Only redirect if we're not already on the login page
          // if (window.location.pathname !== '/login') {
          //   window.location.href = '/login';
          // }

          return Promise.reject(refreshError);
        }
      } else {

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');

        // Only redirect if we're not already on the login page and it's a protected route
        // if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        //   window.location.href = '/login';
        // }

        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;