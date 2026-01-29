import axios from 'axios';

let API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// Normalize the URL: remove trailing slash, ensure /api suffix, and add trailing slash
API_BASE_URL = API_BASE_URL.replace(/\/$/, ''); 
if (!API_BASE_URL.endsWith('/api')) {
  API_BASE_URL = `${API_BASE_URL}/api`;
}
API_BASE_URL = `${API_BASE_URL}/`;

// Create axios instance for auth
const authAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include API key
authAPI.interceptors.request.use(
  (config) => {
    const apiKey = localStorage.getItem('api_key');
    if (apiKey) {
      config.headers['x-api-key'] = apiKey;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
authAPI.interceptors.response.use(
  (response) => {
    // console.log('Auth API Response:', response.data);
    return response;
  },
  (error) => {
    console.error('Auth API Error:', error.response?.data || error.message);
    
    // If unauthorized, clear stored data and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('hr_api_key');
      localStorage.removeItem('hr_user');
      // Don't redirect here to avoid infinite loops
    }
    
    return Promise.reject(error);
  }
);

export const authService = {
  // Register new user
  register: async (userData) => {
    const response = await authAPI.post('hr/register', userData);
    return response.data;
  },

  // Login user
  login: async (credentials) => {
    const response = await authAPI.post('hr/login', credentials);
    const { user, api_key } = response.data.data;
    
    // Store user data and API key
    localStorage.setItem('hr_api_key', api_key);
    localStorage.setItem('hr_user', JSON.stringify(user));
    
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('hr_api_key');
    localStorage.removeItem('hr_user');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const apiKey = localStorage.getItem('hr_api_key');
    const user = localStorage.getItem('hr_user');
    return !!(apiKey && user);
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('hr_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get API key
  getApiKey: () => {
    return localStorage.getItem('hr_api_key');
  },

  // Verify API key
  verifyApiKey: async () => {
    const response = await authAPI.get('/verify');
    return response.data;
  }
};

export default authService;
