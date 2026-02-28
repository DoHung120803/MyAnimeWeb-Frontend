const STORAGE_KEY = 'notification_actioned';

/**
 * Lấy map các notification đã xử lý từ localStorage
 * @returns {Object} - { [notificationId]: 'accepted' | 'declined' }
 */
export const getActionedMap = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
};

/**
 * Lưu trạng thái đã xử lý của một notification
 * @param {number|string} notificationId
 * @param {'accepted'|'declined'|null} action - null để xóa (rollback)
 */
export const saveActionedNotification = (notificationId, action) => {
    try {
        const map = getActionedMap();
        if (action === null) {
            delete map[notificationId];
        } else {
            map[notificationId] = action;
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch {
        // ignore storage errors
    }
};

/**
 * Merge friendRequestActioned vào danh sách notifications từ API
 * để giữ trạng thái đã xử lý khi fetch lại
 * @param {Array} notifications
 * @returns {Array}
 */
export const mergeActionedState = (notifications) => {
    const map = getActionedMap();
    if (Object.keys(map).length === 0) return notifications;
    return notifications.map(n =>
        map[n.id] ? { ...n, friendRequestActioned: map[n.id] } : n
    );
};
