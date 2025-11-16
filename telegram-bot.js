// Telegram Bot API Integration
// File này xử lý việc gửi thông báo qua Telegram Bot

// Lưu trữ cấu hình Telegram Bot
const TELEGRAM_CONFIG_KEY = 'telegramBotConfig';
const TEST_MODE_KEY = 'telegramBotTestMode';

// Cấu hình mặc định (có thể thay đổi)
const DEFAULT_BOT_TOKEN = '7699871995:AAErjz_8XGMLWHO05xVz3UqLUsGHny9_e2M';
const DEFAULT_CHAT_ID = '-1003488821832';

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
        botToken: botToken,
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
    // Kiểm tra trong config nếu không có trong localStorage riêng
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
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (data.ok) {
            console.log(`Đã gửi thông báo qua Telegram thành công đến chat ID: ${chatId}`);
            return { success: true, data: data, chatId: chatId };
        } else {
            console.error(`Lỗi khi gửi thông báo qua Telegram đến chat ID ${chatId}:`, data.description);
            return { success: false, error: data.description, chatId: chatId };
        }
    } catch (error) {
        console.error(`Lỗi khi gửi thông báo qua Telegram đến chat ID ${chatId}:`, error);
        return { success: false, error: error.message, chatId: chatId };
    }
}

// Gửi tin nhắn qua Telegram Bot API đến tất cả các chat ID đã cấu hình
async function sendTelegramMessage(message, parseMode = 'HTML') {
    const config = getTelegramConfig();
    const testMode = isTestMode();
    
    if (!config || !config.botToken || !config.chatIds || config.chatIds.length === 0 || !config.enabled) {
        console.log('Telegram Bot chưa được cấu hình');
        return { success: false, error: 'Telegram Bot chưa được cấu hình' };
    }

    // Chế độ test: chỉ log, không gửi thật
    if (testMode) {
        console.log('🧪 [TEST MODE] Không gửi thông báo thật');
        console.log('📋 [TEST MODE] Nội dung thông báo:');
        console.log(message);
        console.log(`📋 [TEST MODE] Sẽ gửi đến ${config.chatIds.length} Chat ID:`, config.chatIds);
        
        // Giả lập kết quả thành công
        return {
            success: true,
            testMode: true,
            successCount: config.chatIds.length,
            failCount: 0,
            total: config.chatIds.length,
            message: 'Chế độ test: Thông báo đã được mô phỏng, không gửi thật',
            results: config.chatIds.map(chatId => ({
                success: true,
                chatId: chatId,
                testMode: true
            }))
        };
    }

    // Gửi thật đến tất cả các chat ID
    const results = await Promise.allSettled(
        config.chatIds.map(chatId => 
            sendTelegramMessageToChat(config.botToken, chatId.trim(), message, parseMode)
        )
    );

    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failCount = results.length - successCount;

    if (successCount > 0) {
        console.log(`Đã gửi thông báo đến ${successCount}/${results.length} chat ID thành công`);
        return { 
            success: true, 
            successCount: successCount,
            failCount: failCount,
            total: results.length,
            testMode: false,
            results: results.map(r => r.status === 'fulfilled' ? r.value : r.reason)
        };
    } else {
        console.error('Không thể gửi thông báo đến bất kỳ chat ID nào');
        return { 
            success: false, 
            error: 'Không thể gửi thông báo đến bất kỳ chat ID nào',
            testMode: false,
            results: results.map(r => r.status === 'fulfilled' ? r.value : r.reason)
        };
    }
}

// Format thông báo đăng ký lịch hẹn mới
function formatAppointmentMessage(appointmentData) {
    const date = formatDateToDDMMYYYY(appointmentData.appointmentDate);
    const time = formatTime(appointmentData.appointmentTime);
    
    return `🔔 <b>ĐĂNG KÝ LỊCH HẸN MỚI</b>

👤 <b>Họ và Tên:</b> ${appointmentData.fullName}
📱 <b>Số Điện Thoại:</b> ${appointmentData.phone}
🆔 <b>CCCD/CMND:</b> ${appointmentData.idNumber}
📍 <b>Địa Chỉ:</b> ${appointmentData.address || 'Không có'}

🏢 <b>Cơ Quan:</b> ${appointmentData.soBanNganh}
👨‍💼 <b>Cán Bộ Tiếp Nhận:</b> ${appointmentData.officer || 'Chưa xác định'}

📅 <b>Ngày Hẹn:</b> ${date}
⏰ <b>Khung Giờ:</b> ${time}

📋 <b>Loại Công Việc:</b> ${appointmentData.jobType}
📝 <b>Lý Do Hẹn:</b> ${appointmentData.purpose}
👥 <b>Số Người Tham Gia:</b> ${appointmentData.participants || '1'}

📍 <b>Tỉnh/Thành Phố:</b> ${appointmentData.province}
🏘️ <b>Phường/Xã:</b> ${appointmentData.ward}

✅ <b>VNeID Mức 2:</b> ${appointmentData.vnidLevel2}
🏦 <b>Đồng Bộ Ngân Hàng:</b> ${appointmentData.bankSync}

${appointmentData.notes ? `📌 <b>Ghi Chú:</b> ${appointmentData.notes}` : ''}

⏳ <b>Thời Gian Đăng Ký:</b> ${new Date().toLocaleString('vi-VN')}`;
}

