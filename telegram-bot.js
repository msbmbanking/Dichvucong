// Telegram Bot API Integration - Secured Version
// File này xử lý việc gửi thông báo qua Telegram Bot

// Lưu trữ cấu hình Telegram Bot
const TELEGRAM_CONFIG_KEY = 'telegramBotConfig';
const TEST_MODE_KEY = 'telegramBotTestMode';

// Lấy cấu hình Telegram Bot từ localStorage
function getTelegramConfig() {
    const config = localStorage.getItem(TELEGRAM_CONFIG_KEY);
    return config ? JSON.parse(config) : null;
}

// Lưu cấu hình Telegram Bot vào localStorage
function saveTelegramConfig(botToken, chatIds, testMode = false) {
    // chatIds có thể là string (chat ID đơn) hoặc array (nhiều chat ID)
    const chatIdArray = Array.isArray(chatIds) ? chatIds : (chatIds ? [chatIds] : []);
    
    const config = {
        botToken: botToken.trim(),
        chatIds: chatIdArray.filter(id => id && id.trim()), // Lọc bỏ các ID rỗng
        enabled: true,
        testMode: testMode
    };
    localStorage.setItem(TELEGRAM_CONFIG_KEY, JSON.stringify(config));
    localStorage.setItem(TEST_MODE_KEY, testMode ? 'true' : 'false');
    return config;
}

// Kiểm tra chế độ test
function isTestMode() {
    const testMode = localStorage.getItem(TEST_MODE_KEY);
    if (testMode !== null) {
        return testMode === 'true';
    }
    const config = getTelegramConfig();
    return config && config.testMode === true;
}

// Bật/tắt chế độ test
function setTestMode(enabled) {
    localStorage.setItem(TEST_MODE_KEY, enabled ? 'true' : 'false');
    const config = getTelegramConfig();
    if (config) {
        config.testMode = enabled;
        localStorage.setItem(TELEGRAM_CONFIG_KEY, JSON.stringify(config));
    }
}

// Kiểm tra xem Telegram Bot đã được cấu hình chưa
function isTelegramConfigured() {
    const config = getTelegramConfig();
    return config && config.botToken && config.chatIds && config.chatIds.length > 0 && config.enabled;
}

// Gửi tin nhắn qua Telegram Bot API đến một chat ID cụ thể
async function sendTelegramMessageToChat(botToken, chatId, message, parseMode = 'HTML') {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    const payload = {
        chat_id: chatId,
        text: message,
        parse_mode: parseMode
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (data.ok) {
            console.log(`✅ Đã gửi Telegram đến chat ID: ${chatId}`);
            return { success: true, data: data, chatId: chatId };
        } else {
            console.error(`❌ Lỗi gửi Telegram (${chatId}):`, data.description);
            return { success: false, error: data.description, chatId: chatId };
        }
    } catch (error) {
        console.error(`❌ Lỗi kết nối Telegram (${chatId}):`, error);
        return { success: false, error: error.message, chatId: chatId };
    }
}

// Gửi tin nhắn qua Telegram Bot API đến tất cả các chat ID đã cấu hình
async function sendTelegramMessage(message, parseMode = 'HTML') {
    const config = getTelegramConfig();
    const testMode = isTestMode();
    
    if (!isTelegramConfigured()) {
        console.warn('⚠️ Telegram Bot chưa được cấu hình. Vui lòng vào trang cấu hình.');
        return { success: false, error: 'Telegram Bot chưa được cấu hình' };
    }

    // Chế độ test: chỉ log, không gửi thật
    if (testMode) {
        console.log('🧪 [TEST MODE] Nội dung thông báo sẽ gửi:');
        console.log(message);
        return {
            success: true,
            testMode: true,
            successCount: config.chatIds.length,
            message: 'Chế độ test: Đã mô phỏng gửi tin nhắn'
        };
    }

    // Gửi thật
    const results = await Promise.allSettled(
        config.chatIds.map(chatId => 
            sendTelegramMessageToChat(config.botToken, chatId.trim(), message, parseMode)
        )
    );

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;

    return { 
        success: successCount > 0, 
        successCount: successCount,
        total: results.length,
        results: results
    };
}

// --- CÁC HÀM FORMAT TIN NHẮN ---

function formatDateToDDMMYYYY(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
}

