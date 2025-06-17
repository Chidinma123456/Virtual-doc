import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, User } from '../types';
import { database } from '../services/database';

interface UserContextType {
  userRole: UserRole | null;
  user: User | null;
  setUserRole: (role: UserRole) => void;
  setUser: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userRole, setUserRoleState] = useState<UserRole | null>(null);
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from database on mount
  useEffect(() => {
    const initializeUser = () => {
      try {
        const currentUser = database.getCurrentUser();
        if (currentUser) {
          setUserState(currentUser);
          setUserRoleState(currentUser.role);
        }
      } catch (error) {
        console.error('Error initializing user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, []);

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
  };

  const setUser = (userData: User) => {
    setUserState(userData);
    setUserRoleState(userData.role);
    // The database service already handles localStorage
  };

  const logout = () => {
    setUserRoleState(null);
    setUserState(null);
    database.logout();
  };

  const value: UserContextType = {
    userRole,
    user,
    setUserRole,
    setUser,
    logout,
    isLoading
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};