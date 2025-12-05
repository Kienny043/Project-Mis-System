import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import LandingPage from './pages/LandingPage.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Dashboard from './components/Dashboard.jsx';
import MaintenanceList from './components/MaintenanceList.jsx';
import MaintenanceRequestForm from './components/MaintenanceRequestForm.jsx';
import Calendar from './components/Calendar.jsx';
import ManagementOverview from './components/MaintenanceOverviewPage.jsx';
import ComplaintsPage from './pages/ComplaintsPage.jsx';
import BuildingsPage from './pages/BuildingsPage.jsx';
import StaffersPage from './pages/StaffersPage.jsx';
import TrackRequest from './pages/TrackRequest.jsx';
import AccountSettingsDashboard from './components/Account.jsx';
import UserDashboard from './components/UserDashboard.jsx'
import UserAccountSettingsDashboard from './components/UserProfile.jsx'
import UserHome from './pages/UserHome.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx';

function PrivateRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles) {
    const userRole = user?.role?.toLowerCase().trim() || 'user';
    const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase().trim());
    
    // Check if user's role matches any allowed role or contains staff
    const hasAccess = normalizedAllowedRoles.some(allowedRole => {
      if (allowedRole.includes('staff') && userRole.includes('staff')) {
        return true;
      }
      return userRole === allowedRole;
    });
    
    if (!hasAccess) {
      console.log('Access denied. User role:', userRole, 'Allowed:', allowedRoles);
      return <Navigate to="/home" />;
    }
  }
  
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/home" />;
}

// Public access - no auth required
function PublicPage({ children }) {
  return children;
}

