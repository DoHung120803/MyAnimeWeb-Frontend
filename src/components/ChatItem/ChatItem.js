import React from 'react';
import classNames from 'classnames/bind';
import styles from './ChatItem.module.scss';
import Image from '~/components/Image';
import images from '~/assets/images';

const cx = classNames.bind(styles);

/**
 * Component hiển thị một conversation item trong dropdown
 * @param {object} conversation - Dữ liệu conversation {id, name, lastMessageText, lastMessageTime, type}
 * @param {function} onClick - Callback khi click vào item
 * @param {number} unreadCount - Số tin nhắn chưa đọc
 */
function ChatItem({ conversation, onClick, unreadCount = 0 }) {
    // Format time (ví dụ: "2 giờ trước", "Hôm qua", v.v.)
    const formatTime = (dateTime) => {
        if (!dateTime) return '';
        
        const messageDate = new Date(dateTime);
        const now = new Date();
        const diffMs = now - messageDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút`;
        if (diffHours < 24) return `${diffHours} giờ`;
        if (diffDays === 1) return 'Hôm qua';
        if (diffDays < 7) return `${diffDays} ngày`;
        
        return messageDate.toLocaleDateString('vi-VN');
    };

    // Rút gọn text nếu quá dài
    const truncateText = (text, maxLength = 40) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        <div className={cx('chat-item', { 'has-unread': unreadCount > 0 })} onClick={onClick}>
            <div className={cx('avatar-wrapper')}>
                {/* Avatar - Tạm dùng default image, sau có thể lấy từ user info */}
                <Image
                    src={conversation.chatAvt || images.noImage} // Thay bằng avatar thật nếu có
                    alt={conversation.name}
                    className={cx('avatar')}
                />
                {/* Online status indicator (tùy chọn) */}
                {/* <span className={cx('online-status')}></span> */}
            </div>

            <div className={cx('content')}>
                <div className={cx('header')}>
                    <span className={cx('name', { 'unread': unreadCount > 0 })}>
                        {conversation.name || 'Người dùng'}
                    </span>
                    <span className={cx('time')}>
                        {formatTime(conversation.lastMessageTime)}
                    </span>
                </div>
                
                <div className={cx('message')}>
                    <span className={cx('text', { 'unread': unreadCount > 0 })}>
                        {truncateText(conversation.lastMessageText || 'Bắt đầu trò chuyện')}
                    </span>
                    {unreadCount > 0 && (
                        <span className={cx('unread-badge')}>{unreadCount > 99 ? '99+' : unreadCount}</span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ChatItem;
