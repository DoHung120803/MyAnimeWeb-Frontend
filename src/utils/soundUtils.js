/**
 * Utility functions để phát âm thanh thông báo
 */

let audioContext = null;
let notificationSound = null;

/**
 * Khởi tạo audio context (cần user interaction trước)
 */
const initAudioContext = () => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
};

/**
 * Preload notification sound
 */
export const preloadNotificationSound = () => {
    if (!notificationSound) {
        notificationSound = new Audio('/sounds/notification.mp3');
        notificationSound.load();
    }
};

/**
 * Phát âm thanh thông báo khi nhận tin nhắn mới
 * Tự động fallback sang beep sound nếu không tìm thấy file
 * @param {number} volume - Âm lượng (0.0 - 1.0), mặc định 0.5
 */
export const playNotificationSound = (volume = 0.5) => {
    try {
        // Khởi tạo audio context nếu chưa có
        initAudioContext();

        // Tạo audio mới mỗi lần phát (để có thể phát nhiều lần liên tiếp)
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = Math.max(0, Math.min(1, volume)); // Đảm bảo volume trong khoảng 0-1
        
        // Play và xử lý promise
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log('Notification sound played');
                })
                .catch((error) => {
                    console.warn('Failed to play notification sound, using beep fallback:', error);
                    // Fallback sang beep sound nếu không tìm thấy file
                    playBeepSound(800, 150);
                });
        }
    } catch (error) {
        console.error('Error playing notification sound:', error);
        // Fallback sang beep sound nếu có lỗi
        playBeepSound(800, 150);
    }
};

/**
 * Tạo âm thanh thông báo đơn giản bằng Web Audio API
 * (fallback nếu không có file âm thanh)
 */
export const playBeepSound = (frequency = 800, duration = 200) => {
    try {
        const context = initAudioContext();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration / 1000);

        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + duration / 1000);
    } catch (error) {
        console.error('Error playing beep sound:', error);
    }
};

const soundUtils = {
    preloadNotificationSound,
    playNotificationSound,
    playBeepSound,
};

export default soundUtils;
