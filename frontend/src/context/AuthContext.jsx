import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        console.error('Failed to parse user from localStorage', e);
        return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fast initialization, just verify session
    setLoading(false);
  }, []);

  const login = (userData) => {
    // Store user object (without token in localStorage.user to keep it clean)
    const userToStore = {
      ...userData,
      // Extract token-related fields
      token: userData.token,
      dashboardPath: userData.dashboardPath
    };
    
    setUser(userToStore);
    
    // Store user data (without sensitive token)
    localStorage.setItem('user', JSON.stringify({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      location: userData.location,
      phone: userData.phone,
      createdAt: userData.createdAt,
      dashboardPath: userData.dashboardPath
    }));
    
    // Store token separately for API calls
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateUser = async (newData) => {
    try {
      const response = await api.updateUser(user.id, newData);
      const updatedUser = { 
        ...user, 
        ...newData, 
        ...response,
        token: user.token,
        dashboardPath: user.dashboardPath
      };
      setUser(updatedUser);
      
      // Update localStorage (preserve token separately)
      const userToStore = {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        location: updatedUser.location,
        phone: updatedUser.phone,
        createdAt: updatedUser.createdAt,
        dashboardPath: updatedUser.dashboardPath
      };
      localStorage.setItem('user', JSON.stringify(userToStore));
      
      return updatedUser;
    } catch (error) {
      console.error('Failed to update user', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
