import axios from 'axios';

function resolveApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

  return configuredUrl
    .replace(/^https:\/\/localhost:8080/i, 'http://localhost:8080')
    .replace(/^https:\/\/127\.0\.0\.1:8080/i, 'http://127.0.0.1:8080');
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('novelv_access_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('novelv_access_token');
      localStorage.removeItem('novelv_user');
    }

    return Promise.reject(error);
  },
);

export default api;
