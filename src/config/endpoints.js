const endpoints = {

    // auth
    login: "api/v1/auth/login",

    // user
    register: "api/v1/users/register",
    getMyInfo: "api/v1/users/info",
    getUserById: "api/v1/users", // + /{id}
    getUserByUsername: "api/v1/users/username", // + /{username}
    getAllUsers: "api/v1/users/get-all",
    searchUsers: "api/v1/users/search",

    // anime
    getTopAnimes: "api/v1/animes/top-animes",
    getAnimes: "api/v1/animes",

    // banner
    getBanners: "api/v1/banners",

    // conversations
    getUserConversations: "api/v1/conversations/get-all",
    createConversation: "api/v1/conversations",
    getMessages: "api/v1/conversations/messages",
    getDirectConversation: "api/v1/conversations/get-direct-conversation",

    // friends
    getFriends: "api/v1/friendships/get-friends",
    addFriend: "api/v1/friendships/add",
    getFriendshipStatus: "api/v1/friendships/status", // + /{targetUserId}

    // notifications
    getNotifications: "api/v1/notifications",
    getUnreadCount: "api/v1/notifications/unread-count",
    markAsRead: "api/v1/notifications", // + /{id}/read (PUT)
    markAllAsRead: "api/v1/notifications/read-all", // PUT
};

export default endpoints;
