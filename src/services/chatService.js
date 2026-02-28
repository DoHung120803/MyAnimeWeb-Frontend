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
     * Tạo direct conversation mới giữa 2 người
     * @param {object} conversationData - Dữ liệu conversation (memberIds)
     * @returns {Promise}
     */
    createDirectConversation: async (conversationData) => {
        try {
            const response = await httpRequest.post(
                config.endpoints.createDirectConversation,
                conversationData
            );
            return response;
        } catch (error) {
            console.error('Error creating direct conversation:', error);
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

    /**
     * Lấy hoặc tạo direct conversation với một user (helper function)
     * Backend tự lấy firstUserId từ token, FE chỉ cần truyền secondUserId
     * Nếu conversation chưa tồn tại → trả về object với id = null,
     * ChatBox sẽ tự tạo conversation khi gửi tin nhắn đầu tiên
     * @param {string} friendId - ID của friend
     * @param {object} friendInfo - Thông tin friend (firstName, lastName, avtUrl)
     * @returns {Promise} - Response chứa conversation object và messages
     */
    getOrCreateDirectConversation: async (friendId, friendInfo = {}) => {
        try {
            // Gọi API lấy messages của direct conversation
            const response = await httpRequest.post(
                config.endpoints.getDirectConversation,
                { secondUserId: friendId },
                { params: { page: 0, size: 20 } }
            );

            // Tạo conversation object từ friendInfo
            const friendName = `${friendInfo.firstName || ''} ${friendInfo.lastName || ''}`.trim() || friendInfo.username;
            const conversationObject = {
                id: null, // Sẽ được fill từ messages nếu conversation đã tồn tại
                type: 1, // DIRECT
                name: friendName,
                chatAvt: friendInfo.avtUrl || 'https://via.placeholder.com/36',
                secondUserId: friendId, // Cần để ChatBox tạo conversation khi gửi tin nhắn đầu tiên
            };

            // Nếu có messages thì lấy conversationId từ message đầu tiên
            if (response.data && response.data.content && response.data.content.length > 0) {
                conversationObject.id = response.data.content[0].conversationId;
            }

            return {
                data: conversationObject,
                messages: response.data || { content: [] },
            };
        } catch (error) {
            console.error('Error getting or creating direct conversation:', error);
            throw error;
        }
    },

    /**
     * Đánh dấu conversation đã đọc
     * @param {object} request - { conversationId, lastReadMessageId }
     * @returns {Promise}
     */
    markAsRead: async (request) => {
        try {
            const response = await httpRequest.put(
                config.endpoints.markConversationAsRead,
                request
            );
            return response;
        } catch (error) {
            console.error('Error marking conversation as read:', error);
            throw error;
        }
    },

    /**
     * Lấy tổng số tin nhắn chưa đọc của user hiện tại
     * @returns {Promise} - Response chứa số lượng unread
     */
    getTotalUnreadCount: async () => {
        try {
            const response = await httpRequest.get(
                config.endpoints.getUnreadMessageCount
            );
            return response;
        } catch (error) {
            console.error('Error fetching total unread count:', error);
            throw error;
        }
    },
};

export default chatService;
