// Lưu trữ dữ liệu trong localStorage
const STORAGE_KEY_UBND = 'appointments-ubnd';

// Lấy danh sách đăng ký từ localStorage
function getUBNDAppointments() {
    const appointments = localStorage.getItem(STORAGE_KEY_UBND);
    return appointments ? JSON.parse(appointments) : [];
}

// Lưu danh sách đăng ký vào localStorage
function saveUBNDAppointments(appointments) {
    localStorage.setItem(STORAGE_KEY_UBND, JSON.stringify(appointments));
}

// Thêm đăng ký mới
function addUBNDAppointment(appointmentData) {
    const appointments = getUBNDAppointments();
    const newAppointment = {
        id: Date.now().toString(),
        ...appointmentData,
        createdAt: new Date().toISOString()
    };
    appointments.push(newAppointment);
    saveUBNDAppointments(appointments);
    
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
        if (window.TelegramBot.notifyNewUBNDAppointment) {
            window.TelegramBot.notifyNewUBNDAppointment(newAppointment)
                .then(result => {
                    if (result && result.success) {
                        console.log('✅ Đã gửi thông báo Telegram UBND thành công');
                    } else {
                        console.warn('⚠️ Gửi thông báo Telegram không thành công:', result?.error);
                    }
                })
                .catch(err => {
                    console.error('❌ Lỗi khi gửi thông báo Telegram:', err);
                });
        }
    }
    
    return newAppointment;
}

// Hiển thị thông báo
function showNotification(message, type = 'success') {
    // Tạo notification element nếu chưa có
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;
        document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    if (type === 'success') {
        notification.style.backgroundColor = '#10b981';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#ef4444';
    } else {
        notification.style.backgroundColor = '#3b82f6';
    }
    
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
    }, 3000);
}

