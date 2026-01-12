import axios from "axios";
import { BASE_URL } from "../config/api";

const chatApi = {
    getHistory: async (chatId, params = {}) => {
        try {
            const response = await axios.get(`${BASE_URL}/website-chat/${chatId}/history`, { 
                params,
                withCredentials: true 
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching chat history:", error);
            throw error;
        }
    },
    closeChat: async (chatId, operatorId, role) => {
        try {
            const response = await axios.post(`${BASE_URL}/website-chat/${chatId}/close`, { operatorId, role }, { withCredentials: true });
            return response.data;
        } catch (error) {
             console.error("Error closing chat:", error);
             throw error;
        }
    }
};

export default chatApi;
