import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './stores/authStore';
import { authService } from './services/authService';

// Auth Components
import SignUpForm from './components/Auth/SignUpForm';
import SignInForm from './components/Auth/SignInForm';
import MfaForm from './components/Auth/MfaForm';
import EmailVerificationForm from './components/Auth/EmailVerificationForm';
import ForgotPasswordForm from './components/Auth/ForgotPasswordForm';

// Layout Components
import DashboardLayout from './components/Layout/DashboardLayout';

// Page Components
import PatientDashboard from './pages/PatientDashboard';
import HealthWorkerDashboard from './pages/HealthWorkerDashboard';
import DoctorDashboard from './pages/DoctorDashboard';

const App: React.FC = () => {
  const { user, isAuthenticated, setUser, setLoading, mfaRequired, tempCredentials } = useAuthStore();
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'mfa' | 'verify' | 'forgot'>('signin');
  const [pendingEmail, setPendingEmail] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Check for existing session on app load
    const initializeAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [setUser]);

  // Show loading spinner during initialization
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading VirtuDoc...</p>
        </div>
      </div>
    );
  }

  // Auth flow handlers
  const handleSignUpSuccess = (email: string) => {
    setPendingEmail(email);
    setAuthMode('verify');
  };

  const handleSignInSuccess = () => {
    // Navigation will be handled by the route protection
  };

  const handleMfaRequired = (session: string) => {
    setAuthMode('mfa');
  };

  const handleForgotPassword = (email: string) => {
    setPendingEmail(email);
    setAuthMode('forgot');
  };

  const handleBackToSignIn = () => {
    setAuthMode('signin');
    setPendingEmail('');
  };

  // If user is authenticated, show dashboard based on role
  if (isAuthenticated && user) {
    return (
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Navigate to={`/${user.role}`} replace />} />
              <Route 
                path="/patient" 
                element={user.role === 'patient' ? <PatientDashboard /> : <Navigate to={`/${user.role}`}  />} 
              />
              <Route 
                path="/healthworker" 
                element={user.role === 'healthworker' ? <HealthWorkerDashboard /> : <Navigate to={`/${user.role}`} />} 
              />
              <Route 
                path="/doctor" 
                element={user.role === 'doctor' ? <DoctorDashboard /> : <Navigate to={`/${user.role}`} />} 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#374151',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                border: '1px solid #E5E7EB',
                borderRadius: '0.75rem',
              },
            }}
          />
        </div>
      </Router>
    );
  }

  // Show MFA form if required
  if (mfaRequired && tempCredentials) {
    return (
      <>
        <MfaForm
          session={tempCredentials}
          onSuccess={handleSignInSuccess}
          onBack={handleBackToSignIn}
        />
        <Toaster position="top-right" />
      </>
    );
  }

  // Show appropriate auth form
  const renderAuthForm = () => {
    switch (authMode) {
      case 'signup':
        return (
          <SignUpForm
            onSuccess={handleSignUpSuccess}
            onSwitchToSignIn={() => setAuthMode('signin')}
          />
        );
      case 'verify':
        return (
          <EmailVerificationForm
            email={pendingEmail}
            onSuccess={handleSignInSuccess}
            onBack={handleBackToSignIn}
            onResend={() => {/* Implement resend logic */}}
          />
        );
      case 'forgot':
        return (
          <ForgotPasswordForm
            email={pendingEmail}
            onSuccess={handleBackToSignIn}
            onBack={handleBackToSignIn}
          />
        );
      default:
        return (
          <SignInForm
            onSuccess={handleSignInSuccess}
            onSwitchToSignUp={() => setAuthMode('signup')}
            onForgotPassword={handleForgotPassword}
            onMfaRequired={handleMfaRequired}
          />
        );
    }
  };

  return (
    <>
      {renderAuthForm()}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#374151',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid #E5E7EB',
            borderRadius: '0.75rem',
          },
        }}
      />
    </>
  );
};

export default App;