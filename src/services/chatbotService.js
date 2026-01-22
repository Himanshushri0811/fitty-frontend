import API from '../components/axiosConfig';

export const chatbotService = {
    /**
     * Send a message to the AI
     * @param {string} message - User message
     * @param {string|null} sessionId - Current Session ID
     * @returns {Promise<Object>} - Reply and new SessionID
     */
    sendMessage: async (message, sessionId = null) => {
        try {
            const response = await API.post('/api/ai/chat/', {
                message,
                session_id: sessionId
            });
            return response.data;
        } catch (error) {
            console.error('Chatbot API Error:', error);
            throw error;
        }
    },

    /**
     * Get chat history / active session
     * @returns {Promise<Object>} - { history: [], session_id: "..." }
     */
    getHistory: async () => {
        try {
            const response = await API.get('/api/ai/chat/');
            return response.data;
        } catch (error) {
            console.error('History fetch error:', error);
            return { history: [] };
        }
    }
};
