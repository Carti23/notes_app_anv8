import apiClient from './apiClient';

// User service functions
const userService = {
  // Find user by email
  findUserByEmail: async (email) => {
    try {
      const response = await apiClient.get(`/api/v1/users/find/?email=${encodeURIComponent(email)}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Failed to find user');
    }
  },

  // Get current user profile
  getCurrentUserProfile: async () => {
    try {
      const response = await apiClient.get('/api/v1/users/me/');
      return response.data;
    } catch (error) {
      throw error.response?.data || new Error('Failed to fetch user profile');
    }
  }
};

export default userService;