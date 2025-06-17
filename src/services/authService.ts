import { 
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  ChangePasswordCommand,
  AssociateSoftwareTokenCommand,
  VerifySoftwareTokenCommand,
  SetUserMFAPreferenceCommand,
  GetUserCommand,
  UpdateUserAttributesCommand,
  GlobalSignOutCommand
} from '@aws-sdk/client-cognito-identity-provider';
import { User, UserRole } from '../types';

class AuthService {
  private client: CognitoIdentityProviderClient;
  private userPoolId: string;
  private clientId: string;

  constructor() {
    this.userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID || '';
    this.clientId = import.meta.env.VITE_COGNITO_CLIENT_ID || '';
    
    this.client = new CognitoIdentityProviderClient({
      region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async signUp(email: string, password: string, name: string, role: UserRole): Promise<{ success: boolean; userSub?: string; error?: string }> {
    try {
      const command = new SignUpCommand({
        ClientId: this.clientId,
        Username: email,
        Password: password,
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'name', Value: name },
          { Name: 'custom:role', Value: role },
        ],
      });

      const response = await this.client.send(command);
      
      return {
        success: true,
        userSub: response.UserSub,
      };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  async confirmSignUp(email: string, confirmationCode: string): Promise<{ success: boolean; error?: string }> {
    try {
      const command = new ConfirmSignUpCommand({
        ClientId: this.clientId,
        Username: email,
        ConfirmationCode: confirmationCode,
      });

      await this.client.send(command);
      
      return { success: true };
    } catch (error: any) {
      console.error('Confirm sign up error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  async signIn(email: string, password: string): Promise<{ 
    success: boolean; 
    user?: User; 
    accessToken?: string;
    mfaRequired?: boolean;
    session?: string;
    error?: string;
  }> {
    try {
      const command = new InitiateAuthCommand({
        ClientId: this.clientId,
        AuthFlow: 'USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      });

      const response = await this.client.send(command);

      if (response.ChallengeName === 'SOFTWARE_TOKEN_MFA') {
        return {
          success: true,
          mfaRequired: true,
          session: response.Session,
        };
      }

      if (response.AuthenticationResult?.AccessToken) {
        const user = await this.getUserFromToken(response.AuthenticationResult.AccessToken);
        
        // Store tokens securely
        localStorage.setItem('accessToken', response.AuthenticationResult.AccessToken);
        localStorage.setItem('refreshToken', response.AuthenticationResult.RefreshToken || '');
        localStorage.setItem('idToken', response.AuthenticationResult.IdToken || '');

        return {
          success: true,
          user,
          accessToken: response.AuthenticationResult.AccessToken,
        };
      }

      return {
        success: false,
        error: 'Authentication failed',
      };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  async verifyMFA(session: string, mfaCode: string): Promise<{
    success: boolean;
    user?: User;
    accessToken?: string;
    error?: string;
  }> {
    try {
      const command = new RespondToAuthChallengeCommand({
        ClientId: this.clientId,
        ChallengeName: 'SOFTWARE_TOKEN_MFA',
        Session: session,
        ChallengeResponses: {
          SOFTWARE_TOKEN_MFA_CODE: mfaCode,
        },
      });

      const response = await this.client.send(command);

      if (response.AuthenticationResult?.AccessToken) {
        const user = await this.getUserFromToken(response.AuthenticationResult.AccessToken);
        
        // Store tokens securely
        localStorage.setItem('accessToken', response.AuthenticationResult.AccessToken);
        localStorage.setItem('refreshToken', response.AuthenticationResult.RefreshToken || '');
        localStorage.setItem('idToken', response.AuthenticationResult.IdToken || '');

        return {
          success: true,
          user,
          accessToken: response.AuthenticationResult.AccessToken,
        };
      }

      return {
        success: false,
        error: 'MFA verification failed',
      };
    } catch (error: any) {
      console.error('MFA verification error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  async forgotPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const command = new ForgotPasswordCommand({
        ClientId: this.clientId,
        Username: email,
      });

      await this.client.send(command);
      
      return { success: true };
    } catch (error: any) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  async confirmForgotPassword(email: string, confirmationCode: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const command = new ConfirmForgotPasswordCommand({
        ClientId: this.clientId,
        Username: email,
        ConfirmationCode: confirmationCode,
        Password: newPassword,
      });

      await this.client.send(command);
      
      return { success: true };
    } catch (error: any) {
      console.error('Confirm forgot password error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  async setupMFA(): Promise<{ success: boolean; secretCode?: string; error?: string }> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const command = new AssociateSoftwareTokenCommand({
        AccessToken: accessToken,
      });

      const response = await this.client.send(command);
      
      return {
        success: true,
        secretCode: response.SecretCode,
      };
    } catch (error: any) {
      console.error('Setup MFA error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  async verifyMFASetup(mfaCode: string): Promise<{ success: boolean; error?: string }> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        throw new Error('No access token found');
      }

      const verifyCommand = new VerifySoftwareTokenCommand({
        AccessToken: accessToken,
        UserCode: mfaCode,
      });

      await this.client.send(verifyCommand);

      // Enable MFA for the user
      const setMFACommand = new SetUserMFAPreferenceCommand({
        AccessToken: accessToken,
        SoftwareTokenMfaSettings: {
          Enabled: true,
          PreferredMfa: true,
        },
      });

      await this.client.send(setMFACommand);
      
      return { success: true };
    } catch (error: any) {
      console.error('Verify MFA setup error:', error);
      return {
        success: false,
        error: this.getErrorMessage(error),
      };
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        return null;
      }

      return await this.getUserFromToken(accessToken);
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async signOut(): Promise<void> {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        const command = new GlobalSignOutCommand({
          AccessToken: accessToken,
        });
        await this.client.send(command);
      }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('idToken');
    }
  }

  private async getUserFromToken(accessToken: string): Promise<User> {
    const command = new GetUserCommand({
      AccessToken: accessToken,
    });

    const response = await this.client.send(command);
    
    const getAttribute = (name: string) => 
      response.UserAttributes?.find(attr => attr.Name === name)?.Value || '';

    return {
      id: response.Username || '',
      cognitoId: response.Username || '',
      email: getAttribute('email'),
      name: getAttribute('name'),
      role: getAttribute('custom:role') as UserRole,
      isVerified: getAttribute('email_verified') === 'true',
      mfaEnabled: response.MFAOptions?.length > 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private getErrorMessage(error: any): string {
    switch (error.name) {
      case 'UsernameExistsException':
        return 'An account with this email already exists';
      case 'InvalidPasswordException':
        return 'Password does not meet requirements';
      case 'CodeMismatchException':
        return 'Invalid verification code';
      case 'ExpiredCodeException':
        return 'Verification code has expired';
      case 'NotAuthorizedException':
        return 'Invalid email or password';
      case 'UserNotConfirmedException':
        return 'Please verify your email address';
      case 'TooManyRequestsException':
        return 'Too many requests. Please try again later';
      default:
        return error.message || 'An unexpected error occurred';
    }
  }
}

export const authService = new AuthService();