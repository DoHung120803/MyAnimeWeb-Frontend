import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
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
 * @param {function} onAcceptFriend - Callback chấp nhận lời mời kết bạn
 * @param {function} onDeclineFriend - Callback từ chối lời mời kết bạn
 */
function NotificationPopup({ notification, onClose, index = 0, onAcceptFriend, onDeclineFriend }) {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [actioned, setActioned] = useState(null); // 'accepted' | 'declined'
    const navigate = useNavigate();

    useEffect(() => {
        // Animate vào
        const showTimer = setTimeout(() => setIsVisible(true), 50);

        // Tự ẩn sau 5 giây
        const hideTimer = setTimeout(() => {
            triggerClose();
        }, 5000);

        return () => {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [notification.id]);

    const triggerClose = () => {
        setIsLeaving(true);
        setTimeout(() => {
            if (onClose) onClose(notification.id);
        }, 400);
    };

    const handleClose = (e) => {
        e.stopPropagation();
        triggerClose();
    };

    const handlePopupClick = () => {
        if (notification.senderUsername) {
            navigate(`/profile/${notification.senderUsername}`);
        }
        triggerClose();
    };

    const handleAccept = (e) => {
        e.stopPropagation();
        setActioned('accepted');
        if (onAcceptFriend) onAcceptFriend(notification);
        setTimeout(() => triggerClose(), 1200);
    };

    const handleDecline = (e) => {
        e.stopPropagation();
        setActioned('declined');
        if (onDeclineFriend) onDeclineFriend(notification);
        setTimeout(() => triggerClose(), 1200);
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

    const isFriendRequest = notification.type === 'FRIEND_REQUEST';

    // Tính bottom offset dựa trên index (xếp chồng popup)
    const bottomOffset = 24 + index * 110;

    const popup = (
        <div
            className={cx('popup', { visible: isVisible, leaving: isLeaving })}
            style={{ bottom: `${bottomOffset}px` }}
        >
            <div className={cx('popup-content')} onClick={handlePopupClick}>
                <div className={cx('popup-avatar', { 'friend-request': isFriendRequest })}>
                    {isFriendRequest ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="8.5" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="20" y1="8" x2="20" y2="14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="23" y1="11" x2="17" y2="11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    )}
                </div>
                <div className={cx('popup-body')}>
                    <p className={cx('popup-message')}>{notification.content}</p>
                    <span className={cx('popup-time')}>{getTimeAgo(notification.createdAt)}</span>

                    {/* Action buttons cho FRIEND_REQUEST */}
                    {isFriendRequest && !actioned && (
                        <div className={cx('popup-actions')} onClick={(e) => e.stopPropagation()}>
                            <button className={cx('popup-btn-accept')} onClick={handleAccept}>
                                Chấp nhận
                            </button>
                            <button className={cx('popup-btn-decline')} onClick={handleDecline}>
                                Từ chối
                            </button>
                        </div>
                    )}
                    {actioned && (
                        <span className={cx('popup-actioned', actioned)}>
                            {actioned === 'accepted' ? '✓ Đã chấp nhận' : '✗ Đã từ chối'}
                        </span>
                    )}
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
