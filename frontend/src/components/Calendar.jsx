import React, { useState, useEffect } from 'react';
import { maintenanceAPI } from '../services/api';
import { Calendar, Clock, MapPin, User } from 'lucide-react';

function MaintenanceCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [selectedDateRequests, setSelectedDateRequests] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMaintenanceRequests();
  }, [currentDate]);

  const fetchMaintenanceRequests = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await maintenanceAPI.getAll();
      
      // Handle both array and object responses
      const requestsData = Array.isArray(response.data) 
        ? response.data 
        : response.data.results || [];
      
      setMaintenanceRequests(requestsData);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      setError('Failed to load maintenance requests. Please try again.');
      setMaintenanceRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    
    return { firstDay: adjustedFirstDay, daysInMonth };
  };

  const getRequestsForDate = (day) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const targetDate = new Date(year, month, day);
    const dateString = targetDate.toISOString().split('T')[0];
    
    // Filter maintenance requests by created_at date
    return maintenanceRequests.filter(request => {
      const requestDate = new Date(request.created_at).toISOString().split('T')[0];
      return requestDate === dateString;
    });
  };

  const getDateMarkerColor = (day) => {
    const dayRequests = getRequestsForDate(day);
    
    if (dayRequests.length === 0) return null;
    
    const hasCompleted = dayRequests.some(r => r.status === 'completed');
    const hasInProgress = dayRequests.some(r => r.status === 'in_progress');
    const hasPending = dayRequests.some(r => r.status === 'pending');
    
    if (hasCompleted) return 'bg-green-500';
    if (hasInProgress) return 'bg-blue-500';
    if (hasPending) return 'bg-yellow-500';
    
    return 'bg-purple-500';
  };

  const handleDateClick = (day) => {
    const dayRequests = getRequestsForDate(day);
    
    if (dayRequests.length > 0) {
      setSelectedDateRequests(dayRequests);
      setShowDetailsModal(true);
    }
  };

  const renderCalendar = () => {
    const { firstDay, daysInMonth } = getDaysInMonth(currentDate);
    const days = [];
    const today = new Date().getDate();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const isCurrentMonth = currentDate.getMonth() === currentMonth && 
                          currentDate.getFullYear() === currentYear;

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="text-center py-2"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isCurrentMonth && day === today;
      const markerColor = getDateMarkerColor(day);
      const requestsCount = getRequestsForDate(day).length;

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`text-center py-3 rounded relative cursor-pointer transition-all ${
            isToday 
              ? 'bg-indigo-600 text-white font-bold shadow-lg' 
              : markerColor 
              ? 'hover:bg-gray-100 hover:shadow-md' 
              : 'text-gray-700 hover:bg-gray-50'
          } ${requestsCount > 0 ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <div className="relative">
            {day}
            {markerColor && !isToday && (
              <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 ${markerColor} rounded-full animate-pulse`}></div>
            )}
            {requestsCount > 0 && (
              <div className={`text-xs mt-1 ${isToday ? 'text-indigo-100' : 'text-gray-500'}`}>
                {requestsCount}
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
    };
    return badges[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">Maintenance Calendar</h1>
          </div>
          <p className="text-gray-600">View maintenance requests by date</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-6">
          {/* Calendar Navigation */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => changeMonth(-1)}
              className="w-10 h-10 rounded-full bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center transition-all font-bold text-xl text-indigo-700"
            >
              ‹
            </button>
            <h2 className="text-2xl font-bold text-gray-800">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => changeMonth(1)}
              className="w-10 h-10 rounded-full bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center transition-all font-bold text-xl text-indigo-700"
            >
              ›
            </button>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading maintenance requests...</p>
            </div>
          )}

          {!loading && (
            <>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                  <div key={i} className="text-center font-bold text-gray-600 text-sm py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {renderCalendar()}
              </div>

              {/* Summary Stats */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-4">Monthly Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-indigo-600">
                      {maintenanceRequests.length}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Total Requests</div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {maintenanceRequests.filter(r => r.status === 'pending').length}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Pending</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {maintenanceRequests.filter(r => r.status === 'in_progress').length}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">In Progress</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {maintenanceRequests.filter(r => r.status === 'completed').length}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Completed</div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-3">Status Legend</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">In Progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-indigo-600 rounded-full"></div>
                    <span className="text-sm text-gray-600">Today</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Request Details Modal */}
        {showDetailsModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <div
              className="bg-white rounded-xl w-full max-w-3xl p-6 max-h-[85vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h3 className="text-2xl font-bold text-gray-800">
                  Maintenance Requests ({selectedDateRequests.length})
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-3xl font-bold leading-none"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {selectedDateRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
                          <span>Request #{request.id}</span>
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(request.created_at).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(request.status)}`}>
                        {request.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50 rounded-lg p-4">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-gray-600 font-medium">Location</p>
                            <p className="text-gray-800">
                              {request.building?.name || 'N/A'}
                              {request.room && `, Room ${request.room}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <User className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-gray-600 font-medium">Requester</p>
                            <p className="text-gray-800">{request.requester_name || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {request.assigned_to_details && (
                          <div className="flex items-start gap-2">
                            <User className="w-4 h-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-gray-600 font-medium">Assigned To</p>
                              <p className="text-gray-800">{request.assigned_to_details.username}</p>
                            </div>
                          </div>
                        )}
                        {request.role && (
                          <div className="flex items-start gap-2">
                            <User className="w-4 h-4 text-gray-400 mt-0.5" />
                            <div>
                              <p className="text-gray-600 font-medium">Role</p>
                              <p className="text-gray-800">{request.role}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {request.description && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                          {request.description}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MaintenanceCalendar;