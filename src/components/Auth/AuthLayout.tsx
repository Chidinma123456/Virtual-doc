import React from 'react';
import { Heart, Shield, Clock, Users } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex">
      {/* Left Panel - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-secondary-500 p-12 flex-col justify-between text-white">
        <div>
          <div className="flex items-center mb-8">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">VirtuDoc</h1>
              <p className="text-primary-100">AI-Powered Healthcare</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-3xl font-bold leading-tight">
              Revolutionizing Healthcare with AI
            </h2>
            <p className="text-lg text-primary-100">
              Secure, HIPAA-compliant telemedicine platform connecting patients, 
              health workers, and doctors through intelligent AI assistance.
            </p>
            
            <div className="space-y-4 mt-8">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-secondary-200" />
                <span>HIPAA Compliant & Secure</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-secondary-200" />
                <span>24/7 AI Health Assistant</span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-secondary-200" />
                <span>Multi-Role Healthcare Platform</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-primary-200">
          <p>© 2024 VirtuDoc. All rights reserved.</p>
          <p className="mt-1">Built with enterprise-grade security and compliance.</p>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="lg:hidden flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center mr-3">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-gray-900">VirtuDoc</h1>
                <p className="text-gray-600">AI-Powered Healthcare</p>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-600">{subtitle}</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-soft p-8 border border-gray-100">
            {children}
          </div>
          
          <div className="text-center mt-6 text-sm text-gray-500">
            <p>Secure authentication powered by AWS Cognito</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;