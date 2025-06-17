import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Heart, 
  Bell, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Settings,
  Shield,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useAppStore } from '../../stores/appStore';
import { webSocketService } from '../../services/webSocketService';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { 
    sidebarOpen, 
    setSidebarOpen, 
    notifications, 
    unreadCount, 
    isConnected,
    markNotificationRead 
  } = useAppStore();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    // Connect to WebSocket when component mounts
    if (user) {
      webSocketService.connect(user.id, user.role);
    }

    // Cleanup on unmount
    return () => {
      webSocketService.disconnect();
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await authService.signOut();
      webSocketService.disconnect();
      logout();
      toast.success('Signed out successfully');
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error signing out');
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'patient': return 'Patient';
      case 'healthworker': return 'Health Worker';
      case 'doctor': return 'Doctor';
      default: return '';
    }
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/patient')) return 'Patient Dashboard';
    if (path.includes('/healthworker')) return 'Health Worker Dashboard';
    if (path.includes('/doctor')) return 'Doctor Dashboard';
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo and title */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">VirtuDoc</h1>
                  <p className="text-xs text-gray-500 hidden sm:block">AI-Powered Healthcare</p>
                </div>
              </div>
              
              <div className="hidden md:block">
                <h2 className="text-lg font-semibold text-gray-700">{getPageTitle()}</h2>
              </div>
            </div>

            {/* Right side - Status and user menu */}
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <div className="flex items-center text-green-600">
                    <Wifi className="w-4 h-4 mr-1" />
                    <span className="text-xs hidden sm:inline">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <WifiOff className="w-4 h-4 mr-1" />
                    <span className="text-xs hidden sm:inline">Disconnected</span>
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 10).map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                              !notification.read ? 'bg-primary-50' : ''
                            }`}
                            onClick={() => {
                              markNotificationRead(notification.id);
                              setShowNotifications(false);
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                  {new Date(notification.createdAt).toLocaleString()}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-primary-500 rounded-full ml-2 mt-1"></div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                          <p>No notifications</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{getRoleDisplayName(user?.role || '')}</p>
                  </div>
                </button>

                {/* User Dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <p className="text-xs text-primary-600 mt-1">{getRoleDisplayName(user?.role || '')}</p>
                    </div>
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('/settings');
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Settings
                      </button>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          navigate('/security');
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Shield className="w-4 h-4 mr-3" />
                        Security
                      </button>
                    </div>
                    <div className="border-t border-gray-200 py-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* HIPAA Compliance Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span>HIPAA Compliant</span>
              </div>
              <span>•</span>
              <span>© 2024 VirtuDoc. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Built with</span>
              <a
                href="https://bolt.new"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-medium rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
                ⚡ Bolt.new
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Click outside handlers */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowNotifications(false)}
        />
      )}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;