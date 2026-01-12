import axios from 'axios';
import { BASE_URL } from '../config/api';

export const updateStudentStatus = async (studentId, statusData) => {
  try {
    const response = await axios.put(`${BASE_URL}/student/updateStudentStatus/${studentId}`, statusData, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const getStudentById = async (studentId) => {
  try {
    const response = await axios.get(`${BASE_URL}/student/${studentId}`, {
      withCredentials: true
    });

    return response.data;

  } catch (error) {
    throw error;
  }
};
export const updateStudent = async (
  studentId,
  payload
) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/student/updateStudentDetails/${studentId}`,
      {
        payload
      },
      {
        withCredentials: true
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to update student:", error);
    throw error.response?.data || { message: "Something went wrong" };
  }
};

export const bulkinsertion = async (parsedData) => {
  try {
    const response = await axios.post(`${BASE_URL}/student/bulkCreate`, { data: parsedData }, { withCredentials: true })
    return response
  } catch (error) {
    throw error
  }
}
export const bulkReassignment = async (parsedData) => {
  try {
    const response = await axios.post(`${BASE_URL}/student/bulkReassign`, { data: parsedData }, { withCredentials: true })
    return response
  } catch (error) {
    throw error
  }
}
export const AddDirectStudent = async (parsedData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/student/addLeadDirect`,
      parsedData,
      { withCredentials: true }
    );
    return response;
  } catch (error) {
    console.log('API Error:', error);
    throw error;
  }
}

export const updateStudentWindowOpen = async (studentId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/student/studentWindowOpenByCounsellor?studentId=${studentId}`,
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error updating student window:', error);
    throw error;
  }
};