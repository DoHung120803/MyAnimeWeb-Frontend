import React, { useState, useRef, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './NotificationIcon.module.scss';
import NotificationDropdown from '~/components/NotificationDropdown';
import NotificationPopup from '~/components/NotificationPopup';
import { useAuth } from '~/contexts/AuthContext';
import { useNotificationSocket } from '~/hooks';

const cx = classNames.bind(styles);

/**
 * Component icon notification trong header
 * Hiển thị badge số thông báo chưa đọc, dropdown khi click, popup realtime
 */
function NotificationIcon() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [popups, setPopups] = useState([]);
    const wrapperRef = useRef(null);
    const { isAuthenticated, openAuthModal } = useAuth();

    // Callback khi nhận notification mới qua WebSocket
    const handleNewNotification = useCallback((notification) => {
        // Hiển thị popup toast
        setPopups(prev => {
            // Tránh trùng popup
            if (prev.some(p => p.id === notification.id)) return prev;
            return [...prev, notification];
        });
    }, []);

    const {
        unreadCount,
        notifications,
        hasMore,
        loadNotifications,
        markAsRead,
        markAllAsRead,
    } = useNotificationSocket(handleNewNotification);

    const handleToggleDropdown = (e) => {
        e.stopPropagation();
        if (!isAuthenticated) {
            openAuthModal('login');
            return;
        }

        const willOpen = !isDropdownOpen;
        setIsDropdownOpen(willOpen);

        // Load notifications khi mở dropdown
        if (willOpen) {
            loadNotifications(true);
        }
    };

    const handleCloseDropdown = () => {
        setIsDropdownOpen(false);
    };

    const handleNotificationClick = (notification) => {
        // Đánh dấu đã đọc
        if (!notification.isRead) {
            markAsRead(notification.id);
        }
        // Có thể navigate dựa vào type/referenceId nếu cần
        handleCloseDropdown();
    };

    const handleLoadMore = () => {
        loadNotifications(false);
    };

    const handleMarkAllAsRead = () => {
        markAllAsRead();
    };

    const handlePopupClose = useCallback((notificationId) => {
        setPopups(prev => prev.filter(p => p.id !== notificationId));
    }, []);

    return (
        <>
            <div className={cx('notification-icon-wrapper')} ref={wrapperRef}>
                <button
                    type="button"
                    className={cx('icon-btn', { active: isDropdownOpen })}
                    onClick={handleToggleDropdown}
                    aria-label="Notifications"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>

                    {/* Badge hiển thị số thông báo chưa đọc */}
                    {unreadCount > 0 && (
                        <span className={cx('badge')}>
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>

                {/* Dropdown danh sách notifications */}
                <NotificationDropdown
                    isVisible={isDropdownOpen}
                    onClose={handleCloseDropdown}
                    notifications={notifications}
                    hasMore={hasMore}
                    onLoadMore={handleLoadMore}
                    onNotificationClick={handleNotificationClick}
                    onMarkAllAsRead={handleMarkAllAsRead}
                    parentRef={wrapperRef}
                />
            </div>

            {/* Popup notifications (toast, góc dưới trái) */}
            {popups.map((notification, index) => (
                <NotificationPopup
                    key={notification.id}
                    notification={notification}
                    onClose={handlePopupClose}
                    index={index}
                />
            ))}
        </>
    );
}

export default NotificationIcon;
