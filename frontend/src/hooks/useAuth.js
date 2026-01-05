// Custom hook for authentication
// Provides auth state and methods: login, logout, isAuthenticated

import { useAuth as useAuthContext } from '../context/AuthContext';

export const useAuth = () => {
  return useAuthContext();
};
