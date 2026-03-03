import axios from 'axios';

const api = axios.create({
    baseURL: 'https://pamuenbackend.onrender.com/api', // Hardcoded per instruction
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
