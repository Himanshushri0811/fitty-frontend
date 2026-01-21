import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/diet';

const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
};

export const fetchDietPlan = async () => {
    try {
        const response = await axios.get(`${API_URL}/plan/`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Error fetching diet plan:", error);
        throw error;
    }
};

export const updateDietProfile = async (profileData) => {
    try {
        const response = await axios.post(`${API_URL}/profile/`, profileData, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Error updating diet profile:", error);
        throw error;
    }
};

export const searchFoods = async (query) => {
    try {
        const response = await axios.get(`${API_URL}/foods/search/?q=${query}`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Error searching foods:", error);
        throw error;
    }
};

export const replaceMeal = async (data) => {
    // data: { day, period, index, food_id }
    try {
        const response = await axios.post(`${API_URL}/plan/replace/`, data, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Error replacing meal:", error);
        throw error;
    }
};
