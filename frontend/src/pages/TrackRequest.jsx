import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Package, User, Calendar, MapPin, FileText, ImageIcon } from 'lucide-react';
import api from '../api/axios';
import Footer from '../components/Footer.jsx'

function TrackRequest() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    fetchUserRequests();
  }, []);

  const fetchUserRequests = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Use '/maintenance/requests/my/' if you created Option 2 endpoint
      // Or use '/maintenance/requests/' if you modified the existing view
      const response = await api.get('/maintenance/requests/');
      
      // Handle both array and paginated responses
      const requestsData = Array.isArray(response.data) 
        ? response.data 
        : response.data.results || [];

      const requesterName = userData.first_name && userData.last_name
        ? `${userData.first_name} ${userData.last_name}`.trim()
        : userData.username?.toLowerCase() || '';
          
      // Filter requests by requester_name matching current user
      const userRequests = requestsData.filter(
        req => req.requester_name?.toLowerCase() === requesterName
      );
      
      setRequests(userRequests);
      if (userRequests.length > 0) {
        setSelectedRequest(userRequests[0]);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to load your requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `${API_BASE_URL}${imagePath}`;
  };

  const getStatusStep = (status) => {
    const steps = {
      'pending': 0,
      'in_progress': 1,
      'completed': 2
    };
    return steps[status] || 0;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg border border-red-200 max-w-md">
          <p className="font-medium mb-2">Error</p>
          <p>{error}</p>
          <button 
            onClick={fetchUserRequests}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center bg-white p-12 rounded-lg shadow-md max-w-md">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Requests Found</h2>
          <p className="text-gray-600 mb-6">You haven't submitted any maintenance requests yet.</p>
          <a 
            href="/submit-request"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Submit a Request
          </a>
        </div>
      </div>
    );
  }

  const currentStep = getStatusStep(selectedRequest?.status);

  return (
    <>
      <div className="p-6 max-w-7xl min-h-screen flex flex-col mx-auto height: 100vh;">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Track Your Requests</h1>
            <p className="text-gray-600">Monitor the status of your maintenance requests</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Request List Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-4 max-h-[600px] overflow-y-auto">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Requests</h2>
                <div className="space-y-2">
                  {requests.map((req) => (
                    <button
                      key={req.id}
                      onClick={() => setSelectedRequest(req)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedRequest?.id === req.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-gray-800">Request #{req.id}</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          req.status === 'completed' ? 'bg-green-100 text-green-700' :
                          req.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {req.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate mb-1">{req.description}</p>
                      <p className="text-xs text-gray-500">{formatDate(req.created_at)}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              {selectedRequest && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Progress Tracker */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
                    <h2 className="text-white text-2xl font-bold mb-6">Request #{selectedRequest.id}</h2>
                    
                    {/* Progress Steps */}
                    <div className="relative">
                      <div className="flex justify-between items-center">
                        {/* Step 1: Pending */}
                        <div className="flex flex-col items-center flex-1">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                            currentStep >= 0 ? 'bg-white text-blue-600' : 'bg-blue-400 text-white'
                          }`}>
                            <Clock className="w-6 h-6" />
                          </div>
                          <span className="text-white text-sm font-medium mt-2">Pending</span>
                        </div>

                        {/* Connecting Line 1 */}
                        <div className={`flex-1 h-1 transition-all ${
                          currentStep >= 1 ? 'bg-white' : 'bg-blue-400'
                        }`}></div>

                        {/* Step 2: In Progress */}
                        <div className="flex flex-col items-center flex-1">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                            currentStep >= 1 ? 'bg-white text-blue-600' : 'bg-blue-400 text-white'
                          }`}>
                            <User className="w-6 h-6" />
                          </div>
                          <span className="text-white text-sm font-medium mt-2">In Progress</span>
                        </div>

                        {/* Connecting Line 2 */}
                        <div className={`flex-1 h-1 transition-all ${
                          currentStep >= 2 ? 'bg-white' : 'bg-blue-400'
                        }`}></div>

                        {/* Step 3: Completed */}
                        <div className="flex flex-col items-center flex-1">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                            currentStep >= 2 ? 'bg-white text-green-600' : 'bg-blue-400 text-white'
                          }`}>
                            <CheckCircle className="w-6 h-6" />
                          </div>
                          <span className="text-white text-sm font-medium mt-2">Completed</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-6">
                    {/* PENDING STAGE */}
                    {selectedRequest.status === 'pending' && (
                      <div className="space-y-6">
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                          <p className="text-yellow-800 font-medium">Your request is pending assignment</p>
                          <p className="text-yellow-700 text-sm mt-1">A staff member will be assigned soon</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-start space-x-3">
                            <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                            <div>
                              <p className="text-sm text-gray-600">Submitted</p>
                              <p className="font-medium text-gray-800">{formatDate(selectedRequest.created_at)}</p>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3">
                            <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                            <div>
                              <p className="text-sm text-gray-600">Location</p>
                              <p className="font-medium text-gray-800">
                                {selectedRequest.building?.name || 'N/A'}, Floor {selectedRequest.floor?.number || 'N/A'}, Room {selectedRequest.room?.name || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <h3 className="font-semibold text-gray-800">Description</h3>
                          </div>
                          <p className="text-gray-700 bg-gray-50 p-4 rounded">{selectedRequest.description}</p>
                        </div>

                        {selectedRequest.issue_photo && (
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <ImageIcon className="w-5 h-5 text-gray-400" />
                              <h3 className="font-semibold text-gray-800">Issue Photo</h3>
                            </div>
                            <img 
                              src={getImageUrl(selectedRequest.issue_photo)}
                              alt="Issue"
                              className="w-full max-h-64 object-contain rounded border"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* IN PROGRESS STAGE */}
                    {selectedRequest.status === 'in_progress' && (
                      <div className="space-y-6">
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                          <p className="text-blue-800 font-medium">A staff member is working on your request</p>
                          <p className="text-blue-700 text-sm mt-1">You will be notified once completed</p>
                        </div>

                        {/* Assigned Staff Info */}
                        {selectedRequest.assigned_to_details && (
                          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                              <User className="w-5 h-5 mr-2 text-blue-600" />
                              Assigned Staff
                            </h3>
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 font-bold text-xl">
                                {selectedRequest.assigned_to_details.first_name?.[0] || selectedRequest.assigned_to_details.username?.[0] || 'S'}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800 text-lg">
                                  {selectedRequest.assigned_to_details.first_name} {selectedRequest.assigned_to_details.last_name}
                                </p>
                                <p className="text-gray-600">@{selectedRequest.assigned_to_details.username}</p>
                                <p className="text-sm text-gray-500 capitalize">{selectedRequest.assigned_to_details.role || 'Staff'}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-start space-x-3">
                            <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                            <div>
                              <p className="text-sm text-gray-600">Started</p>
                              <p className="font-medium text-gray-800">{formatDate(selectedRequest.updated_at)}</p>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3">
                            <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                            <div>
                              <p className="text-sm text-gray-600">Location</p>
                              <p className="font-medium text-gray-800">
                                {selectedRequest.building?.name || 'N/A'}, Floor {selectedRequest.floor?.number || 'N/A'}, Room {selectedRequest.room?.name || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <h3 className="font-semibold text-gray-800">Original Request</h3>
                          </div>
                          <p className="text-gray-700 bg-gray-50 p-4 rounded">{selectedRequest.description}</p>
                        </div>
                      </div>
                    )}

                    {/* COMPLETED STAGE */}
                    {selectedRequest.status === 'completed' && (
                      <div className="space-y-6">
                        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                          <div className="flex items-center">
                            <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                            <div>
                              <p className="text-green-800 font-medium">Request Completed!</p>
                              <p className="text-green-700 text-sm mt-1">Your maintenance request has been successfully resolved</p>
                            </div>
                          </div>
                        </div>

                        {/* Assigned Staff Info */}
                        {selectedRequest.assigned_to_details && (
                          <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                              <User className="w-5 h-5 mr-2 text-green-600" />
                              Completed By
                            </h3>
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-16 rounded-full bg-green-200 flex items-center justify-center text-green-600 font-bold text-xl">
                                {selectedRequest.assigned_to_details.first_name?.[0] || selectedRequest.assigned_to_details.username?.[0] || 'S'}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800 text-lg">
                                  {selectedRequest.assigned_to_details.first_name} {selectedRequest.assigned_to_details.last_name}
                                </p>
                                <p className="text-gray-600">@{selectedRequest.assigned_to_details.username}</p>
                                <p className="text-sm text-gray-500 capitalize">{selectedRequest.assigned_to_details.role || 'Staff'}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-start space-x-3">
                            <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                            <div>
                              <p className="text-sm text-gray-600">Completed On</p>
                              <p className="font-medium text-gray-800">{formatDate(selectedRequest.updated_at)}</p>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3">
                            <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                            <div>
                              <p className="text-sm text-gray-600">Location</p>
                              <p className="font-medium text-gray-800">
                                {selectedRequest.building?.name || 'N/A'}, Floor {selectedRequest.floor?.number || 'N/A'}, Room {selectedRequest.room?.name || 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {selectedRequest.completion_notes && (
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <FileText className="w-5 h-5 text-gray-400" />
                              <h3 className="font-semibold text-gray-800">Completion Notes</h3>
                            </div>
                            <p className="text-gray-700 bg-green-50 p-4 rounded border border-green-200">{selectedRequest.completion_notes}</p>
                          </div>
                        )}

                        {selectedRequest.completion_photo && (
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <ImageIcon className="w-5 h-5 text-gray-400" />
                              <h3 className="font-semibold text-gray-800">Completion Photo</h3>
                            </div>
                            <img 
                              src={getImageUrl(selectedRequest.completion_photo)}
                              alt="Completed work"
                              className="w-full max-h-64 object-contain rounded border"
                            />
                          </div>
                        )}

                        {/* Optional: Feedback Section */}
                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-6">
                          <h3 className="font-semibold text-gray-800 mb-3">How was the service?</h3>
                          <p className="text-sm text-gray-600 mb-4">Your feedback helps us improve our maintenance services</p>
                          <div className="flex gap-2">
                            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm">
                              Rate Service
                            </button>
                            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm">
                              Leave Feedback
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
}

export default TrackRequest;