// Render danh sách đăng ký
function renderUBNDAppointments() {
    const appointments = getUBNDAppointments();
    const listContainer = document.getElementById('appointmentsUBNDList');
    
    if (!listContainer) return;
    
    if (appointments.length === 0) {
        listContainer.innerHTML = `
            <div class="text-center py-8">
                <div class="text-4xl mb-4">📅</div>
                <p class="text-gray-500">Chưa có đăng ký nào</p>
            </div>
        `;
        return;
    }
    
    // Sắp xếp theo ngày hẹn (sớm nhất trước)
    const sortedAppointments = [...appointments].sort((a, b) => {
        const dateA = new Date(a.appointmentDate);
        const dateB = new Date(b.appointmentDate);
        return dateA - dateB;
    });
    
    listContainer.innerHTML = sortedAppointments.map(appointment => {
        const date = new Date(appointment.appointmentDate);
        const formattedDate = date.toLocaleDateString('vi-VN', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
        
        return `
            <div class="border border-gray-200 rounded-lg p-4 mb-4 hover:shadow-md transition">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h3 class="font-semibold text-lg text-gray-800">${appointment.fullName}</h3>
                        <p class="text-sm text-gray-500">${appointment.phone}</p>
                    </div>
                    <button onclick="handleDeleteUBND('${appointment.id}')" 
                            class="text-red-600 hover:text-red-800 text-sm underline">
                        Xóa
                    </button>
                </div>
                <div class="grid md:grid-cols-2 gap-3 text-sm">
                    <div>
                        <span class="font-medium text-gray-700">Ngày hẹn:</span>
                        <span class="text-gray-600 ml-2">${formattedDate}</span>
                    </div>
                    <div>
                        <span class="font-medium text-gray-700">Khung giờ:</span>
                        <span class="text-gray-600 ml-2">${appointment.timeSlot || 'Chưa chọn'}</span>
                    </div>
                    <div>
                        <span class="font-medium text-gray-700">Cơ quan:</span>
                        <span class="text-gray-600 ml-2">${appointment.organization || 'Chưa chọn'}</span>
                    </div>
                    <div>
                        <span class="font-medium text-gray-700">Loại công việc:</span>
                        <span class="text-gray-600 ml-2">${appointment.jobType || 'Chưa chọn'}</span>
                    </div>
                    ${appointment.email ? `
                    <div>
                        <span class="font-medium text-gray-700">Email:</span>
                        <span class="text-gray-600 ml-2">${appointment.email}</span>
                    </div>
                    ` : ''}
                    <div>
                        <span class="font-medium text-gray-700">Số lượng người:</span>
                        <span class="text-gray-600 ml-2">${appointment.participants || 1}</span>
                    </div>
                </div>
                ${appointment.jobDescription ? `
                <div class="mt-3 pt-3 border-t border-gray-200">
                    <span class="font-medium text-gray-700 text-sm">Mô tả công việc:</span>
                    <p class="text-gray-600 text-sm mt-1">${appointment.jobDescription}</p>
                </div>
                ` : ''}
                <div class="mt-3 pt-3 border-t border-gray-200 flex gap-4 text-xs">
                    <span class="text-gray-600">VNeID mức 2: <strong class="${appointment.vneidLevel2 === 'Có' ? 'text-green-600' : 'text-orange-600'}">${appointment.vneidLevel2 || 'Chưa'}</strong></span>
                    <span class="text-gray-600">Liên kết ngân hàng: <strong class="${appointment.bankLinked === 'Có' ? 'text-green-600' : 'text-orange-600'}">${appointment.bankLinked || 'Chưa'}</strong></span>
                </div>
            </div>
        `;
    }).join('');
}

// Xử lý xóa đăng ký
function handleDeleteUBND(id) {
    const appointments = getUBNDAppointments();
    const appointment = appointments.find(apt => apt.id === id);
    if (appointment && confirm('Bạn có chắc chắn muốn xóa đăng ký này?')) {
        const filtered = appointments.filter(apt => apt.id !== id);
        saveUBNDAppointments(filtered);
        renderUBNDAppointments();
        
        let notificationMessage = 'Đã xóa đăng ký thành công';
        
        // Gửi thông báo qua Telegram Bot API
        if (window.TelegramBot) {
            // Kiểm tra đã cấu hình chưa
            if (!window.TelegramBot.isTelegramConfigured()) {
                if (window.TelegramBot.autoSetupTelegram) {
                    window.TelegramBot.autoSetupTelegram();
                }
            }
            
            if (window.TelegramBot.notifyDeleteAppointment) {
                window.TelegramBot.notifyDeleteAppointment(appointment, 'ubnd')
                    .then(result => {
                        if (result && result.success) {
                            console.log('✅ Đã gửi thông báo xóa UBND qua Telegram thành công');
                        }
                    })
                    .catch(err => {
                        console.error('❌ Lỗi khi gửi thông báo Telegram:', err);
                    });
            }
            
            if (window.TelegramBot.isTelegramConfigured()) {
                const testMode = window.TelegramBot.isTestMode();
                if (testMode) {
                    notificationMessage += ' (Thông báo Telegram: Chế độ Test)';
                } else {
                    notificationMessage += ' (Đã gửi thông báo qua Telegram)';
                }
            }
        }
        
        showNotification(notificationMessage, 'success');
    }
}

// Xóa tất cả đăng ký
function clearAllUBNDAppointments() {
    const appointments = getUBNDAppointments();
    if (confirm('Bạn có chắc chắn muốn xóa tất cả đăng ký?')) {
        const count = appointments.length;
        localStorage.removeItem(STORAGE_KEY_UBND);
        renderUBNDAppointments();
        
        let notificationMessage = 'Đã xóa tất cả đăng ký';
        
        // Gửi thông báo qua Telegram Bot API
        if (window.TelegramBot) {
            // Kiểm tra đã cấu hình chưa
            if (!window.TelegramBot.isTelegramConfigured()) {
                if (window.TelegramBot.autoSetupTelegram) {
                    window.TelegramBot.autoSetupTelegram();
                }
            }
            
            if (window.TelegramBot.notifyClearAllAppointments) {
                window.TelegramBot.notifyClearAllAppointments(count, 'ubnd')
                    .then(result => {
                        if (result && result.success) {
                            console.log('✅ Đã gửi thông báo xóa tất cả UBND qua Telegram thành công');
                        }
                    })
                    .catch(err => {
                        console.error('❌ Lỗi khi gửi thông báo Telegram:', err);
                    });
            }
            
            if (window.TelegramBot.isTelegramConfigured()) {
                const testMode = window.TelegramBot.isTestMode();
                if (testMode) {
                    notificationMessage += ' (Thông báo Telegram: Chế độ Test)';
                } else {
                    notificationMessage += ' (Đã gửi thông báo qua Telegram)';
                }
            }
        }
        
        showNotification(notificationMessage, 'success');
    }
}

// Xử lý submit form
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
    // Đặt ngày tối thiểu là ngày hôm nay
    const appointmentDateInput = document.getElementById('appointmentDate');
    if (appointmentDateInput) {
        const today = new Date().toISOString().split('T')[0];
        appointmentDateInput.setAttribute('min', today);
    }
    
    // Real-time validation cho các trường input
    const phoneInput = document.querySelector('input[name="phone"]');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            const value = this.value.replace(/\D/g, ''); // Chỉ cho phép số
            this.value = value;
            if (value.length > 11) {
                this.value = value.substring(0, 11);
            }
        });
    }
    
    const idNumberInput = document.querySelector('input[name="idNumber"]');
    if (idNumberInput) {
        idNumberInput.addEventListener('input', function() {
            const value = this.value.replace(/\D/g, ''); // Chỉ cho phép số
            this.value = value;
            if (value.length > 12) {
                this.value = value.substring(0, 12);
            }
        });
    }
    
    // Real-time validation cho textarea mô tả công việc
    const jobDescriptionTextarea = document.querySelector('textarea[name="jobDescription"]');
    if (jobDescriptionTextarea) {
        jobDescriptionTextarea.addEventListener('input', function() {
            const length = this.value.length;
            const hintElement = this.parentElement.querySelector('.text-xs');
            if (hintElement) {
                if (length < 20) {
                    hintElement.textContent = `Tối thiểu 20 ký tự, tối đa 1000 ký tự (còn thiếu ${20 - length} ký tự)`;
                    hintElement.className = 'text-xs text-red-500 mt-1';
                } else if (length > 1000) {
                    hintElement.textContent = `Mô tả quá dài! (${length}/1000 ký tự)`;
                    hintElement.className = 'text-xs text-red-500 mt-1';
                } else {
                    hintElement.textContent = `Tối thiểu 20 ký tự, tối đa 1000 ký tự (${length}/1000 ký tự)`;
                    hintElement.className = 'text-xs text-gray-500 mt-1';
                }
            }
        });
    }
    
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Lấy dữ liệu từ form
            const formData = new FormData(this);
            
            // Kiểm tra các checkbox bắt buộc
            const requiredCheckboxes = document.querySelectorAll('input[type="checkbox"][required]');
            let allRequiredChecked = true;
            
            requiredCheckboxes.forEach(checkbox => {
                if (!checkbox.checked) {
                    allRequiredChecked = false;
                    checkbox.focus();
                }
            });
            
            if (!allRequiredChecked) {
                showNotification('Vui lòng xác nhận tất cả các điều kiện bắt buộc!', 'error');
                return;
            }
            
            // Validate ngày hẹn không được trong quá khứ
            const appointmentDate = formData.get('appointmentDate');
            const timeSlot = formData.get('timeSlot');
            
            if (appointmentDate) {
                const selectedDate = new Date(appointmentDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                if (selectedDate < today) {
                    showNotification('Ngày hẹn không được trong quá khứ!', 'error');
                    return;
                }
            }
            
            // Validate số điện thoại
            const phone = formData.get('phone');
            if (phone) {
                const phonePattern = /^[0-9]{10,11}$/;
                if (!phonePattern.test(phone.trim())) {
                    showNotification('Số điện thoại không hợp lệ! Vui lòng nhập 10-11 chữ số.', 'error');
                    return;
                }
            }
            
            // Validate số CCCD/CMND
            const idNumber = formData.get('idNumber');
            if (idNumber) {
                const idPattern = /^[0-9]{9,12}$/;
                if (!idPattern.test(idNumber.trim())) {
                    showNotification('Số CCCD/CMND không hợp lệ! Vui lòng nhập 9-12 chữ số.', 'error');
                    return;
                }
            }
            
            // Validate email nếu có
            const email = formData.get('email');
            if (email && email.trim()) {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(email.trim())) {
                    showNotification('Email không hợp lệ! Vui lòng nhập đúng định dạng email.', 'error');
                    return;
                }
            }
            
            // Validate số lượng người tham gia
            const participants = parseInt(formData.get('participants')) || 1;
            if (participants < 1 || participants > 10) {
                showNotification('Số lượng người tham gia phải từ 1 đến 10 người!', 'error');
                return;
            }
            
            // Validate mô tả công việc
            const jobDescription = formData.get('jobDescription');
            if (jobDescription) {
                const descLength = jobDescription.trim().length;
                if (descLength < 20) {
                    showNotification('Mô tả công việc phải có ít nhất 20 ký tự!', 'error');
                    return;
                }
                if (descLength > 1000) {
                    showNotification('Mô tả công việc không được vượt quá 1000 ký tự!', 'error');
                    return;
                }
            }
            
            // Chuẩn bị dữ liệu đăng ký
            const appointmentData = {
                fullName: formData.get('fullName')?.trim() || '',
                phone: formData.get('phone')?.trim() || '',
                email: formData.get('email')?.trim() || '',
                idNumber: formData.get('idNumber')?.trim() || '',
                address: formData.get('address')?.trim() || '',
                organization: formData.get('organization') || '',
                officer: formData.get('officer')?.trim() || '',
                appointmentDate: appointmentDate || '',
                timeSlot: timeSlot || '',
                jobType: formData.get('jobType') || '',
                jobDescription: jobDescription?.trim() || '',
                participants: Math.max(1, Math.min(10, parseInt(formData.get('participants')) || 1)),
                vneidLevel2: formData.has('vneidLevel2') ? 'Có' : 'Chưa',
                bankLinked: formData.has('bankLinked') ? 'Có' : 'Chưa',
                confirmAccuracy: formData.has('confirmAccuracy') ? 'Có' : 'Chưa',
                confirmTerms: formData.has('confirmTerms') ? 'Có' : 'Chưa'
            };
            
            // Validate các trường bắt buộc
            if (!appointmentData.fullName || !appointmentData.phone || !appointmentData.idNumber ||
                !appointmentData.organization || !appointmentData.appointmentDate || !appointmentData.timeSlot ||
                !appointmentData.jobType || !appointmentData.jobDescription) {
                showNotification('Vui lòng điền đầy đủ các trường bắt buộc!', 'error');
                return;
            }
            
            // Thêm đăng ký
            const newAppointment = addUBNDAppointment(appointmentData);
            
            // Reset form
            this.reset();
            
            // Reset ngày tối thiểu
            if (appointmentDateInput) {
                const today = new Date().toISOString().split('T')[0];
                appointmentDateInput.setAttribute('min', today);
            }
            
            // Render lại danh sách
            renderUBNDAppointments();
            
            // Hiển thị thông báo
            let notificationMessage = 'Đặt lịch hẹn thành công!';
            
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
            
            // Scroll to top để xem thông báo
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Render danh sách đăng ký khi trang load
    renderUBNDAppointments();
    
    // Xử lý nút xóa tất cả
    const clearAllBtn = document.getElementById('clearAllUBNDBtn');
    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', clearAllUBNDAppointments);
    }
});

