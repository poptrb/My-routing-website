import axios from 'axios';

export const BASE_URL = 'https://beatlavolan.srinotforme.xyz/api/';

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
