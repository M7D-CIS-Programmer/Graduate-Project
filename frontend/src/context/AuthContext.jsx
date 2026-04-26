import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
        const saved = sessionStorage.getItem('user');
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        console.error('Failed to parse user from sessionStorage', e);
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
    sessionStorage.setItem('user', JSON.stringify({
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      location: userData.location,
      phone: userData.phone,
      website: userData.website || '',
      description: userData.description || '',
      linkedIn: userData.linkedIn || '',
      github: userData.github || '',
      industry: userData.industry || '',
      photo: userData.photo || null,
      createdAt: userData.createdAt,
      dashboardPath: userData.dashboardPath,
      savedJobs: userData.savedJobs || [],
      appliedJobs: userData.appliedJobs || [],
      notifications: userData.notifications || []
    }));
    
    // Store token separately for API calls
    if (userData.token) {
      sessionStorage.setItem('token', userData.token);
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
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
      
      // Update sessionStorage — include ALL profile fields so inputs stay populated
      const userToStore = {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        location: updatedUser.location,
        phone: updatedUser.phone,
        website: updatedUser.website || '',
        description: updatedUser.description || '',
        linkedIn: updatedUser.linkedIn || '',
        github: updatedUser.github || '',
        industry: updatedUser.industry || '',
        photo: updatedUser.photo || null,
        createdAt: updatedUser.createdAt,
        dashboardPath: updatedUser.dashboardPath,
        savedJobs: updatedUser.savedJobs || [],
        appliedJobs: updatedUser.appliedJobs || [],
        notifications: updatedUser.notifications || []
      };
      sessionStorage.setItem('user', JSON.stringify(userToStore));
      
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
