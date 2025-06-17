import { User, UserRole } from '../types';

// Mock authentication service
// In production, this would integrate with AWS Cognito
class AuthService {
  private users: Array<User & { password: string }> = [];
  private currentUser: User | null = null;

  async signUp(email: string, password: string, name: string, role: UserRole): Promise<void> {
    // Check if user already exists
    if (this.users.find(u => u.email === email)) {
      throw new Error('User already exists');
    }

    // Create new user
    const newUser: User & { password: string } = {
      id: this.generateId(),
      email,
      name,
      role,
      password,
      createdAt: new Date(),
      emailVerified: false,
      mfaEnabled: false
    };

    this.users.push(newUser);
    
    // Simulate email verification requirement
    // In production, AWS Cognito would handle this
  }

  async confirmSignUp(email: string, code: string): Promise<void> {
    const user = this.users.find(u => u.email === email);
    if (!user) {
      throw new Error('User not found');
    }

    // Simulate code verification
    if (code !== '123456') {
      throw new Error('Invalid verification code');
    }

    user.emailVerified = true;
  }

  async signIn(email: string, password: string): Promise<User> {
    const user = this.users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.emailVerified) {
      throw new Error('Email not verified');
    }

    // Simulate MFA requirement for some users
    if (user.mfaEnabled) {
      throw new Error('MFA_REQUIRED');
    }

    const { password: _, ...userWithoutPassword } = user;
    this.currentUser = userWithoutPassword;
    
    // Store in localStorage for persistence
    localStorage.setItem('virtudoc_user', JSON.stringify(userWithoutPassword));
    
    return userWithoutPassword;
  }

  async confirmMfa(session: string, code: string): Promise<User> {
    // Simulate MFA verification
    if (code !== '123456') {
      throw new Error('Invalid MFA code');
    }

    if (!this.currentUser) {
      throw new Error('No active session');
    }

    return this.currentUser;
  }

  async forgotPassword(email: string): Promise<void> {
    const user = this.users.find(u => u.email === email);
    if (!user) {
      throw new Error('User not found');
    }

    // Simulate sending reset code
    console.log(`Reset code sent to ${email}: 123456`);
  }

  async confirmForgotPassword(email: string, code: string, newPassword: string): Promise<void> {
    const user = this.users.find(u => u.email === email);
    if (!user) {
      throw new Error('User not found');
    }

    if (code !== '123456') {
      throw new Error('Invalid reset code');
    }

    user.password = newPassword;
  }

  async resendConfirmationCode(email: string): Promise<void> {
    const user = this.users.find(u => u.email === email);
    if (!user) {
      throw new Error('User not found');
    }

    // Simulate resending code
    console.log(`Verification code sent to ${email}: 123456`);
  }

  async getCurrentUser(): Promise<User | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    // Try to restore from localStorage
    const stored = localStorage.getItem('virtudoc_user');
    if (stored) {
      try {
        this.currentUser = JSON.parse(stored);
        return this.currentUser;
      } catch {
        localStorage.removeItem('virtudoc_user');
      }
    }

    return null;
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
    localStorage.removeItem('virtudoc_user');
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const authService = new AuthService();