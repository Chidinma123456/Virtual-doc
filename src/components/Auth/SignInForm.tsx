import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../stores/authStore';
import AuthLayout from './AuthLayout';
import toast from 'react-hot-toast';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type SignInFormData = z.infer<typeof signInSchema>;

interface SignInFormProps {
  onSuccess: () => void;
  onSwitchToSignUp: () => void;
  onForgotPassword: (email: string) => void;
  onMfaRequired: (session: string) => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ 
  onSuccess, 
  onSwitchToSignUp, 
  onForgotPassword,
  onMfaRequired 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setMfaRequired } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: 'onChange',
  });

  const email = watch('email');

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    
    try {
      const result = await authService.signIn(data.email, data.password);
      
      if (result.success) {
        if (result.mfaRequired && result.session) {
          setMfaRequired(true, result.session);
          onMfaRequired(result.session);
          toast.success('Please enter your MFA code');
        } else if (result.user) {
          setUser(result.user);
          toast.success(`Welcome back, ${result.user.name}!`);
          onSuccess();
        }
      } else {
        toast.error(result.error || 'Failed to sign in');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (email) {
      onForgotPassword(email);
    } else {
      toast.error('Please enter your email address first');
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your VirtuDoc account"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              {...register('email')}
              className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                errors.email
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
              }`}
              placeholder="Enter your email"
            />
          </div>
          {errors.email && (
            <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              {...register('password')}
              className={`block w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                errors.password
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
              }`}
              placeholder="Enter your password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              {...register('rememberMe')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm text-primary-600 hover:text-primary-500 font-medium transition-colors"
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Signing In...
            </div>
          ) : (
            <>
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </>
          )}
        </button>

        {/* Security Notice */}
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-primary-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-primary-800">Secure Authentication</p>
              <p className="text-sm text-primary-700 mt-1">
                Your account is protected with enterprise-grade security and optional MFA.
              </p>
            </div>
          </div>
        </div>

        {/* Switch to Sign Up */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignUp}
              className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              Sign up here
            </button>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default SignInForm;