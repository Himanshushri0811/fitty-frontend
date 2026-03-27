import axios from 'axios';

// Base URL: ENV > fallback to local
let baseURL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

// ALWAYS ensure HTTPS protocol on production
if (baseURL && !baseURL.startsWith('http')) {
    baseURL = 'https://' + baseURL;
}
// Strip trailing slash to prevent double-slashes in endpoints
if (baseURL.endsWith('/')) {
    baseURL = baseURL.slice(0, -1);
}

console.log("🚀 [API CONFIG] Booting up with Base URL:", baseURL);

const API = axios.create({
  baseURL: baseURL,
  withCredentials: false, 
  headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
  },
  timeout: 60000, // 60s for Render cold start
});

// WARM-UP PING (Wakes up Render instance while user types)
try {
    API.get('/api/accounts/health/').catch(err => console.log("⏳ Waiting for backend to wake up..."));
} catch (e) {}

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// REQUEST INTERCEPTOR
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return API(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${baseURL}/api/accounts/token/refresh/`,
          { refresh: refreshToken }
        );

        const { access } = response.data;

        localStorage.setItem('access_token', access);

        API.defaults.headers.common.Authorization = `Bearer ${access}`;
        originalRequest.headers.Authorization = `Bearer ${access}`;

        processQueue(null, access);
        return API(originalRequest);

      } catch (err) {
        processQueue(err, null);

        // Logout on refresh failure
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');

        window.location.href = '/auth?tab=login';
        return Promise.reject(err);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default API;
