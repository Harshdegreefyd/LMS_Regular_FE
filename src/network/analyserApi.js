import axios from "axios";
import { BASE_URL } from "../config/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

axiosInstance.interceptors.request.use(
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

export const fetchAnalysers = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/analyser', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching analysers:', error);
    throw error;
  }
};

export const createAnalyser = async (analyserData) => {
  try {
    const response = await axiosInstance.post('/analyser', analyserData);
    return response.data;
  } catch (error) {
    console.error('Error creating analyser:', error);
    throw error;
  }
};

export const updateAnalyser = async (id, analyserData) => {
  try {
    const response = await axiosInstance.put(`/analyser/${id}`, analyserData);
    return response.data;
  } catch (error) {
    console.error('Error updating analyser:', error);
    throw error;
  }
};

export const deleteAnalyser = async (id) => {
  try {
    const response = await axiosInstance.delete(`/analyser/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting analyser:', error);
    throw error;
  }
};

export const forceLogoutAnalyser = async (id) => {
  try {
    const response = await axiosInstance.post(`/analyser/${id}/force-logout`);
    return response.data;
  } catch (error) {
    console.error('Error force logging out analyser:', error);
    throw error;
  }
};