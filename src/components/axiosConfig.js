import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  withCredentials: true,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    const csrfToken = document.cookie.split('; ')
      .find(row => row.startsWith('csrftoken'))
      ?.split('=')[1];

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
