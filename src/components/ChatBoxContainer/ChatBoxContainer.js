import React, { useRef, useEffect, useCallback } from 'react';
import classNames from 'classnames/bind';
import styles from './ChatBoxContainer.module.scss';
import ChatBox from '~/components/ChatBox';
import { useChatContext } from '~/contexts/ChatContext';
import useChatSocket from '~/hooks/useChatSocket';

const cx = classNames.bind(styles);

/**
 * Container quản lý layout của nhiều chat boxes
 * Xếp ngang từ phải sang trái (bottom-right) giống Facebook Messenger
 */
const ChatBoxContainer = () => {
    const { openChatBoxes, isSoundEnabled, updateConversationLastMessage } = useChatContext();
    const messageRefsMap = useRef(new Map());
    const typingRefsMap = useRef(new Map());

    /**
     * Callback khi nhận tin nhắn mới từ WebSocket
     */
    const handleMessageReceived = (message) => {
        console.log('New message received in ChatBoxContainer:', message);
        
        // Cập nhật lastMessage trong conversations list
        updateConversationLastMessage(message.conversationId, message);
        
        // Tìm chat box tương ứng và thêm tin nhắn vào
        const conversationId = message.conversationId;
        console.log('Available refs:', Array.from(messageRefsMap.current.keys()));
        const addMessageFunc = messageRefsMap.current.get(conversationId);
        
        if (addMessageFunc) {
            console.log('Found Handler for conversation:', conversationId);
            addMessageFunc(message);
        } else {
            console.log('Chat box not open or handler not registered for conversation:', conversationId);
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
     * Handle gửi tin nhắn
     */
    const handleSendMessage = (messageData) => {
        if (isConnected) {
            sendMessage(messageData);
        } else {
            console.error('WebSocket not connected. Cannot send message.');
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
        <>
            {/* Minimized chat boxes - xếp dọc ở góc phải */}
            {minimizedChatBoxes.length > 0 && (
                <div className={cx('minimized-container')}>
                    {minimizedChatBoxes.map((chatBox) => {
                        return (
                            <ChatBox
                                key={chatBox.conversationId}
                                conversation={chatBox.conversation}
                                isMinimized={chatBox.isMinimized}
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
                        return (
                            <ChatBox
                                key={chatBox.conversationId}
                                conversation={chatBox.conversation}
                                isMinimized={chatBox.isMinimized}
                                onSendMessage={handleSendMessage}
                                onSendTyping={handleSendTyping}
                                onRegisterReceiveMessage={registerReceiveMessage}
                                onRegisterTypingHandler={registerTypingHandler}
                            />
                        );
                    })}
                </div>
            )}
        </>
    );
}

export default ChatBoxContainer;
