import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function Header({ showSearch = false }) {
  const { isAuthenticated, user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
  };

  const handleLogin = () => {
    navigate('/login');
    setShowProfileMenu(false);
  };

  const handleRegister = () => {
    navigate('/register');
    setShowProfileMenu(false);
  };

  const handleAccount = () => {
    navigate('/account');
    setShowProfileMenu(false);
  };

  const handleUserAccount = () => {
    navigate('/user-accounts');
    setShowProfileMenu(false);
  };

  // Check if user is admin
  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';


  return (
    <div className="relative">
      {/* Background Image - Fixed at top */}
      <div className="h-32 bg-cover bg-center" style={{ backgroundImage: 'url(/src/images/bg.png)', backgroundPosition: 'center'}}>
        <div className="absolute inset-0 bg-black/60"></div>
        {showSearch && (
          <div className="relative h-full bg-gradient-to-b from-gray-900/85 to-gray-900/95 flex items-center justify-center px-6">
            <div className="w-full max-w-7xl mx-auto flex items-center gap-4">
              {/* Search Bar - Made wider */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search requests..."
                  className="w-full px-6 py-3 rounded-full border-2 border-gray-300 focus:outline-none focus:border-blue-400 transition-colors text-gray-700 placeholder-gray-400"
                />
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400">
                  🔍
                </span>
              </div>

              {/* Notification Icon */}
              <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors flex items-center justify-center relative">
                <span className="text-xl">🔔</span>
                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Profile Icon with Dropdown */}
              <div className="relative">
                <button
                  onClick={handleProfileClick}
                  className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors flex items-center justify-center text-white font-bold shadow-lg"
                >
                  {isAuthenticated ? (
                    user?.username?.charAt(0).toUpperCase() || '👤'
                  ) : (
                    '👤'
                  )}
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 py-2 z-50">
                    {isAuthenticated ? (
                      <>
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-200">
                          <p className="font-semibold text-gray-800">{user?.username}</p>
                          <p className="text-sm text-gray-500 capitalize">{user?.role || 'User'}</p>
                          <p className="text-xs text-gray-400">{user?.email}</p>
                        </div>

                        {/* Register Button (Admin only) */}
                        {isAdmin && (
                          <button
                            onClick={handleRegister}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-gray-700 flex items-center gap-2"
                          >
                            <span>➕</span>
                            Register New User
                          </button>
                        )}

                        {/* Account Settings */}
                        {isStaff ? (
                          <button
                            onClick={handleAccount}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-gray-700 flex items-center gap-2"
                          >
                            <span>⚙️</span>
                            Account Settings
                          </button>
                        ) : (
                          <button
                            onClick={handleUserAccount}
                            className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-gray-700 flex items-center gap-2"
                          >
                            <span>⚙️</span>
                            Account Settings
                          </button>
                        )}

                        {/* Logout */}
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 hover:bg-red-50 transition-colors text-red-600 flex items-center gap-2 border-t border-gray-200 mt-1"
                        >
                          <span>🚪</span>
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Login Button */}
                        <button
                          onClick={handleLogin}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-gray-700 flex items-center gap-2"
                        >
                          <span>🔐</span>
                          Login
                        </button>

                        {/* Register Button */}
                        <button
                          onClick={handleRegister}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors text-gray-700 flex items-center gap-2"
                        >
                          <span>📝</span>
                          Register
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Click outside to close dropdown */}
        {showProfileMenu && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowProfileMenu(false)}
          />
        )}
      </div>
    </div>
  );
}

export default Header;