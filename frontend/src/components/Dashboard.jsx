import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header.jsx';
import Logo from '../images/Logo.png';
import api, { maintenanceAPI, requestAPI } from '../api/axios';  // ✅ Import from axios.js
import Footer from '../components/Footer.jsx'


function Dashboard() {
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingCount: 0,
    inProgressCount: 0,
    completedCount: 0,
    monthlyData: [],
    recentRequests: [],
    statusTrend: [],
  });
  const [showContactModal, setShowContactModal] = useState(false);
  const [adminRequest, setAdminRequest] = useState({
    subject: '',
    message: '',
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await requestAPI.getAll();
      
      // Handle different response structures
      let requests;
      if (Array.isArray(response.data)) {
        requests = response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        requests = response.data.results;
      } else {
        console.error('Unexpected API response format:', response.data);
        requests = [];
      }

      const pendingCount = requests.filter(r => r.status === 'pending').length;
      const inProgressCount = requests.filter(r => r.status === 'in_progress' || r.status === 'approved').length;
      const completedCount = requests.filter(r => r.status === 'completed').length;
      const totalTasks = requests.length;

      const monthlyData = calculateMonthlyData(requests);
      const recentRequests = requests.slice(0, 4);
      const statusTrend = calculateStatusTrend(requests);

      setStats({
        totalTasks,
        pendingCount,
        inProgressCount,
        completedCount,
        monthlyData,
        recentRequests,
        statusTrend,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set empty stats on error
      setStats({
        totalTasks: 0,
        pendingCount: 0,
        inProgressCount: 0,
        completedCount: 0,
        monthlyData: [],
        recentRequests: [],
        statusTrend: [],
      });
    }
  };
    
  const calculateMonthlyData = (requests) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const monthCounts = new Array(12).fill(0);

    requests.forEach(req => {
      const month = new Date(req.created_at).getMonth();
      monthCounts[month]++;
    });

    return months.map((name, index) => ({
      name,
      count: monthCounts[index],
      isCurrent: index === currentMonth
    })).slice(-8);
  };

  const calculateStatusTrend = (requests) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const currentMonth = new Date().getMonth();
    
    const pendingCounts = new Array(6).fill(0);
    const inProgressCounts = new Array(6).fill(0);
    const completedCounts = new Array(6).fill(0);

    requests.forEach(req => {
      const month = new Date(req.created_at).getMonth();
      const monthIndex = month - (currentMonth - 5);
      
      if (monthIndex >= 0 && monthIndex < 6) {
        if (req.status === 'pending') {
          pendingCounts[monthIndex]++;
        } else if (req.status === 'in_progress' || req.status === 'approved') {
          inProgressCounts[monthIndex]++;
        } else if (req.status === 'completed') {
          completedCounts[monthIndex]++;
        }
      }
    });

    return months.map((name, index) => ({
      name,
      pending: pendingCounts[index],
      inProgress: inProgressCounts[index],
      completed: completedCounts[index],
    }));
  };

  const handleContactAdmin = async (e) => {
    e.preventDefault();
    try {
      alert('Your request has been sent to the admin successfully!');
      setShowContactModal(false);
      setAdminRequest({ subject: '', message: '' });
    } catch (error) {
      alert('Failed to send request to admin');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      
      {/* Header with Search */}
      <Header showSearch={true} />
      
      

      {/* Main Content */}
      <div className="p-6">
        <div className="pb-6 flex items-center space-x-6">
          {/* Logo */}
          <div className="w-20 h-20 rounded-full bg-white p-2 shadow-2xl flex items-center justify-center">
            <img
              className="w-full h-full object-contain"
              src={Logo}
              alt="Maintenance Tracker Logo"
            />
          </div>

          {/* Text */}
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Dalubhasaan ng Lungsod ng Lucena
            </h1>
            <h3 className="text-sm md:text-lg text-gray-500 font-medium">
              Maintenance Tracker
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section - Stats and Graphs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-md p-4">
                <h3 className="text-sm text-gray-600 mb-2">Total Tasks</h3>
                <p className="text-3xl font-bold text-gray-800">{stats.totalTasks}</p>
              </div>
              <div className="bg-yellow-50 rounded-xl shadow-md p-4">
                <h3 className="text-sm text-yellow-800 mb-2">Pending</h3>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingCount}</p>
              </div>
              <div className="bg-blue-50 rounded-xl shadow-md p-4">
                <h3 className="text-sm text-blue-800 mb-2">In Progress</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.inProgressCount}</p>
              </div>
              <div className="bg-green-50 rounded-xl shadow-md p-4">
                <h3 className="text-sm text-green-800 mb-2">Completed</h3>
                <p className="text-3xl font-bold text-green-600">{stats.completedCount}</p>
              </div>
            </div>

            {/* Graphs Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Monthly Requests Chart */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Requests This Year
                </h3>
                <div className="flex items-end justify-around h-64">
                  {stats.monthlyData.map((month, index) => (
                    <div key={index} className="flex flex-col items-center gap-2">
                      <div
                        className={`w-8 rounded-t transition-all ${
                          month.isCurrent ? 'bg-red-400' : 'bg-gray-800'
                        }`}
                        style={{
                          height: `${Math.max((month.count / Math.max(...stats.monthlyData.map(m => m.count), 1)) * 100, 10)}%`,
                        }}
                      ></div>
                      <span className="text-xs text-gray-600">{month.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Trend Chart */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Status Trend (Last 6 Months)
                </h3>
                <div className="flex items-end justify-around h-64">
                  {stats.statusTrend.map((item, index) => {
                    const maxValue = Math.max(
                      ...stats.statusTrend.map(t => t.pending + t.inProgress + t.completed),
                      1
                    );
                    
                    return (
                      <div key={index} className="flex flex-col items-center gap-2">
                        <div className="w-10 flex flex-col" style={{ height: '200px', justifyContent: 'flex-end' }}>
                          {item.completed > 0 && (
                            <div
                              className="w-full bg-green-500 rounded-t"
                              style={{
                                height: `${(item.completed / maxValue) * 100}%`,
                              }}
                              title={`Completed: ${item.completed}`}
                            ></div>
                          )}
                          {item.inProgress > 0 && (
                            <div
                              className="w-full bg-blue-500"
                              style={{
                                height: `${(item.inProgress / maxValue) * 100}%`,
                              }}
                              title={`In Progress: ${item.inProgress}`}
                            ></div>
                          )}
                          {item.pending > 0 && (
                            <div
                              className="w-full bg-yellow-500"
                              style={{
                                height: `${(item.pending / maxValue) * 100}%`,
                              }}
                              title={`Pending: ${item.pending}`}
                            ></div>
                          )}
                        </div>
                        <span className="text-xs text-gray-600">{item.name}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 flex justify-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                    <span>Pending</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span>In Progress</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span>Completed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Requests */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  Recent Requests ({stats.totalTasks})
                </h3>
                <Link
                  to="/dashboard"
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  VIEW ALL →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.recentRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {request.request_type}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {request.building?.name || 'N/A'} - Room {request.room}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        request.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{request.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Section - Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/calendar-admin"
                  className="block w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl transition-colors text-center font-medium"
                >
                  📅 View Calendar
                </Link>
                <Link
                  to="/dashboard"
                  className="block w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-xl transition-colors text-center font-medium"
                >
                  📋 All Requests
                </Link>
              </div>
            </div>

            {/* Contact Admin */}
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              <div className="mb-4">
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-32 h-32 text-gray-400" fill="currentColor" viewBox="0 0 200 200">
                    <rect x="50" y="40" width="100" height="120" fill="#e5e7eb" stroke="#374151" strokeWidth="2"/>
                    <rect x="60" y="50" width="30" height="30" fill="#9ca3af"/>
                    <rect x="110" y="50" width="30" height="30" fill="#9ca3af"/>
                    <rect x="60" y="90" width="30" height="30" fill="#9ca3af"/>
                    <rect x="110" y="90" width="30" height="30" fill="#9ca3af"/>
                    <rect x="85" y="130" width="30" height="30" fill="#10b981"/>
                  </svg>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Request Admin Assistance
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Need help? Send a request to the admin
              </p>
              <button
                onClick={() => setShowContactModal(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-medium inline-block transition-colors"
              >
                Contact Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Admin Modal */}
      {showContactModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
          onClick={() => setShowContactModal(false)}
        >
          <div
            className="bg-white rounded-lg w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Request Admin Assistance
            </h3>

            <form onSubmit={handleContactAdmin} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={adminRequest.subject}
                  onChange={(e) => setAdminRequest({ ...adminRequest, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  placeholder="Enter subject..."
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Message
                </label>
                <textarea
                  rows="5"
                  value={adminRequest.message}
                  onChange={(e) => setAdminRequest({ ...adminRequest, message: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 resize-y"
                  placeholder="Describe your request..."
                  required
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors font-medium"
                >
                  Send Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Footer/>
    </div>
  );
}

export default Dashboard;