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
     * Get chat history / specific session
     * @param {string|null} sessionId - Optional ID to fetch specific session
     * @returns {Promise<Object>} - { history: [], session_id: "..." }
     */
    getHistory: async (sessionId = null) => {
        try {
            const url = sessionId ? `/api/ai/chat/?session_id=${sessionId}` : '/api/ai/chat/';
            const response = await API.get(url);
            return response.data;
        } catch (error) {
            console.error('History fetch error:', error);
            return { history: [] };
        }
    },

    /**
     * List all sidebar sessions
     */
    getSessionsList: async () => {
        try {
            const response = await API.get('/api/ai/sessions/');
            return response.data; // Array of { id, title, updated_at }
        } catch (error) {
            console.error('Session list fetch error:', error);
            return [];
        }
    }
};
