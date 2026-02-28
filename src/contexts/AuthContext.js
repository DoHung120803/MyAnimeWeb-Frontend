import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getToken, removeToken, decodeToken, isAuthenticated as checkAuth } from '~/utils/authUtils';
import userService from '~/services/userService';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'

    /**
     * Lấy thông tin user từ token đã lưu (khi reload trang)
     */
    const fetchUserInfo = useCallback(async () => {
        const token = getToken();
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        // Kiểm tra token có hết hạn chưa
        const payload = decodeToken();
        if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) {
            // Token hết hạn
            removeToken();
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const response = await userService.getMyInfo();
            if (response && response.data) {
                setUser(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch user info:', error);
            // Nếu lỗi 401, token không hợp lệ
            removeToken();
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Khi app khởi động, kiểm tra token và lấy user info
    useEffect(() => {
        fetchUserInfo();
    }, [fetchUserInfo]);

    // Lắng nghe event 401 Unauthorized từ httpRequest interceptor
    useEffect(() => {
        const handleUnauthorized = () => {
            setUser(null);
            setIsAuthModalOpen(true);
            setAuthModalMode('login');
            toast.warning("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        };
        window.addEventListener('auth:unauthorized', handleUnauthorized);
        return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }, []);

    /**
     * Đăng nhập thành công - cập nhật state
     */
    const loginSuccess = useCallback(async () => {
        setLoading(true);
        await fetchUserInfo();
        setIsAuthModalOpen(false);
    }, [fetchUserInfo]);

    /**
     * Đăng xuất
     */
    const logout = useCallback(() => {
        removeToken();
        setUser(null);
        toast.info("Đã đăng xuất thành công");
        // Không redirect, chỉ clear state
    }, []);

    /**
     * Mở modal đăng nhập
     */
    const openAuthModal = useCallback((mode = 'login') => {
        setAuthModalMode(mode);
        setIsAuthModalOpen(true);
    }, []);

    /**
     * Đóng modal đăng nhập
     */
    const closeAuthModal = useCallback(() => {
        setIsAuthModalOpen(false);
    }, []);

    /**
     * Kiểm tra user có role cụ thể không
     */
    const hasRole = useCallback((roleName) => {
        if (!user || !user.roles) return false;
        return user.roles.some(role => role.name === roleName);
    }, [user]);

    /**
     * Kiểm tra user có permission cụ thể không
     */
    const hasPermission = useCallback((permissionName) => {
        if (!user || !user.roles) return false;
        return user.roles.some(role => 
            role.permissions && role.permissions.some(p => p.name === permissionName)
        );
    }, [user]);

    /**
     * Kiểm tra đã đăng nhập chưa
     */
    const isAuthenticated = !!user && checkAuth();

    /**
     * Kiểm tra có phải admin không
     */
    const isAdmin = hasRole('ADMIN');

    /**
     * Yêu cầu đăng nhập - nếu chưa login thì mở modal, return false
     * Nếu đã login thì return true
     */
    const requireAuth = useCallback(() => {
        if (isAuthenticated) return true;
        openAuthModal('login');
        return false;
    }, [isAuthenticated, openAuthModal]);

    const value = {
        user,
        loading,
        isAuthenticated,
        isAdmin,
        isAuthModalOpen,
        authModalMode,
        loginSuccess,
        logout,
        openAuthModal,
        closeAuthModal,
        hasRole,
        hasPermission,
        requireAuth,
        fetchUserInfo,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
