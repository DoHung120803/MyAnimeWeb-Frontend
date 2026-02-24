import React from 'react';
import classNames from 'classnames/bind';
import styles from './NotificationItem.module.scss';

const cx = classNames.bind(styles);

/**
 * Một item trong danh sách notification dropdown
 * Gồm: icon/avatar, nội dung, thời gian, trạng thái đã đọc
 */
function NotificationItem({ notification, onClick }) {
    const getTimeAgo = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);

        if (diffSec < 60) return 'Vừa xong';
        if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
        if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
        return `${Math.floor(diffSec / 86400)} ngày trước`;
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'FRIEND_REQUEST':
                return (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="8.5" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="20" y1="8" x2="20" y2="14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="23" y1="11" x2="17" y2="11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                );
            default:
                return (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                );
        }
    };

    const handleClick = () => {
        if (onClick) {
            onClick(notification);
        }
    };

    return (
        <div 
            className={cx('notification-item', { unread: !notification.isRead })}
            onClick={handleClick}
        >
            <div className={cx('item-icon', notification.type?.toLowerCase())}>
                {getNotificationIcon(notification.type)}
            </div>
            <div className={cx('item-body')}>
                <p className={cx('item-content')}>{notification.content}</p>
                <span className={cx('item-time')}>{getTimeAgo(notification.createdAt)}</span>
            </div>
            {!notification.isRead && (
                <div className={cx('unread-dot')}></div>
            )}
        </div>
    );
}

export default NotificationItem;
