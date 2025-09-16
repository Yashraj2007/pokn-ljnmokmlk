import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Helper function to normalize user object
  const normalizeUser = (userData) => {
    if (!userData) return null;
    
    console.log('🔍 [AUTH] Raw user data from API:', userData);
    
    // Ensure we have both id and userId fields for compatibility
    const normalizedUser = {
      ...userData,
      id: userData._id || userData.id || userData.userId, // MongoDB ObjectId
      userId: userData._id || userData.userId || userData.id, // Alternative field
      _id: userData._id || userData.id || userData.userId, // Keep original
    };
    
    console.log('✅ [AUTH] Normalized user data:', {
      id: normalizedUser.id,
      userId: normalizedUser.userId,
      _id: normalizedUser._id,
      name: normalizedUser.name,
      email: normalizedUser.email
    });
    
    // ✅ Validate that we have a proper MongoDB ObjectId
    const objectId = normalizedUser.id;
    if (!objectId || typeof objectId !== 'string' || objectId.length !== 24) {
      console.error('❌ [AUTH] Invalid ObjectId format:', objectId);
      console.error('❌ [AUTH] Expected: 24-character hex string like "507f1f77bcf86cd799439011"');
      console.error('❌ [AUTH] Received:', objectId, 'Length:', objectId?.length, 'Type:', typeof objectId);
    } else {
      console.log('✅ [AUTH] Valid ObjectId detected:', objectId);
    }
    
    return normalizedUser;
  };

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('pmis-auth-token');
      
      if (!token) {
        console.log('⏳ [AUTH] No token found, user not authenticated');
        setLoading(false);
        return;
      }

      console.log('🔍 [AUTH] Token found, checking authentication...');

      try {
        const response = await authAPI.getCurrentUser();
        console.log('✅ [AUTH] getCurrentUser response:', response);
        
        const userData = response.data.data.user;
        const normalizedUser = normalizeUser(userData);
        
        if (normalizedUser?.id) {
          setUser(normalizedUser);
          setIsAuthenticated(true);
          console.log('✅ [AUTH] User authenticated successfully');
        } else {
          throw new Error('Invalid user data - missing ObjectId');
        }
      } catch (error) {
        console.error('❌ [AUTH] Auth check failed:', error);
        localStorage.removeItem('pmis-auth-token');
        localStorage.removeItem('pmis-refresh-token');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      console.log('🔍 [AUTH] Attempting login...');
      const response = await authAPI.login(credentials);
      console.log('✅ [AUTH] Login response:', response);
      
      const { user: userData, token, refreshToken } = response.data.data;

      localStorage.setItem('pmis-auth-token', token);
      localStorage.setItem('pmis-refresh-token', refreshToken);
      
      const normalizedUser = normalizeUser(userData);
      setUser(normalizedUser);
      setIsAuthenticated(true);

      console.log('✅ [AUTH] Login successful');
      return { success: true, user: normalizedUser };
    } catch (error) {
      console.error('❌ [AUTH] Login failed:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      console.log('🔍 [AUTH] Attempting registration...');
      const response = await authAPI.register(userData);
      console.log('✅ [AUTH] Registration response:', response);
      
      const { user: newUser, token, refreshToken } = response.data.data;

      localStorage.setItem('pmis-auth-token', token);
      localStorage.setItem('pmis-refresh-token', refreshToken);
      
      const normalizedUser = normalizeUser(newUser);
      setUser(normalizedUser);
      setIsAuthenticated(true);

      console.log('✅ [AUTH] Registration successful');
      return { success: true, user: normalizedUser };
    } catch (error) {
      console.error('❌ [AUTH] Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🔍 [AUTH] Logging out...');
      await authAPI.logout();
    } catch (error) {
      console.error('❌ [AUTH] Logout API call failed:', error);
    } finally {
      localStorage.removeItem('pmis-auth-token');
      localStorage.removeItem('pmis-refresh-token');
      setUser(null);
      setIsAuthenticated(false);
      console.log('✅ [AUTH] Logout complete');
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
