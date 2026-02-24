import { useEffect, useRef, useState, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { getToken, getCurrentUserId } from '~/utils/authUtils';
import { playNotificationSound } from '~/utils/soundUtils';
import notificationService from '~/services/notificationService';

/**
 * Custom hook để quản lý WebSocket cho notification realtime
 * Subscribe vào /notification/user/{userId} để nhận thông báo mới
 * 
 * @param {function} onNotificationReceived - Callback khi nhận được notification mới
 * @param {boolean} soundEnabled - Bật/tắt âm thanh thông báo (mặc định true)
 * @returns {object} - { isConnected, unreadCount, notifications, loadNotifications, markAsRead, markAllAsRead }
 */
const useNotificationSocket = (onNotificationReceived = null, soundEnabled = true) => {
    const [isConnected, setIsConnected] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const stompClientRef = useRef(null);
    const subscriptionRef = useRef(null);
    const onNotificationReceivedRef = useRef(onNotificationReceived);
    const pageRef = useRef(0);

    useEffect(() => {
        onNotificationReceivedRef.current = onNotificationReceived;
    }, [onNotificationReceived]);

    const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:8080/ws';

    /**
     * Lấy số thông báo chưa đọc từ API
     */
    const fetchUnreadCount = useCallback(async () => {
        try {
            const response = await notificationService.getUnreadCount();
            if (response && response.data !== undefined) {
                setUnreadCount(response.data);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    }, []);

    /**
     * Lấy danh sách thông báo từ API
     * @param {boolean} reset - Reset về trang đầu hay load thêm
     */
    const loadNotifications = useCallback(async (reset = false) => {
        try {
            const page = reset ? 0 : pageRef.current;
            const response = await notificationService.getNotifications(page, 15);

            if (response && response.data) {
                const pageData = response.data;
                const content = pageData.content || [];

                if (reset) {
                    setNotifications(content);
                    pageRef.current = 1;
                } else {
                    setNotifications(prev => [...prev, ...content]);
                    pageRef.current = page + 1;
                }

                setHasMore(!pageData.last);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    }, []);

    /**
     * Đánh dấu một thông báo là đã đọc
     */
    const markAsRead = useCallback(async (notificationId) => {
        // Optimistic update
        setNotifications(prev =>
            prev.map(n =>
                n.id === notificationId ? { ...n, isRead: true } : n
            )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));

        try {
            await notificationService.markAsRead(notificationId);
        } catch (error) {
            console.error('Error marking as read:', error);
            // Rollback on error
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId ? { ...n, isRead: false } : n
                )
            );
            setUnreadCount(prev => prev + 1);
        }
    }, []);

    /**
     * Đánh dấu tất cả thông báo là đã đọc
     */
    const markAllAsRead = useCallback(async () => {
        const previousNotifications = notifications;
        const previousCount = unreadCount;

        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);

        try {
            await notificationService.markAllAsRead();
        } catch (error) {
            console.error('Error marking all as read:', error);
            // Rollback on error
            setNotifications(previousNotifications);
            setUnreadCount(previousCount);
        }
    }, [notifications, unreadCount]);

    /**
     * Kết nối WebSocket và subscribe notification channel
     */
    const connect = useCallback(() => {
        if (stompClientRef.current) {
            return;
        }

        const token = getToken();
        const userId = getCurrentUserId();
        if (!token || !userId) {
            return;
        }

        const stompClient = new Client({
            webSocketFactory: () => new SockJS(WS_URL),
            connectHeaders: {
                Authorization: `Bearer ${token}`,
            },
            debug: (str) => {
                if (process.env.NODE_ENV === 'development') {
                    // console.log('[STOMP Notification Debug]:', str);
                }
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        stompClient.onConnect = () => {
            setIsConnected(true);

            // Subscribe vào channel notification cá nhân
            subscriptionRef.current = stompClient.subscribe(
                `/notification/user/${userId}`,
                (message) => {
                    try {
                        const response = JSON.parse(message.body);
                        const notification = response.data;

                        if (notification) {
                            // Thêm notification mới vào đầu danh sách (tránh trùng)
                            setNotifications(prev => {
                                const exists = prev.some(n => n.id === notification.id);
                                if (exists) return prev;
                                return [notification, ...prev];
                            });

                            // Tăng unread count
                            setUnreadCount(prev => prev + 1);

                            // Phát âm thanh
                            if (soundEnabled) {
                                playNotificationSound(0.5);
                            }

                            // Gọi callback
                            if (onNotificationReceivedRef.current) {
                                onNotificationReceivedRef.current(notification);
                            }
                        }
                    } catch (error) {
                        console.error('Error parsing notification:', error);
                    }
                }
            );
        };

        stompClient.onDisconnect = () => {
            setIsConnected(false);
        };

        stompClient.onWebSocketError = (event) => {
            console.error('Notification WebSocket error:', event);
        };

        stompClient.onStompError = (frame) => {
            console.error('Notification STOMP error:', frame.headers['message']);
            setIsConnected(false);
        };

        stompClient.activate();
        stompClientRef.current = stompClient;
    }, [WS_URL, soundEnabled]);

    const disconnect = useCallback(() => {
        if (stompClientRef.current) {
            stompClientRef.current.deactivate();
            stompClientRef.current = null;
            subscriptionRef.current = null;
            setIsConnected(false);
        }
    }, []);

    // Auto connect + fetch initial data
    useEffect(() => {
        const token = getToken();
        if (token) {
            connect();
            fetchUnreadCount();
        }

        return () => {
            disconnect();
        };
    }, [connect, disconnect, fetchUnreadCount]);

    return {
        isConnected,
        unreadCount,
        notifications,
        hasMore,
        loadNotifications,
        markAsRead,
        markAllAsRead,
        fetchUnreadCount,
    };
};

export default useNotificationSocket;