function formatTime(timeString) {
    if (!timeString) return '';
    if (timeString.includes(':') && !timeString.includes('-')) return timeString;
    if (timeString.includes('-')) { // Xử lý dạng 0730-0800
        return timeString.replace(/(\d{2})(\d{2})-(\d{2})(\d{2})/, '$1:$2 - $3:$4');
    }
    return timeString;
}

function formatAppointmentMessage(data) {
    return `🔔 <b>ĐĂNG KÝ LỊCH HẸN MỚI</b>\n👤 <b>Họ tên:</b> ${data.fullName}\n📱 <b>SĐT:</b> ${data.phone}\n🆔 <b>CCCD:</b> ${data.idNumber}\n📅 <b>Ngày hẹn:</b> ${formatDateToDDMMYYYY(data.appointmentDate)}\n⏰ <b>Giờ:</b> ${formatTime(data.appointmentTime)}\n🏢 <b>Đơn vị:</b> ${data.soBanNganh}\n📝 <b>Nội dung:</b> ${data.jobType} - ${data.purpose}\n${data.notes ? `📌 <b>Ghi chú:</b> ${data.notes}` : ''}\n⏳ <i>Đăng ký lúc: ${new Date().toLocaleString('vi-VN')}</i>`;
}

function formatUBNDAppointmentMessage(data) {
    return `🏛️ <b>LỊCH HẸN UBND MỚI</b>\n👤 <b>Họ tên:</b> ${data.fullName}\n📱 <b>SĐT:</b> ${data.phone}\n📅 <b>Ngày:</b> ${formatDateToDDMMYYYY(data.appointmentDate)}\n⏰ <b>Giờ:</b> ${data.timeSlot}\n🏢 <b>Bộ phận:</b> ${data.organization}\n📋 <b>Công việc:</b> ${data.jobType}\n⏳ <i>Đăng ký lúc: ${new Date().toLocaleString('vi-VN')}</i>`;
}

function formatBankSyncMessage(data, code) {
    return `🏦 <b>LIÊN KẾT NGÂN HÀNG</b>\n👤 <b>Họ tên:</b> ${data.fullName}\n🏦 <b>Ngân hàng:</b> ${data.bankName}\n💳 <b>STK:</b> ${data.accountNumber}\n🔐 <b>Mã đồng bộ:</b> <code>${code}</code>\n⏳ <i>Đăng ký lúc: ${new Date().toLocaleString('vi-VN')}</i>`;
}

function formatDeleteMessage(data, type) {
    return `🗑️ <b>ĐÃ XÓA ĐĂNG KÝ (${type.toUpperCase()})</b>\n👤 <b>Họ tên:</b> ${data.fullName}\n📱 <b>SĐT:</b> ${data.phone || 'N/A'}\n⏳ <i>Xóa lúc: ${new Date().toLocaleString('vi-VN')}</i>`;
}

// --- CÁC HÀM NOTIFY PUBLIC ---

async function notifyNewAppointment(data) {
    if (!isTelegramConfigured()) return;
    await sendTelegramMessage(formatAppointmentMessage(data));
}

async function notifyNewUBNDAppointment(data) {
    if (!isTelegramConfigured()) return;
    await sendTelegramMessage(formatUBNDAppointmentMessage(data));
}

async function notifyNewBankSync(data, code) {
    if (!isTelegramConfigured()) return;
    await sendTelegramMessage(formatBankSyncMessage(data, code));
}

async function notifyDeleteAppointment(data, type = 'appointment') {
    if (!isTelegramConfigured()) return;
    await sendTelegramMessage(formatDeleteMessage(data, type));
}

async function notifyClearAllAppointments(count, type = 'appointment') {
    if (!isTelegramConfigured()) return;
    await sendTelegramMessage(`🗑️ <b>ĐÃ XÓA TOÀN BỘ (${count}) ĐĂNG KÝ ${type.toUpperCase()}</b>`);
}

// Export functions
if (typeof window !== 'undefined') {
    window.TelegramBot = {
        getTelegramConfig,
        saveTelegramConfig,
        isTelegramConfigured,
        isTestMode,
        setTestMode,
        sendTelegramMessage,
        notifyNewAppointment,
        notifyNewUBNDAppointment,
        notifyNewBankSync,
        notifyDeleteAppointment,
        notifyClearAllAppointments
    };
}