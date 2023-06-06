import axios from 'axios';

export const axiosApiInstance = axios.create({ baseURL: process.env.API_SERVER })

