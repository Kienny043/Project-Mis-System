import { useState, useEffect } from 'react';
import { 
  FileText, 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Send, 
  Camera, 
  Bell,
  ArrowRight,
  Lightbulb,
  TrendingUp
} from 'lucide-react';
import api from '../api/axios';
import Footer from '../components/Footer.jsx'

function UserHome() {
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    fetchRecentRequests(userData.username);
  }, []);

  const fetchRecentRequests = async (username) => {
    try {
      setLoading(true);
      const response = await api.get('/maintenance/requests/');
      
      let allRequests = Array.isArray(response.data) 
        ? response.data 
        : response.data.results || [];
      
      const userRequests = allRequests
        .filter(req => req.requester_name?.toLowerCase() === username?.toLowerCase())
        .slice(0, 3);
      
      setRecentRequests(userRequests);
    } catch (error) {
      console.error('Error fetching recent requests:', error);
      setRecentRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const navigate = (path) => {
    window.location.href = path;
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-300',
        icon: Clock
      },
      in_progress: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        border: 'border-blue-300',
        icon: TrendingUp
      },
      completed: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-300',
        icon: CheckCircle
      }
    };
    return badges[status] || badges.pending;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 to-blue-900 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Hello, {user?.first_name || user?.username || 'User'}!
              </h1>
              <p className="text-lg md:text-xl text-blue-100 leading-relaxed max-w-2xl">
                Submit new maintenance requests, track your existing requests, and monitor their progress from submission to completion—all in one place.
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">{recentRequests.length}</div>
                  <div className="text-blue-100">Active Requests</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Quick Action Cards */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">
              ⚡
            </span>
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Submit Request Card */}
            <button
              onClick={() => navigate('/submit-request')}
              className="group bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-white/20 rounded-full p-4 mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Submit New Request</h3>
                <p className="text-green-100 text-sm mb-4">
                  Report a maintenance issue and get it resolved quickly
                </p>
                <div className="flex items-center text-sm font-medium">
                  Get Started <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>

            {/* Track Requests Card */}
            <button
              onClick={() => navigate('/track-requests')}
              className="group bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-white/20 rounded-full p-4 mb-4 group-hover:scale-110 transition-transform">
                  <Eye className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Track My Requests</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Monitor the status and progress of your submissions
                </p>
                <div className="flex items-center text-sm font-medium">
                  View Status <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>

            {/* View Dashboard Card */}
            <button
              onClick={() => navigate('/home')}
              className="group bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-white/20 rounded-full p-4 mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">View Dashboard</h3>
                <p className="text-purple-100 text-sm mb-4">
                  See detailed analytics and statistics
                </p>
                <div className="flex items-center text-sm font-medium">
                  Open Dashboard <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="bg-indigo-100 text-indigo-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">
              📋
            </span>
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-green-100 text-green-600 rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mb-4 mx-auto">
                1
              </div>
              <div className="text-center">
                <Send className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 mb-2">Submit Request</h3>
                <p className="text-sm text-gray-600">
                  Fill out the form with issue details and upload a photo
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mb-4 mx-auto">
                2
              </div>
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 mb-2">Staff Reviews</h3>
                <p className="text-sm text-gray-600">
                  Admin reviews and assigns a staff member to your request
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-indigo-100 text-indigo-600 rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mb-4 mx-auto">
                3
              </div>
              <div className="text-center">
                <TrendingUp className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 mb-2">Track Progress</h3>
                <p className="text-sm text-gray-600">
                  Watch your request move from Pending → In Progress → Completed
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 text-purple-600 rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl mb-4 mx-auto">
                4
              </div>
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 mb-2">View Completion</h3>
                <p className="text-sm text-gray-600">
                  Receive completion notes and photos once work is finished
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Requests Preview */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <span className="bg-orange-100 text-orange-600 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">
                📝
              </span>
              Recent Requests
            </h2>
            <button
              onClick={() => navigate('/track-requests')}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
            >
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl p-12 shadow-md text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your requests...</p>
            </div>
          ) : recentRequests.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 shadow-md text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Requests Yet</h3>
              <p className="text-gray-600 mb-6">
                You haven't submitted any maintenance requests. Start by creating your first one!
              </p>
              <button
                onClick={() => navigate('/submit-request')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
              >
                <FileText className="w-5 h-5 mr-2" />
                Submit First Request
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentRequests.map((request) => {
                const statusInfo = getStatusBadge(request.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <div
                    key={request.id}
                    className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-200"
                    onClick={() => navigate('/track-requests')}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-100 text-blue-600 rounded-lg px-3 py-1 font-bold text-sm">
                          #{request.id}
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 ${statusInfo.bg} ${statusInfo.text} px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.border}`}>
                        <StatusIcon className="w-3 h-3" />
                        <span>{request.status.replace('_', ' ').toUpperCase()}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[40px]">
                      {request.description}
                    </p>

                    <div className="border-t pt-3 space-y-2">
                      <div className="flex items-center text-xs text-gray-500">
                        <span className="mr-2">📍</span>
                        <span className="truncate">
                          {request.building?.name || 'N/A'} - Floor {request.floor?.number || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <span className="mr-2">📅</span>
                        <span>{formatDate(request.created_at)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tips & Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Helpful Tips */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 shadow-md border border-yellow-200">
            <div className="flex items-center mb-4">
              <div className="bg-yellow-100 rounded-full p-2 mr-3">
                <Lightbulb className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Helpful Tips</h3>
            </div>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start">
                <Camera className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>Upload a <strong>clear photo</strong> of the issue for faster resolution</span>
              </li>
              <li className="flex items-start">
                <FileText className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>Provide <strong>detailed descriptions</strong> including location and severity</span>
              </li>
              <li className="flex items-start">
                <Bell className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>You'll be <strong>notified</strong> once a staff member is assigned</span>
              </li>
              <li className="flex items-start">
                <Eye className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                <span>Check the <strong>Track Requests</strong> page regularly for updates</span>
              </li>
            </ul>
          </div>

          {/* Need Help? */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-md border border-blue-200">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 rounded-full p-2 mr-3">
                <AlertCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Need Assistance?</h3>
            </div>
            <p className="text-sm text-gray-700 mb-4">
              If you have questions or need help with your maintenance requests, our admin team is here to assist you.
            </p>
            <button
              onClick={() => navigate('/home')}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <span>Contact Admin</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  );
}

export default UserHome;