// Format thông báo đăng ký UBND
function formatUBNDAppointmentMessage(appointmentData) {
    const date = formatDateToDDMMYYYY(appointmentData.appointmentDate);
    
    return `🔔 <b>ĐĂNG KÝ LỊCH HẸN UBND MỚI</b>

👤 <b>Họ và Tên:</b> ${appointmentData.fullName}
📱 <b>Số Điện Thoại:</b> ${appointmentData.phone}
📧 <b>Email:</b> ${appointmentData.email || 'Không có'}
🆔 <b>CCCD/CMND:</b> ${appointmentData.idNumber}
📍 <b>Địa Chỉ:</b> ${appointmentData.address || 'Không có'}

🏢 <b>Cơ Quan/Đơn Vị:</b> ${appointmentData.organization}
👨‍💼 <b>Cán Bộ Tiếp Nhận:</b> ${appointmentData.officer || 'Chưa xác định'}

📅 <b>Ngày Hẹn:</b> ${date}
⏰ <b>Khung Giờ:</b> ${appointmentData.timeSlot}

📋 <b>Loại Công Việc:</b> ${appointmentData.jobType}
📝 <b>Mô Tả Công Việc:</b> ${appointmentData.jobDescription}
👥 <b>Số Người Tham Gia:</b> ${appointmentData.participants || '1'}

✅ <b>VNeID Mức 2:</b> ${appointmentData.vneidLevel2}
🏦 <b>Liên Kết Ngân Hàng:</b> ${appointmentData.bankLinked}

⏳ <b>Thời Gian Đăng Ký:</b> ${new Date().toLocaleString('vi-VN')}`;
}

// Format thông báo đăng ký đồng bộ ngân hàng
function formatBankSyncMessage(syncData, syncCode) {
    return `🔔 <b>ĐĂNG KÝ ĐỒNG BỘ NGÂN HÀNG MỚI</b>

👤 <b>Họ và Tên:</b> ${syncData.fullName}
📱 <b>Số Điện Thoại:</b> ${syncData.phone}
📧 <b>Email:</b> ${syncData.email || 'Không có'}
🆔 <b>CCCD/CMND:</b> ${syncData.idNumber}

🏦 <b>Ngân Hàng:</b> ${syncData.bankName}
🏢 <b>Chi Nhánh:</b> ${syncData.bankBranch}
💳 <b>Số Tài Khoản:</b> ${syncData.accountNumber}
👤 <b>Chủ Tài Khoản:</b> ${syncData.accountHolderName}

🔐 <b>Mã Đồng Bộ:</b> <code>${syncCode}</code>

${syncData.notes ? `📌 <b>Ghi Chú:</b> ${syncData.notes}` : ''}

⏳ <b>Thời Gian Đăng Ký:</b> ${new Date().toLocaleString('vi-VN')}`;
}

// Format thông báo xóa đăng ký
function formatDeleteMessage(appointmentData, type = 'appointment') {
    const typeName = type === 'ubnd' ? 'UBND' : type === 'bank' ? 'Đồng Bộ Ngân Hàng' : 'Lịch Hẹn';
    
    return `🗑️ <b>ĐÃ XÓA ĐĂNG KÝ ${typeName.toUpperCase()}</b>

👤 <b>Họ và Tên:</b> ${appointmentData.fullName}
📱 <b>Số Điện Thoại:</b> ${appointmentData.phone || appointmentData.syncPhone || 'N/A'}

⏳ <b>Thời Gian Xóa:</b> ${new Date().toLocaleString('vi-VN')}`;
}

