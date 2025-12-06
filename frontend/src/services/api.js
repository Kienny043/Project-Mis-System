import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh and 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/api/accounts/refresh/`, {
          refresh: refreshToken,
        });

        localStorage.setItem('access_token', response.data.access);
        api.defaults.headers.Authorization = `Bearer ${response.data.access}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/accounts/login/', credentials),
  register: (userData) => api.post('/accounts/register/', userData),
  refreshToken: (refresh) => api.post('/accounts/refresh/', { refresh }),
};

// Maintenance API
export const maintenanceAPI = {
  getAll: () => api.get('/maintenance/requests/'),
  getById: (id) => api.get(`/maintenance/requests/${id}/`),

  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.post('/maintenance/requests/create/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  claim: (id) => api.post(`/maintenance/requests/${id}/claim/`),


complete: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.post(`/maintenance/requests/${id}/complete/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updateStatus: (id, data) =>
    api.post(`/maintenance/requests/${id}/update-status/`, data),
};


// Request System API
export const requestAPI = {
  getAll: () => api.get('/maintenance/requests/'),
  getById: (id) => api.get(`/maintenance/requests/${id}/`),
  create: (data) => api.post('/maintenance/requests/', data),
  update: (id, data) => api.put(`/maintenance/requests/${id}/`, data),
  delete: (id) => api.delete(`/maintenance/requests/${id}/`),
};

// Notification API
export const notificationAPI = {
  // Get all notifications for current user
  getAll: () => api.get('/notifications/my/'),
  
  // Mark single notification as read
  markAsRead: (id) => api.post(`/notifications/${id}/mark-read/`),
  
  // Mark all notifications as read
  markAllAsRead: () => api.post('/notifications/mark-all-read/'),
  
  // Delete notification
  delete: (id) => api.delete(`/notifications/${id}/`),
};

// Calendar/Schedule API
export const calendarAPI = {
  // Get schedules for a specific month
  getMonthSchedules: (year, month) => 
    api.get('/calendar/calendar/month/', {
      params: { year, month }
    }),
  
  // Set/Update schedule for a maintenance request
  setSchedule: (requestId, data) => 
    api.post(`/calendar/schedule/${requestId}/`, data),
  
  // Get schedule for specific request
  getRequestSchedule: (requestId) => 
    api.get(`/calendar/schedule/${requestId}/`),
};



export default api;