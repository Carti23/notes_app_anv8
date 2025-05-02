import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import { useNavigate } from 'react-router-dom';

// Create context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Load user from localStorage on initial load and set up token refresh
  useEffect(() => {
    const loadUser = () => {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    loadUser();
    
    // Set up event listener for storage changes (for multi-tab support)
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'accessToken') {
        loadUser();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      const data = await authService.login(email, password);
      
      // Immediately update the user state with the new user data
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      
      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      
      // Clear user state
      setUser(null);
      
      // Navigate to login page
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      
      // Even if there's an error, we should clear local user state
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (username, email, password, confirmPassword) => {
    try {
      setLoading(true);
      return await authService.register(username, email, password, confirmPassword);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user && authService.isAuthenticated();
  };

  // Context value
  const value = {
    user,
    loading,
    login,
    logout,
    register,
    isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;