import axios from 'axios';
import { BASE_URL } from '../config/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAllUniversities = () =>
  api.get('/courseHeaderValue/universities/list');

export const getCoursesWithFilters = (filters) => {
  const params = new URLSearchParams();
  if (filters.universityName) params.append('universityName', filters.universityName);
  if (filters.courseName) params.append('courseName', filters.courseName);
  if (filters.level) params.append('level', filters.level);
  if (filters.studyMode) params.append('studyMode', filters.studyMode);
  if (filters.status !== 'all') params.append('status', filters.status);
  return api.get(`/universitycourse?${params}`);
};

export const getUniversityCourseMappings = (universityName) =>
  api.get(`/courseHeaderValue/university/${encodeURIComponent(universityName)}/courses`);

export const updateCourse = (courseId, updatedData) =>
  api.put(`/universitycourse/${courseId}`, updatedData);

export const disableAllCourses = (courseId, universityName) =>
  api.put(`/universitycourse/disable/${encodeURIComponent(universityName)}/${courseId}`);

export const deleteCourseMapping = (courseId, universityName) =>
  api.delete(`/courseHeaderValue/${courseId}?university=${encodeURIComponent(universityName)}`);

export const saveCourseHeaderValues = (courseId, universityName, values) =>
  api.post('/courseHeaderValue', { courseId, universityName, values });

export const bulkImportCourses = (courses) =>
  api.post('/universitycourse/insert-courses', courses);

export const bulkImportMappings = (mappings) =>
  api.post('/courseHeaderValue/bulk', { courseHeaderValues: mappings });
export const bulkUpdateUniversityCourses = (mappings) =>
  api.post('/courseHeaderValue/bulk', { courseHeaderValues: mappings });
export const updateUniversal = async (universityName, courseId, formData) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/universitycourse/updateuniversal/${encodeURIComponent(universityName)}/${courseId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response;
  } catch (error) {
    throw error;
  }
};
// Make sure this is the correct API function
export const uploadUniversityBrochure = async (universityName, formData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/universitytemplates/${encodeURIComponent(universityName)}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};
export default api;
