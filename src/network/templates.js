import axios from 'axios';
import { BASE_URL } from '../config/api';
import { template } from 'lodash-es';

const getTemplates = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/templates`, { withCredentials: true });
        return response.data.data
    } catch (error) {
        console.error(error);
        throw error
    }
}
const getTemplateById = async (templateId) => {
    try {
        const response = await axios.get(`${BASE_URL}/templates/${templateId}`, { withCredentials: true });
        return response.data.data
    } catch (error) {
        console.error(error);
        throw error
    }
}
const updateTemplate = async (templateId, templateData) => {
    try {
        const response = await axios.put(`${BASE_URL}/templates/${templateId}`, templateData, { withCredentials: true });
        return response.data.data
    } catch (error) {
        console.error(error);
        throw error
    }
}
const createTemplates = async (templatesWithContent) => {
    try {
        const response = await axios.post(`${BASE_URL}/templates`, { templatesWithContent }, { withCredentials: true });
        return response.data.data
    } catch (error) {
        console.error(error);
        throw error
    }
}
const HandleDelte=async(template_name)=>
{
    try {
        const response = await axios.delete(`${BASE_URL}/templates/${template_name}`, { withCredentials: true });
        return response.data
    } catch (error) {
        console.error(error);
        throw error
    }
}
export { getTemplates, createTemplates, getTemplateById, updateTemplate ,HandleDelte}