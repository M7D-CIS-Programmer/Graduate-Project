import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api, SuspendedError } from '../api/api';

const AuthContext = createContext();

// ── Storage helpers ────────────────────────────────────────────────────────────

const readUser = () => {
  try {
    const tab = sessionStorage.getItem('user');
    if (tab) return JSON.parse(tab);

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
    status:         userData.status         || 'Active',   // ← persisted so we can read it on load
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
  sessionStorage.setItem('user', payload);
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

// ── Provider ──────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const [user, setUser]           = useState(readUser);
  const [loading, setLoading]     = useState(true);
  // true when the backend has told us this session is suspended
  const [isSuspended, setIsSuspended] = useState(false);

  useEffect(() => {
    setLoading(false);
    // If the user was stored as suspended (e.g. page refresh after suspension),
    // immediately show the suspension screen without waiting for an API call.
    const stored = readUser();
    if (stored?.status === 'Suspended') setIsSuspended(true);
  }, []);

  const login = (userData) => {
    const userToStore = {
      ...userData,
      token:         userData.token,
      dashboardPath: userData.dashboardPath,
      status:        userData.status || 'Active',
    };
    setUser(userToStore);
    setIsSuspended(false);
    writeUser(userToStore);
    if (userData.token) writeToken(userData.token);
  };

  const logout = useCallback(() => {
    setUser(null);
    setIsSuspended(false);
    clearStorage();
    queryClient.clear();
  }, [queryClient]);

  // Called by any component that catches a SuspendedError from an API call.
  // Updates local state so the suspension screen is shown immediately, then
  // clears the session so no further authenticated requests are made.
  const handleSuspension = useCallback(() => {
    // Update stored user's status so a page refresh still shows the screen
    const stored = readUser();
    if (stored) {
      writeUser({ ...stored, status: 'Suspended' });
      setUser(u => u ? { ...u, status: 'Suspended' } : u);
    }
    setIsSuspended(true);
    // Clear the token so no further API calls are made with the old JWT
    sessionStorage.removeItem('token');
    localStorage.removeItem('token');
    queryClient.clear();
  }, [queryClient]);

  const updateUser = async (newData) => {
    try {
      const response = await api.updateUser(user.id, newData);
      const updatedUser = {
        ...user,
        ...newData,
        ...response,
        token:         user.token,
        dashboardPath: user.dashboardPath,
        status:        user.status,
      };
      setUser(updatedUser);
      writeUser(updatedUser);
      return updatedUser;
    } catch (error) {
      if (error instanceof SuspendedError) handleSuspension();
      console.error('Failed to update user', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout, updateUser,
      isSuspended, handleSuspension
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined)
    throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
