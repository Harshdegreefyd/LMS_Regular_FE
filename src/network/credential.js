import axios from "axios";
import { BASE_URL } from "../config/api";


export const fetchCollegeCredentials = async (studentId) => {
    try {
        const response = await axios.get(`${BASE_URL}/studentCollegeCreds/${studentId}`, { withCredentials: true })
        return response.data;
    } catch (error) {
        throw error
    }
}

export const fetchCollegeSentStatusByCourseId = async (studentId, selectedCollege) => {
    try {
        const response = await axios.get(`${BASE_URL}/studentCollegeCreds?courseId=${selectedCollege?.courseId}&studentId=${studentId}`, { withCredentials: true })
        return response.data;
    } catch (error) {
        throw error
    }
}

export const updateCollegeSentStatusCreds = async (formPayload) => {
    try {
        const response = await axios.post(`${BASE_URL}/studentCollegeCreds`, formPayload, { withCredentials: true })
        return response.data;
    } catch (error) {

        throw error.response?.data?.message || 'An error occurred while updating credentials'
    }
}

export const getCollegeCredsForReport = async (page, pageSize, allParams) => {
    try {
        const response = await axios.get(`${BASE_URL}/studentCollegeCreds/getCollegeCredsForReport?page=${page}&limit=${pageSize}${allParams ? '&' + allParams : ''}`, {
            withCredentials: true, // send cookies
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching remarks:", error);
        throw error;
    }
}


export const downloadCollegeCredsForReport = async (allParams) => {
    try {
        const response = await axios.get(`${BASE_URL}/studentCollegeCreds/downloadCollegeCredsForReport${allParams ? '?' + allParams : ''}`, {
            withCredentials: true, // send cookies
        });
        return response
    } catch (error) {
        return error
    }
}