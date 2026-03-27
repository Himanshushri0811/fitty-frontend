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
     * Send a message to the Advanced Fitty AI Agent
     */
    sendAgentMessage: async (message, mode = 'CHAT', session_id = null) => {
        try {
            const response = await API.post('/api/fitty-ai/agent/', { message, mode, session_id });
            return response.data;
        } catch (error) {
            console.error('Fitty Agent API Error:', error);
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
            const url = sessionId ? `/api/fitty-ai/agent/?session_id=${sessionId}` : '/api/fitty-ai/agent/';
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
            const response = await API.get('/api/fitty-ai/sessions/');
            return response.data;
        } catch (error) {
            console.error('Session list fetch error:', error);
            return [];
        }
    },

    /**
     * Delete a chat session
     */
    deleteSession: async (sessionId) => {
        try {
            await API.delete(`/api/fitty-ai/sessions/${sessionId}/`);
            return true;
        } catch (error) {
            console.error('Delete session error:', error);
            throw error;
        }
    }
};
