import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './MessageIcon.module.scss';
import ChatDropdown from '~/components/ChatDropdown';
import { useAuth } from '~/contexts/AuthContext';
import { useChatContext } from '~/contexts/ChatContext';

const cx = classNames.bind(styles);

/**
 * Component icon message trong header
 * Hiển thị badge số tin chưa đọc và dropdown conversations khi click
 */
function MessageIcon() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const wrapperRef = useRef(null);
    const { openChatBox, totalUnreadCount, fetchTotalUnreadCount, setFocusedChatBoxId } = useChatContext();
    const { isAuthenticated, openAuthModal } = useAuth();

    // Fetch tổng unread count khi component mount và khi user đăng nhập
    useEffect(() => {
        if (isAuthenticated) {
            fetchTotalUnreadCount();
        }
    }, [isAuthenticated, fetchTotalUnreadCount]);

    const handleToggleDropdown = (e) => {
        e.stopPropagation(); // Ngăn event bubble up
        // Nếu chưa đăng nhập thì mở modal login
        if (!isAuthenticated) {
            openAuthModal('login');
            return;
        }
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleCloseDropdown = () => {
        setIsDropdownOpen(false);
    };

    const handleConversationClick = (conversation) => {
        // Mở chat box thay vì chỉ đóng dropdown
        openChatBox(conversation);
        handleCloseDropdown();

        // Set focused chatbox → ChatBox sẽ tự markAsRead khi load xong messages
        if (conversation.id) {
            setFocusedChatBoxId(conversation.id);
        }
    };

    return (
        <div className={cx('message-icon-wrapper')} ref={wrapperRef}>
            <button 
                type="button"
                className={cx('icon-btn', { 'active': isDropdownOpen })} 
                onClick={handleToggleDropdown}
                aria-label="Messages"
            >
                {/* SVG Icon messenger - stroke style giống notification */}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path 
                        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    />
                </svg>
                
                {/* Badge hiển thị số tin nhắn chưa đọc */}
                {totalUnreadCount > 0 && (
                    <span className={cx('badge')}>
                        {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown conversations */}
            <ChatDropdown 
                isVisible={isDropdownOpen}
                onClose={handleCloseDropdown}
                onConversationClick={handleConversationClick}
                parentRef={wrapperRef}
            />
        </div>
    );
}

export default MessageIcon;
