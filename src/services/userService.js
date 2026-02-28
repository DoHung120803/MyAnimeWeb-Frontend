import * as httpRequest from '~/utils/httpRequest';
import config from '~/config';

const userService = {
    /**
     * Lấy thông tin cá nhân của user đang đăng nhập
     * @returns {Promise} - Response chứa thông tin user
     */
    getMyInfo: async () => {
        try {
            const response = await httpRequest.get(config.endpoints.getMyInfo);
            return response;
        } catch (error) {
            console.error('Error fetching user info:', error);
            throw error;
        }
    },

    /**
     * Lấy thông tin user theo ID
     * @param {string} userId - ID của user
     * @returns {Promise} - Response chứa thông tin user
     */
    getUserById: async (userId) => {
        try {
            const response = await httpRequest.get(`${config.endpoints.getUserById}/${userId}`);
            return response;
        } catch (error) {
            console.error('Error fetching user by id:', error);
            throw error;
        }
    },

    /**
     * Lấy thông tin user theo username
     * @param {string} username - Username của user
     * @returns {Promise} - Response chứa thông tin user
     */
    getUserByUsername: async (username) => {
        try {
            const response = await httpRequest.get(`${config.endpoints.getUserByUsername}/${username}`);
            return response;
        } catch (error) {
            console.error('Error fetching user by username:', error);
            throw error;
        }
    },

    /**
     * Lấy danh sách bạn bè
     * @returns {Promise} - Response chứa danh sách bạn bè (List<UserModel>)
     */
    getFriends: async () => {
        try {
            const response = await httpRequest.post(config.endpoints.getFriends);
            return response;
        } catch (error) {
            console.error('Error fetching friends:', error);
            throw error;
        }
    },

    /**
     * Lấy danh sách tất cả users (gợi ý kết bạn)
     * @param {number} page - Số trang (mặc định: 1)
     * @param {number} size - Số items mỗi trang (mặc định: 20)
     * @returns {Promise} - Response chứa danh sách users
     */
    getAllUsers: async (page = 1, size = 20) => {
        try {
            const response = await httpRequest.post(
                config.endpoints.getAllUsers,
                null,
                {
                    params: { page, size },
                }
            );
            return response;
        } catch (error) {
            console.error('Error fetching all users:', error);
            throw error;
        }
    },

    /**
     * Tìm kiếm users theo keyword (ES hoặc DB)
     * @param {string} keyword - Từ khóa tìm kiếm
     * @param {number} page - Số trang (Spring Pageable, 0-indexed)
     * @param {number} size - Số items mỗi trang
     * @returns {Promise} - Response chứa PageResponse<UserModel>
     */
    searchUsers: async (keyword, page = 0, size = 10) => {
        try {
            const response = await httpRequest.post(
                config.endpoints.searchUsers,
                null,
                {
                    params: { keyword, page, size },
                }
            );
            return response;
        } catch (error) {
            console.error('Error searching users:', error);
            throw error;
        }
    },

    /**
     * Gửi lời mời kết bạn
     * @param {string} friendUserId - ID của user muốn kết bạn
     * @returns {Promise} - Response từ server
     */
    addFriend: async (friendUserId) => {
        try {
            const response = await httpRequest.post(
                config.endpoints.addFriend,
                { friendUserId }
            );
            return response;
        } catch (error) {
            console.error('Error adding friend:', error);
            throw error;
        }
    },

    /**
     * Lấy trạng thái kết bạn giữa user hiện tại và user khác
     * @param {string} targetUserId - ID của user cần kiểm tra
     * @returns {Promise} - Response chứa { status, requestId }: NONE | SENT | WAITING | ACCEPTED | REJECTED | SELF
     */
    getFriendshipStatus: async (targetUserId) => {
        try {
            const response = await httpRequest.get(
                `${config.endpoints.getFriendshipStatus}/${targetUserId}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching friendship status:', error);
            throw error;
        }
    },

    /**
     * Phản hồi lời mời kết bạn (chấp nhận hoặc từ chối)
     * @param {string} id - ID của friendship record
     * @param {boolean} isAccept - true = chấp nhận, false = từ chối
     * @returns {Promise} - Response từ server
     */
    respondToFriendRequest: async (id, isAccept) => {
        try {
            const response = await httpRequest.post(
                config.endpoints.respondFriend,
                { id, isAccept }
            );
            return response;
        } catch (error) {
            console.error('Error responding to friend request:', error);
            throw error;
        }
    },
};

export default userService;
