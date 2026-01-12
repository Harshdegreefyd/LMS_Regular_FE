import axios from "axios";
import { BASE_URL } from "../config/api";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  }
});

export const fetchFilterOptions = async () => {
    try {
        const response = await axiosInstance.get('/filterOption');
        return response.data;
    } catch (error) {
        console.error('Error fetching filter options:', error);
        throw error;
    }
}