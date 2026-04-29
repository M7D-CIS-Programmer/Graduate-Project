import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../api/api';

const AuthContext = createContext();

// ---------------------------------------------------------------------------
// Storage helpers
//
// sessionStorage  → per-tab, survives page refresh, invisible to other tabs
// localStorage    → shared across tabs, used only as a fallback for new tabs
//                   or browser restarts (when sessionStorage is empty)
//
// Read order on every page load:
//   1. sessionStorage['user']  – this tab already owns a session → use it
//   2. localStorage['user']    – new tab / browser restart → promote to sessionStorage
//   3. null                    – not logged in
// ---------------------------------------------------------------------------

const readUser = () => {
  try {
    const tab = sessionStorage.getItem('user');
    if (tab) return JSON.parse(tab);

    // New tab or browser restart — restore from localStorage and own the copy
    const persisted = localStorage.getItem('user');
    if (persisted) {
      const token = localStorage.getItem('token') || '';
      sessionStorage.setItem('user', persisted);
      if (token) sessionStorage.setItem('token', token);
      return JSON.parse(persisted);
    }
  } catch (e) {
    console.error('Failed to parse user from storage', e);
  }
  return null;
};

const writeUser = (userData) => {
  const payload = JSON.stringify({
    id:             userData.id,
    name:           userData.name,
    email:          userData.email,
    role:           userData.role,
    location:       userData.location,
    phone:          userData.phone,
    website:        userData.website        || '',
    description:    userData.description    || '',
    linkedIn:       userData.linkedIn       || '',
    github:         userData.github         || '',
    industry:       userData.industry       || '',
    profilePicture: userData.profilePicture || userData.photo || null,
    createdAt:      userData.createdAt,
    dashboardPath:  userData.dashboardPath,
    savedJobs:      userData.savedJobs      || [],
    appliedJobs:    userData.appliedJobs    || [],
    notifications:  userData.notifications  || [],
  });
  // Tab-specific copy (primary source of truth for this tab)
  sessionStorage.setItem('user', payload);
  // Shared fallback — lets new tabs or browser restarts restore the last session
  localStorage.setItem('user', payload);
};

const writeToken = (token) => {
  sessionStorage.setItem('token', token);
  localStorage.setItem('token', token);
};

const clearStorage = () => {
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('token');
};

// ---------------------------------------------------------------------------

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(readUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = (userData) => {
    const userToStore = {
      ...userData,
      token:         userData.token,
      dashboardPath: userData.dashboardPath,
    };

    setUser(userToStore);
    writeUser(userToStore);
    if (userData.token) writeToken(userData.token);
  };

  const logout = () => {
    setUser(null);
    clearStorage();
    queryClient.clear();
  };

  const updateUser = async (newData) => {
    try {
      const response = await api.updateUser(user.id, newData);
      const updatedUser = {
        ...user,
        ...newData,
        ...response,
        token:         user.token,
        dashboardPath: user.dashboardPath,
      };
      setUser(updatedUser);
      writeUser(updatedUser);
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
