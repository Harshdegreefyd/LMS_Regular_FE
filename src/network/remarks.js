import axios from "axios";
import { BASE_URL } from "../config/api";

export const fetchStudentRemarks = async (studentId) => {
  try {
    const response = await axios.get(`${BASE_URL}/remark/${studentId}`, {
      withCredentials: true, // send cookies
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching remarks:", error);
    throw error;
  }
};

export const getAnalysisReport = async (params) => {
  try {
    const response = await axios.get(`${BASE_URL}/remark/getAnalysisReport?${params.toString()}`, {
      withCredentials: true, // send cookies
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching remarks:", error);
    throw error;
  }
}

export const downloadAnalysisReport = async (allParams) => {
    try {
        const response = await axios.get(`${BASE_URL}/remark/downloadAnalysisReport${allParams ? '?' + allParams : ''}`, {
            withCredentials: true, // send cookies
        });
        return response
    } catch (error) {
        return error
    }
}