function Sidebar() {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return null;

  const isActive = (path) => location.pathname === path;

  // Role-based navigation configuration
  const getNavigationItems = () => {
    const role = user?.role?.toLowerCase().trim() || 'user';
    
    console.log('Current user role:', role); // Debug log
        
    // Admin navigation
    if (role === 'admin' || role === 'administrator') {
      return [
        { path: '/home', label: 'Dashboard' },
        { path: '/management', label: 'Management' },
        { path: '/analytics', label: 'Analytics' },
        { path: '/account', label: 'Account' }
      ];
    }
    
    // Staff navigation (matches: staff, maintenance staff)
    if (role === 'staff' || role === 'maintenance staff' || role.includes('staff')) {
      return [
        { path: '/home', label: 'Dashboard' },
        { path: '/dashboard', label: 'Assigned Request' },
        { path: '/account', label: 'Account' }
      ];
    }
    
    // User navigation (default)
    return [
      { path: '/user-dashboard', label: 'Dashboard' },
      { path: '/public-home', label: 'Home' },
      { path: '/track-requests', label: 'Track Requests' },
      { path: '/submit-request', label: '+ Submit Request' }
    ];
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="fixed left-0 top-0 w-60 h-screen bg-[#0a2540] text-white p-6 flex flex-col justify-between shadow-xl/30">
      {/* Logo */}
      <div>
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 rounded-full bg-white p-4 mb-4 shadow-lg">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="#3b82f6"/>
              <text x="50" y="35" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">DLL</text>
              <text x="50" y="55" textAnchor="middle" fill="white" fontSize="12">MAINT</text>
              <text x="50" y="70" textAnchor="middle" fill="white" fontSize="12">TRACKER</text>
            </svg>
          </div>
          <h3 className="text-lg font-medium">Hi, {user?.username || 'User'}</h3>
          <p className="text-sm text-gray-300 capitalize">{user?.role || 'Staff'}</p>
        </div>

        {/* Menu Items with Active Border */}
        <div className="space-y-2">
          {/* Regular navigation items */}
          {navigationItems.map((item) => {
            if (item.path === '/submit-request') return null; // skip for now
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-6 py-3 rounded-xl transition-all text-center font-medium
                  ${isActive(item.path)
                    ? 'bg-transparent border-2 border-orange-500 text-white'
                    : 'border-2 border-transparent hover:bg-white/10 hover:border-orange-300 text-white'
                  }`}
              >
                {item.label}
              </Link>
            );
          })}

        </div>
        <div className="pt-4"> {/* pt-4 adds spacing from the previous links */}
          {navigationItems
            .filter(item => item.path === '/submit-request')
            .map(item => (
              <Link
                key={item.path}
                to={item.path}
                className="block px-6 py-3 rounded-xl transition-all text-center font-medium bg-green-600 text-white hover:bg-green-700 border-2 border-green-700"
              >
                {item.label}
              </Link>
            ))}
        </div>
      </div>

    </nav>
  );
}

function RoleBasedDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  React.useEffect(() => {
    const role = user?.role?.toLowerCase().trim() || 'user';
    
    // Redirect users to their specific dashboard
    if (role === 'user') {
      navigate('/public-home', { replace: true });
    }
    // Admin and staff stay on /home
  }, [user, navigate]);
  
  return <Dashboard />;
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className={`flex-1 ${isAuthenticated ? 'ml-60' : 'ml-0'} transition-all`}>
        <Routes>
          {/* Landing Page - Public */}
          <Route
            path="/"
            element={
              <PublicPage>
                <LandingPage />
              </PublicPage>
            }
          />
          
          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <Register />
            }
          />
          
          {/* Common Dashboard */}
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <RoleBasedDashboard />
              </PrivateRoute>
            }
          />
          
          {/* Staff Routes - Keep /dashboard for backward compatibility */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute allowedRoles={['staff', 'maintenance staff', 'admin', 'administrator']}>
                <MaintenanceList />
              </PrivateRoute>
            }
          />
          <Route
            path="/user-dashboard"
            element={
              <PrivateRoute allowedRoles={['user']}>
                <UserDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/user-accounts/"
            element={
              <PrivateRoute allowedRoles={['user']}>
                <UserAccountSettingsDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/assigned-requests"
            element={
              <PrivateRoute allowedRoles={['staff', 'maintenance staff', 'admin', 'administrator']}>
                <MaintenanceList />
              </PrivateRoute>
            }
          />
          
          {/* Admin Routes */}
          <Route
            path="/management"
            element={
              <PrivateRoute allowedRoles={['admin', 'administrator']}>
                <ManagementOverview/>
              </PrivateRoute>
            }
          />
          <Route
            path="/requests"
            element={
              <PrivateRoute allowedRoles={['admin', 'administrator']}>
                <div className="p-8">
                  <h1 className="text-3xl font-bold">All Requests</h1>
                  <p className="text-gray-600 mt-4">Request management coming soon...</p>
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <PrivateRoute allowedRoles={['admin', 'administrator']}>
                <AnalyticsPage/>
              </PrivateRoute>
            }
          />
          
          {/* User Routes */}
          <Route
            path="/public-home"
            element={
              <PrivateRoute>
                <UserHome/>
              </PrivateRoute>
            }
          />
          <Route
            path="/track-requests"
            element={
              <PrivateRoute>
                <TrackRequest/>
              </PrivateRoute>
            }
          />
          
          {/* Shared Routes */}
          <Route
            path="/account"
            element={
              <PrivateRoute>
                <AccountSettingsDashboard/>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/calendar"
            element={
              <PrivateRoute>
                <Calendar />
              </PrivateRoute>
            }
          />
          <Route
            path="/submit-request"
            element={
              <PrivateRoute>
                <MaintenanceRequestForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/maintenance/buildings"
            element={
              <PrivateRoute>
                <BuildingsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/maintenance/staffers"
            element={
              <PrivateRoute>
                <StaffersPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/maintenance/complaints"
            element={
              <PrivateRoute>
                <ComplaintsPage />
              </PrivateRoute>
            }
          />
          
          <Route path="/" element={<Navigate to="/landing" />} />
          <Route path="/landing" element={<PublicPage><LandingPage /></PublicPage>} />
            
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;