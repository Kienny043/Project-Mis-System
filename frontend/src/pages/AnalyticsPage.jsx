import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, CheckCircle, MapPin, Users, AlertCircle } from 'lucide-react';
import api from '../api/axios'; // Adjust import path as needed
import Footer from '../components/Footer';
import Header from '../components/Header';

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({
    avgResponseTime: 0,
    avgCompletionTime: 0,
    totalRequests: 0,
    completedRequests: 0,
    pendingRequests: 0,
    inProgressRequests: 0,
    requestTrends: [],
    completionTrends: [],
    locationStats: [],
    userEngagement: [],
    recentMetrics: {
      last7Days: 0,
      last30Days: 0,
      completionRate: 0
    }
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch all maintenance requests
      const response = await api.get('/maintenance/requests/');
      
      // Handle different response formats (array or paginated object)
      let requests = response.data;
      
      // If response is paginated (has results key), use results array
      if (requests && typeof requests === 'object' && requests.results) {
        requests = requests.results;
      }
      
      // Ensure requests is an array
      if (!Array.isArray(requests)) {
        console.error('Unexpected response format:', requests);
        throw new Error('Invalid data format received from server');
      }
      
      // Process the data
      const processedData = processAnalytics(requests);
      setAnalytics(processedData);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err.message || 'Failed to load analytics data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const processAnalytics = (requests) => {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calculate status counts
    const statusCounts = {
      pending: requests.filter(r => r.status === 'pending').length,
      in_progress: requests.filter(r => r.status === 'in_progress').length,
      completed: requests.filter(r => r.status === 'completed').length
    };

    // Calculate average times
    const { avgResponse, avgCompletion } = calculateAverageTimes(requests);

    // Calculate trends
    const requestTrends = calculateTrends(requests, 'created_at', 30);
    const completionTrends = calculateCompletionTrends(requests, 30);

    // Calculate location statistics
    const locationStats = calculateLocationStats(requests);

    // Calculate user engagement
    const userEngagement = calculateUserEngagement(requests, last30Days);

    // Recent metrics
    const recentRequests = requests.filter(r => new Date(r.created_at) >= last7Days);
    const recentMonthRequests = requests.filter(r => new Date(r.created_at) >= last30Days);
    const completionRate = statusCounts.completed > 0 
      ? ((statusCounts.completed / requests.length) * 100).toFixed(1)
      : 0;

    return {
      avgResponseTime: avgResponse,
      avgCompletionTime: avgCompletion,
      totalRequests: requests.length,
      completedRequests: statusCounts.completed,
      pendingRequests: statusCounts.pending,
      inProgressRequests: statusCounts.in_progress,
      requestTrends,
      completionTrends,
      locationStats,
      userEngagement,
      recentMetrics: {
        last7Days: recentRequests.length,
        last30Days: recentMonthRequests.length,
        completionRate
      }
    };
  };

  const calculateAverageTimes = (requests) => {
    const inProgressRequests = requests.filter(r => 
      r.status === 'in_progress' || r.status === 'completed'
    );
    
    const completedRequests = requests.filter(r => r.status === 'completed');

    // Calculate average response time (created -> in_progress)
    let totalResponseTime = 0;
    let responseCount = 0;
    
    inProgressRequests.forEach(req => {
      const created = new Date(req.created_at);
      const updated = new Date(req.updated_at);
      const diffHours = (updated - created) / (1000 * 60 * 60);
      
      if (diffHours >= 0) {
        totalResponseTime += diffHours;
        responseCount++;
      }
    });

    // Calculate average completion time (created -> completed)
    let totalCompletionTime = 0;
    let completionCount = 0;
    
    completedRequests.forEach(req => {
      const created = new Date(req.created_at);
      const updated = new Date(req.updated_at);
      const diffHours = (updated - created) / (1000 * 60 * 60);
      
      if (diffHours >= 0) {
        totalCompletionTime += diffHours;
        completionCount++;
      }
    });

    return {
      avgResponse: responseCount > 0 ? (totalResponseTime / responseCount).toFixed(1) : 0,
      avgCompletion: completionCount > 0 ? (totalCompletionTime / completionCount).toFixed(1) : 0
    };
  };

  const calculateTrends = (requests, dateField, days) => {
    const trends = {};
    const now = new Date();
    
    // Initialize last 'days' days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      trends[dateStr] = 0;
    }

    // Count requests per day
    requests.forEach(req => {
      const reqDate = new Date(req[dateField]).toISOString().split('T')[0];
      if (trends.hasOwnProperty(reqDate)) {
        trends[reqDate]++;
      }
    });

    // Convert to array for recharts
    return Object.entries(trends).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      requests: count
    }));
  };

  const calculateCompletionTrends = (requests, days) => {
    const trends = {};
    const now = new Date();
    
    // Initialize last 'days' days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      trends[dateStr] = 0;
    }

    // Count completed requests per day
    const completedRequests = requests.filter(r => r.status === 'completed');
    completedRequests.forEach(req => {
      const reqDate = new Date(req.updated_at).toISOString().split('T')[0];
      if (trends.hasOwnProperty(reqDate)) {
        trends[reqDate]++;
      }
    });

    // Convert to array for recharts
    return Object.entries(trends).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      completed: count
    }));
  };

  const calculateLocationStats = (requests) => {
    const locationMap = {};

    requests.forEach(req => {
      const location = `${req.building || 'Unknown'} - Floor ${req.floor || 'N/A'}`;
      locationMap[location] = (locationMap[location] || 0) + 1;
    });

    // Sort by count and take top 10
    return Object.entries(locationMap)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  const calculateUserEngagement = (requests, since) => {
    const userMap = {};

    requests
      .filter(r => new Date(r.created_at) >= since)
      .forEach(req => {
        const user = req.requester_name || 'Anonymous';
        userMap[user] = (userMap[user] || 0) + 1;
      });

    // Sort by count and take top 10
    return Object.entries(userMap)
      .map(([user, count]) => ({ user, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center gap-3 text-red-800">
            <AlertCircle className="w-6 h-6" />
            <div>
              <h3 className="font-semibold">Error Loading Analytics</h3>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchAnalyticsData}
            className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <Header/>
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Maintenance request insights and metrics</p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={<Clock className="w-6 h-6" />}
            title="Avg Response Time"
            value={`${analytics.avgResponseTime}h`}
            subtitle="Time to start work"
            color="blue"
          />
          <MetricCard
            icon={<CheckCircle className="w-6 h-6" />}
            title="Avg Completion Time"
            value={`${analytics.avgCompletionTime}h`}
            subtitle="Total time to complete"
            color="green"
          />
          <MetricCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Total Requests"
            value={analytics.totalRequests}
            subtitle={`${analytics.recentMetrics.last30Days} in last 30 days`}
            color="purple"
          />
          <MetricCard
            icon={<CheckCircle className="w-6 h-6" />}
            title="Completion Rate"
            value={`${analytics.recentMetrics.completionRate}%`}
            subtitle={`${analytics.completedRequests} completed`}
            color="emerald"
          />
        </div>

        {/* Status Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatusCard
            title="Pending"
            count={analytics.pendingRequests}
            color="yellow"
          />
          <StatusCard
            title="In Progress"
            count={analytics.inProgressRequests}
            color="blue"
          />
          <StatusCard
            title="Completed"
            count={analytics.completedRequests}
            color="green"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Request Trends */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Trends (30 Days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.requestTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="requests" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Completion Trends */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Completions (30 Days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.completionTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Location Stats */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Top Locations</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Location</th>
                    <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">Requests</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.locationStats.map((loc, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2 text-sm text-gray-900">{loc.location}</td>
                      <td className="py-3 px-2 text-sm text-gray-900 text-right font-medium">
                        {loc.count}
                      </td>
                    </tr>
                  ))}
                  {analytics.locationStats.length === 0 && (
                    <tr>
                      <td colSpan="2" className="py-8 text-center text-gray-500 text-sm">
                        No location data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Engagement */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">User Engagement (30 Days)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">User</th>
                    <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">Requests</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.userEngagement.map((user, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2 text-sm text-gray-900">{user.user}</td>
                      <td className="py-3 px-2 text-sm text-gray-900 text-right font-medium">
                        {user.count}
                      </td>
                    </tr>
                  ))}
                  {analytics.userEngagement.length === 0 && (
                    <tr>
                      <td colSpan="2" className="py-8 text-center text-gray-500 text-sm">
                        No user data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={fetchAnalyticsData}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
};

// Metric Card Component
const MetricCard = ({ icon, title, value, subtitle, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className={`inline-flex p-3 rounded-lg ${colorClasses[color]} mb-4`}>
        {icon}
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  );
};

// Status Card Component
const StatusCard = ({ title, count, color }) => {
  const colorClasses = {
    yellow: 'border-yellow-200 bg-yellow-50',
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50'
  };

  const textColorClasses = {
    yellow: 'text-yellow-700',
    blue: 'text-blue-700',
    green: 'text-green-700'
  };

  return (
    <div className={`rounded-lg border-2 p-6 ${colorClasses[color]}`}>
      <h3 className={`text-sm font-semibold mb-2 ${textColorClasses[color]}`}>{title}</h3>
      <p className={`text-3xl font-bold ${textColorClasses[color]}`}>{count}</p>
    </div>
  );
};

export default AnalyticsPage;