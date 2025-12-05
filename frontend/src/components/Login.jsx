import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../images/Logo.png';


function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('Attempting login with:', { username, password: '***' });

    const result = await login(username, password);

  if (result.success) {
    console.log('Login successful, navigating based on role...');
    
    // Get the user data from localStorage (it was just set by login())
    const userData = JSON.parse(localStorage.getItem('user'));
    const userRole = userData?.role?.toLowerCase().trim() || 'user';
    
    console.log('User role detected:', userRole);
    
    // Role-based navigation
    if (userRole === 'admin' || userRole === 'administrator') {
      navigate('/home');
    } else if (userRole === 'staff' || userRole === 'maintenance staff' || userRole.includes('staff')) {
      navigate('/home');
    } else {
      // Default to user dashboard
      navigate('/public-home');
    }
  } else {
    console.error('Login failed:', result.error);
    setError(result.error || 'Login failed. Please check your credentials.');
  }
      
    setLoading(false);
  };

  return (
    <div
    className="relative flex justify-center items-center min-h-screen"
    style={{
      backgroundImage: "url(/src/images/bg.png)",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
    }}
  >

    {/* Dark overlay */}
    <div className="absolute inset-0 bg-black/60"></div>
    {/* You can adjust /60 (60%) → /40 lighter, /80 darker */}

    {/* Content container (stays bright) */}
    <div className="relative bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <div className="mb-8 animate-fade-in">
          <div className="w-40 h-40 rounded-full bg-white p-2 shadow-2xl">
            <img
              className="w-full h-full object-contain scale-100"
              src={Logo}
              alt="Maintenance Tracker Logo"
            />
          </div>
        </div>
      </div>

      <h2 className="text-3xl font-bold mb-2 text-gray-800 text-center">
        Welcome Back
      </h2>
      <p className="text-gray-600 text-center mb-6">
        Sign in to continue to Maintenance Tracker
      </p>
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 border border-red-200">
            <p className="font-medium">Login Failed</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 text-gray-700 font-medium">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              placeholder="Enter your username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block mb-2 text-gray-700 font-medium">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium mt-6 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-500 hover:text-blue-600 font-medium">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;