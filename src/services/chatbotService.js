import API from '../components/axiosConfig';

export const chatbotService = {
    /**
     * Send a message to the AI
     * @param {string} message - User message
     * @param {Object} context - Page context { page: '/dashboard' }
     * @returns {Promise<Object>} - Contextual response
     */
    sendMessage: async (message, context = {}) => {
        try {
            const response = await API.post('/api/ai/chat/', {
                message,
                context
            });
            return response.data;
        } catch (error) {
            console.error('Chatbot API Error:', error);
            throw error;
        }
    },

    /**
     * Fetch current user profile for personalization
     * @returns {Promise<Object>}
     */
    getUserProfile: async () => {
        try {
            const response = await API.get('/api/accounts/profile/');
            return response.data;
        } catch (error) {
            console.error('Profile fetch error:', error);
            return null;
        }
    }
};
