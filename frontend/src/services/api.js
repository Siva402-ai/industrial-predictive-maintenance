import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 5000,
});

export const getStatus = async () => {
  const res = await api.get('/status');
  return res.data;
};

export const getCurrentData = async () => {
  const res = await api.get('/current');
  return res.data;
};

export const getHistoryData = async () => {
  const res = await api.get('/history');
  return res.data;
};

export const getModelMetrics = async () => {
  const res = await api.get('/model');
  return res.data;
};

export const getRecentLogs = async () => {
  const res = await api.get('/logs');
  return res.data;
};

export const getMaintenanceData = async () => {
  const res = await api.get('/maintenance');
  return res.data;
};

export const postControlAction = async (action, speed = 1.0) => {
  const res = await api.post('/control', { action, speed });
  return res.data;
};
