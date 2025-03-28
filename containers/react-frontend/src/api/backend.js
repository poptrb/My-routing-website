import axios from 'axios';

export const BASE_URL = process.env.REACT_APP_BACKEND_URL

export default axios.create({
    baseURL: BASE_URL
});

export const privateRoute = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    withCredentials: true
});