// Gửi thông báo khi có đăng ký lịch hẹn mới
async function notifyNewAppointment(appointmentData) {
    if (!isTelegramConfigured()) return;
    
    const message = formatAppointmentMessage(appointmentData);
    await sendTelegramMessage(message);
}

// Gửi thông báo khi có đăng ký UBND mới
async function notifyNewUBNDAppointment(appointmentData) {
    if (!isTelegramConfigured()) return;
    
    const message = formatUBNDAppointmentMessage(appointmentData);
    await sendTelegramMessage(message);
}

// Gửi thông báo khi có đăng ký đồng bộ ngân hàng mới
async function notifyNewBankSync(syncData, syncCode) {
    if (!isTelegramConfigured()) return;
    
    const message = formatBankSyncMessage(syncData, syncCode);
    await sendTelegramMessage(message);
}

// Gửi thông báo khi xóa đăng ký
async function notifyDeleteAppointment(appointmentData, type = 'appointment') {
    if (!isTelegramConfigured()) return;
    
    const message = formatDeleteMessage(appointmentData, type);
    await sendTelegramMessage(message);
}

// Gửi thông báo khi xóa tất cả đăng ký
async function notifyClearAllAppointments(count, type = 'appointment') {
    if (!isTelegramConfigured()) return;
    
    const typeName = type === 'ubnd' ? 'UBND' : type === 'bank' ? 'Đồng Bộ Ngân Hàng' : 'Lịch Hẹn';
    
    const message = `🗑️ <b>ĐÃ XÓA TẤT CẢ ĐĂNG KÝ ${typeName.toUpperCase()}</b>

📊 <b>Số Lượng Đã Xóa:</b> ${count} đăng ký

⏳ <b>Thời Gian Xóa:</b> ${new Date().toLocaleString('vi-VN')}`;
    
    await sendTelegramMessage(message);
}

