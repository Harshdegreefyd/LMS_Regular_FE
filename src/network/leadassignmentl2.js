// api/leadAssignmentApi.js
import axios from 'axios';
import { BASE_URL } from '../config/api';
import { handleError } from '../utils/handleError';


// Fetch all lead assignment rules
export const fetchLeadAssignmentRules = async () => {
  try {
    const res = await axios.get(
      `${BASE_URL}/leadassignmentl2`,
      { withCredentials: true }
    );
    return res.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// Create new lead assignment rule
export const createLeadAssignmentRule = async (ruleData) => {
  try {
    const res = await axios.post(
      `${BASE_URL}/leadassignmentl2`,
      ruleData,
      { withCredentials: true }
    );
    return res.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// Update lead assignment rule
export const updateLeadAssignmentRule = async (ruleId, ruleData) => {
  try {
    const res = await axios.put(
      `${BASE_URL}/leadassignmentl2/${ruleId}`,
      ruleData,
      { withCredentials: true }
    );
    return res.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// Delete lead assignment rule
export const deleteLeadAssignmentRule = async (ruleId) => {
  try {
    const res = await axios.delete(
      `${BASE_URL}/leadassignmentl2/${ruleId}`,
      { withCredentials: true }
    );
    return res.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// Toggle lead assignment rule status
export const toggleLeadAssignmentRule = async (ruleId) => {
  try {
    const res = await axios.patch(
      `${BASE_URL}/leadassignmentl2/${ruleId}/toggle`,
      {},
      { withCredentials: true }
    );
    return res.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// Fetch L2 agents
export const fetchL2Agents = async () => {
  try {
    const res = await axios.get(
      `${BASE_URL}/counsellor/getAllCounsellors?role=l2`,
      { withCredentials: true }
    );
    return res.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// Fetch lead options
export const fetchLeadOptions = async () => {
  try {
    const res = await axios.get(
      `${BASE_URL}/filterOption`,
      { withCredentials: true }
    );
    return res.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};

// Fetch advanced dropdown data
export const fetchAdvancedDropdownData = async () => {
  try {
    const res = await axios.get(
      `${BASE_URL}/universitycourse/dropdown`,
      { withCredentials: true }
    );
    return res.data;
  } catch (error) {
    handleError(error);
    throw error;
  }
};