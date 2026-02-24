import { useAuth } from '~/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

/**
 * AdminRoute - Bọc các route chỉ dành cho admin
 * Yêu cầu:
 * 1. Phải đăng nhập (nếu chưa login → mở modal login)
 * 2. Phải có role ADMIN (nếu không → hiển thị trang "Không có quyền truy cập")
 */
function AdminRoute({ children }) {
    const { isAuthenticated, isAdmin, openAuthModal, loading } = useAuth();
    const navigate = useNavigate();

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

    // Đã đăng nhập nhưng không phải admin → hiển thị thông báo không có quyền
    if (!isAdmin) {
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
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(239, 68, 68, 0.8)" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p style={{ fontSize: '18px', fontWeight: '500', color: 'rgba(255,255,255,0.9)' }}>
                    Không có quyền truy cập
                </p>
                <p>Bạn không có quyền truy cập vào trang này</p>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        marginTop: '8px',
                        padding: '10px 24px',
                        background: 'rgba(102, 126, 234, 0.8)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(102, 126, 234, 1)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(102, 126, 234, 0.8)'}
                >
                    Quay lại
                </button>
            </div>
        );
    }

    // Đã đăng nhập và là admin → cho phép truy cập
    return children;
}

export default AdminRoute;
