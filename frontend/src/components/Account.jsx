import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, User, Mail, Phone, Briefcase } from 'lucide-react';
import {Link}from 'react-router-dom';
import Footer from './Footer.jsx'

export default function AccountSettingsDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    contact_number: '',
    specialization: ''
  });
  
  // Calendar data for November 2022
  const calendarDays = [
    { day: null }, { day: 1 }, { day: 2 }, { day: 3 }, { day: 4 }, { day: 5 }, { day: 6 },
    { day: 7 }, { day: 8 }, { day: 9 }, { day: 10 }, { day: 11 }, { day: 12 }, { day: 13 },
    { day: 14 }, { day: 15 }, { day: 16 }, { day: 17 }, { day: 18 }, { day: 19 }, { day: 20 },
    { day: 21 }, { day: 22 }, { day: 23 }, { day: 24 }, { day: 25 }, { day: 26 }, { day: 27 },
    { day: 28 }, { day: 29 }, { day: 30 }
  ];
  
  const highlightedDays = [14, 15, 16, 17, 18, 19, 20];
  
  const schedules = [
    { building: 'Annex Building', room: 'Room A4', date: 'DEC', day: '16' },
    { building: 'Annex Building', room: 'Room A4', date: 'DEC', day: '16' }
  ];

  // Fetch user profile on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('Not authenticated. Please login.');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:8000/api/accounts/profile/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data);
      
      // Initialize form data
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        contact_number: data.staff_profile?.contact_number || '',
        specialization: data.staff_profile?.specialization || ''
      });
      
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('Not authenticated. Please login.');
        return;
      }

      // Get staff profile ID from the current profile
      const staffProfileId = profile.staff_profile?.id || profile.id;

      const response = await fetch(`http://localhost:8000/api/accounts/staff-management/${staffProfileId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: profile.username,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          contact_number: formData.contact_number,
          specialization: formData.specialization,
          role: profile.role || profile.staff_profile?.role
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedData = await response.json();
      
      // Refresh profile data
      await fetchProfile();
      
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      setError(err.message);
      console.error('Error updating profile:', err);
      alert('Failed to update profile: ' + err.message);
    }
  };

  const getRoleDisplay = (role) => {
    const roleMap = {
      'admin': 'Administrator',
      'staff': 'Maintenance Staff',
      'user': 'User',
      'Maintenance Staff': 'Maintenance Staff'
    };
    return roleMap[role] || role;
  };

  const getRoleBadgeColor = (role) => {
    const colorMap = {
      'admin': 'bg-purple-100 text-purple-800 border-purple-300',
      'staff': 'bg-blue-100 text-blue-800 border-blue-300',
      'user': 'bg-gray-100 text-gray-800 border-gray-300',
      'Maintenance Staff': 'bg-blue-100 text-blue-800 border-blue-300'
    };
    return colorMap[role] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex min-h-screen bg-gray-100 items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <p className="text-red-600 font-semibold mb-4">Error: {error}</p>
          <button 
            onClick={fetchProfile}
            className="px-6 py-2 bg-slate-800 text-white rounded hover:bg-slate-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen bg-gray-100">
        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
            <p className="text-gray-600 mt-1">Manage your profile and account preferences</p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Stats and Form */}
            <div className="col-span-2 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800 text-white p-6 rounded-lg text-center">
                  <p className="text-sm mb-2">Number of Pendings (Month)</p>
                  <p className="text-5xl font-bold">5</p>
                </div>
                <div className="bg-slate-800 text-white p-6 rounded-lg text-center">
                  <p className="text-sm mb-2">Number of Complaints (Month)</p>
                  <p className="text-5xl font-bold">19</p>
                </div>
                <div className="bg-slate-800 text-white p-6 rounded-lg text-center">
                  <p className="text-sm mb-2">Number of Accomplished (Month)</p>
                  <p className="text-5xl font-bold">13</p>
                </div>
              </div>

              {/* Profile Form */}
              <div className="bg-white p-6 rounded-lg shadow">
                {/* Role Badge */}
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="text-slate-600" size={24} />
                    <h2 className="text-xl font-bold text-slate-900">Profile Information</h2>
                  </div>
                  <div className={`px-4 py-2 rounded-full border-2 flex items-center gap-2 ${getRoleBadgeColor(profile?.role || profile?.staff_profile?.role)}`}>
                    <Briefcase size={16} />
                    <span className="font-semibold text-sm">
                      Role: {getRoleDisplay(profile?.role || profile?.staff_profile?.role)}
                    </span>
                  </div>
                </div>

                {/* Username (Read-only) */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Username</label>
                  <input
                    type="text"
                    value={profile?.username || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>

                {/* Full Name */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 border border-gray-300 rounded ${isEditing ? 'bg-white' : 'bg-gray-50'}`}
                      placeholder="First Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 border border-gray-300 rounded ${isEditing ? 'bg-white' : 'bg-gray-50'}`}
                      placeholder="Last Name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                      <Mail size={16} />
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 border border-gray-300 rounded ${isEditing ? 'bg-white' : 'bg-gray-50'}`}
                      placeholder="Email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                      <Phone size={16} />
                      Contact Number
                    </label>
                    <input
                      type="text"
                      name="contact_number"
                      value={formData.contact_number}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 border border-gray-300 rounded ${isEditing ? 'bg-white' : 'bg-gray-50'}`}
                      placeholder="Contact Number"
                    />
                  </div>
                </div>

                {/* Specialization */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border border-gray-300 rounded ${isEditing ? 'bg-white' : 'bg-gray-50'}`}
                    placeholder="e.g., Plumbing, Electrical, HVAC"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  {!isEditing ? (
                    <>
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 transition-colors"
                      >
                        EDIT PROFILE
                      </button>
                      <button className="px-6 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 transition-colors">
                        CHANGE PASSWORD
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={handleUpdateProfile}
                        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        SAVE CHANGES
                      </button>
                      <button 
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            first_name: profile.first_name || '',
                            last_name: profile.last_name || '',
                            email: profile.email || '',
                            contact_number: profile.staff_profile?.contact_number || '',
                            specialization: profile.staff_profile?.specialization || ''
                          });
                        }}
                        className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                      >
                        CANCEL
                      </button>
                    </>
                  )}
                </div>

                {/* Work Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div>
                    <p className="text-sm font-semibold mb-2">Total work assigned</p>
                    <div className="h-20 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-600">24</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-2">Work in Progress</p>
                    <div className="h-20 bg-yellow-100 rounded flex items-center justify-center">
                      <span className="text-2xl font-bold text-yellow-600">8</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-2">Completed Tasks</p>
                    <div className="h-20 bg-green-100 rounded flex items-center justify-center">
                      <span className="text-2xl font-bold text-green-600">16</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Calendar and Schedules */}
            <div className="space-y-6">
              {/* Calendar */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Track Complaint</h3>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <ChevronLeft size={20} />
                  </button>
                  <span className="font-medium">November, 2022</span>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <ChevronRight size={20} />
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                    <div key={i} className="font-semibold text-gray-600 py-1">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                  {calendarDays.map((item, index) => (
                    <div
                      key={index}
                      className={`py-2 rounded ${
                        item.day === null
                          ? 'text-transparent'
                          : highlightedDays.includes(item.day)
                          ? 'bg-indigo-500 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.day || '.'}
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-center">
                  <button className="text-sm text-indigo-600 hover:underline">
                  <Link
                      to="/calendar"
                      className="text-blue-500 hover:text-blue-600 font-medium"
                      >
                      View Schedule →
                  </Link>
                  </button>
                </div>
              </div>

              {/* Schedules */}
              <div className="space-y-3">
                {schedules.map((schedule, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-lg shadow flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-sm">{schedule.building}</p>
                      <p className="text-gray-600 text-xs">{schedule.room}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold">{schedule.date}</p>
                      <p className="text-2xl font-bold">{schedule.day}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact Maintenance */}
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-6 rounded-lg shadow text-center">
                <div className="mb-3">
                  <div className="w-32 h-24 mx-auto bg-white rounded flex items-center justify-center">
                    <Briefcase size={48} className="text-purple-600" />
                  </div>
                </div>
                <p className="font-semibold text-slate-900">Contact Maintenance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
}