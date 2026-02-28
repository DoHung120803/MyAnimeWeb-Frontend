import React, { useEffect, useRef, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './NotificationDropdown.module.scss';
import NotificationItem from '~/components/NotificationItem';

const cx = classNames.bind(styles);

/**
 * Dropdown danh sách notification (giống Facebook)
 * Hiển thị khi click vào icon notification trên header
 */
function NotificationDropdown({
    isVisible,
    onClose,
    notifications,
    hasMore,
    onLoadMore,
    onNotificationClick,
    onMarkAllAsRead,
    onAcceptFriend,
    onDeclineFriend,
    parentRef,
}) {
    const dropdownRef = useRef(null);

    // Đóng dropdown khi click bên ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                parentRef?.current &&
                !parentRef.current.contains(event.target)
            ) {
                onClose();
            }
        };

        if (isVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isVisible, onClose, parentRef]);

    // Scroll to load more
    const handleScroll = useCallback((e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop - clientHeight < 50 && hasMore) {
            if (onLoadMore) onLoadMore();
        }
    }, [hasMore, onLoadMore]);

    if (!isVisible) return null;

    return (
        <div className={cx('dropdown')} ref={dropdownRef}>
            {/* Header */}
            <div className={cx('dropdown-header')}>
                <h3 className={cx('dropdown-title')}>Thông báo</h3>
                <button 
                    className={cx('mark-all-btn')} 
                    onClick={onMarkAllAsRead}
                >
                    Đánh dấu tất cả đã đọc
                </button>
            </div>

            {/* Notification list */}
            <div className={cx('dropdown-list')} onScroll={handleScroll}>
                {notifications.length === 0 ? (
                    <div className={cx('empty-state')}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ opacity: 0.3 }}>
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <p>Chưa có thông báo nào</p>
                    </div>
                ) : (
                    <>
                        {notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onClick={onNotificationClick}
                                onAcceptFriend={onAcceptFriend}
                                onDeclineFriend={onDeclineFriend}
                            />
                        ))}
                        {hasMore && (
                            <div className={cx('load-more')}>
                                <span>Đang tải...</span>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default NotificationDropdown;
