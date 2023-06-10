import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/api/',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@fmdev:token');

  const headers = { ...config.headers };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return { ...config, headers };
});

export default api;
