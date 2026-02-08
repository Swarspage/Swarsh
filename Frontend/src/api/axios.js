import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true, // Important for session cookies
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor (optional - for debugging or adding auth tokens)
api.interceptors.request.use(
    (config) => {
        // You can add auth token here if needed
        // config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor (optional - for error handling)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle common errors
        if (error.response?.status === 401) {
            // Unauthorized - redirect to login
            console.log('Unauthorized - please login');
            // window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
