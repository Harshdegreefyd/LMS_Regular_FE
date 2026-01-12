import { BASE_URL } from "../config/api";
import axios from "axios"

export const FetchScoreBoardStats = async (level = null, week = null, year = null) => {
    try {
        const params = new URLSearchParams();
        if (level) params.append('level', level.toLowerCase());
        if (week) params.append('week', week);
        if (year) params.append('year', year);

        const response = await axios.get(`${BASE_URL}/scoreboard/weekly?${params.toString()}`, {
            withCredentials: true,
            headers: {
                'Accept': 'application/json'
            }
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching scoreboard stats:", error);
        return { success: false, message: error.message };
    }
};
