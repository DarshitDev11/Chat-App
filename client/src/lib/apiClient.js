import axios from 'axios';

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_SERVER_URL, 
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, 
});