import apiClient from './apiClient';

// Authentication service functions
const authService = {
  // Register new user
  register: async (username, email, password, confirmPassword) => {
    try {
      const response = await apiClient.post('/api/v1/auth/register/', {
        username,
        email,
        password,
        password2: confirmPassword || password
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Registration failed');
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/api/v1/auth/login/', {
        email,
        password
      });
      
      // Store tokens in localStorage
      if (response.data.token && response.data.token.access) {
        authService.setSession(
          response.data.token.access,
          response.data.token.refresh,
          {
            username: response.data.username || email.split('@')[0],
            email: email,
          }
        );
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Login failed');
    }
  },

  // Logout user
  logout: async () => {
    try {
      // Call backend logout endpoint
      await apiClient.post('/api/v1/auth/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear session data even if API call fails
      authService.clearSession();
    }
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await apiClient.post('/api/v1/auth/token/refresh/', {
        refresh: refreshToken
      });
      
      localStorage.setItem('accessToken', response.data.access);
      return response.data;
    } catch (error) {
      // If refresh fails, force logout
      authService.clearSession();
      throw error;
    }
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing user data:', e);
        return null;
      }
    }
    return null;
  },

  // Check if user is logged in
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },
  
  // Helper to set session data
  setSession: (accessToken, refreshToken, userData) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
  },
  
  // Helper to clear session data
  clearSession: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
};

export default authService;