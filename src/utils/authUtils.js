// Utility functions để quản lý authentication

export const getToken = () => {
    return localStorage.getItem("token");
};

export const setToken = (token) => {
    localStorage.setItem("token", token);
};

export const removeToken = () => {
    localStorage.removeItem("token");
};


export const isAuthenticated = () => {
    return !!getToken();
};

export const logout = () => {
    removeToken();
};

/**
 * Decode JWT token để lấy payload (không verify signature)
 * @returns {object|null} - JWT payload hoặc null nếu không có token
 */
export const decodeToken = () => {
    const token = getToken();
    if (!token) return null;

    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
};

/**
 * Lấy userId (subject) từ JWT token
 * @returns {string|null} - userId hoặc null
 */
export const getCurrentUserId = () => {
    const payload = decodeToken();
    return payload?.sub || null;
};
