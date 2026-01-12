import axios from "axios";
import { BASE_URL } from "../config/api";


export const updatetheCourseStatusLog = async (selectedCollege, selectedStatus, studentId, notes, examInterviewDate, lastAdmissionDate, depositAmount) => {
    try {
        const response = await axios.post(`${BASE_URL}/StudentCourseStatusLogs/${selectedCollege.course_id}`, {
            studentId,
            status: selectedStatus,
            collegeName: selectedCollege.universityName,
            courseName: selectedCollege.courseName,
            notes,
            examInterviewDate,
            lastAdmissionDate,
            depositAmount: Number(depositAmount),
            courseId: selectedCollege.courseId,
        }, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchStudentCourseStatus = async (courseId, studentId) => {
    try {
        let response = await axios.get(`${BASE_URL}/studentcoursestatus/${courseId}/${studentId}`, {
            withCredentials: true,
        })
        return response.data
    } catch (error) {
        return error
    }
}

export const updatetheCourseStatus = async (courseId, studentId, pendingStatus, isShortlisted) => {
    try {
        const response = await axios.post(`${BASE_URL}/StudentCourseStatus/update`, {
            courseId: courseId,
            studentId: studentId,
            status: pendingStatus || "Shortlisted",
            isShortlisted: isShortlisted,
        }, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getRecordsForAnalysis = async (page, pageSize, allParams) => {
    try {
        const response = await axios.get(`${BASE_URL}/studentcoursestatus/getRecordsForAnalysis?page=${page}&limit=${pageSize}${allParams ? '&' + allParams : ''}`, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching remarks:", error);
        throw error;
    }
}

export const downloadRemarksReport = async (allParams, showDetailedColumns) => {
    try {
        console.log(showDetailedColumns,"jalal")
        // Build query string
        let queryString = '';
        
        if (allParams) {
            queryString = '?' + allParams;
        }
        
        if (showDetailedColumns !== undefined) {
            if (queryString) {
                queryString += '&showDetailedColumns=' + showDetailedColumns;
            } else {
                queryString = '?showDetailedColumns=' + showDetailedColumns;
            }
        }
        
        // CORRECT THE ENDPOINT PATH
        const response = await axios.get(
            `${BASE_URL}/studentcoursestatus/getrecords/form-filled/download${queryString}`, 
            {
                withCredentials: true,
                responseType: 'blob'
            }
        );
        return response;
    } catch (error) {
        return error;
    }
}