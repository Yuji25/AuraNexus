import axios from 'axios';

// Use environment variable or default to localhost:4000
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Upload files
export const uploadFiles = async (files) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  
  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Upload JSON/text
export const uploadJSON = async (data) => {
  const response = await api.post('/upload-json', data, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

// Get all files
export const getFiles = async () => {
  const response = await api.get('/files');
  return response.data;
};

// Get schema registry
export const getSchemas = async () => {
  const response = await api.get('/schemas');
  return response.data;
};

// Get data from a specific table
export const getTableData = async (tableName) => {
  const response = await api.get(`/data/${tableName}`);
  return response.data;
};

// Download file
export const downloadFile = async (filename) => {
  const response = await api.get(`/download/${encodeURIComponent(filename)}`);
  return response.data;
};
