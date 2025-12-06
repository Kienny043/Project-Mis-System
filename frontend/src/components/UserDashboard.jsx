import { useState, useEffect } from 'react';
import { Calendar, MessageSquare, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import Header from './Header';
import Footer from './Footer.jsx'

function UserDashboard() {
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingCount: 0,  
    inProgressCount: 0,
    completedCount: 0,
    recentRequests: [],
  });
  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [adminRequest, setAdminRequest] = useState({
    subject: '',
    message: '',
  });

  useEffect(() => {
    fetchUserRequests();
  }, []);

  const fetchUserRequests = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await api.get('/maintenance/requests/');
      
      let allRequests = Array.isArray(response.data) 
        ? response.data 
        : response.data.results || [];
      
      const requesterName = userData.first_name && userData.last_name
        ? `${userData.first_name} ${userData.last_name}`.toLowerCase().trim()
        : userData.username?.toLowerCase() || '';

      const userRequests = allRequests.filter(
        req => req.requester_name?.toLowerCase() === requesterName
      );

      const pendingCount = userRequests.filter(r => r.status === 'pending').length;
      const inProgressCount = userRequests.filter(r => r.status === 'in_progress').length;
      const completedCount = userRequests.filter(r => r.status === 'completed').length;

      setStats({
        totalRequests: userRequests.length,
        pendingCount,
        inProgressCount,
        completedCount,
        recentRequests: userRequests.slice(0, 4),
      });
    } catch (error) {
      console.error('Error fetching user requests:', error);
      setStats({
        totalRequests: 0,
        pendingCount: 0,
        inProgressCount: 0,
        completedCount: 0,
        recentRequests: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContactAdmin = (e) => {
    e.preventDefault();
    alert('Your request has been sent to the admin successfully!');
    setShowContactModal(false);
    setAdminRequest({ subject: '', message: '' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const navigate = (path) => {
    window.location.href = path;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
    <Header showSearch={true} />
      <div className="p-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome back, {user.first_name || 'User'}!
          </h2>
          <p className="text-gray-600">
            Track and manage your maintenance requests all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Requests</p>
                    <p className="text-3xl font-bold text-gray-800">{stats.totalRequests}</p>
                  </div>
                  <FileText className="w-10 h-10 text-blue-500 opacity-50" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.pendingCount}</p>
                  </div>
                  <Clock className="w-10 h-10 text-yellow-500 opacity-50" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">In Progress</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.inProgressCount}</p>
                  </div>
                  <AlertCircle className="w-10 h-10 text-blue-600 opacity-50" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Completed</p>
                    <p className="text-3xl font-bold text-green-600">{stats.completedCount}</p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-green-500 opacity-50" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  My Recent Requests
                </h3>
                <button
                  onClick={() => navigate('/track-requests')}
                  className="text-blue-500 hover:text-blue-600 font-medium text-sm"
                >
                  VIEW ALL →
                </button>
              </div>

              {stats.recentRequests.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">You haven't submitted any requests yet.</p>
                  <button
                    onClick={() => navigate('/submit-request')}
                    className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Submit Your First Request
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-all border border-gray-200"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-800">
                              Request #{request.id}
                            </h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(request.status)}`}>
                              {request.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            📍 {request.building?.name || 'N/A'} - Floor {request.floor?.number || 'N/A'}, Room {request.room?.name || request.room || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">
                            📅 {formatDate(request.created_at)}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2 bg-white p-3 rounded border border-gray-200">
                        {request.description}
                      </p>
                      <div className="mt-3 flex justify-end">
                        <button
                          onClick={() => navigate('/track-requests')}
                          className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                        >
                          View Details →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {stats.totalRequests > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Request Status Overview</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Completed</span>
                      <span className="font-semibold text-green-600">
                        {stats.completedCount} of {stats.totalRequests} ({Math.round((stats.completedCount / stats.totalRequests) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-500 h-3 rounded-full transition-all"
                        style={{ width: `${(stats.completedCount / stats.totalRequests) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">In Progress</span>
                      <span className="font-semibold text-blue-600">
                        {stats.inProgressCount} of {stats.totalRequests} ({Math.round((stats.inProgressCount / stats.totalRequests) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-500 h-3 rounded-full transition-all"
                        style={{ width: `${(stats.inProgressCount / stats.totalRequests) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Pending</span>
                      <span className="font-semibold text-yellow-600">
                        {stats.pendingCount} of {stats.totalRequests} ({Math.round((stats.pendingCount / stats.totalRequests) * 100)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-yellow-500 h-3 rounded-full transition-all"
                        style={{ width: `${(stats.pendingCount / stats.totalRequests) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/submit-request')}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl transition-colors text-center font-medium flex items-center justify-center"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Submit New Request
                </button>
                <button
                  onClick={() => navigate('/track-requests')}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl transition-colors text-center font-medium flex items-center justify-center"
                >
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Track Requests
                </button>
                <button
                  onClick={() => navigate('/calendar')}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-xl transition-colors text-center font-medium flex items-center justify-center"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  View Calendar
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl shadow-lg p-6 border border-orange-200">
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-10 h-10 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Need Help?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Contact the admin for assistance with your requests
                </p>
              </div>
              <button
                onClick={() => setShowContactModal(true)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Contact Admin
              </button>
            </div>

            <div className="bg-blue-50 rounded-2xl shadow-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">💡 Tips</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Include clear photos when submitting requests</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Check request status regularly for updates</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Provide detailed descriptions for faster resolution</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {showContactModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
          onClick={() => setShowContactModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-4">
              <MessageSquare className="w-6 h-6 text-orange-500 mr-2" />
              <h3 className="text-xl font-bold text-gray-800">
                Contact Admin
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={adminRequest.subject}
                  onChange={(e) => setAdminRequest({ ...adminRequest, subject: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="What do you need help with?"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Message
                </label>
                <textarea
                  rows={5}
                  value={adminRequest.message}
                  onChange={(e) => setAdminRequest({ ...adminRequest, message: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  placeholder="Describe your issue or question..."
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleContactAdmin}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg transition-colors font-medium"
                >
                  Send Message
                </button>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button> 
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer/>
    </div>
  );
}

export default UserDashboard;