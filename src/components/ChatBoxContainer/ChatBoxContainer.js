import React, { useRef, useEffect, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './ChatBoxContainer.module.scss';
import ChatBox from '~/components/ChatBox';
import { useChatContext } from '~/contexts/ChatContext';
import useChatSocket from '~/hooks/useChatSocket';
import { getCurrentUserId } from '~/utils/authUtils';
import { toast } from 'react-toastify';

const cx = classNames.bind(styles);

/**
 * Container quản lý layout của nhiều chat boxes
 * Xếp ngang từ phải sang trái (bottom-right) giống Facebook Messenger
 */
const ChatBoxContainer = () => {
    const { 
        openChatBoxes, 
        isSoundEnabled, 
        updateConversationLastMessage, 
        incrementUnreadForConversation,
        markConversationAsRead,
        openChatBox,
        conversations,
        focusedChatBoxId,
        setFocusedChatBoxId,
    } = useChatContext();
    const messageRefsMap = useRef(new Map());
    const typingRefsMap = useRef(new Map());
    const chatBoxContainerRef = useRef(null);
    // Ref để luôn có state mới nhất trong callback
    const openChatBoxesRef = useRef(openChatBoxes);
    const conversationsRef = useRef(conversations);
    const focusedChatBoxIdRef = useRef(focusedChatBoxId);
    useEffect(() => {
        openChatBoxesRef.current = openChatBoxes;
    }, [openChatBoxes]);
    useEffect(() => {
        conversationsRef.current = conversations;
    }, [conversations]);
    useEffect(() => {
        focusedChatBoxIdRef.current = focusedChatBoxId;
    }, [focusedChatBoxId]);

    /**
     * Callback khi nhận tin nhắn mới từ WebSocket
     */
    const handleMessageReceived = (message) => {
        console.log('New message received in ChatBoxContainer:', message);
        
        const conversationId = message.conversationId;
        const currentUserId = getCurrentUserId();
        const isOwnMessage = String(message.senderId) === String(currentUserId);

        // Cập nhật lastMessage trong conversations list
        updateConversationLastMessage(conversationId, message);
        
        // Tìm chat box tương ứng và thêm tin nhắn vào
        console.log('Available refs:', Array.from(messageRefsMap.current.keys()));
        const addMessageFunc = messageRefsMap.current.get(conversationId);
        
        if (addMessageFunc) {
            console.log('Found Handler for conversation:', conversationId);
            addMessageFunc(message);
        } else {
            console.log('Chat box not open for conversation:', conversationId);

            // Nếu chatbox chưa mở và tin nhắn không phải của mình → auto mở chatbox (giống Facebook)
            if (!isOwnMessage) {
                const conv = conversationsRef.current.find(c => c.id === conversationId);
                if (conv) {
                    openChatBox(conv);
                }
            }
        }

        // Tăng unreadCount nếu tin nhắn không phải của mình
        // VÀ chatbox đó KHÔNG đang được user focus (click vào)
        if (!isOwnMessage) {
            const isFocused = focusedChatBoxIdRef.current === conversationId;
            if (!isFocused) {
                incrementUnreadForConversation(conversationId);
            } else if (message.id) {
                // Chatbox đang focused → mark as read ngay lập tức
                // (Backend đã tăng unreadCount, cần gọi markAsRead để reset về 0)
                markConversationAsRead(conversationId, message.id);
            }
        }
    };

    /**
     * Callback khi nhận typing event từ WebSocket
     */
    const handleTypingReceived = (typingEvent) => {
        console.log('Typing event received in ChatBoxContainer:', typingEvent);
        
        const conversationId = typingEvent.conversationId;
        const handleTypingFunc = typingRefsMap.current.get(conversationId);
        
        if (handleTypingFunc) {
            console.log('Found typing handler for conversation:', conversationId);
            handleTypingFunc(typingEvent);
        } else {
            console.log('No typing handler registered for conversation:', conversationId);
        }
    };

    /**
     * Register callback to receive messages for a conversation
     */
    const registerReceiveMessage = useCallback((conversationId, callback) => {
        messageRefsMap.current.set(conversationId, callback);
    }, []);

    /**
     * Register callback to receive typing events for a conversation
     */
    const registerTypingHandler = useCallback((conversationId, callback) => {
        typingRefsMap.current.set(conversationId, callback);
    }, []);

    /**
     * Kết nối WebSocket
     */
    const { sendMessage, sendTyping, isConnected } = useChatSocket(
        handleMessageReceived, 
        isSoundEnabled,
        handleTypingReceived
    );

    /**
     * Cleanup message refs khi chat boxes thay đổi
     */
    useEffect(() => {
        // Xóa refs của các chat box đã đóng
        const currentConversationIds = openChatBoxes.map((cb) => cb.conversationId);
        
        messageRefsMap.current.forEach((_, conversationId) => {
            if (!currentConversationIds.includes(conversationId)) {
                messageRefsMap.current.delete(conversationId);
            }
        });

        typingRefsMap.current.forEach((_, conversationId) => {
            if (!currentConversationIds.includes(conversationId)) {
                typingRefsMap.current.delete(conversationId);
            }
        });
    }, [openChatBoxes]);

    /**
     * Clear focusedChatBoxId khi user click ra ngoài tất cả chatbox
     * → Để khi tin nhắn mới đến, chatbox không focused sẽ tăng unreadCount
     */
    useEffect(() => {
        const handleDocumentClick = (e) => {
            if (
                chatBoxContainerRef.current && 
                !chatBoxContainerRef.current.contains(e.target)
            ) {
                setFocusedChatBoxId(null);
            }
        };
        document.addEventListener('mousedown', handleDocumentClick);
        return () => document.removeEventListener('mousedown', handleDocumentClick);
    }, [setFocusedChatBoxId]);

    /**
     * Handle gửi tin nhắn
     */
    const handleSendMessage = (messageData) => {
        if (isConnected) {
            sendMessage(messageData);
        } else {
            console.error('WebSocket not connected. Cannot send message.');
            toast.error('Mất kết nối máy chủ chat. Vui lòng thử lại sau.');
        }
    };

    /**
     * Handle gửi typing status
     */
    const handleSendTyping = (typingData) => {
        if (isConnected) {
            sendTyping(typingData);
        } else {
            console.error('WebSocket not connected. Cannot send typing status.');
            // Typing is less critical, maybe allow suppress, or show warning once?
            // For now, let's just log or maybe no toast to avoid spamming user
        }
    };

    // Render chat boxes từ phải sang trái (reverse order)
    // Tách riêng minimized và expanded để layout khác nhau
    const minimizedChatBoxes = openChatBoxes.filter(cb => cb.isMinimized);
    const expandedChatBoxes = openChatBoxes.filter(cb => !cb.isMinimized);
    
    // Tính toán offset cho expanded container khi có minimized chat boxes
    // Sử dụng transform thay vì right để có hiệu ứng mượt hơn
    const hasMinimized = minimizedChatBoxes.length > 0;
    const translateX = hasMinimized ? -90 : 0; // Dịch sang trái 64px nếu có minimized

    return (
        <div ref={chatBoxContainerRef} style={{ display: 'contents' }}>
            {/* Minimized chat boxes - xếp dọc ở góc phải */}
            {minimizedChatBoxes.length > 0 && (
                <div className={cx('minimized-container')}>
                    {minimizedChatBoxes.map((chatBox) => {
                        const conv = conversations.find(c => c.id === chatBox.conversationId);
                        const unread = conv?.unreadCount || 0;
                        return (
                            <ChatBox
                                key={chatBox.conversationId}
                                conversationKey={chatBox.conversationId}
                                conversation={chatBox.conversation}
                                isMinimized={chatBox.isMinimized}
                                hasUnread={unread > 0}
                                unreadCount={unread}
                                initialMessages={chatBox.initialMessages}
                                onSendMessage={handleSendMessage}
                                onSendTyping={handleSendTyping}
                                onRegisterReceiveMessage={registerReceiveMessage}
                                onRegisterTypingHandler={registerTypingHandler}
                            />
                        );
                    })}
                </div>
            )}

            {/* Expanded chat boxes - xếp ngang ở dưới cùng */}
            {expandedChatBoxes.length > 0 && (
                <div 
                    className={cx('expanded-container')}
                    style={{ transform: `translateX(${translateX}px)` }}
                >
                    {expandedChatBoxes.map((chatBox) => {
                        const conv = conversations.find(c => c.id === chatBox.conversationId);
                        const unread = conv?.unreadCount || 0;
                        return (
                            <ChatBox
                                key={chatBox.conversationId}
                                conversationKey={chatBox.conversationId}
                                conversation={chatBox.conversation}
                                isMinimized={chatBox.isMinimized}
                                hasUnread={unread > 0}
                                unreadCount={unread}
                                initialMessages={chatBox.initialMessages}
                                onSendMessage={handleSendMessage}
                                onSendTyping={handleSendTyping}
                                onRegisterReceiveMessage={registerReceiveMessage}
                                onRegisterTypingHandler={registerTypingHandler}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default ChatBoxContainer;
