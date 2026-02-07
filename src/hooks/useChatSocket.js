import { useEffect, useRef, useState, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { getToken, getCurrentUserId } from '~/utils/authUtils';
import { playNotificationSound, playBeepSound } from '~/utils/soundUtils';

/**
 * Custom hook để quản lý WebSocket connection cho chat realtime
 * Backend sử dụng SockJS + STOMP protocol
 * Backend tự động lấy userId từ JWT token gửi qua STOMP header
 * 
 * @param {function} onMessageReceived - Callback khi nhận được tin nhắn mới
 * @param {boolean} soundEnabled - Bật/tắt âm thanh thông báo (mặc định true)
 * @param {function} onTypingReceived - Callback khi nhận được typing status (optional)
 * @returns {object} - {isConnected, sendMessage, sendTyping, disconnect}
 */
const useChatSocket = (onMessageReceived, soundEnabled = true, onTypingReceived = null) => {
    const [isConnected, setIsConnected] = useState(false);
    const stompClientRef = useRef(null);
    const subscriptionRef = useRef(null);
    const typingSubscriptionRef = useRef(null);
    const onMessageReceivedRef = useRef(onMessageReceived);
    const onTypingReceivedRef = useRef(onTypingReceived);

    // Cập nhật ref khi callback thay đổi (tránh re-create connection)
    useEffect(() => {
        onMessageReceivedRef.current = onMessageReceived;
    }, [onMessageReceived]);

    useEffect(() => {
        onTypingReceivedRef.current = onTypingReceived;
    }, [onTypingReceived]);

    // WebSocket URL từ backend config
    const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:8080/chat';

    /**
     * Kết nối WebSocket và subscribe conversation channel
     */
    const connect = useCallback(() => {
        // Tránh tạo kết nối trùng lặp
        if (stompClientRef.current) {
            console.log('WebSocket already connected or connecting. Skipping.');
            return;
        }

        const token = getToken();
        if (!token) {
            console.warn('No token found. Cannot connect WebSocket.');
            return;
        }

        // Tạo STOMP client
        // webSocketFactory phải tạo SockJS MỚI mỗi lần gọi (cho reconnect)
        const stompClient = new Client({
            webSocketFactory: () => new SockJS(WS_URL),
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            debug: (str) => {
                if (process.env.NODE_ENV === 'development') {
                    console.log('[STOMP Debug]:', str);
                }
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        // Callback khi kết nối thành công
        stompClient.onConnect = (frame) => {
            console.log('WebSocket connected:', frame);
            setIsConnected(true);

            // Subscribe vào channel /conversation để nhận tin nhắn realtime
            subscriptionRef.current = stompClient.subscribe('/conversation', (message) => {
                try {
                    const response = JSON.parse(message.body);
                    console.log('Received WebSocket response:', response);
                    
                    const receivedMessage = response.data;

                    if (receivedMessage && onMessageReceivedRef.current) {
                        // Phát âm thanh thông báo khi nhận tin nhắn mới (nếu được bật)
                        // Chỉ phát khi tin nhắn KHÔNG phải của chính mình gửi
                        const currentUserId = getCurrentUserId();
                        if (soundEnabled && String(receivedMessage.senderId) !== String(currentUserId)) {
                            playNotificationSound(0.6);
                        }
                        
                        onMessageReceivedRef.current(receivedMessage);
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            });

            // Subscribe vào channel /conversation/typing để nhận typing status
            typingSubscriptionRef.current = stompClient.subscribe('/conversation/typing', (message) => {
                try {
                    const response = JSON.parse(message.body);
                    console.log('Received typing event:', response);
                    
                    const typingEvent = response.data;

                    if (typingEvent && onTypingReceivedRef.current) {
                        // Không xử lý typing event của chính mình
                        const currentUserId = getCurrentUserId();
                        if (String(typingEvent.userId) !== String(currentUserId)) {
                            onTypingReceivedRef.current(typingEvent);
                        }
                    }
                } catch (error) {
                    console.error('Error parsing typing event:', error);
                }
            });
        };

        // Callback khi bị disconnect
        stompClient.onDisconnect = () => {
            console.log('WebSocket disconnected');
            setIsConnected(false);
        };

        // Callback khi có lỗi WebSocket (transport level)
        stompClient.onWebSocketError = (event) => {
            console.error('WebSocket connection error:', event);
        };

        // Callback khi có lỗi STOMP protocol
        stompClient.onStompError = (frame) => {
            console.error('STOMP error:', frame.headers['message']);
            console.error('Details:', frame.body);
            setIsConnected(false);
        };

        // Kích hoạt kết nối
        stompClient.activate();
        stompClientRef.current = stompClient;
    }, [WS_URL, soundEnabled]);

    /**
     * Gửi tin nhắn qua WebSocket
     * @param {object} messageData - { conversationId, content, messageType? }
     */
    const sendMessage = useCallback((messageData) => {
        const client = stompClientRef.current;
        if (client && client.connected) {
            try {
                client.publish({
                    destination: '/app/send-message',
                    body: JSON.stringify({
                        conversationId: messageData.conversationId,
                        content: messageData.content,
                        messageType: messageData.messageType || 0,
                    }),
                });
                console.log('Message sent via WebSocket:', messageData);
                return true;
            } catch (error) {
                console.error('Error sending message:', error);
                return false;
            }
        } else {
            console.warn('WebSocket is not connected. Cannot send message.');
            return false;
        }
    }, []);

    /**
     * Gửi trạng thái typing qua WebSocket
     * @param {object} typingData - { conversationId, isTyping }
     */
    const sendTyping = useCallback((typingData) => {
        const client = stompClientRef.current;
        if (client && client.connected) {
            try {
                client.publish({
                    destination: '/app/typing',
                    body: JSON.stringify({
                        conversationId: typingData.conversationId,
                        isTyping: typingData.isTyping,
                    }),
                });
                console.log('Typing status sent via WebSocket:', typingData);
                return true;
            } catch (error) {
                console.error('Error sending typing status:', error);
                return false;
            }
        } else {
            console.warn('WebSocket is not connected. Cannot send typing status.');
            return false;
        }
    }, []);

    /**
     * Ngắt kết nối WebSocket
     */
    const disconnect = useCallback(() => {
        if (stompClientRef.current) {
            stompClientRef.current.deactivate();
            stompClientRef.current = null;
            subscriptionRef.current = null;
            typingSubscriptionRef.current = null;
            setIsConnected(false);
        }
    }, []);

    // Auto connect khi component mount
    useEffect(() => {
        const token = getToken();
        if (token) {
            connect();
        }

        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    return {
        isConnected,
        sendMessage,
        sendTyping,
        disconnect,
    };
};

export default useChatSocket;
