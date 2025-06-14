import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole, User } from '../types';

interface UserContextType {
  userRole: UserRole | null;
  user: User | null;
  setUserRole: (role: UserRole) => void;
  setUser: (user: User) => void;
  logout: () => void;
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

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    // Store in localStorage for persistence
    localStorage.setItem('userRole', role);
  };

  const setUser = (userData: User) => {
    setUserState(userData);
    setUserRoleState(userData.role);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userRole', userData.role);
  };

  const logout = () => {
    setUserRoleState(null);
    setUserState(null);
    localStorage.removeItem('userRole');
    localStorage.removeItem('user');
  };

  // Initialize from localStorage on mount
  React.useEffect(() => {
    const storedRole = localStorage.getItem('userRole') as UserRole;
    const storedUser = localStorage.getItem('user');
    
    if (storedRole) {
      setUserRoleState(storedRole);
    }
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUserState(userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
      }
    }
  }, []);

  return (
    <UserContext.Provider value={{
      userRole,
      user,
      setUserRole,
      setUser,
      logout
    }}>
      {children}
    </UserContext.Provider>
  );
};