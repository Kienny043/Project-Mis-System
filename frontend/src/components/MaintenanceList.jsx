// MaintenanceList

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Footer from './Footer.jsx'
import Header from './Header.jsx';
import { ClipboardList, CheckCircle2, Clock, XCircle } from 'lucide-react';

function MaintenanceList() {
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: '',
    notes: '',
    image: null,
    assigned_to: ''
  });
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pending', 'assigned'
  const navigate = useNavigate();

  // Helper function to get the full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath.trim() === '') return null;
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    return `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}${imagePath}`;
  };

  useEffect(() => {
    initializeData();
  }, []);

  // Initialize: fetch user profile first, then requests
  const initializeData = async () => {
    try {
      setLoading(true);
      const profile = await fetchUserProfile();
      setUserRole(profile.role);
      setUserId(profile.userId);
      
      // Fetch staff list if user is admin
      if (profile.role === 'admin') {
        await fetchStaffList();
        setActiveTab('all'); // Admin default to all
      } else {
        setActiveTab('pending'); // Staff default to pending
      }
      
      await fetchRequests();
    } catch (error) {
      console.error('Error initializing data:', error);
      setError(`Failed to initialize: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch list of all staff members (admin only)
  const fetchStaffList = async () => {
    try {
      const response = await api.get('/accounts/staff/all/');
      const staffArray = Array.isArray(response.data) ? response.data : [];
      setStaffList(staffArray);
    } catch (error) {
      console.error('Error fetching staff list:', error);
      setStaffList([]);
    }
  };

  // Fetch current user's profile
  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/accounts/staffprofile/');
      const profileData = response.data;
      const userId = profileData.user?.id || profileData.user;
      const role = (profileData.role || 'staff').toLowerCase();
      
      return { role: role, userId: userId };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { role: 'staff', userId: null };
    }
  };

  // Fetch ALL maintenance requests (no filtering)
  const fetchRequests = async () => {
    try {
      const response = await api.get('/maintenance/requests/');
      const data = response.data;

      let requestsArray = [];
      
      if (Array.isArray(data)) {
        requestsArray = data;
      } else if (data && Array.isArray(data.results)) {
        requestsArray = data.results;
      } else if (data && typeof data === 'object' && !data.detail) {
        requestsArray = [data];
      } else {
        requestsArray = [];
      }

      setAllRequests(requestsArray);
      setError(null);
      
    } catch (error) {
      console.error('Error fetching requests:', error);
      
      if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (error.response?.status === 403) {
        setError('You do not have permission to view these requests.');
      } else {
        setError(`Failed to load maintenance requests: ${error.response?.data?.detail || error.message}`);
      }
      
      setAllRequests([]);
    }
  };

  // Filter requests based on active tab
  const getFilteredRequests = () => {
    if (userRole === 'admin') {
      // Admin sees everything in "all" tab
      if (activeTab === 'all') return allRequests;
      if (activeTab === 'pending') return allRequests.filter(req => req.status === 'pending');
      if (activeTab === 'assigned') return allRequests.filter(req => req.assigned_to !== null);
    } else {
      // Staff filtering
      if (activeTab === 'pending') {
        // Show unassigned pending requests
        return allRequests.filter(req => req.status === 'pending' && !req.assigned_to);
      }
      if (activeTab === 'assigned') {
        // Show requests assigned to this staff member
        return allRequests.filter(req => {
          const assignedToId = typeof req.assigned_to === 'object' 
            ? req.assigned_to?.id 
            : req.assigned_to;
          return assignedToId === userId;
        });
      }
    }
    return allRequests;
  };

  const openDetailModal = (request) => {
    setSelectedRequest(request);
    
    const assignedToId = typeof request.assigned_to === 'object' 
      ? request.assigned_to?.id 
      : request.assigned_to;
    
    setUpdateData({
      status: request.status,
      notes: request.completion_notes || '',
      image: null,
      assigned_to: assignedToId || ''
    });
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedRequest(null);
    setUpdateData({ status: '', notes: '', image: null, assigned_to: '' });
  };

  const handleUpdateRequest = async () => {
    if (!selectedRequest) return;

    try {
      const formData = new FormData();
      
      let endpoint = '';
      
      if (updateData.status === 'completed') {
        endpoint = `/maintenance/requests/${selectedRequest.id}/complete/`;
        if (updateData.notes) {
          formData.append('completion_notes', updateData.notes);
        }
        if (updateData.image) {
          formData.append('completion_photo', updateData.image);
        }
      } else {
        endpoint = `/maintenance/requests/${selectedRequest.id}/update-status/`;
        formData.append('status', updateData.status);
        if (updateData.notes) {
          formData.append('notes', updateData.notes);
        }
        if (updateData.image) {
          formData.append('image', updateData.image);
        }
      }
      
      // Add assigned_to if admin changed it
      if (userRole === 'admin' && updateData.assigned_to) {
        formData.append('assigned_to', updateData.assigned_to);
      }
      
      await api.post(endpoint, formData);
      
      alert('Request updated successfully!');
      closeDetailModal();
      await fetchRequests();
      
    } catch (error) {
      console.error('Update error:', error);
      
      if (error.response?.status === 401) {
        alert('Authentication failed. Please log in again.');
      } else {
        alert(`Failed to update request: ${error.response?.data?.detail || error.message}`);
      }
    }
  };

  const handleAcceptRequest = async (request) => {
    try {
      await api.post(`/maintenance/requests/${request.id}/claim/`);
      alert('Request claimed successfully!');
      await fetchRequests();
    } catch (error) {
      console.error('Error claiming request:', error);
      alert(`Failed to claim request: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleCancelRequest = async (request) => {
    if (!window.confirm('Are you sure you want to cancel this assignment?')) return;
    
    try {
      const formData = new FormData();
      formData.append('status', 'pending');
      formData.append('assigned_to', '');
      
      await api.post(`/maintenance/requests/${request.id}/update-status/`, formData);
      alert('Assignment cancelled successfully!');
      await fetchRequests();
    } catch (error) {
      console.error('Error cancelling request:', error);
      alert(`Failed to cancel request: ${error.response?.data?.error || error.message}`);
    }
  };

  const getStatusBadgeClass = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      on_hold: 'bg-orange-100 text-orange-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const formatStatusText = (status) => {
    return status.replace(/_/g, ' ').toUpperCase();
  };

  // Get tab counts
  const getTabCounts = () => {
    if (userRole === 'admin') {
      return {
        all: allRequests.length,
        pending: allRequests.filter(req => req.status === 'pending').length,
        assigned: allRequests.filter(req => req.assigned_to !== null).length
      };
    } else {
      return {
        pending: allRequests.filter(req => req.status === 'pending' && !req.assigned_to).length,
        assigned: allRequests.filter(req => {
          const assignedToId = typeof req.assigned_to === 'object' 
            ? req.assigned_to?.id 
            : req.assigned_to;
          return assignedToId === userId;
        }).length
      };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-xl">Loading maintenance requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded border border-red-200">
          {error}
        </div>
        <button 
          onClick={initializeData}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  const filteredRequests = getFilteredRequests();
  const tabCounts = getTabCounts();
  
  return (
    <>
    <Header/>
      <div className="p-6 max-w-7xl min-h-screen flex flex-col mx-auto height: 100vh;">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {userRole === 'admin' ? 'Maintenance Requests Management' : 'My Maintenance Tasks'}
          </h1>
          <p className="text-gray-600 mt-2">
            {userRole === 'admin' 
              ? 'View and manage all maintenance requests' 
              : 'Accept pending requests and manage your assigned tasks'}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            {userRole === 'admin' && (
              <button
                onClick={() => setActiveTab('all')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" />
                  <span>All Requests</span>
                  <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                    {tabCounts.all}
                  </span>
                </div>
              </button>
            )}
            
            <button
              onClick={() => setActiveTab('pending')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{userRole === 'admin' ? 'Pending' : 'Available Tasks'}</span>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs">
                  {tabCounts.pending}
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('assigned')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'assigned'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>{userRole === 'admin' ? 'Assigned' : 'My Tasks'}</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                  {tabCounts.assigned}
                </span>
              </div>
            </button>
          </nav>
        </div>

        {/* Requests Table */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white p-12 rounded-lg text-center shadow-md">
            <div className="text-gray-400 mb-4">
              <ClipboardList className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-xl text-gray-700 font-medium mb-2">
              No requests found
            </p>
            <p className="text-gray-600">
              {activeTab === 'pending' && userRole === 'staff'
                ? "There are no available tasks to accept at the moment."
                : activeTab === 'assigned' && userRole === 'staff'
                ? "You don't have any tasks assigned to you yet."
                : "No maintenance requests in this category."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  {userRole === 'admin' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{req.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <div>
                        <div className="font-medium">{req.building?.name || req.building || 'N/A'}</div>
                        <div className="text-xs text-gray-500">
                          Floor {req.floor?.number || req.floor || 'N/A'}, Room {req.room?.name || req.room || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="max-w-xs truncate">{req.description}</div>
                    </td>
                    {userRole === 'admin' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {req.assigned_to_details?.username || req.assigned_to?.username || 'Unassigned'}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(req.status)}`}>
                        {req.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        {/* Staff can accept pending tasks */}
                        {userRole === 'staff' && activeTab === 'pending' && (
                          <button
                            onClick={() => handleAcceptRequest(req)}
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            Accept
                          </button>
                        )}
                        
                        {/* Staff can cancel their assigned tasks */}
                        {userRole === 'staff' && activeTab === 'assigned' && req.status !== 'completed' && (
                          <button
                            onClick={() => handleCancelRequest(req)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Cancel
                          </button>
                        )}
                        
                        <button
                          onClick={() => openDetailModal(req)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Request Detail Modal */}
        {showDetailModal && selectedRequest && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
            onClick={closeDetailModal}
          >
            <div 
              className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <div> 
                  <h2 className="text-2xl font-bold text-gray-800">
                    Request #{selectedRequest.id}
                  </h2>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(selectedRequest.status)}`}>
                    {formatStatusText(selectedRequest.status)}
                  </span>
                </div>
                <button
                  onClick={closeDetailModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                {/* Request Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 pb-2">Request Information</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Requester</label>
                      <p className="mt-1 text-gray-900">{selectedRequest.requester_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Role</label>
                      <p className="mt-1 text-gray-900 capitalize">{selectedRequest.role || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Building</label>
                      <p className="mt-1 text-gray-900">{selectedRequest.building?.name || selectedRequest.building || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Floor</label>
                      <p className="mt-1 text-gray-900">{selectedRequest.floor?.number || selectedRequest.floor || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Room</label>
                      <p className="mt-1 text-gray-900">{selectedRequest.room?.name || selectedRequest.room || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date Submitted</label>
                      <p className="mt-1 text-gray-900">{new Date(selectedRequest.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded">{selectedRequest.description}</p>
                </div>

                {selectedRequest.issue_photo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Issue Photo</label>
                    <img 
                      src={getImageUrl(selectedRequest.issue_photo)}
                      alt="Issue" 
                      className="w-full max-h-64 object-contain rounded border"
                      onError={(e) => {
                        console.error('Image failed to load:', getImageUrl(selectedRequest.issue_photo));
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Update Section */}
              <div className="space-y-4 pt-6 px-8 pb-6">
                <h3 className="text-lg font-semibold text-gray-800 pb-2">Update Request</h3>
                
                {/* Staff Assignment Dropdown (Admin Only) */}
                {userRole === 'admin' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assign To
                    </label>
                    <select
                      value={updateData.assigned_to || ''}
                      onChange={(e) => setUpdateData({ ...updateData, assigned_to: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Unassigned</option>
                      {staffList.map(staff => {
                        const userId = staff.user?.id || staff.user;
                        const username = staff.user?.username || staff.username || 'Unknown';
                        const firstName = staff.user?.first_name || staff.first_name || '';
                        const lastName = staff.user?.last_name || staff.last_name || '';
                        
                        const displayName = firstName && lastName 
                          ? `${firstName} ${lastName} (@${username})`
                          : username;
                        
                        return (
                          <option key={staff.id} value={userId}>
                            {displayName} - {staff.role}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                )}
                
                {/* Status dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={updateData.status}
                    onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    rows="4"
                    value={updateData.notes}
                    onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 resize-y"
                    placeholder="Add notes about this request..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Image (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setUpdateData({ ...updateData, image: e.target.files[0] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                  {updateData.image && (
                    <p className="text-sm text-gray-600 mt-1">Selected: {updateData.image.name}</p>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-3 border-t">
                <button 
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors font-medium"
                  onClick={handleUpdateRequest}
                >
                  Update Request
                </button>
                <button 
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors font-medium"
                  onClick={closeDetailModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer/>
    </>
  );
}

export default MaintenanceList;