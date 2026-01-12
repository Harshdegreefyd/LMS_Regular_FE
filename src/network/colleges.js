import axios from "axios";
import { BASE_URL } from "../config/api";

export const fetchShortlistedColleges = async (studentPreferences, page = 1, limit = 100) => {
  try {
    // Create an empty request body - we'll only add valid criteria
    const requestBody = {};
    // Map student preference properties to API request properties
    const mappings = {
      'preferred_stream': 'stream',
      'preferred_degree': 'degreeName',
      'preferred_level': 'level',
      'preferred_state': 'state',
      'preferred_city': 'city',
      'preferred_specialization': 'specialization',
      'mode': 'mode'
    };

    // Process each property from student preferences
    Object.entries(mappings).forEach(([prefKey, apiKey]) => {
      const value = studentPreferences[prefKey];

      // Only add the property if it has a meaningful value
      if (value) {
        // Handle array values
        if (Array.isArray(value)) {
          // Only add non-empty arrays with actual values
          if (value.length > 0 && value.some(item => item && item.trim() !== "")) {
            // Filter out empty strings and undefined values
            const filteredArray = value.filter(item => item && item.trim() !== "");
            if (filteredArray.length > 0) {
              requestBody[apiKey] = filteredArray;
            }
          }
        }

        // Handle string values
        else if (typeof value === 'string' && value.trim() !== "") {
          requestBody[apiKey] = value;
        }
      }
    });

    

    // Add pagination parameters
    requestBody.page = page;
    requestBody.limit = limit;
    requestBody.student_id=studentPreferences?.student_id
    // Log the request for debugging

    const response = await axios.post(
      `${BASE_URL}/universitycourse/search`,
      requestBody
    );

    return {
      colleges: response.data.courses || [],
      totalCount: response.data.totalCount || 0,
      hasMore: response.data.hasMore || response.data.totalCount > page * limit
    };
  } catch (error) {
    console.error("Error fetching suggested colleges:", error);
    throw error;
  }
};

export const fetchShortlistedColleges1 = async (studentId) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/studentcoursestatus/shortlisted/${studentId}/full`, {
        withCredentials: true,
    }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching shortlisted colleges:", error);
    throw error;
  }
};