import * as httpRequest from '~/utils/httpRequest';
import config from '~/config';

// Service để handle các chat-related API calls
const chatService = {
    /**
     * Lấy danh sách conversations của user
     * @param {string} userId - ID của user
     * @param {number} page - Số trang (default: 0)
     * @param {number} size - Số lượng items mỗi trang (default: 20)
     * @returns {Promise} - Response chứa danh sách conversations
     */
    getUserConversations: async (page = 0, size = 20) => {
        try {
            const response = await httpRequest.get(
                `${config.endpoints.getUserConversations}`,
                {
                    params: { page, size },
                }
            );
            return response;
        } catch (error) {
            console.error('Error fetching user conversations:', error);
            throw error;
        }
    },

    /**
     * Tạo conversation mới
     * @param {object} conversationData - Dữ liệu conversation (type, memberIds, name)
     * @returns {Promise}
     */
    createConversation: async (conversationData) => {
        try {
            const response = await httpRequest.post(
                config.endpoints.createConversation,
                conversationData
            );
            return response;
        } catch (error) {
            console.error('Error creating conversation:', error);
            throw error;
        }
    },

    /**
     * Lấy messages của một conversation
     * @param {object} request - {conversationId}
     * @param {number} page
     * @param {number} size
     * @returns {Promise}
     */
    getMessages: async (request, page = 0, size = 20) => {
        try {
            const response = await httpRequest.post(
                config.endpoints.getMessages,
                request,
                {
                    params: { page, size },
                }
            );
            return response;
        } catch (error) {
            console.error('Error fetching messages:', error);
            throw error;
        }
    },

    /**
     * Lấy direct conversation giữa 2 users
     * @param {object} request - {firstUserId, secondUserId}
     * @param {number} page
     * @param {number} size
     * @returns {Promise}
     */
    getDirectConversation: async (request, page = 0, size = 20) => {
        try {
            const response = await httpRequest.post(
                config.endpoints.getDirectConversation,
                request,
                {
                    params: { page, size },
                }
            );
            return response;
        } catch (error) {
            console.error('Error fetching direct conversation:', error);
            throw error;
        }
    },
};

export default chatService;
