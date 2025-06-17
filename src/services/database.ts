import { User, UserRole } from '../types';

// Simple localStorage-based database service
class DatabaseService {
  private readonly USERS_KEY = 'virtudoc_users';
  private readonly CURRENT_USER_KEY = 'virtudoc_current_user';

  // Get all users from localStorage
  private getUsers(): User[] {
    try {
      const users = localStorage.getItem(this.USERS_KEY);
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Error reading users from localStorage:', error);
      return [];
    }
  }

  // Save users to localStorage
  private saveUsers(users: User[]): void {
    try {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users to localStorage:', error);
      throw new Error('Failed to save user data');
    }
  }

  // Register a new user
  async registerUser(userData: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }): Promise<User> {
    const users = this.getUsers();
    
    // Check if user already exists
    const existingUser = users.find(user => user.email.toLowerCase() === userData.email.toLowerCase());
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const newUser: User = {
      id: this.generateId(),
      name: userData.name,
      email: userData.email.toLowerCase(),
      role: userData.role,
      createdAt: new Date()
    };

    // Save password separately (in a real app, this would be hashed)
    const userWithPassword = {
      ...newUser,
      password: userData.password // In production, this should be hashed
    };

    users.push(userWithPassword);
    this.saveUsers(users);

    // Return user without password
    return newUser;
  }

  // Login user
  async loginUser(email: string, password: string): Promise<User> {
    const users = this.getUsers();
    
    const user = users.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      (u as any).password === password
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Save current user session
    const userSession = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userSession));
    
    return userSession;
  }

  // Get current logged-in user
  getCurrentUser(): User | null {
    try {
      const currentUser = localStorage.getItem(this.CURRENT_USER_KEY);
      if (currentUser) {
        const user = JSON.parse(currentUser);
        // Convert createdAt string back to Date object
        user.createdAt = new Date(user.createdAt);
        return user;
      }
      return null;
    } catch (error) {
      console.error('Error reading current user from localStorage:', error);
      return null;
    }
  }

  // Logout user
  logout(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  // Check if email exists
  async emailExists(email: string): Promise<boolean> {
    const users = this.getUsers();
    return users.some(user => user.email.toLowerCase() === email.toLowerCase());
  }

  // Get user by ID
  async getUserById(id: string): Promise<User | null> {
    const users = this.getUsers();
    const user = users.find(u => u.id === id);
    
    if (user) {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: new Date(user.createdAt)
      };
    }
    
    return null;
  }

  // Update user profile
  async updateUser(userId: string, updates: Partial<Pick<User, 'name' | 'email'>>): Promise<User> {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    // Check if email is being changed and if it already exists
    if (updates.email && updates.email !== users[userIndex].email) {
      const emailExists = users.some((u, index) => 
        index !== userIndex && u.email.toLowerCase() === updates.email!.toLowerCase()
      );
      if (emailExists) {
        throw new Error('Email already exists');
      }
    }

    // Update user
    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      email: updates.email ? updates.email.toLowerCase() : users[userIndex].email
    };

    this.saveUsers(users);

    // Update current user session if it's the same user
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      const updatedUser = {
        id: users[userIndex].id,
        name: users[userIndex].name,
        email: users[userIndex].email,
        role: users[userIndex].role,
        createdAt: new Date(users[userIndex].createdAt)
      };
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    }

    return {
      id: users[userIndex].id,
      name: users[userIndex].name,
      email: users[userIndex].email,
      role: users[userIndex].role,
      createdAt: new Date(users[userIndex].createdAt)
    };
  }

  // Generate a simple ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Clear all data (for development/testing)
  clearAllData(): void {
    localStorage.removeItem(this.USERS_KEY);
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  // Get all users (admin function)
  async getAllUsers(): Promise<User[]> {
    const users = this.getUsers();
    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: new Date(user.createdAt)
    }));
  }
}

// Export singleton instance
export const database = new DatabaseService();
export default database;
