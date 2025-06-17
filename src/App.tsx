import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import HomePage from './pages/HomePage';
import RoleSelection from './components/Auth/RoleSelection';
import UnifiedAuth from './components/Auth/UnifiedAuth';
import LoginForm from './components/Auth/LoginForm';
import SignUpForm from './components/Auth/SignUpForm';
import PatientPage from './pages/PatientPage';
import HealthWorkerPage from './pages/HealthWorkerPage';
import DoctorDashboard from './pages/DoctorDashboard';
import { UserRole, User } from './types';
import { ArrowRight } from 'lucide-react';

const AppContent: React.FC = () => {
  const { userRole, user, setUser, isLoading } = useUser();
  const [showAuth, setShowAuth] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null);

  const handleGetStarted = () => {
    setShowAuth(true);
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setAuthMode('login'); // Default to login
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
    setShowAuth(false);
    setAuthMode(null);
    setSelectedRole(null);
  };

  const handleSignUp = (userData: User) => {
    setUser(userData);
    setShowAuth(false);
    setAuthMode(null);
    setSelectedRole(null);
  };

  const handleBackToHome = () => {
    setShowAuth(false);
    setAuthMode(null);
    setSelectedRole(null);
  };

  const handleBackToRoleSelection = () => {
    setAuthMode(null);
    setSelectedRole(null);
  };

  const handleSwitchToSignUp = () => {
    setAuthMode('signup');
  };

  const handleSwitchToLogin = () => {
    setAuthMode('login');
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading VirtuDoc...</p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, show homepage or auth flow
  if (!user || !userRole) {
    // Show unified auth (no role selection needed for login)
    if (showAuth && !selectedRole) {
      return (
        <UnifiedAuth
          onLogin={handleLogin}
          onBack={handleBackToHome}
        />
      );
    }

    // Show role-specific auth (legacy flow for role-specific signup)
    if (authMode && selectedRole) {
      if (authMode === 'signup') {
        return (
          <SignUpForm
            role={selectedRole}
            onSignUp={handleSignUp}
            onBack={handleBackToRoleSelection}
            onSwitchToLogin={handleSwitchToLogin}
          />
        );
      } else {
        return (
          <LoginForm
            role={selectedRole}
            onLogin={handleLogin}
            onBack={handleBackToRoleSelection}
            onSwitchToSignUp={handleSwitchToSignUp}
          />
        );
      }
    }

    // Show role selection if coming from legacy flow
    if (selectedRole === null && authMode) {
      return <RoleSelection onRoleSelect={handleRoleSelect} />;
    }
    
    // Show homepage with enhanced CTA
    return (
      <div>
        <HomePage />
        {/* Floating CTA Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2"
          >
            <span className="font-semibold">Get Started</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  // Route based on user role
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={`/${userRole}`} replace />} />
        <Route 
          path="/patient" 
          element={userRole === 'patient' ? <PatientPage /> : <Navigate to={`/${userRole}`} replace />} 
        />
        <Route 
          path="/worker" 
          element={userRole === 'worker' ? <HealthWorkerPage /> : <Navigate to={`/${userRole}`} replace />} 
        />
        <Route 
          path="/doctor" 
          element={userRole === 'doctor' ? <DoctorDashboard /> : <Navigate to={`/${userRole}`} replace />} 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
};

export default App;