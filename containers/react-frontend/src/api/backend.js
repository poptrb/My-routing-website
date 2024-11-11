import axios from 'axios';
const BASE_URL = 'http://localhost:8001';

export default axios.create({
    baseURL: BASE_URL
});

export const privateRoute = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
});
