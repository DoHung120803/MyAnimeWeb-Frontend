import { useAuth } from '~/contexts/AuthContext';

/**
 * ProtectedRoute - Bọc các route cần đăng nhập
 * Nếu chưa đăng nhập, sẽ mở modal login thay vì redirect
 */
function ProtectedRoute({ children }) {
    const { isAuthenticated, openAuthModal, loading } = useAuth();

    // Đang load user info (kiểm tra token)
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                background: '#0a0a0f',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '16px',
            }}>
                Đang tải...
            </div>
        );
    }

    // Chưa đăng nhập → mở modal login
    if (!isAuthenticated) {
        // Mở modal login sau khi render
        setTimeout(() => openAuthModal('login'), 0);
        
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                background: '#0a0a0f',
                color: 'rgba(255,255,255,0.7)',
                fontSize: '16px',
                flexDirection: 'column',
                gap: '16px',
            }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(102, 126, 234, 0.8)" strokeWidth="1.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <p>Bạn cần đăng nhập để truy cập trang này</p>
            </div>
        );
    }

    return children;
}

export default ProtectedRoute;
