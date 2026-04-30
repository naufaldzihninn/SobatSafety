import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getAreas = async () => {
  const response = await apiClient.get('/areas');
  return response.data;
};

export const login = async (username, password) => {
  const response = await apiClient.post('/auth/login', { username, password });
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await apiClient.get('/dashboard/stats');
  return response.data;
};

export const getAllLogs = async () => {
  const response = await apiClient.get('/logs');
  return response.data;
};

export const deleteLog = async (logId) => {
  const response = await apiClient.delete(`/logs/${logId}`);
  return response.data;
};

export const deleteAllLogs = async () => {
  const response = await apiClient.delete('/logs');
  return response.data;
};

export const detectPPE = async (file, areaId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('area_id', areaId);

  const response = await apiClient.post('/detect', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getStreamStats = async (filename) => {
  const response = await apiClient.get(`/stream/stats/${filename}`);
  return response.data;
};

export const getFileUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  // The backend returns paths like /uploads/filename.png
  // We need to prepend the backend base URL (without /api/v1)
  const baseUrl = API_URL.replace('/api/v1', '');
  return `${baseUrl}${path}`;
};

export default apiClient;
