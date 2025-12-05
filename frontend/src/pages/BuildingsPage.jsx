import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit2, Trash2, X } from 'lucide-react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer.jsx'

const BuildingsPage = ({ onNavigate }) => {
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [requests, setRequests] = useState([]);
  const [buildingFilter, setBuildingFilter] = useState('');
  const [issueFilter, setIssueFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    has_floors: true,
    total_floors: 0
  });

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
        setLoading(true);
        
        const response = await api.get('/location/buildings/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        const buildingsData = Array.isArray(response.data) 
          ? response.data 
          : response.data.results || [];
        setBuildings(buildingsData);
        
        const requestsResponse = await api.get('/maintenance/requests/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
        });
        const requestsData = Array.isArray(requestsResponse.data) 
        ? requestsResponse.data 
        : requestsResponse.data.results || [];
        setRequests(requestsData);
        
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to load buildings');
        setBuildings([]);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

  const fetchBuildingDetails = async (buildingId) => {
    try {
      const floorsResponse = await api.get(`/location/buildings/${buildingId}/floors/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      setFloors(floorsResponse.data);

      const roomsResponse = await api.get(`/location/buildings/${buildingId}/rooms/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      setRooms(roomsResponse.data);
    } catch (error) {
      console.error('Error fetching building details:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        await api.delete(`/maintenance/requests/${id}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        fetchBuildings();
      } catch (error) {
        console.error('Error deleting request:', error);
        alert('Failed to delete request');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBuilding) {
        await api.put(`/location/buildings/${editingBuilding.id}/`, formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        });
      } else {
        await api.post('/location/buildings/', formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
          }
        });
      }
      fetchBuildings();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving building:', error);
      alert(`Failed to save building: ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      has_floors: true,
      total_floors: 0
    });
    setEditingBuilding(null);
  };

  const openEditModal = (building) => {
    setEditingBuilding(building);
    setFormData({
      name: building.name,
      has_floors: building.has_floors,
      total_floors: building.total_floors
    });
    setShowModal(true);
  };

  const viewBuildingDetails = async (building) => {
    setSelectedBuilding(building);
    await fetchBuildingDetails(building.id);
    setShowDetailModal(true);
  };

  const getFilteredRequests = () => {
    let filtered = requests;

    if (buildingFilter) {
      filtered = filtered.filter(req => {
        const reqBuildingId = req.building?.id || req.building;
        return reqBuildingId === parseInt(buildingFilter);
      });
    }

    if (issueFilter === 'with') {
      const buildingsWithIssues = [...new Set(requests.map(r => r.building?.id || r.building))];
      filtered = filtered.filter(req => {
        const reqBuildingId = req.building?.id || req.building;
        return buildingsWithIssues.includes(reqBuildingId);
      });
    } else if (issueFilter === 'without') {
      const buildingsWithIssues = [...new Set(requests.map(r => r.building?.id || r.building))];
      const buildingsWithoutIssues = buildings.filter(b => !buildingsWithIssues.includes(b.id)).map(b => b.id);
      filtered = filtered.filter(req => {
        const reqBuildingId = req.building?.id || req.building;
        return buildingsWithoutIssues.includes(reqBuildingId);
      });
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(req =>
        (req.requester_name?.toLowerCase() || '').includes(searchLower) ||
        (req.room?.toLowerCase() || '').includes(searchLower) ||
        (req.category?.toLowerCase() || '').includes(searchLower) ||
        (req.building?.name?.toLowerCase() || '').includes(searchLower)
      );
    }

    return filtered;
  };

  return (
    <>  
      <div className="p-6 max-w-7xl min-h-screen flex flex-col mx-auto height: 100vh;">
        <div className="mb-6">
          <button className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-1">
              <Link to={`/management/`}>
                  ← Back to Management Overview
              </Link>
          </button>
          
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Buildings</h1>
              <p className="text-gray-600 mt-1">Manage building locations and structure</p>
            </div>
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Building
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b">
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <select
                value={buildingFilter}
                onChange={(e) => setBuildingFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All Buildings</option>
                {buildings.map(building => (
                  <option key={building.id} value={building.id}>
                    {building.name}
                  </option>
                ))}
              </select>
              <select
                value={issueFilter}
                onChange={(e) => setIssueFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All</option>
                <option value="with">With Issue</option>
                <option value="without">No Issue</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Issue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Floor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Building</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getFilteredRequests().length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                        No maintenance requests found.
                      </td>
                    </tr>
                  ) : (
                    getFilteredRequests().map((request) => {
                      const assignedTo = request.assigned_to;
                      let assignedName = 'Unassigned';
                      
                      if (assignedTo && typeof assignedTo === 'object') {
                        const firstName = assignedTo.first_name || '';
                        const lastName = assignedTo.last_name || '';
                        const fullName = `${firstName} ${lastName}`.trim();
                        assignedName = fullName || assignedTo.username || 'Unassigned';
                      } else if (assignedTo) {
                        assignedName = assignedTo;
                      }

                      return (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{request.id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{request.requester_name || 'None'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{request.floor || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{request.building?.name || request.building || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{request.room || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{request.category || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{assignedName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              request.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {request.status ? request.status.replace(/_/g, ' ').toUpperCase() : 'None'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => {/* view details */}}
                                className="text-blue-600 hover:text-blue-800" 
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {/* update request */}}
                                className="text-green-600 hover:text-green-800"
                                title="Update"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(request.id)}
                                className="text-red-600 hover:text-red-800"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{editingBuilding ? 'Edit Building' : 'Add New Building'}</h2>
                <button onClick={() => { setShowModal(false); resetForm(); }} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Building Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Main Building, Annex, DFA"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="has_floors"
                    checked={formData.has_floors}
                    onChange={(e) => setFormData({...formData, has_floors: e.target.checked})}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="has_floors" className="ml-2 text-sm text-gray-700">
                    Building has multiple floors
                  </label>
                </div>

                {formData.has_floors && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Floors</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.total_floors}
                      onChange={(e) => setFormData({...formData, total_floors: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                )}

                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    {editingBuilding ? 'Update' : 'Create'} Building
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetailModal && selectedBuilding && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{selectedBuilding.name} - Details</h2>
                <button onClick={() => setShowDetailModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Building Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><span className="font-medium">Has Floors:</span> {selectedBuilding.has_floors ? 'Yes' : 'No'}</p>
                    <p><span className="font-medium">Total Floors:</span> {selectedBuilding.total_floors}</p>
                  </div>
                </div>

                {floors.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Floors ({floors.length})</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <ul className="space-y-1">
                        {floors.map(floor => (
                          <li key={floor.id} className="text-sm">
                            • Floor {floor.number} - {floor.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {rooms.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Rooms ({rooms.length})</h3>
                    <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                      <ul className="space-y-1">
                        {rooms.map(room => (
                          <li key={room.id} className="text-sm">
                            • {room.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer/>
    </>
  );
};

export default BuildingsPage; 