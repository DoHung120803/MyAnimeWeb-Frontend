import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames/bind';
import styles from './NotificationPopup.module.scss';

const cx = classNames.bind(styles);

/**
 * Popup thông báo nhỏ ở góc dưới trái (giống Facebook)
 * Sử dụng React Portal để render trực tiếp vào document.body
 * Tự ẩn sau vài giây
 * 
 * @param {object} notification - Notification data
 * @param {function} onClose - Callback khi popup đóng
 * @param {number} index - Vị trí trong stack (để xếp chồng nhiều popup)
 */
function NotificationPopup({ notification, onClose, index = 0 }) {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        // Animate vào
        const showTimer = setTimeout(() => setIsVisible(true), 50);

        // Tự ẩn sau 5 giây
        const hideTimer = setTimeout(() => {
            setIsLeaving(true);
            setTimeout(() => {
                if (onClose) onClose(notification.id);
            }, 400);
        }, 5000);

        return () => {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
        };
    }, [notification.id, onClose]);

    const handleClose = (e) => {
        e.stopPropagation();
        setIsLeaving(true);
        setTimeout(() => {
            if (onClose) onClose(notification.id);
        }, 400);
    };

    const getTimeAgo = (dateStr) => {
        if (!dateStr) return 'Vừa xong';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);

        if (diffSec < 60) return 'Vừa xong';
        if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
        if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
        return `${Math.floor(diffSec / 86400)} ngày trước`;
    };

    // Tính bottom offset dựa trên index (xếp chồng popup)
    const bottomOffset = 24 + index * 90;

    const popup = (
        <div
            className={cx('popup', { visible: isVisible, leaving: isLeaving })}
            style={{ bottom: `${bottomOffset}px` }}
        >
            <div className={cx('popup-content')}>
                <div className={cx('popup-avatar')}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <div className={cx('popup-body')}>
                    <p className={cx('popup-message')}>{notification.content}</p>
                    <span className={cx('popup-time')}>{getTimeAgo(notification.createdAt)}</span>
                </div>
                <button className={cx('popup-close')} onClick={handleClose}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </button>
            </div>
        </div>
    );

    // Render vào document.body qua Portal để tránh bị clip bởi parent
    return ReactDOM.createPortal(popup, document.body);
}

export default NotificationPopup;
