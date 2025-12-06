import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, CheckCircle, AlertCircle, PlayCircle, Plus } from 'lucide-react';
import { maintenanceAPI, calendarAPI } from '../services/api';

function IntegratedCalendarMaintenance() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [selectedDateSchedules, setSelectedDateSchedules] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('calendar');

  const [scheduleForm, setScheduleForm] = useState({
    schedule_date: '',
    estimated_duration: '',
    assigned_staff: ''
  });

  useEffect(() => {
    fetchData();
  }, [currentDate, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (activeTab === 'calendar') {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const response = await calendarAPI.getMonthSchedules(year, month);
        // Handle both array and object responses
        const schedulesData = Array.isArray(response.data) 
          ? response.data 
          : response.data.results || [];
        setSchedules(schedulesData);
      } else {
        const response = await maintenanceAPI.getAll();
        // Handle both array and object responses
        const requestsData = Array.isArray(response.data) 
          ? response.data 
          : response.data.results || [];
        setMaintenanceRequests(requestsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again.');
      // Set empty arrays on error to prevent crashes
      if (activeTab === 'calendar') {
        setSchedules([]);
      } else {
        setMaintenanceRequests([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleRequest = (request) => {
    setSelectedRequest(request);
    setScheduleForm({
      schedule_date: '',
      estimated_duration: '',
      assigned_staff: ''
    });
    setShowScheduleModal(true);
  };

  const submitSchedule = async () => {
    // Validate form
    const errors = validateScheduleForm();
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    try {
      // Prepare data - only send non-empty fields
      const scheduleData = {
        schedule_date: scheduleForm.schedule_date,
      };
      
      if (scheduleForm.estimated_duration) {
        scheduleData.estimated_duration = scheduleForm.estimated_duration;
      }
      
      if (scheduleForm.assigned_staff) {
        scheduleData.assigned_staff = scheduleForm.assigned_staff;
      }

      // Log what we're sending
      console.log('Submitting schedule:', {
        requestId: selectedRequest.id,
        scheduleData
      });

      const response = await calendarAPI.setSchedule(selectedRequest.id, scheduleData);
      console.log('Schedule response:', response);
      
      alert('Schedule created successfully!');
      setShowScheduleModal(false);
      setSelectedRequest(null);
      fetchData();
    } catch (error) {
      console.error('Error creating schedule:', error);
      console.error('Error response:', error.response?.data);
      
      // Show more detailed error message
      const errorMessage = error.response?.data?.detail 
        || error.response?.data?.message
        || JSON.stringify(error.response?.data)
        || 'Failed to create schedule. Please check the console for details.';
      
      alert(errorMessage);
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      await maintenanceAPI.updateStatus(requestId, { status: newStatus });
      alert('Status updated successfully!');
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Adjust so Monday is first day (0) instead of Sunday
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    return { firstDay: adjustedFirstDay, daysInMonth };
  };

  const getSchedulesForDate = (day) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    // Create date at noon to avoid timezone issues
    const targetDate = new Date(year, month, day, 12, 0, 0);
    const dateString = targetDate.toISOString().split('T')[0];
    
    return schedules.filter(schedule => {
      if (!schedule.schedule_date) return false;
      // Compare date strings directly for accuracy
      const scheduleDate = schedule.schedule_date.split('T')[0];
      return scheduleDate === dateString;
    });
  };

  const getDateMarkerColor = (day) => {
    const daySchedules = getSchedulesForDate(day);
    if (daySchedules.length === 0) return null;
    
    const hasCompleted = daySchedules.some(s => s.request_details?.status === 'completed');
    const hasInProgress = daySchedules.some(s => s.request_details?.status === 'in_progress');
    const hasPending = daySchedules.some(s => s.request_details?.status === 'pending');
    
    if (hasCompleted) return 'bg-green-500';
    if (hasInProgress) return 'bg-blue-500';
    if (hasPending) return 'bg-yellow-500';
    return 'bg-purple-500';
  };

  const handleDateClick = (day) => {
    const daySchedules = getSchedulesForDate(day);
    if (daySchedules.length > 0) {
      setSelectedDateSchedules(daySchedules);
      setShowDetailsModal(true);
    }
  };

  const renderCalendar = () => {
    const { firstDay, daysInMonth } = getDaysInMonth(currentDate);
    const days = [];
    const today = new Date();
    const isCurrentMonth = currentDate.getMonth() === today.getMonth() && 
                          currentDate.getFullYear() === today.getFullYear();

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="text-center py-2"></div>);
    }

    // Calendar days
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isCurrentMonth && day === today.getDate();
      const markerColor = getDateMarkerColor(day);
      const schedulesCount = getSchedulesForDate(day).length;

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`text-center py-3 rounded relative transition-all ${
            isToday 
              ? 'bg-indigo-600 text-white font-bold shadow-lg' 
              : markerColor 
              ? 'hover:bg-gray-100 hover:shadow-md' 
              : 'text-gray-700 hover:bg-gray-50'
          } ${schedulesCount > 0 ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <div className="relative">
            {day}
            {markerColor && !isToday && (
              <div className={`absolute -top-1 -right-1 w-2.5 h-2.5 ${markerColor} rounded-full animate-pulse`}></div>
            )}
            {schedulesCount > 0 && (
              <div className={`text-xs mt-1 ${isToday ? 'text-indigo-100' : 'text-gray-500'}`}>
                {schedulesCount}
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

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress': return <PlayCircle className="w-5 h-5 text-blue-600" />;
      case 'pending': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-800">Maintenance Management</h1>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex gap-2 bg-white rounded-lg p-1 shadow-md inline-flex">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                activeTab === 'calendar'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📅 Calendar View
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                activeTab === 'list'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📋 Maintenance List
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Calendar View */}
        {activeTab === 'calendar' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
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

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading schedules...</p>
              </div>
            ) : (
              <>
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
                      <div className="text-2xl font-bold text-indigo-600">{schedules.length}</div>
                      <div className="text-sm text-gray-600 mt-1">Total Scheduled</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {schedules.filter(s => s.request_details?.status === 'pending').length}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Pending</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {schedules.filter(s => s.request_details?.status === 'in_progress').length}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">In Progress</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {schedules.filter(s => s.request_details?.status === 'completed').length}
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
        )}

        {/* Maintenance List View */}
        {activeTab === 'list' && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">All Maintenance Requests</h2>
              <div className="text-sm text-gray-600">
                Total: <span className="font-bold text-indigo-600">{maintenanceRequests.length}</span>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading requests...</p>
              </div>
            ) : maintenanceRequests.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No maintenance requests found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {maintenanceRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(request.status)}
                        <div>
                          <h4 className="font-semibold text-gray-800 text-lg">Request #{request.id}</h4>
                          <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(request.status)}`}>
                        {request.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-gray-50 rounded-lg p-4 mb-4">
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
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-gray-600 font-medium">Created</p>
                          <p className="text-gray-800">
                            {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleScheduleRequest(request)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all text-sm font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        Schedule
                      </button>
                      
                      {request.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(request.id, 'in_progress')}
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all text-sm font-medium"
                        >
                          Start Work
                        </button>
                      )}
                      
                      {request.status === 'in_progress' && (
                        <button
                          onClick={() => handleUpdateStatus(request.id, 'completed')}
                          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all text-sm font-medium"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Schedule Details Modal */}
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
                  Scheduled Tasks ({selectedDateSchedules.length})
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-3xl font-bold leading-none"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {selectedDateSchedules.map((schedule) => (
                  <div key={schedule.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-800 text-lg">Request #{schedule.request_details?.id}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(schedule.schedule_date).toLocaleDateString('en-US', { 
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                          })}</span>
                          {schedule.estimated_duration && (
                            <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">
                              {schedule.estimated_duration}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(schedule.request_details?.status)}`}>
                        {schedule.request_details?.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-gray-600 font-medium">Location</p>
                          <p className="text-gray-800">
                            {schedule.request_details?.building?.name || 'N/A'}
                            {schedule.request_details?.room && `, Room ${schedule.request_details.room}`}
                          </p>
                        </div>
                      </div>
                      {schedule.assigned_staff_details && (
                        <div className="flex items-start gap-2">
                          <User className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-gray-600 font-medium">Assigned To</p>
                            <p className="text-gray-800">{schedule.assigned_staff_details.username}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {schedule.request_details?.description && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm font-medium text-gray-700 mb-2">Description</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                          {schedule.request_details.description}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Schedule Modal */}
        {showScheduleModal && selectedRequest && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
            onClick={() => setShowScheduleModal(false)}
          >
            <div
              className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h3 className="text-2xl font-bold text-gray-800">Schedule Request #{selectedRequest.id}</h3>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-3xl font-bold leading-none"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Date *</label>
                  <input
                    type="date"
                    value={scheduleForm.schedule_date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setScheduleForm({...scheduleForm, schedule_date: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Duration</label>
                  <input
                    type="text"
                    placeholder="e.g., 2 hours, 30 minutes"
                    value={scheduleForm.estimated_duration}
                    onChange={(e) => setScheduleForm({...scheduleForm, estimated_duration: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional - e.g., "2 hours" or "90 minutes"</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assign Staff</label>
                  <input
                    type="text"
                    placeholder="Staff member name or ID"
                    value={scheduleForm.assigned_staff}
                    onChange={(e) => setScheduleForm({...scheduleForm, assigned_staff: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional - Leave blank to assign later</p>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={submitSchedule}
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-all font-medium"
                  >
                    Create Schedule
                  </button>
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    className="px-6 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-all font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default IntegratedCalendarMaintenance;