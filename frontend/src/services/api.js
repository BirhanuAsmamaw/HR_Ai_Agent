import axios from 'axios';

let API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// Ensure API_BASE_URL ends with /api
if (!API_BASE_URL.endsWith('/api')) {
  API_BASE_URL = `${API_BASE_URL}/api`;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add Authorization header with API key if available
    const apiKey = localStorage.getItem('hr_api_key');
    if (apiKey) {
      config.headers['Authorization'] = `Bearer ${apiKey}`;
    }
    // console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Job API endpoints
export const jobsAPI = {
  getAll: () => api.get('/jobs'),
  create: (jobData) => api.post('/jobs/create', jobData),
  getById: (id) => api.get(`/jobs/${id}`),
  update: (id, jobData) => api.post(`/jobs/${id}`, jobData), // Using POST as requested
  delete: (id) => api.delete(`/jobs/${id}`),
};

// Applicant API endpoints
export const applicantsAPI = {
  getAll: () => api.get('/applicants'),
  create: (applicantData) => api.post('/applicants', applicantData),
  getById: (id) => api.get(`/applicants/${id}`),
  update: (id, applicantData) => api.put(`/applicants/${id}`, applicantData),
  delete: (id) => api.delete(`/applicants/${id}`),
  runAI: (id) => api.post(`/ai/run/${id}`),
  sendEmailToAll: () => api.post('/applicants/send-email'),
  sendEmail: (id) => api.post(`/applicants/${id}/send-email`),
};

// Email API endpoints
export const emailsAPI = {
  fetch: () => api.post('/emails/fetch'),
  send: (emailData) => api.post('/emails/send', emailData),
};

// Interview API endpoints
export const interviewsAPI = {
  getAll: () => api.get('/interviews'),
  getById: (id) => api.get(`/interviews/${id}`),
  generate: (applicantIds) => api.post('/interviews/generate', { applicant_ids: applicantIds }),
  sendEmails: (interviewIds) => api.post('/interviews/send-emails', interviewIds ? { interview_ids: interviewIds } : {}),
  getAvailability: () => api.get('/interviews/availability'),
  setAvailability: (availability) => api.post('/interviews/availability', { availability }),
};

export default api;
