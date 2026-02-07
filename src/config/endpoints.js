const endpoints = {

    // auth
    login: "api/v1/auth/login",

    // user
    register: "api/v1/users/register",

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
};

export default endpoints;
