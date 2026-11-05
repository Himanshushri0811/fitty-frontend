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

export const regeneratePlan = async () => {
    try {
        const response = await axios.get(`${API_URL}/plan/?force=true`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Error regenerating diet plan:", error);
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

export const fetchDietProfile = async () => {
    try {
        const response = await axios.get(`${API_URL}/profile/`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Error fetching diet profile:", error);
        throw error;
    }
};

export const searchFoods = async (query) => {
    try {
        const response = await axios.get(`${API_URL}/food-search/?q=${encodeURIComponent(query)}`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Error searching foods:", error);
        throw error;
    }
};

export const replaceMeal = async (data) => {
    // data: { day, period, index, food_id }
    try {
        const response = await axios.post(`${API_URL}/replace-meal/`, data, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Error replacing meal:", error);
        throw error;
    }
};

export const fetchDietCarousel = async () => {
    try {
        const response = await axios.get(`${API_URL}/carousel/`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Error fetching carousel:", error);
        throw error;
    }
};

export const fetchFoodDetail = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/foods/${id}/`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Error fetching food detail:", error);
        throw error;
    }
};

export const calculateMacros = async (text) => {
    try {
        const response = await axios.post(`${API_URL}/calculate-macros/`, { text }, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Error calculating macros:", error);
        throw error;
    }
};

export const logFood = async (data) => {
    // payload: { date, meal_type, client_id, items, items_detail, totals, source }
    try {
        const payload = {
            client_id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            ...data
        };
        const response = await axios.post(`${API_URL}/log-food/`, payload, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Error logging food:", error);
        throw error;
    }
};

export const fetchDailySummary = async (date) => {
    try {
        const localDate = date || new Date().toLocaleDateString('en-CA');
        const response = await axios.get(`${API_URL}/daily-summary/?date=${localDate}`, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Error fetching daily summary:", error);
        throw error;
    }
};

export const markMealEaten = async (date, period, eaten) => {
    try {
        const localDate = date || new Date().toLocaleDateString('en-CA');
        const payload = { date: localDate, period };
        if (typeof eaten === 'boolean') {
            payload.eaten = eaten;
        }
        const response = await axios.post(`${API_URL}/mark-eaten/`, payload, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Error marking meal eaten:", error);
        throw error;
    }
};

export const removeLogEntry = async (date, entryId) => {
    try {
        const localDate = date || new Date().toLocaleDateString('en-CA');
        const response = await axios.post(`${API_URL}/log-food/remove/`, { date: localDate, entry_id: entryId }, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Error removing log entry:", error);
        throw error;
    }
};

export const logWater = async (date, waterPayload) => {
    try {
        const localDate = date || new Date().toLocaleDateString('en-CA');
        const payload = { date: localDate, ...waterPayload };
        const response = await axios.post(`${API_URL}/water/`, payload, getAuthHeaders());
        return response.data;
    } catch (error) {
        console.error("Error logging water:", error);
        throw error;
    }
};
