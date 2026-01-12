import axios from 'axios';
import { BASE_URL } from '../config/api';


export const addStudentToWishList = async (studentId) => {
    try {
        const response = await axios.post(`${BASE_URL}/wishlist/add`, { studentId }, { withCredentials: true });
        return response.data
    } catch (error) {
        console.error(error);
        throw error
    }
}
export const removeStudentToWishList = async (studentId) => {
    try {
        const response = await axios.post(`${BASE_URL}/wishlist/remove`, { studentId }, { withCredentials: true });
        return response.data
    } catch (error) {
        console.error(error);
        throw error
    }
}
export const checkWishlistStatusById = async (studentId) => {
    try {
        const response = await axios.get(`${BASE_URL}/wishlist/checkwishlist/${studentId}`, { withCredentials: true });
        return response.data
    } catch (error) {
        console.error(error);
        throw error
    }
}