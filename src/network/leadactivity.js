import axios from "axios";
import { BASE_URL } from "../config/api";

export const getActivityByStudentId = async (studentId) => {
  try {
    const response = await axios.get(`${BASE_URL}/leadactivity/${studentId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
