import * as httpRequest from '~/utils/httpRequest';
import config from '~/config';

/**
 * Service để handle các notification-related API calls
 */
const notificationService = {
    /**
     * Lấy danh sách thông báo
     * @param {number} page - Số trang (default: 0)
     * @param {number} size - Số lượng items mỗi trang (default: 20)
     * @returns {Promise} - Response chứa Page<NotificationModel>
     */
    getNotifications: async (page = 0, size = 20) => {
        try {
            const response = await httpRequest.get(config.endpoints.getNotifications, {
                params: { page, size },
            });
            return response;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    },

    /**
     * Lấy số thông báo chưa đọc
     * @returns {Promise} - Response chứa count (number)
     */
    getUnreadCount: async () => {
        try {
            const response = await httpRequest.get(config.endpoints.getUnreadCount);
            return response;
        } catch (error) {
            console.error('Error fetching unread count:', error);
            throw error;
        }
    },

    /**
     * Đánh dấu một thông báo là đã đọc
     * @param {number} notificationId - ID thông báo
     * @returns {Promise}
     */
    markAsRead: async (notificationId) => {
        try {
            const response = await httpRequest.put(
                `${config.endpoints.markAsRead}/${notificationId}/read`
            );
            return response;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    /**
     * Đánh dấu tất cả thông báo là đã đọc
     * @returns {Promise}
     */
    markAllAsRead: async () => {
        try {
            const response = await httpRequest.put(config.endpoints.markAllAsRead);
            return response;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    },
};

export default notificationService;
