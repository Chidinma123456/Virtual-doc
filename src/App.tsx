import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import RoleSelection from './components/Auth/RoleSelection';
import SignUpForm from './components/Auth/SignUpForm';
import PatientPage from './pages/PatientPage';
import HealthWorkerPage from './pages/HealthWorkerPage';
import DoctorDashboard from './pages/DoctorDashboard';
import { UserRole, User } from './types';

const AppContent: React.FC = () => {
  const { userRole, user, setUser } = useUser();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showSignUp, setShowSignUp] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setShowSignUp(true);
  };

  const handleSignUp = (userData: User) => {
    setUser(userData);
    setShowSignUp(false);
    setSelectedRole(null);
  };

  const handleBackToRoleSelection = () => {
    setShowSignUp(false);
    setSelectedRole(null);
  };

  // If user is not authenticated, show auth flow
  if (!user || !userRole) {
    if (showSignUp && selectedRole) {
      return (
        <SignUpForm
          role={selectedRole}
          onSignUp={handleSignUp}
          onBack={handleBackToRoleSelection}
        />
      );
    }
    
    return <RoleSelection onRoleSelect={handleRoleSelect} />;
  }

  // Route based on user role
  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            userRole === 'patient' ? <Navigate to="/patient" replace /> :
            userRole === 'worker' ? <Navigate to="/health-worker" replace /> :
            userRole === 'doctor' ? <Navigate to="/doctor" replace /> :
            <Navigate to="/auth" replace />
          } 
        />
        <Route 
          path="/patient" 
          element={userRole === 'patient' ? <PatientPage /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/health-worker" 
          element={userRole === 'worker' ? <HealthWorkerPage /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/doctor" 
          element={userRole === 'doctor' ? <DoctorDashboard /> : <Navigate to="/" replace />} 
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