// Helper function để format date (nếu chưa có trong file khác)
function formatDateToDDMMYYYY(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Helper function để format time (nếu chưa có trong file khác)
function formatTime(timeString) {
    if (!timeString) return '';
    // Nếu là format từ select dropdown (ví dụ: "0730-0800")
    if (timeString.includes('-')) {
        const [start, end] = timeString.split('-');
        const startTime = formatTimeSlot(start);
        const endTime = formatTimeSlot(end);
        return `${startTime} - ${endTime}`;
    }
    return timeString;
}

function formatTimeSlot(timeStr) {
    if (timeStr.length === 4) {
        return `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}`;
    }
    return timeStr;
}

// Thêm chat ID mới vào cấu hình
function addChatId(chatId) {
    const config = getTelegramConfig();
    if (!config) {
        return false;
    }
    
    if (!config.chatIds) {
        config.chatIds = [];
    }
    
    const trimmedId = chatId.trim();
    if (trimmedId && !config.chatIds.includes(trimmedId)) {
        config.chatIds.push(trimmedId);
        localStorage.setItem(TELEGRAM_CONFIG_KEY, JSON.stringify(config));
        return true;
    }
    return false;
}

// Xóa chat ID khỏi cấu hình
function removeChatId(chatId) {
    const config = getTelegramConfig();
    if (!config || !config.chatIds) {
        return false;
    }
    
    config.chatIds = config.chatIds.filter(id => id !== chatId);
    localStorage.setItem(TELEGRAM_CONFIG_KEY, JSON.stringify(config));
    return true;
}

// Test toàn bộ API Telegram Bot
async function testAllAPI() {
    console.log('🧪 [TEST API] Bắt đầu test toàn bộ API Telegram Bot...');
    console.log('='.repeat(60));
    
    const testResults = {
        config: { passed: 0, failed: 0, tests: [] },
        messaging: { passed: 0, failed: 0, tests: [] },
        chatIdManagement: { passed: 0, failed: 0, tests: [] },
        notifications: { passed: 0, failed: 0, tests: [] },
        formatting: { passed: 0, failed: 0, tests: [] }
    };

    // 1. Test các hàm cấu hình
    console.log('\n📋 [TEST] 1. Test các hàm cấu hình...');
    try {
        // Test getTelegramConfig
        const config = getTelegramConfig();
        if (config !== null || typeof config === 'object') {
            testResults.config.passed++;
            testResults.config.tests.push({ name: 'getTelegramConfig', status: '✅' });
            console.log('  ✅ getTelegramConfig: OK');
        } else {
            testResults.config.failed++;
            testResults.config.tests.push({ name: 'getTelegramConfig', status: '❌' });
            console.log('  ❌ getTelegramConfig: FAILED');
        }

        // Test isTelegramConfigured
        const isConfigured = isTelegramConfigured();
        testResults.config.passed++;
        testResults.config.tests.push({ name: 'isTelegramConfigured', status: '✅', result: isConfigured });
        console.log(`  ✅ isTelegramConfigured: ${isConfigured ? 'Đã cấu hình' : 'Chưa cấu hình'}`);

        // Test isTestMode
        const testMode = isTestMode();
        testResults.config.passed++;
        testResults.config.tests.push({ name: 'isTestMode', status: '✅', result: testMode });
        console.log(`  ✅ isTestMode: ${testMode ? 'BẬT' : 'TẮT'}`);

        // Test setTestMode
        const originalTestMode = testMode;
        setTestMode(true);
        if (isTestMode() === true) {
            setTestMode(false);
            if (isTestMode() === false) {
                setTestMode(originalTestMode);
                testResults.config.passed++;
                testResults.config.tests.push({ name: 'setTestMode', status: '✅' });
                console.log('  ✅ setTestMode: OK');
            } else {
                testResults.config.failed++;
                testResults.config.tests.push({ name: 'setTestMode', status: '❌' });
                console.log('  ❌ setTestMode: FAILED (không thể tắt)');
            }
        } else {
            testResults.config.failed++;
            testResults.config.tests.push({ name: 'setTestMode', status: '❌' });
            console.log('  ❌ setTestMode: FAILED (không thể bật)');
        }
    } catch (error) {
        console.error('  ❌ Lỗi khi test cấu hình:', error);
        testResults.config.failed++;
    }

    // 2. Test các hàm format message
    console.log('\n📝 [TEST] 2. Test các hàm format message...');
    try {
        const testAppointmentData = {
            fullName: 'Nguyễn Văn Test',
            phone: '0912345678',
            idNumber: '001234567890',
            address: '123 Đường Test',
            officer: 'Cán bộ Test',
            soBanNganh: 'UBND Phường/Xã',
            appointmentDate: new Date().toISOString().split('T')[0],
            appointmentTime: '0800-0830',
            jobType: 'Đăng ký khai sinh',
            purpose: 'Test mục đích',
            participants: '1',
            province: 'Hà Nội',
            ward: 'Phường Test',
            vnidLevel2: 'Có',
            bankSync: 'Có',
            notes: 'Ghi chú test'
        };

        const appointmentMsg = formatAppointmentMessage(testAppointmentData);
        if (appointmentMsg && appointmentMsg.includes('ĐĂNG KÝ LỊCH HẸN MỚI')) {
            testResults.formatting.passed++;
            testResults.formatting.tests.push({ name: 'formatAppointmentMessage', status: '✅' });
            console.log('  ✅ formatAppointmentMessage: OK');
        } else {
            testResults.formatting.failed++;
            testResults.formatting.tests.push({ name: 'formatAppointmentMessage', status: '❌' });
            console.log('  ❌ formatAppointmentMessage: FAILED');
        }

        const testUBNDData = {
            fullName: 'Trần Thị Test',
            phone: '0987654321',
            email: 'test@example.com',
            idNumber: '001234567891',
            address: '456 Đường Test',
            organization: 'UBND Phường/Xã',
            officer: 'Cán bộ Test',
            appointmentDate: new Date().toISOString().split('T')[0],
            timeSlot: '09:00 - 09:30',
            jobType: 'Đăng ký kết hôn',
            jobDescription: 'Test mô tả',
            participants: 2,
            vneidLevel2: 'Có',
            bankLinked: 'Có'
        };

        const ubndMsg = formatUBNDAppointmentMessage(testUBNDData);
        if (ubndMsg && ubndMsg.includes('ĐĂNG KÝ LỊCH HẸN UBND MỚI')) {
            testResults.formatting.passed++;
            testResults.formatting.tests.push({ name: 'formatUBNDAppointmentMessage', status: '✅' });
            console.log('  ✅ formatUBNDAppointmentMessage: OK');
        } else {
            testResults.formatting.failed++;
            testResults.formatting.tests.push({ name: 'formatUBNDAppointmentMessage', status: '❌' });
            console.log('  ❌ formatUBNDAppointmentMessage: FAILED');
        }

        const testBankData = {
            fullName: 'Lê Văn Test',
            phone: '0901234567',
            email: 'bank@example.com',
            idNumber: '001234567892',
            bankName: 'Ngân hàng Test',
            bankBranch: 'Chi nhánh Test',
            accountNumber: '1234567890',
            accountHolderName: 'Lê Văn Test'
        };

        const bankMsg = formatBankSyncMessage(testBankData, 'TEST1234');
        if (bankMsg && bankMsg.includes('ĐĂNG KÝ ĐỒNG BỘ NGÂN HÀNG MỚI')) {
            testResults.formatting.passed++;
            testResults.formatting.tests.push({ name: 'formatBankSyncMessage', status: '✅' });
            console.log('  ✅ formatBankSyncMessage: OK');
        } else {
            testResults.formatting.failed++;
            testResults.formatting.tests.push({ name: 'formatBankSyncMessage', status: '❌' });
            console.log('  ❌ formatBankSyncMessage: FAILED');
        }

        const deleteMsg = formatDeleteMessage(testAppointmentData, 'appointment');
        if (deleteMsg && deleteMsg.includes('ĐÃ XÓA ĐĂNG KÝ')) {
            testResults.formatting.passed++;
            testResults.formatting.tests.push({ name: 'formatDeleteMessage', status: '✅' });
            console.log('  ✅ formatDeleteMessage: OK');
        } else {
            testResults.formatting.failed++;
            testResults.formatting.tests.push({ name: 'formatDeleteMessage', status: '❌' });
            console.log('  ❌ formatDeleteMessage: FAILED');
        }
    } catch (error) {
        console.error('  ❌ Lỗi khi test format:', error);
        testResults.formatting.failed++;
    }

    // 3. Test quản lý Chat ID
    console.log('\n💬 [TEST] 3. Test quản lý Chat ID...');
    try {
        const config = getTelegramConfig();
        if (config) {
            const originalChatIds = [...(config.chatIds || [])];
            const testChatId = '999999999';

            // Test addChatId
            const added = addChatId(testChatId);
            if (added) {
                const newConfig = getTelegramConfig();
                if (newConfig.chatIds && newConfig.chatIds.includes(testChatId)) {
                    testResults.chatIdManagement.passed++;
                    testResults.chatIdManagement.tests.push({ name: 'addChatId', status: '✅' });
                    console.log('  ✅ addChatId: OK');

                    // Test removeChatId
                    const removed = removeChatId(testChatId);
                    if (removed) {
                        const finalConfig = getTelegramConfig();
                        if (!finalConfig.chatIds || !finalConfig.chatIds.includes(testChatId)) {
                            testResults.chatIdManagement.passed++;
                            testResults.chatIdManagement.tests.push({ name: 'removeChatId', status: '✅' });
                            console.log('  ✅ removeChatId: OK');
                        } else {
                            testResults.chatIdManagement.failed++;
                            testResults.chatIdManagement.tests.push({ name: 'removeChatId', status: '❌' });
                            console.log('  ❌ removeChatId: FAILED');
                        }
                    } else {
                        testResults.chatIdManagement.failed++;
                        testResults.chatIdManagement.tests.push({ name: 'removeChatId', status: '❌' });
                        console.log('  ❌ removeChatId: Không thể xóa');
                    }
                } else {
                    testResults.chatIdManagement.failed++;
                    testResults.chatIdManagement.tests.push({ name: 'addChatId', status: '❌' });
                    console.log('  ❌ addChatId: FAILED');
                }
            } else {
                testResults.chatIdManagement.failed++;
                testResults.chatIdManagement.tests.push({ name: 'addChatId', status: '❌' });
                console.log('  ❌ addChatId: Không thể thêm');
            }
        } else {
            console.log('  ⚠️ Bỏ qua test Chat ID (chưa có cấu hình)');
        }
    } catch (error) {
        console.error('  ❌ Lỗi khi test Chat ID:', error);
        testResults.chatIdManagement.failed++;
    }

    // 4. Test các hàm gửi tin nhắn (chỉ trong test mode)
    console.log('\n📤 [TEST] 4. Test các hàm gửi tin nhắn...');
    const wasTestMode = isTestMode();
    if (!wasTestMode) {
        setTestMode(true);
    }

    try {
        const testMessage = '🧪 <b>Test API</b>\n\nĐây là tin nhắn test API.';
        const result = await sendTelegramMessage(testMessage);
        
        if (result && (result.success || result.testMode)) {
            testResults.messaging.passed++;
            testResults.messaging.tests.push({ name: 'sendTelegramMessage', status: '✅', testMode: result.testMode });
            console.log(`  ✅ sendTelegramMessage: OK (Test Mode: ${result.testMode ? 'BẬT' : 'TẮT'})`);
        } else {
            testResults.messaging.failed++;
            testResults.messaging.tests.push({ name: 'sendTelegramMessage', status: '❌', error: result?.error });
            console.log(`  ❌ sendTelegramMessage: FAILED - ${result?.error || 'Unknown error'}`);
        }
    } catch (error) {
        testResults.messaging.failed++;
        testResults.messaging.tests.push({ name: 'sendTelegramMessage', status: '❌', error: error.message });
        console.error('  ❌ Lỗi khi test sendTelegramMessage:', error);
    }

    if (!wasTestMode) {
        setTestMode(false);
    }

    // 5. Test tất cả các hàm thông báo
    console.log('\n🔔 [TEST] 5. Test tất cả các hàm thông báo...');
    if (!isTestMode()) {
        setTestMode(true);
    }

    const testAppointmentData = {
        fullName: 'Nguyễn Văn Test',
        phone: '0912345678',
        idNumber: '001234567890',
        address: '123 Đường Test',
        officer: 'Cán bộ Test',
        soBanNganh: 'UBND Phường/Xã',
        appointmentDate: new Date().toISOString().split('T')[0],
        appointmentTime: '0800-0830',
        jobType: 'Đăng ký khai sinh',
        purpose: 'Test mục đích',
        participants: '1',
        province: 'Hà Nội',
        ward: 'Phường Test',
        vnidLevel2: 'Có',
        bankSync: 'Có',
        notes: 'Ghi chú test'
    };

    const testUBNDData = {
        fullName: 'Trần Thị Test',
        phone: '0987654321',
        email: 'test@example.com',
        idNumber: '001234567891',
        address: '456 Đường Test',
        organization: 'UBND Phường/Xã',
        officer: 'Cán bộ Test',
        appointmentDate: new Date().toISOString().split('T')[0],
        timeSlot: '09:00 - 09:30',
        jobType: 'Đăng ký kết hôn',
        jobDescription: 'Test mô tả',
        participants: 2,
        vneidLevel2: 'Có',
        bankLinked: 'Có'
    };

    const testBankSyncData = {
        fullName: 'Lê Văn Test',
        phone: '0901234567',
        email: 'banktest@example.com',
        idNumber: '001234567892',
        bankName: 'Ngân hàng Test',
        bankBranch: 'Chi nhánh Test',
        accountNumber: '1234567890',
        accountHolderName: 'Lê Văn Test',
        notes: 'Ghi chú test'
    };

    const notificationTests = [
        { name: 'notifyNewAppointment', fn: () => notifyNewAppointment(testAppointmentData) },
        { name: 'notifyNewUBNDAppointment', fn: () => notifyNewUBNDAppointment(testUBNDData) },
        { name: 'notifyNewBankSync', fn: () => notifyNewBankSync(testBankSyncData, 'TEST1234') },
        { name: 'notifyDeleteAppointment', fn: () => notifyDeleteAppointment(testAppointmentData, 'appointment') },
        { name: 'notifyClearAllAppointments', fn: () => notifyClearAllAppointments(5, 'appointment') }
    ];

    for (const test of notificationTests) {
        try {
            await test.fn();
            testResults.notifications.passed++;
            testResults.notifications.tests.push({ name: test.name, status: '✅' });
            console.log(`  ✅ ${test.name}: OK`);
        } catch (error) {
            testResults.notifications.failed++;
            testResults.notifications.tests.push({ name: test.name, status: '❌', error: error.message });
            console.error(`  ❌ ${test.name}: FAILED - ${error.message}`);
        }
    }

    // Tổng kết
    console.log('\n' + '='.repeat(60));
    console.log('📊 [TEST API] TỔNG KẾT KẾT QUẢ TEST:');
    console.log('='.repeat(60));
    
    const totalPassed = Object.values(testResults).reduce((sum, cat) => sum + cat.passed, 0);
    const totalFailed = Object.values(testResults).reduce((sum, cat) => sum + cat.failed, 0);
    const totalTests = totalPassed + totalFailed;

    console.log(`\n✅ Tổng số test đã pass: ${totalPassed}/${totalTests}`);
    console.log(`❌ Tổng số test đã fail: ${totalFailed}/${totalTests}`);
    console.log(`📈 Tỷ lệ thành công: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);

    console.log('\n📋 Chi tiết theo từng nhóm:');
    console.log(`  1. Cấu hình: ${testResults.config.passed}/${testResults.config.passed + testResults.config.failed} passed`);
    console.log(`  2. Format message: ${testResults.formatting.passed}/${testResults.formatting.passed + testResults.formatting.failed} passed`);
    console.log(`  3. Quản lý Chat ID: ${testResults.chatIdManagement.passed}/${testResults.chatIdManagement.passed + testResults.chatIdManagement.failed} passed`);
    console.log(`  4. Gửi tin nhắn: ${testResults.messaging.passed}/${testResults.messaging.passed + testResults.messaging.failed} passed`);
    console.log(`  5. Thông báo: ${testResults.notifications.passed}/${testResults.notifications.passed + testResults.notifications.failed} passed`);

    console.log('\n' + '='.repeat(60));
    console.log('✅ [TEST API] Hoàn thành test toàn bộ API!');
    console.log('='.repeat(60));

    return {
        success: totalFailed === 0,
        totalPassed,
        totalFailed,
        totalTests,
        successRate: ((totalPassed / totalTests) * 100).toFixed(1),
        details: testResults
    };
}

// Test các loại thông báo (chỉ dùng trong chế độ test)
async function testAllNotifications() {
    if (!isTestMode()) {
        console.warn('Chế độ test chưa được bật. Vui lòng bật test mode trước.');
        return { success: false, error: 'Chế độ test chưa được bật' };
    }

    console.log('🧪 [TEST MODE] Bắt đầu test tất cả các loại thông báo...');

    // Test data mẫu
    const testAppointmentData = {
        fullName: 'Nguyễn Văn Test',
        phone: '0912345678',
        idNumber: '001234567890',
        address: '123 Đường Test, Quận Test',
        officer: 'Cán bộ Test',
        soBanNganh: 'UBND Phường/Xã',
        appointmentDate: new Date().toISOString().split('T')[0],
        appointmentTime: '0800-0830',
        jobType: 'Đăng ký khai sinh',
        purpose: 'Đây là mục đích test để kiểm tra hệ thống thông báo',
        participants: '1',
        province: 'Hà Nội',
        ward: 'Phường Test',
        vnidLevel2: 'Có',
        bankSync: 'Có',
        notes: 'Ghi chú test'
    };

    const testUBNDData = {
        fullName: 'Trần Thị Test',
        phone: '0987654321',
        email: 'test@example.com',
        idNumber: '001234567891',
        address: '456 Đường Test UBND',
        organization: 'UBND Phường/Xã',
        officer: 'Cán bộ UBND Test',
        appointmentDate: new Date().toISOString().split('T')[0],
        timeSlot: '09:00 - 09:30',
        jobType: 'Đăng ký kết hôn',
        jobDescription: 'Đây là mô tả công việc test để kiểm tra hệ thống thông báo UBND',
        participants: 2,
        vneidLevel2: 'Có',
        bankLinked: 'Có'
    };

    const testBankSyncData = {
        fullName: 'Lê Văn Test',
        phone: '0901234567',
        email: 'banktest@example.com',
        idNumber: '001234567892',
        bankName: 'Ngân hàng Test',
        bankBranch: 'Chi nhánh Test',
        accountNumber: '1234567890',
        accountHolderName: 'Lê Văn Test',
        notes: 'Ghi chú test đồng bộ ngân hàng'
    };

    const results = {
        appointment: null,
        ubnd: null,
        bankSync: null,
        delete: null,
        clearAll: null
    };

    // Test từng loại thông báo
    try {
        console.log('🧪 [TEST] Test thông báo đăng ký lịch hẹn...');
        results.appointment = await notifyNewAppointment(testAppointmentData);
        
        console.log('🧪 [TEST] Test thông báo đăng ký UBND...');
        results.ubnd = await notifyNewUBNDAppointment(testUBNDData);
        
        console.log('🧪 [TEST] Test thông báo đồng bộ ngân hàng...');
        results.bankSync = await notifyNewBankSync(testBankSyncData, 'TEST1234');
        
        console.log('🧪 [TEST] Test thông báo xóa đăng ký...');
        results.delete = await notifyDeleteAppointment(testAppointmentData, 'appointment');
        
        console.log('🧪 [TEST] Test thông báo xóa tất cả...');
        results.clearAll = await notifyClearAllAppointments(5, 'appointment');
        
        console.log('✅ [TEST MODE] Đã hoàn thành test tất cả các loại thông báo');
        return { success: true, testMode: true, results: results };
    } catch (error) {
        console.error('❌ [TEST MODE] Lỗi khi test:', error);
        return { success: false, error: error.message, results: results };
    }
}

// Hàm tự động cấu hình với token và chat ID mặc định
function autoSetupTelegram() {
    const config = {
        botToken: DEFAULT_BOT_TOKEN,
        chatIds: [DEFAULT_CHAT_ID],
        enabled: true,
        testMode: false
    };
    
    localStorage.setItem(TELEGRAM_CONFIG_KEY, JSON.stringify(config));
    localStorage.setItem(TEST_MODE_KEY, 'false');
    
    console.log('✅ Đã tự động cấu hình Telegram Bot với token và chat ID mặc định');
    console.log('📋 Token:', DEFAULT_BOT_TOKEN);
    console.log('💬 Chat ID:', DEFAULT_CHAT_ID);
    return config;
}

// Tự động cấu hình khi file được load (nếu chưa có cấu hình)
if (typeof window !== 'undefined') {
    // Hàm tự động cấu hình ngay lập tức (không cần điều kiện)
    const autoSetupIfNeeded = () => {
        const currentConfig = getTelegramConfig();
        
        // Nếu chưa có cấu hình hoặc cấu hình không hợp lệ, tự động cấu hình
        if (!currentConfig || !currentConfig.botToken || !currentConfig.chatIds || currentConfig.chatIds.length === 0) {
            console.log('🔧 Tự động cấu hình Telegram Bot với token và chat ID mặc định...');
            autoSetupTelegram();
            return true;
        }
        
        // Nếu đã có cấu hình nhưng muốn cập nhật về mặc định
        const urlParams = new URLSearchParams(window.location.search);
        const forceSetup = urlParams.get('forceSetup') === 'true' || urlParams.get('forceSetup') === '1';
        
        if (forceSetup) {
            console.log('🔄 Buộc cập nhật cấu hình về mặc định...');
            autoSetupTelegram();
            return true;
        }
        
        return false;
    };
    
    // Chờ DOM load xong
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            autoSetupIfNeeded();
        });
    } else {
        // DOM đã load xong
        autoSetupIfNeeded();
    }
}

// Hàm tự động chạy test API khi file được load
function autoRunTestAPI() {
    if (typeof window === 'undefined') return;
    
    // Kiểm tra URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const autoTest = urlParams.get('autotest') || urlParams.get('test');
    
    if (autoTest === 'true' || autoTest === '1') {
        // Chờ DOM load xong
        const runTest = async () => {
            // Đảm bảo đã cấu hình
            if (!getTelegramConfig()) {
                console.log('🔧 Chưa có cấu hình, đang tự động cấu hình...');
                autoSetupTelegram();
            }
            
            // Bật test mode
            setTestMode(true);
            
            // Chờ một chút để đảm bảo mọi thứ đã sẵn sàng
            setTimeout(async () => {
                console.log('🧪 Bắt đầu tự động chạy test API...');
                console.log('='.repeat(60));
                
                if (window.TelegramBot && window.TelegramBot.testAllAPI) {
                    try {
                        const result = await window.TelegramBot.testAllAPI();
                        console.log('\n✅ Hoàn thành test API!');
                        console.log('📊 Kết quả:', result);
                    } catch (error) {
                        console.error('❌ Lỗi khi chạy test API:', error);
                    }
                } else {
                    console.error('❌ Hàm testAllAPI không khả dụng');
                }
            }, 1000);
        };
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', runTest);
        } else {
            runTest();
        }
    }
}

// Export functions để sử dụng trong các file khác
if (typeof window !== 'undefined') {
    window.TelegramBot = {
        getTelegramConfig,
        saveTelegramConfig,
        isTelegramConfigured,
        isTestMode,
        setTestMode,
        sendTelegramMessage,
        sendTelegramMessageToChat,
        addChatId,
        removeChatId,
        testAllAPI,
        testAllNotifications,
        notifyNewAppointment,
        notifyNewUBNDAppointment,
        notifyNewBankSync,
        notifyDeleteAppointment,
        notifyClearAllAppointments,
        autoSetupTelegram,
        DEFAULT_BOT_TOKEN,
        DEFAULT_CHAT_ID
    };
    
    // Tự động chạy test nếu có yêu cầu
    autoRunTestAPI();
}
