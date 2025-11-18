// Lưu trữ dữ liệu trong localStorage
const STORAGE_KEY = 'appointments';

// Lấy danh sách đăng ký từ localStorage
function getAppointments() {
    const appointments = localStorage.getItem(STORAGE_KEY);
    return appointments ? JSON.parse(appointments) : [];
}

// Lưu danh sách đăng ký vào localStorage
function saveAppointments(appointments) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
}

// Thêm đăng ký mới
function addAppointment(appointmentData) {
    const appointments = getAppointments();
    const newAppointment = {
        id: Date.now().toString(),
        ...appointmentData,
        createdAt: new Date().toISOString()
    };
    appointments.push(newAppointment);
    saveAppointments(appointments);
    
    // Gửi thông báo qua Telegram Bot API
    if (window.TelegramBot) {
        // Kiểm tra đã cấu hình chưa, nếu chưa thì tự động cấu hình
        if (!window.TelegramBot.isTelegramConfigured()) {
            if (window.TelegramBot.autoSetupTelegram) {
                console.log('🔧 Tự động cấu hình Telegram Bot...');
                // Gửi thông báo qua Telegram Bot API
    if (window.TelegramBot) {
        // Kiểm tra đã cấu hình chưa
        if (!window.TelegramBot.isTelegramConfigured()) {
            console.warn('⚠️ Telegram Bot chưa được cấu hình. Vui lòng truy cập trang Cấu hình Telegram Bot.');
            // Tùy chọn: Có thể hiện thông báo nhỏ nhắc admin cấu hình
        } else {
            // Gửi thông báo
            if (window.TelegramBot.notifyNewAppointment) {
                window.TelegramBot.notifyNewAppointment(newAppointment)
                    .then(result => {
                         if (result && !result.success && !result.testMode) {
                             console.warn('⚠️ Gửi Telegram thất bại:', result.error);
                         }
                    })
                    .catch(err => console.error('❌ Lỗi Telegram:', err));
            }
        }
    }
                        console.log('✅ Đã gửi thông báo Telegram thành công');
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

// Xóa đăng ký
function deleteAppointment(id) {
    const appointments = getAppointments();
    const filtered = appointments.filter(apt => apt.id !== id);
    saveAppointments(filtered);
}

// Xóa tất cả đăng ký
function clearAllAppointments() {
    const appointments = getAppointments();
    if (confirm('Bạn có chắc chắn muốn xóa tất cả đăng ký?')) {
        const count = appointments.length;
        localStorage.removeItem(STORAGE_KEY);
        renderAppointments();
        
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
                window.TelegramBot.notifyClearAllAppointments(count, 'appointment')
                    .then(result => {
                        if (result && result.success) {
                            console.log('✅ Đã gửi thông báo xóa tất cả qua Telegram thành công');
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

// Hiển thị thông báo
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Định dạng ngày tháng (tiếng Việt: dd/mm/yyyy)
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Định dạng giờ (24 giờ)
function formatTime(timeString) {
    if (!timeString) return '';
    // Nếu là select dropdown, timeString đã có format HH:MM
    if (timeString.includes(':')) {
    const [hours, minutes] = timeString.split(':');
        return `${hours.padStart(2, '0')}:${minutes || '00'}`;
    }
    return timeString;
}

// Lấy tên phòng/ban
function getDepartmentName(value) {
    const departments = {
        'chu-tich-ubnd': 'Chủ tịch UBND',
        'pho-chu-tich-ubnd': 'Phó Chủ tịch UBND',
        'van-phong-thong-ke': 'Văn phòng - Thống kê',
        'hanh-chinh-tong-hop': 'Hành chính tổng hợp',
        'phong-tai-chinh-ke-hoach': 'Phòng Tài chính - Kế hoạch',
        'phong-tu-phap-ho-tich': 'Phòng Tư pháp - Hộ tịch',
        'phong-van-hoa-the-thao': 'Phòng Văn hóa, thể thao',
        'phong-lao-dong-thuong-binh-xa-hoi': 'Phòng Lao động - Thương binh - Xã hội',
        'phong-kinh-te-ha-tang': 'Phòng Kinh tế - Hạ tầng',
        'phong-quan-ly-dat-dai-moi-truong': 'Phòng Quản Lí Đất Đai Và Môi Trường',
        'phong-cong-an-phuong-xa': 'Phòng Công an Phường/Xã',
        'phong-quan-ly-dan-cu': 'Phòng Quản lý dân cư',
        'phong-to-chuc-doan-the': 'Phòng tổ chức đoàn thể',
        'hoi-phu-nu': 'Hội Phụ nữ',
        'doan-thanh-nien': 'Đoàn Thanh niên',
        'hoi-cuu-chien-binh': 'Hội Cựu chiến binh',
        'hoi-nguoi-cao-tuoi': 'Hội Người cao tuổi',
        'bo-phan-mot-cua': 'Bộ phận một cửa (tiếp nhận và trả kết quả hành chính)'
    };
    return departments[value] || value;
}

// Render danh sách đăng ký
function renderAppointments() {
    const appointments = getAppointments();
    const listContainer = document.getElementById('appointmentsList');
    
    if (appointments.length === 0) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📅</div>
                <p>Chưa có đăng ký nào</p>
            </div>
        `;
        return;
    }
    
    // Sắp xếp theo ngày hẹn (sớm nhất trước)
    const sortedAppointments = [...appointments].sort((a, b) => {
        const dateA = new Date(`${a.appointmentDate}T${a.appointmentTime}`);
        const dateB = new Date(`${b.appointmentDate}T${b.appointmentTime}`);
        return dateA - dateB;
    });
    
    listContainer.innerHTML = sortedAppointments.map(appointment => `
        <div class="appointment-item">
            <div class="appointment-item-header">
                <div class="appointment-item-title">${appointment.fullName}</div>
                <button class="appointment-item-delete" onclick="handleDelete('${appointment.id}')">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; vertical-align: middle;">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Xóa
                </button>
            </div>
            <div class="appointment-item-info">
                <div class="appointment-item-info-item">
                    <span class="appointment-item-info-label">Ngày hẹn:</span>
                    <span class="appointment-item-info-value">${formatDate(appointment.appointmentDate)}</span>
                </div>
                <div class="appointment-item-info-item">
                    <span class="appointment-item-info-label">Khung giờ:</span>
                    <span class="appointment-item-info-value">${formatTime(appointment.appointmentTime)}</span>
                </div>
                <div class="appointment-item-info-item">
                    <span class="appointment-item-info-label">CMND/CCCD:</span>
                    <span class="appointment-item-info-value">${appointment.idNumber}</span>
                </div>
                <div class="appointment-item-info-item">
                    <span class="appointment-item-info-label">Điện thoại:</span>
                    <span class="appointment-item-info-value">${appointment.phone}</span>
                </div>
                ${appointment.address ? `
                <div class="appointment-item-info-item">
                    <span class="appointment-item-info-label">Địa chỉ:</span>
                    <span class="appointment-item-info-value">${appointment.address}</span>
                </div>
                ` : ''}
                ${appointment.officer ? `
                <div class="appointment-item-info-item">
                    <span class="appointment-item-info-label">Cán bộ tiếp nhận:</span>
                    <span class="appointment-item-info-value">${appointment.officer}</span>
                </div>
                ` : ''}
                ${appointment.jobType ? `
                <div class="appointment-item-info-item">
                    <span class="appointment-item-info-label">Loại công việc:</span>
                    <span class="appointment-item-info-value">${appointment.jobType}</span>
                </div>
                ` : ''}
                ${appointment.participants ? `
                <div class="appointment-item-info-item">
                    <span class="appointment-item-info-label">Số người tham gia:</span>
                    <span class="appointment-item-info-value">${appointment.participants}</span>
                </div>
                ` : ''}
                ${appointment.province ? `
                <div class="appointment-item-info-item">
                    <span class="appointment-item-info-label">Tỉnh/Thành phố:</span>
                    <span class="appointment-item-info-value">${appointment.province}</span>
                </div>
                ` : ''}
                ${appointment.ward ? `
                <div class="appointment-item-info-item">
                    <span class="appointment-item-info-label">Phường/Xã:</span>
                    <span class="appointment-item-info-value">${appointment.ward}</span>
                </div>
                ` : ''}
                ${appointment.soBanNganh ? `
                <div class="appointment-item-info-item">
                    <span class="appointment-item-info-label">Cơ Quan / Đơn Vị:</span>
                    <span class="appointment-item-info-value">${appointment.soBanNganh}</span>
                </div>
                ` : ''}
                <div class="appointment-item-info-item">
                    <span class="appointment-item-info-label">Đồng bộ ngân hàng:</span>
                    <span class="appointment-item-info-value ${appointment.bankSync === 'Có' ? 'text-success' : 'text-warning'}">${appointment.bankSync || 'Chưa'}</span>
                </div>
                <div class="appointment-item-info-item">
                    <span class="appointment-item-info-label">Vnid mức 2:</span>
                    <span class="appointment-item-info-value ${appointment.vnidLevel2 === 'Có' ? 'text-success' : 'text-warning'}">${appointment.vnidLevel2 || 'Chưa'}</span>
                </div>
            </div>
            <div class="appointment-item-purpose">
                <div class="appointment-item-purpose-label">Lý do hẹn:</div>
                <div class="appointment-item-purpose-value">${appointment.purpose}</div>
            </div>
            ${appointment.notes ? `
            <div class="appointment-item-purpose" style="margin-top: 10px; border-left-color: #95a5a6;">
                <div class="appointment-item-purpose-label">Ghi chú:</div>
                <div class="appointment-item-purpose-value">${appointment.notes}</div>
            </div>
            ` : ''}
        </div>
    `).join('');
}

// Xử lý xóa đăng ký
function handleDelete(id) {
    const appointments = getAppointments();
    const appointment = appointments.find(a => a.id === id);
    if (appointment && confirm('Bạn có chắc chắn muốn xóa đăng ký này?')) {
        deleteAppointment(id);
        renderAppointments();
        
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
                window.TelegramBot.notifyDeleteAppointment(appointment, 'appointment')
                    .then(result => {
                        if (result && result.success) {
                            console.log('✅ Đã gửi thông báo xóa qua Telegram thành công');
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
    
    const appointmentForm = document.getElementById('appointmentForm');
    if (!appointmentForm) return;
    
    appointmentForm.addEventListener('submit', function(e) {
    e.preventDefault();
        
        // Đảm bảo date display được sync với date input trước khi submit
        const appointmentDateDisplay = document.getElementById('appointmentDateDisplay');
        const appointmentDateInput = document.getElementById('appointmentDate');
        
        if (appointmentDateDisplay && appointmentDateInput) {
            const displayValue = appointmentDateDisplay.value.trim();
            if (displayValue && displayValue.length === 10) {
                const formattedDate = formatDateToYYYYMMDD(displayValue);
                const date = new Date(formattedDate);
                if (!isNaN(date.getTime())) {
                    appointmentDateInput.value = formattedDate;
                }
            }
        }
        
        // Kiểm tra checkbox cam đoan (bắt buộc)
        const confirmAccuracy = document.getElementById('confirmAccuracy');
        if (!confirmAccuracy || !confirmAccuracy.checked) {
            showNotification('Vui lòng xác nhận cam đoan thông tin chính xác và chịu trách nhiệm trước pháp luật!', 'error');
            confirmAccuracy?.focus();
            return;
        }
    
    // Lấy dữ liệu từ form
    const formData = new FormData(this);
        
        // Validate mô tả lý do hẹn
        const purpose = formData.get('purpose');
        if (purpose && purpose.trim().length < 20) {
            showNotification('Lý do hẹn phải có ít nhất 20 ký tự!', 'error');
            document.getElementById('purpose').focus();
            return;
        }
    const provinceSelect = document.getElementById('province');
    const wardSelect = document.getElementById('ward');
    const soBanNganhSelect = document.getElementById('soBanNganh');
        
        const jobTypeSelect = document.getElementById('jobType');
    
    const appointmentData = {
        fullName: formData.get('fullName').trim(),
        idNumber: formData.get('idNumber').trim(),
        phone: formData.get('phone').trim(),
            address: formData.get('address').trim(),
            officer: formData.get('officer').trim(),
        province: provinceSelect ? provinceSelect.options[provinceSelect.selectedIndex].text : '',
        ward: wardSelect ? wardSelect.options[wardSelect.selectedIndex].text : '',
        soBanNganh: soBanNganhSelect ? soBanNganhSelect.options[soBanNganhSelect.selectedIndex].text : '',
        appointmentDate: formData.get('appointmentDate'),
        appointmentTime: formData.get('appointmentTime'),
            jobType: jobTypeSelect ? jobTypeSelect.options[jobTypeSelect.selectedIndex].text : '',
        purpose: formData.get('purpose').trim(),
            participants: formData.get('participants') || '1',
        notes: formData.get('notes').trim(),
            vnidLevel2: formData.get('vnidLevel2') === 'yes' ? 'Có' : 'Chưa',
            bankSync: formData.get('bankSync') === 'yes' ? 'Có' : 'Chưa',
            confirmAccuracy: formData.get('confirmAccuracy') === 'yes' ? 'Có' : 'Chưa'
    };
    
    // Kiểm tra nếu chưa thực hiện đồng bộ ngân hàng
    const bankSync = formData.get('bankSync');
    if (bankSync !== 'yes') {
        // Chuyển hướng sang trang đăng ký liên kết đồng bộ
        showNotification('Vui lòng đăng ký liên kết đồng bộ ngân hàng trước khi đăng ký lịch hẹn!', 'error');
        setTimeout(() => {
            window.location.href = 'bank-sync-registration.html';
        }, 1500);
        return;
    }
    
    // Kiểm tra ngày hẹn không được trong quá khứ
    const appointmentDateTime = new Date(`${appointmentData.appointmentDate}T${appointmentData.appointmentTime}`);
    const now = new Date();
    
    if (appointmentDateTime < now) {
        showNotification('Ngày và giờ hẹn không được trong quá khứ!', 'error');
        return;
    }
    
    // Thêm đăng ký
        const newAppointment = addAppointment(appointmentData);
    
    // Reset form
    this.reset();
        
        // Reset date display input
        const appointmentDateDisplayReset = document.getElementById('appointmentDateDisplay');
        if (appointmentDateDisplayReset) {
            appointmentDateDisplayReset.value = '';
        }
    
    // Render lại danh sách
    renderAppointments();
    
    // Hiển thị thông báo
        let notificationMessage = 'Đăng ký lịch hẹn thành công!';
        
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
});

// Xử lý nút xóa tất cả
document.getElementById('clearAllBtn').addEventListener('click', clearAllAppointments);

// Format ngày thành dd/mm/yyyy (định dạng tiếng Việt)
function formatDateToDDMMYYYY(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    // Đảm bảo format đúng: ngày/tháng/năm
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
}

// Format dd/mm/yyyy thành yyyy-mm-dd
function formatDateToYYYYMMDD(dateString) {
    if (!dateString) return '';
    const [day, month, year] = dateString.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// Thiết lập ngày tối thiểu cho input date (hôm nay) - sẽ được gọi trong DOMContentLoaded
function initAppointmentDateField() {
    const appointmentDateInput = document.getElementById('appointmentDate');
    const appointmentDateDisplay = document.getElementById('appointmentDateDisplay');
    const datePickerButton = document.getElementById('datePickerButton');

    if (!appointmentDateInput || !appointmentDateDisplay) {
        console.error('Không tìm thấy appointmentDateInput hoặc appointmentDateDisplay');
        return;
    }

    // Khởi tạo trường ngày hẹn

    // Thiết lập min date và locale tiếng Việt
    const today = new Date().toISOString().split('T')[0];
    appointmentDateInput.setAttribute('min', today);
    appointmentDateInput.setAttribute('lang', 'vi');
    appointmentDateInput.value = '';
    
    // Thiết lập locale cho input date (nếu trình duyệt hỗ trợ)
    try {
        // Thử set locale cho date picker
        if (appointmentDateInput.type === 'date') {
            // Một số trình duyệt tự động sử dụng locale từ html lang
            // Đảm bảo format hiển thị là tiếng Việt
        }
    } catch (e) {
        console.log('Không thể thiết lập locale cho date input:', e);
    }
    
    // Khi chọn ngày từ date picker
    appointmentDateInput.addEventListener('change', function() {
        console.log('Ngày đã được thay đổi:', this.value);
        if (this.value) {
            // Format hiển thị theo định dạng tiếng Việt: dd/mm/yyyy
            appointmentDateDisplay.value = formatDateToDDMMYYYY(this.value);
            appointmentDateDisplay.setCustomValidity('');
        } else {
            appointmentDateDisplay.value = '';
        }
    });
    
    // Button để mở date picker
    if (datePickerButton) {
        datePickerButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Nút chọn ngày đã được nhấn');
            
            // Đảm bảo input date có thể nhận click
            appointmentDateInput.style.pointerEvents = 'auto';
            appointmentDateInput.style.zIndex = '15';
            
            // Focus và click vào input date
            appointmentDateInput.focus();
            
            // Thử mở date picker
            setTimeout(function() {
                if (appointmentDateInput.showPicker && typeof appointmentDateInput.showPicker === 'function') {
                    try {
                        appointmentDateInput.showPicker();
                    } catch (err) {
                        console.log('Lỗi khi mở date picker:', err);
                        appointmentDateInput.click();
                    }
                } else {
                    appointmentDateInput.click();
                }
            }, 10);
        });
    }
    
    // Chế độ điền thông tin: Khi click vào input display, tự động mở date picker
    appointmentDateDisplay.addEventListener('click', function(e) {
        // Nếu click vào phần bên phải (nơi có button), không làm gì (button sẽ xử lý)
        const rect = this.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const buttonWidth = 50; // Độ rộng của button
        
        if (clickX < rect.width - buttonWidth) {
            // Click vào phần input, tự động mở date picker
            e.preventDefault();
            e.stopPropagation();
            
            // Đảm bảo input date có thể nhận click
            appointmentDateInput.style.pointerEvents = 'auto';
            appointmentDateInput.style.zIndex = '15';
            
            // Focus và mở date picker
            appointmentDateInput.focus();
            
            setTimeout(function() {
                if (appointmentDateInput.showPicker && typeof appointmentDateInput.showPicker === 'function') {
                    try {
                        appointmentDateInput.showPicker();
                    } catch (err) {
                        console.log('Lỗi khi mở date picker:', err);
                        appointmentDateInput.click();
                    }
                } else {
                    appointmentDateInput.click();
                }
            }, 10);
        }
    });
    
    // Khi input display focus (từ Tab), tự động mở date picker
    appointmentDateDisplay.addEventListener('focus', function(e) {
        // Chỉ mở picker nếu focus từ keyboard (Tab), không phải từ click
        if (e.relatedTarget === null || e.relatedTarget.tagName !== 'BUTTON') {
            // Đảm bảo input date có thể nhận click
            appointmentDateInput.style.pointerEvents = 'auto';
            appointmentDateInput.style.zIndex = '15';
            
            setTimeout(function() {
                if (appointmentDateInput.showPicker && typeof appointmentDateInput.showPicker === 'function') {
                    try {
                        appointmentDateInput.showPicker();
                    } catch (err) {
                        appointmentDateInput.click();
                    }
                } else {
                    appointmentDateInput.click();
                }
            }, 50);
        }
    });
    
    // Vẫn cho phép nhập thủ công nếu người dùng muốn (double-click hoặc nhập trực tiếp)
    let allowManualInput = false;
    
    appointmentDateDisplay.addEventListener('dblclick', function(e) {
        // Double-click để cho phép nhập thủ công
        allowManualInput = true;
        this.classList.add('manual-input-mode');
        appointmentDateInput.style.pointerEvents = 'none';
        appointmentDateInput.style.zIndex = '1';
        this.focus();
        if (this.value) {
            this.setSelectionRange(0, this.value.length);
        }
    });
    
    // Cho phép nhập bằng keyboard khi đã double-click
    appointmentDateDisplay.addEventListener('keydown', function(e) {
        if (!allowManualInput) {
            // Nếu chưa double-click, mở date picker
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                appointmentDateInput.focus();
                if (appointmentDateInput.showPicker && typeof appointmentDateInput.showPicker === 'function') {
                    try {
                        appointmentDateInput.showPicker();
                    } catch (err) {
                        appointmentDateInput.click();
                    }
                } else {
                    appointmentDateInput.click();
                }
                return;
            }
            // Cho phép các phím điều hướng và xóa
            const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Escape'];
            if (!allowedKeys.includes(e.key)) {
                e.preventDefault();
                // Mở date picker khi nhấn bất kỳ phím nào
                appointmentDateInput.focus();
                if (appointmentDateInput.showPicker && typeof appointmentDateInput.showPicker === 'function') {
                    try {
                        appointmentDateInput.showPicker();
                    } catch (err) {
                        appointmentDateInput.click();
                    }
                } else {
                    appointmentDateInput.click();
                }
                return;
            }
        } else {
            // Đã double-click, cho phép nhập bình thường
            appointmentDateInput.style.pointerEvents = 'none';
            appointmentDateInput.style.zIndex = '1';
            
            const allowedKeys = [
                'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
                'Home', 'End', 'Tab', 'Enter'
            ];
            
            if (e.ctrlKey || e.metaKey) {
                return true;
            }
            
            if (allowedKeys.includes(e.key) || /^\d$/.test(e.key)) {
                return true;
            }
            
            e.preventDefault();
        }
    });
    
    // Reset flag khi blur
    appointmentDateDisplay.addEventListener('blur', function() {
        allowManualInput = false;
        this.classList.remove('manual-input-mode');
        appointmentDateInput.style.pointerEvents = 'auto';
        appointmentDateInput.style.zIndex = '10';
    });
    
    // Xử lý nhập thủ công với format tự động
    appointmentDateDisplay.addEventListener('input', function(e) {
        // Đảm bảo input date không can thiệp khi đang nhập
        appointmentDateInput.style.pointerEvents = 'none';
        appointmentDateInput.style.zIndex = '1';
        
        let value = e.target.value.replace(/\D/g, '');
        
        // Xử lý khi xóa hết
        if (value.length === 0) {
            e.target.value = '';
            appointmentDateInput.value = '';
            e.target.setCustomValidity('');
            return;
        }
        
        // Lưu vị trí cursor trước khi format
        const cursorPos = e.target.selectionStart;
        
        // Format tự động: dd/mm/yyyy
        let formatted = value;
        if (value.length > 2) {
            formatted = value.substring(0, 2) + '/' + value.substring(2);
        }
        if (value.length > 4) {
            formatted = formatted.substring(0, 5) + '/' + formatted.substring(5, 9);
        }
        // Giới hạn độ dài
        if (formatted.length > 10) {
            formatted = formatted.substring(0, 10);
        }
        
        // Tính toán vị trí cursor mới sau khi format
        let newCursorPos = cursorPos;
        if (value.length > 2 && cursorPos > 2) {
            newCursorPos++;
        }
        if (value.length > 4 && cursorPos > 4) {
            newCursorPos++;
        }
        
        e.target.value = formatted;
        
        // Khôi phục vị trí cursor
        setTimeout(() => {
            e.target.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
        
        // Validate và cập nhật input date khi đủ 10 ký tự
        if (formatted.length === 10) {
            const formattedDate = formatDateToYYYYMMDD(formatted);
            const date = new Date(formattedDate);
            const [day, month, year] = formatted.split('/');
            
            // Validate ngày hợp lệ
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const selectedDate = new Date(formattedDate);
            selectedDate.setHours(0, 0, 0, 0);
            
            if (!isNaN(date.getTime()) && 
                parseInt(day) >= 1 && parseInt(day) <= 31 &&
                parseInt(month) >= 1 && parseInt(month) <= 12 &&
                parseInt(year) >= 1900) {
                // Kiểm tra ngày không được nhỏ hơn hôm nay
                if (selectedDate < today) {
                    e.target.setCustomValidity('Ngày hẹn không được nhỏ hơn ngày hôm nay. Vui lòng chọn ngày từ hôm nay trở đi.');
                } else {
                    appointmentDateInput.value = formattedDate;
                    e.target.setCustomValidity('');
                }
            } else {
                e.target.setCustomValidity('Ngày không hợp lệ. Vui lòng nhập theo định dạng Ngày/Tháng/Năm');
            }
        } else {
            appointmentDateInput.value = '';
            e.target.setCustomValidity('');
        }
    });
    
    // Validate khi blur
    appointmentDateDisplay.addEventListener('blur', function(e) {
        const value = e.target.value.trim();
        if (!value || value.length === 0) {
            e.target.setCustomValidity('');
            appointmentDateInput.value = '';
            return;
        }
        
        if (value.length === 10) {
            const formattedDate = formatDateToYYYYMMDD(value);
            const date = new Date(formattedDate);
            const [day, month, year] = value.split('/');
            
            if (isNaN(date.getTime()) || 
                parseInt(day) < 1 || parseInt(day) > 31 ||
                parseInt(month) < 1 || parseInt(month) > 12 ||
                parseInt(year) < 1900) {
                e.target.setCustomValidity('Ngày không hợp lệ. Vui lòng nhập theo định dạng Ngày/Tháng/Năm');
            } else {
                // Kiểm tra ngày không được nhỏ hơn hôm nay
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const selectedDate = new Date(formattedDate);
                selectedDate.setHours(0, 0, 0, 0);
                
                if (selectedDate < today) {
                    e.target.setCustomValidity('Ngày hẹn không được nhỏ hơn ngày hôm nay. Vui lòng chọn ngày từ hôm nay trở đi.');
                } else {
                    e.target.setCustomValidity('');
                    appointmentDateInput.value = formattedDate;
                }
            }
        } else {
            e.target.setCustomValidity('Vui lòng nhập đầy đủ theo định dạng Ngày/Tháng/Năm');
        }
    });
}

// Xử lý select thời gian (đã thay đổi từ input time sang select dropdown) - sẽ được gọi trong DOMContentLoaded
function initAppointmentTimeSelect() {
    const appointmentTimeSelect = document.getElementById('appointmentTime');
    if (appointmentTimeSelect && appointmentTimeSelect.tagName === 'SELECT') {
        // Select dropdown không cần validation thêm vì các giá trị đã được định nghĩa sẵn
        appointmentTimeSelect.addEventListener('change', function() {
            if (this.value) {
                this.setCustomValidity('');
            }
        });
    }
}

// Xử lý logo
function initLogo() {
    const logoImg = document.querySelector('.logo');
    const logoPlaceholder = document.getElementById('logoPlaceholder');
    
    if (logoImg) {
        // Kiểm tra nếu logo không tải được
        logoImg.addEventListener('error', function() {
            this.style.display = 'none';
            if (logoPlaceholder) {
                logoPlaceholder.style.display = 'flex';
            }
        });
        
        // Nếu logo tải thành công
        logoImg.addEventListener('load', function() {
            this.classList.add('loaded');
            if (logoPlaceholder) {
                logoPlaceholder.style.display = 'none';
            }
        });
        
        // Kiểm tra ngay khi DOM ready
        if (!logoImg.complete || logoImg.naturalHeight === 0) {
            // Logo chưa tải hoặc lỗi
            if (logoPlaceholder) {
                logoPlaceholder.style.display = 'flex';
            }
        }
    } else if (logoPlaceholder) {
        // Không có thẻ img, hiển thị placeholder
        logoPlaceholder.style.display = 'flex';
    }
}

// Theme Management
const themes = {
    brown: {
        primary: '#8B4513',
        hover: '#A0522D',
        light: '#F5E6D3'
    },
    blue: {
        primary: '#0066cc',
        hover: '#0052a3',
        light: '#E6F2FF'
    },
    red: {
        primary: '#DC143C',
        hover: '#B22222',
        light: '#FFE6E6'
    },
    green: {
        primary: '#228B22',
        hover: '#1E7E1E',
        light: '#E6F5E6'
    },
    purple: {
        primary: '#6A5ACD',
        hover: '#5A4ABD',
        light: '#E6E6F5'
    }
};

// Áp dụng theme
function applyTheme(themeName) {
    const theme = themes[themeName];
    if (!theme) return;
    
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-hover', theme.hover);
    root.style.setProperty('--theme-light', theme.light);
    
    // Cập nhật các phần tử có màu chủ đạo
    document.querySelectorAll('.top-header, .main-nav, .btn-primary, .btn-register, .btn-search').forEach(el => {
        el.style.background = theme.primary;
    });
    
    document.querySelectorAll('.top-header:hover, .main-nav .nav-link:hover, .btn-primary:hover, .btn-register:hover, .btn-search:hover').forEach(el => {
        el.style.background = theme.hover;
    });
    
    document.querySelectorAll('.section-card-header, .category-title, .section-card-title, .search-title, .logo-main-text, .logo-tagline, .logo-placeholder-text, .appointment-item-title').forEach(el => {
        el.style.color = theme.primary;
        el.style.borderColor = theme.primary;
    });
    
    document.querySelectorAll('.logo-styled-c svg path, .logo-styled-c svg line').forEach(el => {
        el.style.stroke = theme.primary;
    });
    
    // Cập nhật màu logo text
    document.querySelectorAll('.logo-main-text, .logo-tagline').forEach(el => {
        el.style.color = theme.primary;
    });
    
    document.querySelectorAll('.btn-login, .theme-toggle').forEach(el => {
        el.style.borderColor = theme.primary;
        el.style.color = theme.primary;
    });
    
    document.querySelectorAll('.btn-login:hover, .theme-toggle:hover').forEach(el => {
        el.style.background = theme.light;
    });
    
    document.querySelectorAll('.category-link:hover, .submenu a:hover').forEach(el => {
        el.style.background = theme.light;
        el.style.color = theme.primary;
        el.style.borderLeftColor = theme.primary;
    });
    
    document.querySelectorAll('.appointment-item, .appointment-item-purpose').forEach(el => {
        el.style.borderLeftColor = theme.primary;
    });
    
    document.querySelectorAll('.form-group input:focus, .form-group select:focus, .form-group textarea:focus').forEach(el => {
        el.style.borderColor = theme.primary;
        el.style.boxShadow = `0 0 0 2px ${theme.light}`;
    });
    
    // Lưu theme vào localStorage
    localStorage.setItem('selectedTheme', themeName);
}

// Khởi tạo theme selector
function initThemeSelector() {
    const themeToggle = document.getElementById('themeToggle');
    const themeMenu = document.getElementById('themeMenu');
    const themeOptions = document.querySelectorAll('.theme-option');
    
    if (!themeToggle || !themeMenu) return;
    
    // Toggle menu
    themeToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        themeMenu.classList.toggle('show');
    });
    
    // Đóng menu khi click bên ngoài
    document.addEventListener('click', function(e) {
        if (!themeMenu.contains(e.target) && !themeToggle.contains(e.target)) {
            themeMenu.classList.remove('show');
        }
    });
    
    // Chọn theme
    themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            const themeName = this.getAttribute('data-theme');
            applyTheme(themeName);
            themeMenu.classList.remove('show');
            
            // Highlight option được chọn
            themeOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Load theme đã lưu
    const savedTheme = localStorage.getItem('selectedTheme') || 'brown';
    applyTheme(savedTheme);
    
    // Highlight theme đã chọn
    themeOptions.forEach(option => {
        if (option.getAttribute('data-theme') === savedTheme) {
            option.classList.add('active');
        }
    });
}

// Dữ liệu Tỉnh/Thành phố và địa giới hành chính
const provincesData = {
    'ha-noi': {
        name: 'Hà Nội',
        districts: {
            'ba-dinh': { name: 'Ba Đình', wards: ['Phúc Xá', 'Trúc Bạch', 'Vĩnh Phúc', 'Cống Vị', 'Liễu Giai', 'Nguyễn Trung Trực', 'Quán Thánh', 'Ngọc Hà', 'Điện Biên', 'Đội Cấn', 'Ngọc Khánh', 'Kim Mã', 'Giảng Võ', 'Thành Công'] },
            'hoan-kiem': { name: 'Hoàn Kiếm', wards: ['Phúc Tân', 'Đồng Xuân', 'Hàng Mã', 'Hàng Buồm', 'Hàng Đào', 'Hàng Bồ', 'Cửa Đông', 'Lý Thái Tổ', 'Hàng Bạc', 'Hàng Gai', 'Chương Dương', 'Hàng Trống', 'Cửa Nam', 'Hàng Bông', 'Hàng Đào', 'Phan Chu Trinh', 'Tràng Tiền'] },
            'dong-da': { name: 'Đống Đa', wards: ['Cát Linh', 'Văn Miếu', 'Quốc Tử Giám', 'Láng Thượng', 'Ô Chợ Dừa', 'Văn Chương', 'Hàng Bột', 'Láng Hạ', 'Khâm Thiên', 'Thổ Quan', 'Nam Đồng', 'Trung Phụng', 'Quang Trung', 'Trung Liệt', 'Phương Liên', 'Thịnh Quang', 'Trung Tự', 'Kim Liên', 'Phương Mai', 'Ngã Tư Sở', 'Khương Thượng'] },
            'hai-ba-trung': { name: 'Hai Bà Trưng', wards: ['Nguyễn Du', 'Bạch Đằng', 'Phạm Đình Hổ', 'Lê Đại Hành', 'Đồng Nhân', 'Phố Huế', 'Đống Mác', 'Thanh Lương', 'Thanh Nhàn', 'Cầu Dền', 'Bách Khoa', 'Đồng Tâm', 'Vĩnh Tuy', 'Bạch Mai', 'Quỳnh Mai', 'Quỳnh Lôi', 'Minh Khai', 'Trương Định'] },
            'hoang-mai': { name: 'Hoàng Mai', wards: ['Giáp Bát', 'Vĩnh Hưng', 'Định Công', 'Mai Động', 'Tương Mai', 'Đại Kim', 'Tân Mai', 'Hoàng Văn Thụ', 'Giáp Bát', 'Lĩnh Nam', 'Thịnh Liệt', 'Trần Phú', 'Yên Sở', 'Vĩnh Tuy'] },
            'thanh-xuan': { name: 'Thanh Xuân', wards: ['Khương Đình', 'Khương Mai', 'Thanh Xuân Bắc', 'Thanh Xuân Nam', 'Thanh Xuân Trung', 'Kim Giang', 'Nguyễn Trãi', 'Phương Liệt'] },
            'long-bien': { name: 'Long Biên', wards: ['Ngọc Lâm', 'Phúc Lợi', 'Bồ Đề', 'Sài Đồng', 'Long Biên', 'Thạch Bàn', 'Phúc Đồng', 'Cự Khối', 'Gia Thụy', 'Ngọc Thụy', 'Việt Hưng', 'Đức Giang', 'Giang Biên', 'Đông Xuân', 'Cầu Đức', 'Thượng Thanh', 'Ngọc Thụy'] },
            'nam-tu-liem': { name: 'Nam Từ Liêm', wards: ['Cầu Diễn', 'Xuân Phương', 'Phương Canh', 'Mỹ Đình 1', 'Mỹ Đình 2', 'Tây Mỗ', 'Mễ Trì', 'Phú Đô', 'Đại Mỗ', 'Trung Văn'] },
            'bac-tu-liem': { name: 'Bắc Từ Liêm', wards: ['Cổ Nhuế 1', 'Cổ Nhuế 2', 'Xuân Đỉnh', 'Phúc Diễn', 'Xuân Tảo', 'Quan Hoa', 'Yên Hoà', 'Liên Mạc', 'Đông Ngạc', 'Đức Thắng', 'Thượng Cát', 'Láng Thượng', 'Tây Tựu', 'Minh Khai', 'Cổ Nhuế', 'Phú Diễn', 'Phúc Xá'] }
        },
        departments: ['Sở Nội vụ', 'Sở Tài chính', 'Sở Kế hoạch và Đầu tư', 'Sở Tư pháp', 'Sở Y tế', 'Sở Giáo dục và Đào tạo', 'Sở Lao động - Thương binh và Xã hội', 'Sở Văn hóa và Thể thao', 'Sở Thông tin và Truyền thông', 'Sở Khoa học và Công nghệ', 'Sở Tài nguyên và Môi trường', 'Sở Giao thông Vận tải', 'Sở Xây dựng', 'Sở Công Thương', 'Sở Nông nghiệp và Phát triển nông thôn']
    },
    'ho-chi-minh': {
        name: 'Hồ Chí Minh',
        districts: {
            'quan-1': { name: 'Quận 1', wards: ['Bến Nghé', 'Bến Thành', 'Cầu Kho', 'Cầu Ông Lãnh', 'Cô Giang', 'Đa Kao', 'Nguyễn Cư Trinh', 'Nguyễn Thái Bình', 'Phạm Ngũ Lão', 'Tân Định', 'Đa Kao', 'Bến Nghé', 'Cầu Ông Lãnh'] },
            'quan-2': { name: 'Quận 2', wards: ['An Phú', 'An Khánh', 'Bình An', 'Bình Khánh', 'Bình Trưng Đông', 'Bình Trưng Tây', 'Bình Xuân', 'Cát Lái', 'Thạnh Mỹ Lợi', 'Thảo Điền', 'Thủ Thiêm'] },
            'quan-3': { name: 'Quận 3', wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14'] },
            'quan-4': { name: 'Quận 4', wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 16', 'Phường 18'] },
            'quan-5': { name: 'Quận 5', wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15'] },
            'quan-6': { name: 'Quận 6', wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14'] },
            'quan-7': { name: 'Quận 7', wards: ['Bình Thuận', 'Phú Mỹ', 'Phú Thuận', 'Tân Hưng', 'Tân Kiểng', 'Tân Phong', 'Tân Phú', 'Tân Quy', 'Tân Quy Đông', 'Tân Thuận Đông', 'Tân Thuận Tây'] },
            'quan-8': { name: 'Quận 8', wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 16'] },
            'quan-9': { name: 'Quận 9', wards: ['Hiệp Phú', 'Long Bình', 'Long Phước', 'Long Thạnh Mỹ', 'Long Trường', 'Phú Hữu', 'Phước Bình', 'Phước Long A', 'Phước Long B', 'Tân Phú', 'Tăng Nhơn Phú A', 'Tăng Nhơn Phú B', 'Trường Thạnh'] },
            'quan-10': { name: 'Quận 10', wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15'] },
            'quan-11': { name: 'Quận 11', wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 16'] },
            'quan-12': { name: 'Quận 12', wards: ['An Phú Đông', 'Đông Hưng Thuận', 'Hiệp Thành', 'Tân Chánh Hiệp', 'Tân Hưng Thuận', 'Tân Thới Hiệp', 'Tân Thới Nhất', 'Thạnh Lộc', 'Thạnh Xuân', 'Thới An', 'Trung Mỹ Tây'] },
            'binh-thanh': { name: 'Bình Thạnh', wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 17', 'Phường 19', 'Phường 21', 'Phường 22', 'Phường 24', 'Phường 25', 'Phường 26', 'Phường 27', 'Phường 28'] },
            'tan-binh': { name: 'Tân Bình', wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15'] },
            'tan-phu': { name: 'Tân Phú', wards: ['Phường Hiệp Tân', 'Phường Hòa Thạnh', 'Phường Phú Thạnh', 'Phường Phú Thọ Hòa', 'Phường Phú Trung', 'Phường Sơn Kỳ', 'Phường Tân Quý', 'Phường Tân Sơn Nhì', 'Phường Tân Thành', 'Phường Tân Thới Hòa', 'Phường Tây Thạnh'] },
            'phu-nhuan': { name: 'Phú Nhuận', wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 17'] },
            'thu-duc': { name: 'Thủ Đức', wards: ['Bình Chiểu', 'Bình Thọ', 'Hiệp Bình Chánh', 'Hiệp Bình Phước', 'Linh Chiểu', 'Linh Đông', 'Linh Tây', 'Linh Trung', 'Linh Xuân', 'Tam Bình', 'Tam Phú', 'Trường Thọ'] },
            'go-vap': { name: 'Gò Vấp', wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 16', 'Phường 17'] },
            'binh-tan': { name: 'Bình Tân', wards: ['An Lạc', 'An Lạc A', 'Bình Hưng Hòa', 'Bình Hưng Hòa A', 'Bình Hưng Hòa B', 'Bình Trị Đông', 'Bình Trị Đông A', 'Bình Trị Đông B', 'Tân Tạo', 'Tân Tạo A'] },
            'hoc-mon': { name: 'Hóc Môn', wards: ['Bà Điểm', 'Đông Thạnh', 'Nhị Bình', 'Tân Hiệp', 'Tân Thới Nhì', 'Tân Xuân', 'Thới Tam Thôn', 'Trung Chánh', 'Xuân Thới Đông', 'Xuân Thới Sơn', 'Xuân Thới Thượng'] },
            'cu-chi': { name: 'Củ Chi', wards: ['An Nhơn Tây', 'An Phú', 'Bình Mỹ', 'Củ Chi', 'Hòa Phú', 'Nhuận Đức', 'Phạm Văn Cội', 'Phú Hòa Đông', 'Phú Mỹ Hưng', 'Phước Hiệp', 'Phước Thạnh', 'Phước Vĩnh An', 'Tân An Hội', 'Tân Phú Trung', 'Tân Thạnh Đông', 'Tân Thạnh Tây', 'Tân Thông Hội', 'Thái Mỹ', 'Trung An', 'Trung Lập Hạ', 'Trung Lập Thượng'] },
            'can-gio': { name: 'Cần Giờ', wards: ['An Thới Đông', 'Bình Khánh', 'Cần Thạnh', 'Đông Thạnh', 'Long Hòa', 'Lý Nhơn', 'Tam Thôn Hiệp', 'Thạnh An'] },
            'nha-be': { name: 'Nhà Bè', wards: ['Hiệp Phước', 'Long Thới', 'Nhà Bè', 'Phước Kiển', 'Phước Lộc', 'Phú Xuân'] }
        },
        departments: ['Sở Nội vụ', 'Sở Tài chính', 'Sở Kế hoạch và Đầu tư', 'Sở Tư pháp', 'Sở Y tế', 'Sở Giáo dục và Đào tạo', 'Sở Lao động - Thương binh và Xã hội', 'Sở Văn hóa và Thể thao', 'Sở Thông tin và Truyền thông', 'Sở Khoa học và Công nghệ', 'Sở Tài nguyên và Môi trường', 'Sở Giao thông Vận tải', 'Sở Xây dựng', 'Sở Công Thương', 'Sở Nông nghiệp và Phát triển nông thôn', 'Sở Du lịch', 'Sở Quy hoạch - Kiến trúc']
    },
    'da-nang': {
        name: 'Đà Nẵng',
        districts: {
            'hai-chau': { name: 'Hải Châu', wards: ['Bình Hiên', 'Bình Thuận', 'Hải Châu I', 'Hải Châu II', 'Hòa Cường Bắc', 'Hòa Cường Nam', 'Hòa Thuận Đông', 'Hòa Thuận Tây', 'Nam Dương', 'Phước Ninh', 'Thạch Thang', 'Thanh Bình', 'Thuận Phước'] },
            'thanh-khe': { name: 'Thanh Khê', wards: ['An Khê', 'Chính Gián', 'Hòa Khê', 'Tam Thuận', 'Tân Chính', 'Thạc Gián', 'Thanh Khê Đông', 'Thanh Khê Tây', 'Vĩnh Trung', 'Xuân Hà'] },
            'son-tra': { name: 'Sơn Trà', wards: ['An Hải Bắc', 'An Hải Đông', 'An Hải Tây', 'Mân Thái', 'Nại Hiên Đông', 'Phước Mỹ', 'Thọ Quang'] },
            'ngu-hanh-son': { name: 'Ngũ Hành Sơn', wards: ['Hòa Hải', 'Hòa Quý', 'Khuê Mỹ', 'Mỹ An'] },
            'lien-chieu': { name: 'Liên Chiểu', wards: ['Hòa Hiệp Bắc', 'Hòa Hiệp Nam', 'Hòa Khánh Bắc', 'Hòa Khánh Nam', 'Hòa Minh'] },
            'cam-le': { name: 'Cẩm Lệ', wards: ['Hòa An', 'Hòa Phát', 'Hòa Thọ Đông', 'Hòa Thọ Tây', 'Hòa Xuân', 'Khuê Trung'] },
            'hoa-vang': { name: 'Hòa Vang', wards: ['Hòa Bắc', 'Hòa Châu', 'Hòa Khương', 'Hòa Liên', 'Hòa Ninh', 'Hòa Phong', 'Hòa Phú', 'Hòa Phước', 'Hòa Sơn', 'Hòa Tiến'] },
            'hoang-sa': { name: 'Hoàng Sa', wards: [] }
        },
        departments: ['Sở Nội vụ', 'Sở Tài chính', 'Sở Kế hoạch và Đầu tư', 'Sở Tư pháp', 'Sở Y tế', 'Sở Giáo dục và Đào tạo', 'Sở Lao động - Thương binh và Xã hội', 'Sở Văn hóa và Thể thao', 'Sở Thông tin và Truyền thông', 'Sở Khoa học và Công nghệ', 'Sở Tài nguyên và Môi trường', 'Sở Giao thông Vận tải', 'Sở Xây dựng', 'Sở Công Thương', 'Sở Nông nghiệp và Phát triển nông thôn', 'Sở Du lịch']
    },
    'can-tho': {
        name: 'Cần Thơ',
        districts: {
            'ninh-kieu': { name: 'Ninh Kiều', wards: ['An Hòa', 'An Khánh', 'An Nghiệp', 'An Phú', 'An Thới', 'Bùi Hữu Nghĩa', 'Hưng Lợi', 'Long Hòa', 'Long Tuyền', 'Tân An', 'Thới Bình', 'Trà An', 'Trà Nóc'] },
            'o-mon': { name: 'Ô Môn', wards: ['Châu Văn Liêm', 'Long Hưng', 'Phước Thới', 'Thới An', 'Thới Hòa', 'Thới Long', 'Trường Lạc'] },
            'binh-thuy': { name: 'Bình Thủy', wards: ['An Thới', 'Bình Thủy', 'Bùi Hữu Nghĩa', 'Long Hòa', 'Long Tuyền', 'Thới An Đông', 'Trà An', 'Trà Nóc'] },
            'cai-rang': { name: 'Cái Răng', wards: ['Ba Láng', 'Hưng Phú', 'Hưng Thạnh', 'Lê Bình', 'Phú Thứ', 'Tân Phú', 'Thường Thạnh'] },
            'thot-not': { name: 'Thốt Nốt', wards: ['Tân Hưng', 'Tân Lộc', 'Thạnh Hòa', 'Thạnh Lộc', 'Thuận An', 'Thuận Hưng', 'Trung Kiên', 'Trung Nhứt', 'Thốt Nốt', 'Vĩnh Bình'] },
            'vinh-thanh': { name: 'Vĩnh Thạnh', wards: ['Thạnh An', 'Thạnh Lộc', 'Thạnh Lợi', 'Thạnh Mỹ', 'Thạnh Quới', 'Thạnh Thắng', 'Thạnh Tiến', 'Vĩnh Bình', 'Vĩnh Trinh'] },
            'co-do': { name: 'Cờ Đỏ', wards: ['Đông Hiệp', 'Đông Thắng', 'Thạnh Phú', 'Thới Đông', 'Thới Hưng', 'Thới Xuân', 'Trung An', 'Trung Hưng', 'Trung Thạnh'] },
            'phong-dien': { name: 'Phong Điền', wards: ['Giai Xuân', 'Mỹ Khánh', 'Nhơn Ái', 'Nhơn Nghĩa', 'Tân Thới', 'Trường Long'] },
            'thoi-lai': { name: 'Thới Lai', wards: ['Định Môn', 'Đông Bình', 'Đông Thuận', 'Tân Thạnh', 'Thới Tân', 'Thới Thạnh', 'Trường Thắng', 'Trường Thành', 'Trường Xuân', 'Xuân Thắng'] }
        },
        departments: ['Sở Nội vụ', 'Sở Tài chính', 'Sở Kế hoạch và Đầu tư', 'Sở Tư pháp', 'Sở Y tế', 'Sở Giáo dục và Đào tạo', 'Sở Lao động - Thương binh và Xã hội', 'Sở Văn hóa và Thể thao', 'Sở Thông tin và Truyền thông', 'Sở Khoa học và Công nghệ', 'Sở Tài nguyên và Môi trường', 'Sở Giao thông Vận tải', 'Sở Xây dựng', 'Sở Công Thương', 'Sở Nông nghiệp và Phát triển nông thôn']
    },
    'hai-phong': {
        name: 'Hải Phòng',
        districts: {
            'hong-bang': { name: 'Hồng Bàng', wards: ['Hạ Lý', 'Hoàng Văn Thụ', 'Hùng Vương', 'Minh Khai', 'Phạm Hồng Thái', 'Phan Bội Châu', 'Quán Toan', 'Quang Trung', 'Sở Dầu', 'Thượng Lý', 'Trại Chuối'] },
            'ngo-quyen': { name: 'Ngô Quyền', wards: ['Cầu Đất', 'Cầu Tre', 'Đằng Giang', 'Đông Khê', 'Đổng Quốc Bình', 'Gia Viên', 'Lạch Tray', 'Lạc Viên', 'Lê Lợi', 'Máy Chai', 'Máy Tơ', 'Vạn Mỹ'] },
            'le-chan': { name: 'Lê Chân', wards: ['An Biên', 'An Dương', 'Cát Dài', 'Đông Hải', 'Dư Hàng', 'Dư Hàng Kênh', 'Hàng Kênh', 'Hồ Nam', 'Lam Sơn', 'Nghĩa Xá', 'Niệm Nghĩa', 'Trại Cau', 'Trần Nguyên Hãn', 'Vĩnh Niệm'] },
            'hai-an': { name: 'Hải An', wards: ['Cát Bi', 'Đằng Hải', 'Đông Hải 1', 'Đông Hải 2', 'Nam Hải', 'Tràng Cát'] },
            'kien-an': { name: 'Kiến An', wards: ['Bắc Sơn', 'Đồng Hòa', 'Lãm Hà', 'Nam Sơn', 'Ngọc Sơn', 'Phù Liễn', 'Quán Trữ', 'Trần Thành Ngọ', 'Tràng Minh', 'Văn Đẩu'] },
            'do-son': { name: 'Đồ Sơn', wards: ['Bàng La', 'Hợp Đức', 'Minh Đức', 'Ngọc Xuyên', 'Vạn Hương', 'Vạn Sơn'] },
            'duong-kinh': { name: 'Dương Kinh', wards: ['Anh Dũng', 'Đa Phúc', 'Hải Thành', 'Hòa Nghĩa', 'Hưng Đạo', 'Tân Thành'] },
            'thuy-nguyen': { name: 'Thủy Nguyên', wards: ['An Lư', 'An Sơn', 'Cao Nhân', 'Chính Mỹ', 'Đông Sơn', 'Dương Quan', 'Gia Đức', 'Gia Minh', 'Hoa Động', 'Hoàng Động', 'Hợp Thành', 'Kênh Giang', 'Kiền Bái', 'Lâm Động', 'Lập Lễ', 'Liên Khê', 'Lưu Kiếm', 'Lưu Kỳ', 'Minh Tân', 'Mỹ Đồng', 'Ngũ Lão', 'Phả Lễ', 'Phù Ninh', 'Phục Lễ', 'Quảng Thanh', 'Tam Hưng', 'Tân Dương', 'Thiên Hương', 'Thủy Đường', 'Thủy Sơn', 'Thủy Triều', 'Trung Hà'] },
            'an-lao': { name: 'An Lão', wards: ['An Thái', 'An Thắng', 'An Thọ', 'An Tiến', 'Bát Trang', 'Chiến Thắng', 'Đồng Thái', 'Hồng Phong', 'Hồng Thái', 'Lê Lợi', 'Lê Thiện', 'Mỹ Đức', 'Quang Hưng', 'Quang Trung', 'Quốc Tuấn', 'Tân Dân', 'Tân Viên', 'Thái Sơn', 'Trường Sơn', 'Trường Thành', 'Trường Thọ'] },
            'kien-thuy': { name: 'Kiến Thụy', wards: ['Đại Đồng', 'Đại Hà', 'Đại Hợp', 'Đoàn Xá', 'Đông Phương', 'Du Lễ', 'Hữu Bằng', 'Kiến Quốc', 'Minh Tân', 'Ngũ Đoan', 'Ngũ Phúc', 'Tân Phong', 'Tân Trào', 'Thanh Sơn', 'Thuận Thiên', 'Thụy Hương', 'Tú Sơn'] },
            'tien-lang': { name: 'Tiên Lãng', wards: ['Bắc Hưng', 'Bạch Đằng', 'Cấp Tiến', 'Đại Thắng', 'Đoàn Lập', 'Đông Hưng', 'Hùng Thắng', 'Khởi Nghĩa', 'Kiến Thiết', 'Nam Hưng', 'Quang Phục', 'Quyết Tiến', 'Tây Hưng', 'Tiên Cường', 'Tiên Minh', 'Tiên Thanh', 'Tiên Thắng', 'Tiên Tiến', 'Toàn Thắng', 'Tự Cường', 'Vinh Quang'] },
            'vinh-bao': { name: 'Vĩnh Bảo', wards: ['An Hòa', 'Cao Minh', 'Cổ Am', 'Cộng Hiền', 'Đồng Minh', 'Dũng Tiến', 'Giang Biên', 'Hiệp Hòa', 'Hòa Bình', 'Hưng Nhân', 'Hùng Tiến', 'Liên Am', 'Lý Học', 'Nhân Hòa', 'Tam Cường', 'Tam Đa', 'Tân Hưng', 'Tân Liên', 'Thắng Thủy', 'Thanh Lương', 'Tiền Phong', 'Trấn Dương', 'Trung Lập', 'Việt Tiến', 'Vĩnh An', 'Vĩnh Long', 'Vĩnh Phong', 'Vinh Quang', 'Vĩnh Tiến'] },
            'cat-hai': { name: 'Cát Hải', wards: ['Cát Bà', 'Cát Hải', 'Đồng Bài', 'Gia Luận', 'Hiền Hào', 'Hoàng Châu', 'Nghĩa Lộ', 'Phù Long', 'Trân Châu', 'Việt Hải', 'Xuân Đám'] },
            'bach-long-vi': { name: 'Bạch Long Vĩ', wards: [] }
        },
        departments: ['Sở Nội vụ', 'Sở Tài chính', 'Sở Kế hoạch và Đầu tư', 'Sở Tư pháp', 'Sở Y tế', 'Sở Giáo dục và Đào tạo', 'Sở Lao động - Thương binh và Xã hội', 'Sở Văn hóa và Thể thao', 'Sở Thông tin và Truyền thông', 'Sở Khoa học và Công nghệ', 'Sở Tài nguyên và Môi trường', 'Sở Giao thông Vận tải', 'Sở Xây dựng', 'Sở Công Thương', 'Sở Nông nghiệp và Phát triển nông thôn']
    },
    'dong-nai': {
        name: 'Đồng Nai',
        districts: {
            'bien-hoa': { name: 'Biên Hòa', wards: ['An Bình', 'An Hòa', 'Bình Đa', 'Bửu Hòa', 'Bửu Long', 'Hố Nai', 'Hóa An', 'Long Bình', 'Long Bình Tân', 'Phước Tân', 'Quang Vinh', 'Quyết Thắng', 'Tam Hiệp', 'Tam Hòa', 'Tam Phước', 'Tân Biên', 'Tân Hạnh', 'Tân Hòa', 'Tân Hiệp', 'Tân Mai', 'Tân Phong', 'Tân Tiến', 'Tân Vạn', 'Thanh Bình', 'Thống Nhất', 'Trảng Dài', 'Trung Dũng'] },
            'long-khanh': { name: 'Long Khánh', wards: ['Bảo Vinh', 'Bàu Sen', 'Bàu Trâm', 'Bình Lộc', 'Hàng Gòn', 'Phú Bình', 'Suối Tre', 'Xuân An', 'Xuân Bình', 'Xuân Hòa', 'Xuân Lập', 'Xuân Tân', 'Xuân Thanh', 'Xuân Trung'] },
            'tan-phu': { name: 'Tân Phú', wards: ['Dak Lua', 'Nam Cát Tiên', 'Núi Tượng', 'Phú An', 'Phú Bình', 'Phú Điền', 'Phú Lâm', 'Phú Lập', 'Phú Lộc', 'Phú Sơn', 'Phú Thanh', 'Phú Thịnh', 'Phú Trung', 'Phú Xuân', 'Tà Lài', 'Thanh Sơn', 'Trà Cổ'] },
            'vinh-cu': { name: 'Vĩnh Cửu', wards: ['Bình Lợi', 'Đại Phước', 'Hiếu Liêm', 'Mã Đà', 'Phú Lý', 'Tân An', 'Tân Bình', 'Thạnh Phú', 'Thiện Tân', 'Vĩnh Tân'] },
            'dinh-quan': { name: 'Định Quán', wards: ['Định Quán', 'Gia Canh', 'La Ngà', 'Ngọc Định', 'Phú Cường', 'Phú Hòa', 'Phú Lợi', 'Phú Ngọc', 'Phú Tân', 'Phú Túc', 'Phú Vinh', 'Suối Nho', 'Túc Trưng'] },
            'thong-nhat': { name: 'Thống Nhất', wards: ['Bàu Hàm 2', 'Gia Kiệm', 'Gia Tân 1', 'Gia Tân 2', 'Gia Tân 3', 'Kiệm Tân', 'Quang Trung', 'Xuân Đông', 'Xuân Thiện'] },
            'cam-my': { name: 'Cẩm Mỹ', wards: ['Bảo Bình', 'Lâm San', 'Long Giao', 'Nhân Nghĩa', 'Sông Nhạn', 'Sông Ray', 'Thừa Đức', 'Xuân Bảo', 'Xuân Đông', 'Xuân Đường', 'Xuân Mỹ', 'Xuân Quế', 'Xuân Tây'] },
            'long-thanh': { name: 'Long Thành', wards: ['An Phước', 'Bàu Cạn', 'Bình An', 'Bình Sơn', 'Cẩm Đường', 'Lộc An', 'Long An', 'Long Đức', 'Long Phước', 'Phước Bình', 'Phước Thái', 'Suối Trầu', 'Tam An', 'Tân Hiệp'] },
            'xuan-loc': { name: 'Xuân Lộc', wards: ['Bảo Hòa', 'Gia Ray', 'Suối Cao', 'Suối Cát', 'Xuân Bắc', 'Xuân Định', 'Xuân Hiệp', 'Xuân Hòa', 'Xuân Hưng', 'Xuân Phú', 'Xuân Tâm', 'Xuân Thành', 'Xuân Thọ', 'Xuân Trường'] },
            'nhon-trach': { name: 'Nhơn Trạch', wards: ['Đại Phước', 'Hiệp Phước', 'Long Tân', 'Long Thọ', 'Phú Đông', 'Phú Hội', 'Phú Hữu', 'Phú Thạnh', 'Phước An', 'Phước Khánh', 'Phước Thiền', 'Vĩnh Thanh'] }
        },
        departments: ['Sở Nội vụ', 'Sở Tài chính', 'Sở Kế hoạch và Đầu tư', 'Sở Tư pháp', 'Sở Y tế', 'Sở Giáo dục và Đào tạo', 'Sở Lao động - Thương binh và Xã hội', 'Sở Văn hóa và Thể thao', 'Sở Thông tin và Truyền thông', 'Sở Khoa học và Công nghệ', 'Sở Tài nguyên và Môi trường', 'Sở Giao thông Vận tải', 'Sở Xây dựng', 'Sở Công Thương', 'Sở Nông nghiệp và Phát triển nông thôn']
    },
    'binh-duong': {
        name: 'Bình Dương',
        districts: {
            'thu-dau-mot': { name: 'Thủ Dầu Một', wards: ['Chánh Mỹ', 'Chánh Nghĩa', 'Định Hòa', 'Hiệp An', 'Hiệp Thành', 'Hòa Phú', 'Phú Cường', 'Phú Hòa', 'Phú Lợi', 'Phú Mỹ', 'Phú Tân', 'Phú Thọ', 'Tân An', 'Tương Bình Hiệp'] },
            'dau-tieng': { name: 'Dầu Tiếng', wards: ['An Lập', 'Định An', 'Định Hiệp', 'Định Thành', 'Long Hòa', 'Long Tân', 'Minh Hòa', 'Minh Tân', 'Minh Thạnh', 'Thanh An', 'Thanh Tuyền'] },
            'ben-cat': { name: 'Bến Cát', wards: ['An Điền', 'An Tây', 'Chánh Phú Hòa', 'Hòa Lợi', 'Mỹ Phước', 'Phú An', 'Tân Định', 'Thới Hòa'] },
            'tan-uyen': { name: 'Tân Uyên', wards: ['Bạch Đằng', 'Bình Mỹ', 'Đất Cuốc', 'Hiếu Liêm', 'Lạc An', 'Tân Bình', 'Tân Định', 'Tân Lập', 'Tân Mỹ', 'Tân Phước Khánh', 'Thường Tân', 'Uyên Hưng', 'Vĩnh Tân'] },
            'di-an': { name: 'Dĩ An', wards: ['An Bình', 'An Thạnh', 'Bình An', 'Bình Thắng', 'Dĩ An', 'Đông Hòa', 'Tân Bình', 'Tân Đông Hiệp'] },
            'thuan-an': { name: 'Thuận An', wards: ['An Phú', 'An Sơn', 'An Thạnh', 'Bình Chuẩn', 'Bình Hòa', 'Bình Nhâm', 'Đông Hòa', 'Lái Thiêu', 'Tân Đông Hiệp', 'Vĩnh Phú'] },
            'bau-bang': { name: 'Bàu Bàng', wards: ['Cây Trường', 'Hưng Hòa', 'Lai Hưng', 'Lai Uyên', 'Long Nguyên', 'Tân Hưng', 'Trừ Văn Thố'] },
            'bac-tan-uyen': { name: 'Bắc Tân Uyên', wards: ['Bình Mỹ', 'Đất Cuốc', 'Hiếu Liêm', 'Lạc An', 'Tân Bình', 'Tân Định', 'Tân Lập', 'Tân Mỹ', 'Tân Phước Khánh', 'Thường Tân', 'Uyên Hưng', 'Vĩnh Tân'] }
        },
        departments: ['Sở Nội vụ', 'Sở Tài chính', 'Sở Kế hoạch và Đầu tư', 'Sở Tư pháp', 'Sở Y tế', 'Sở Giáo dục và Đào tạo', 'Sở Lao động - Thương binh và Xã hội', 'Sở Văn hóa và Thể thao', 'Sở Thông tin và Truyền thông', 'Sở Khoa học và Công nghệ', 'Sở Tài nguyên và Môi trường', 'Sở Giao thông Vận tải', 'Sở Xây dựng', 'Sở Công Thương', 'Sở Nông nghiệp và Phát triển nông thôn']
    },
    'an-giang': {
        name: 'An Giang',
        districts: {
            'long-xuyen': { name: 'Long Xuyên', wards: ['Bình Đức', 'Bình Khánh', 'Đông Xuyên', 'Mỹ Bình', 'Mỹ Hòa', 'Mỹ Hòa Hưng', 'Mỹ Long', 'Mỹ Phước', 'Mỹ Quý', 'Mỹ Thạnh', 'Mỹ Thới', 'Mỹ Xuyên', 'Tân An', 'Tân Mỹ'] },
            'chau-doc': { name: 'Châu Đốc', wards: ['Châu Phú A', 'Châu Phú B', 'Núi Sam', 'Vĩnh Mỹ', 'Vĩnh Ngươn', 'Vĩnh Tế'] },
            'an-phu': { name: 'An Phú', wards: ['Đa Phước', 'Khánh An', 'Khánh Bình', 'Nhơn Hội', 'Phú Hội', 'Phú Hữu', 'Phước Hưng', 'Quốc Thái', 'Vĩnh Hậu', 'Vĩnh Hội Đông', 'Vĩnh Lộc', 'Vĩnh Trường'] },
            'chau-phu': { name: 'Châu Phú', wards: ['Bình Chánh', 'Bình Long', 'Bình Mỹ', 'Bình Thủy', 'Cần Đăng', 'Hòa Bình Thạnh', 'Núi Voi', 'Tân Phú', 'Vĩnh Thạnh Trung'] },
            'chau-thanh': { name: 'Châu Thành', wards: ['An Châu', 'Bình Hòa', 'Bình Thạnh', 'Cần Đăng', 'Hòa Bình Thạnh', 'Hội An', 'Long Hưng A', 'Long Hưng B', 'Long Kiến', 'Long Thuận', 'Phú Thuận', 'Tân Hội', 'Tân Phú', 'Vĩnh Hòa', 'Vĩnh Phú'] },
            'cho-moi': { name: 'Chợ Mới', wards: ['Bình Phước Xuân', 'Hòa An', 'Hòa Bình', 'Hội An', 'Kiến An', 'Kiến Thành', 'Long Điền A', 'Long Điền B', 'Long Giang', 'Long Kiến', 'Long Mỹ', 'Mỹ An', 'Mỹ Hiệp', 'Mỹ Hội Đông', 'Nhơn Mỹ', 'Tấn Mỹ'] },
            'phu-tan': { name: 'Phú Tân', wards: ['Bình Thạnh Đông', 'Chợ Vàm', 'Hiệp Xương', 'Hòa Lạc', 'Long Hòa', 'Phú An', 'Phú Bình', 'Phú Hiệp', 'Phú Hưng', 'Phú Long', 'Phú Lâm', 'Phú Thạnh', 'Phú Thành', 'Phú Thọ', 'Phú Thuận', 'Phú Xuân', 'Tân Hòa', 'Tân Trung'] },
            'thoai-son': { name: 'Thoại Sơn', wards: ['An Bình', 'Bình Thành', 'Định Mỹ', 'Định Thành', 'Mỹ Phú Đông', 'Phú Thuận', 'Tây Phú', 'Thoại Giang', 'Vĩnh Phú', 'Vĩnh Trạch', 'Vọng Đông', 'Vọng Thê'] },
            'tri-ton': { name: 'Tri Tôn', wards: ['An Tức', 'Ba Chúc', 'Châu Lăng', 'Cô Tô', 'Lạc Quới', 'Lê Trì', 'Lương An Trà', 'Lương Phi', 'Núi Tô', 'Ô Lâm', 'Tà Đảnh', 'Tân Tuyến', 'Vĩnh Gia', 'Vĩnh Phước'] },
            'tinh-bien': { name: 'Tịnh Biên', wards: ['An Cư', 'An Hảo', 'An Nông', 'An Phú', 'Chi Lăng', 'Nhơn Hưng', 'Núi Voi', 'Tân Lập', 'Tân Lợi', 'Tân Lộc', 'Thới Sơn', 'Văn Giáo', 'Vĩnh Trung'] }
        },
        departments: ['Sở Nội vụ', 'Sở Tài chính', 'Sở Kế hoạch và Đầu tư', 'Sở Tư pháp', 'Sở Y tế', 'Sở Giáo dục và Đào tạo', 'Sở Lao động - Thương binh và Xã hội', 'Sở Văn hóa và Thể thao', 'Sở Thông tin và Truyền thông', 'Sở Khoa học và Công nghệ', 'Sở Tài nguyên và Môi trường', 'Sở Giao thông Vận tải', 'Sở Xây dựng', 'Sở Công Thương', 'Sở Nông nghiệp và Phát triển nông thôn']
    },
    'khanh-hoa': {
        name: 'Khánh Hòa',
        districts: {
            'nha-trang': { name: 'Nha Trang', wards: ['Lộc Thọ', 'Ngọc Hiệp', 'Phước Hải', 'Phước Hòa', 'Phước Long', 'Phước Tân', 'Phước Tiến', 'Phương Sài', 'Phương Sơn', 'Tân Lập', 'Vạn Thắng', 'Vạn Thạnh', 'Vĩnh Hải', 'Vĩnh Hòa', 'Vĩnh Nguyên', 'Vĩnh Phước', 'Vĩnh Thọ', 'Vĩnh Trường', 'Xương Huân'] },
            'cam-ranh': { name: 'Cam Ranh', wards: ['Ba Ngòi', 'Cam An Bắc', 'Cam An Nam', 'Cam Bình', 'Cam Đức', 'Cam Hải Đông', 'Cam Hải Tây', 'Cam Hòa', 'Cam Lập', 'Cam Linh', 'Cam Nghĩa', 'Cam Phú', 'Cam Phước Đông', 'Cam Phước Tây', 'Cam Phúc Bắc', 'Cam Phúc Nam', 'Cam Phúc Nam', 'Cam Ranh', 'Cam Thành Bắc', 'Cam Thành Nam', 'Cam Thịnh Đông', 'Cam Thịnh Tây', 'Cam Xuân Bắc', 'Cam Xuân Nam', 'Suối Tân', 'Suối Cát'] },
            'ninh-hoa': { name: 'Ninh Hòa', wards: ['Ninh Đa', 'Ninh Diêm', 'Ninh Đông', 'Ninh Giang', 'Ninh Hà', 'Ninh Hải', 'Ninh Hiệp', 'Ninh Ích', 'Ninh Lộc', 'Ninh Phú', 'Ninh Phước', 'Ninh Quang', 'Ninh Sim', 'Ninh Sơn', 'Ninh Tân', 'Ninh Tây', 'Ninh Thân', 'Ninh Thọ', 'Ninh Thượng', 'Ninh Trung', 'Ninh Vân', 'Ninh Xuân'] },
            'van-ninh': { name: 'Vạn Ninh', wards: ['Đại Lãnh', 'Vạn Bình', 'Vạn Giã', 'Vạn Hưng', 'Vạn Khánh', 'Vạn Long', 'Vạn Lương', 'Vạn Ninh', 'Vạn Phú', 'Vạn Phước', 'Vạn Thạnh', 'Vạn Thọ', 'Xuân Sơn'] },
            'khanh-vinh': { name: 'Khánh Vĩnh', wards: ['Cầu Bà', 'Khánh Bình', 'Khánh Đông', 'Khánh Hiệp', 'Khánh Nam', 'Khánh Phú', 'Khánh Thành', 'Khánh Thượng', 'Khánh Trung', 'Khánh Vĩnh', 'Liên Sang', 'Sơn Thái', 'Sông Cầu'] },
            'dien-khanh': { name: 'Diên Khánh', wards: ['Bình Lộc', 'Diên An', 'Diên Điền', 'Diên Đồng', 'Diên Hòa', 'Diên Khánh', 'Diên Lạc', 'Diên Lâm', 'Diên Phú', 'Diên Phước', 'Diên Sơn', 'Diên Tân', 'Diên Thạnh', 'Diên Thọ', 'Diên Toàn', 'Diên Xuân', 'Suối Hiệp', 'Suối Tiên'] },
            'khanh-son': { name: 'Khánh Sơn', wards: ['Ba Cụm Bắc', 'Ba Cụm Nam', 'Sơn Bình', 'Sơn Hiệp', 'Sơn Lâm', 'Sơn Trung', 'Thành Sơn', 'Tô Hạp'] },
            'truong-sa': { name: 'Trường Sa', wards: ['Đảo Trường Sa', 'Đảo Song Tử Tây', 'Đảo Sinh Tồn', 'Đảo Nam Yết'] }
        },
        departments: ['Sở Nội vụ', 'Sở Tài chính', 'Sở Kế hoạch và Đầu tư', 'Sở Tư pháp', 'Sở Y tế', 'Sở Giáo dục và Đào tạo', 'Sở Lao động - Thương binh và Xã hội', 'Sở Văn hóa và Thể thao', 'Sở Thông tin và Truyền thông', 'Sở Khoa học và Công nghệ', 'Sở Tài nguyên và Môi trường', 'Sở Giao thông Vận tải', 'Sở Xây dựng', 'Sở Công Thương', 'Sở Nông nghiệp và Phát triển nông thôn', 'Sở Du lịch']
    },
    'quang-ninh': {
        name: 'Quảng Ninh',
        districts: {
            'ha-long': { name: 'Hạ Long', wards: ['Bạch Đằng', 'Bãi Cháy', 'Cao Thắng', 'Cao Xanh', 'Đại Yên', 'Giếng Đáy', 'Hà Khánh', 'Hà Khẩu', 'Hà Lầm', 'Hà Phong', 'Hà Trung', 'Hà Tu', 'Hồng Gai', 'Hồng Hà', 'Hồng Hải', 'Hùng Thắng', 'Trần Hưng Đạo', 'Tuần Châu', 'Việt Hưng', 'Yết Kiêu'] },
            'mong-cai': { name: 'Móng Cái', wards: ['Bình Ngọc', 'Hải Hòa', 'Hải Yên', 'Hòa Lạc', 'Ka Long', 'Ninh Dương', 'Trà Cổ', 'Trần Phú'] },
            'cam-pha': { name: 'Cẩm Phả', wards: ['Cẩm Bình', 'Cẩm Đông', 'Cẩm Phú', 'Cẩm Sơn', 'Cẩm Tây', 'Cẩm Thạch', 'Cẩm Thành', 'Cẩm Thịnh', 'Cẩm Thuỷ', 'Cẩm Trung', 'Cửa Ông', 'Mông Dương', 'Quang Hanh'] },
            'uong-bi': { name: 'Uông Bí', wards: ['Bắc Sơn', 'Nam Khê', 'Phương Đông', 'Phương Nam', 'Quang Trung', 'Thanh Sơn', 'Thượng Yên Công', 'Trưng Vương', 'Vàng Danh', 'Yên Thanh'] },
            'binh-lieu': { name: 'Bình Liêu', wards: ['Đồng Tâm', 'Đồng Văn', 'Hoành Mô', 'Húc Động', 'Lục Hồn', 'Tình Húc', 'Vô Ngại'] },
            'tien-yen': { name: 'Tiên Yên', wards: ['Đại Dực', 'Đại Thành', 'Điền Xá', 'Đông Hải', 'Đông Ngũ', 'Đồng Rui', 'Hà Lâu', 'Hải Lạng', 'Phong Dụ', 'Tiên Lãng', 'Yên Than'] },
            'dam-ha': { name: 'Đầm Hà', wards: ['Đại Bình', 'Đầm Hà', 'Đồng Rui', 'Đông Hải', 'Quảng Lâm', 'Quảng Lợi', 'Quảng Tân', 'Tân Bình', 'Tân Lập'] },
            'hai-ha': { name: 'Hải Hà', wards: ['Cái Chiên', 'Đảo Cái Chiên', 'Đường Hoa', 'Quảng Chính', 'Quảng Điền', 'Quảng Đức', 'Quảng Hà', 'Quảng Long', 'Quảng Minh', 'Quảng Phong', 'Quảng Sơn', 'Quảng Thắng', 'Quảng Thành', 'Quảng Thịnh', 'Quảng Trung'] },
            'quang-yen': { name: 'Quảng Yên', wards: ['Cộng Hòa', 'Đông Mai', 'Hà An', 'Minh Thành', 'Nam Hòa', 'Phong Cốc', 'Phong Hải', 'Quảng Yên', 'Tân An', 'Yên Giang', 'Yên Hải'] },
            'co-to': { name: 'Cô Tô', wards: ['Cô Tô', 'Đồng Tiến', 'Thanh Lân'] },
            'van-don': { name: 'Vân Đồn', wards: ['Bản Sen', 'Bình Dân', 'Cái Rồng', 'Đài Xuyên', 'Đoàn Kết', 'Đông Xá', 'Hạ Long', 'Minh Châu', 'Ngọc Vừng', 'Quan Lạn', 'Thắng Lợi', 'Vạn Yên'] },
            'dong-tri': { name: 'Đông Triều', wards: ['An Sinh', 'Bình Dương', 'Bình Khê', 'Đông Triều', 'Đức Chính', 'Hoàng Quế', 'Hồng Phong', 'Hồng Thái Đông', 'Hồng Thái Tây', 'Hưng Đạo', 'Kim Sơn', 'Mạo Khê', 'Nguyễn Huệ', 'Tân Việt', 'Thủy An', 'Tràng An', 'Tràng Lương', 'Việt Dân', 'Xuân Sơn', 'Yên Đức', 'Yên Thọ'] },
            'quang-ha': { name: 'Quảng Hà', wards: ['Cẩm La', 'Đông Hải', 'Hải Đông', 'Hải Sơn', 'Hải Tân', 'Hải Tiến', 'Hải Xuân', 'Quảng Đức', 'Quảng Hà', 'Quảng Long', 'Quảng Minh', 'Quảng Phong', 'Quảng Sơn', 'Quảng Thắng', 'Quảng Thành', 'Quảng Thịnh', 'Quảng Trung', 'Tiến Tới', 'Trà Cổ'] },
            'hoanh-bo': { name: 'Hoành Bồ', wards: ['Bằng Cả', 'Dân Chủ', 'Đồng Lâm', 'Đồng Sơn', 'Hòa Bình', 'Kỳ Thượng', 'Lê Lợi', 'Quảng La', 'Sơn Dương', 'Tân Dân', 'Thống Nhất', 'Vũ Oai'] }
        },
        departments: ['Sở Nội vụ', 'Sở Tài chính', 'Sở Kế hoạch và Đầu tư', 'Sở Tư pháp', 'Sở Y tế', 'Sở Giáo dục và Đào tạo', 'Sở Lao động - Thương binh và Xã hội', 'Sở Văn hóa và Thể thao', 'Sở Thông tin và Truyền thông', 'Sở Khoa học và Công nghệ', 'Sở Tài nguyên và Môi trường', 'Sở Giao thông Vận tải', 'Sở Xây dựng', 'Sở Công Thương', 'Sở Nông nghiệp và Phát triển nông thôn', 'Sở Du lịch']
    },
    'thanh-hoa': {
        name: 'Thanh Hóa',
        districts: {
            'thanh-hoa': { name: 'Thanh Hóa', wards: ['An Hưng', 'Ba Đình', 'Điện Biên', 'Đông Cương', 'Đông Hải', 'Đông Hương', 'Đông Lĩnh', 'Đông Sơn', 'Đông Tân', 'Đông Thọ', 'Đông Vệ', 'Hàm Rồng', 'Lam Sơn', 'Nam Ngạn', 'Ngọc Trạo', 'Phú Sơn', 'Quảng Cát', 'Quảng Đông', 'Quảng Hưng', 'Quảng Phú', 'Quảng Tâm', 'Quảng Thắng', 'Quảng Thành', 'Quảng Thịnh', 'Tào Xuyên', 'Tân Sơn', 'Tây Hồ', 'Thiệu Dương', 'Thiệu Khánh', 'Thiệu Phú', 'Trường Thi'] },
            'bim-son': { name: 'Bỉm Sơn', wards: ['Ba Đình', 'Bắc Sơn', 'Đông Sơn', 'Lam Sơn', 'Ngọc Trạo', 'Phú Sơn', 'Quang Trung'] },
            'sam-son': { name: 'Sầm Sơn', wards: ['Bắc Sơn', 'Quảng Châu', 'Quảng Cư', 'Quảng Đại', 'Quảng Hùng', 'Quảng Minh', 'Quảng Thọ', 'Quảng Tiến', 'Quảng Vinh', 'Trung Sơn', 'Trường Lâm'] },
            'muong-lat': { name: 'Mường Lát', wards: ['Mường Chanh', 'Mường Lý', 'Nhi Sơn', 'Pù Nhi', 'Quang Chiểu', 'Tam Chung', 'Tén Tằn', 'Trung Lý'] },
            'quan-hoa': { name: 'Quan Hóa', wards: ['Hiền Chung', 'Hiền Kiệt', 'Hồi Xuân', 'Nam Động', 'Nam Tiến', 'Nam Xuân', 'Phú Lệ', 'Phú Nghiêm', 'Phú Sơn', 'Phú Thanh', 'Phú Xuân', 'Thành Sơn', 'Thiên Phủ', 'Trung Sơn', 'Trung Thành', 'Xuân Phú'] },
            'quan-son': { name: 'Quan Sơn', wards: ['Mường Mìn', 'Na Mèo', 'Sơn Điện', 'Sơn Hà', 'Sơn Lư', 'Sơn Thủy', 'Tam Lư', 'Tam Thanh', 'Trung Hạ', 'Trung Thượng', 'Trung Tiến', 'Trung Xuân'] },
            'muong-te': { name: 'Mường Tè', wards: ['Bum Nưa', 'Bum Tở', 'Ka Lăng', 'Kan Hồ', 'Mù Cả', 'Mường Tè', 'Nậm Khao', 'Nậm Manh', 'Nậm Nhùn', 'Nậm Pì', 'Pa Ủ', 'Pa Vệ Sử', 'Tá Bạ', 'Tà Tổng', 'Tủa Chùa', 'Vàng San'] },
            'ba-thuoc': { name: 'Bá Thước', wards: ['Ái Thượng', 'Ban Công', 'Cổ Lũng', 'Điền Hạ', 'Điền Hương', 'Điền Lư', 'Điền Quang', 'Điền Thượng', 'Điền Trung', 'Hạ Trung', 'Kỳ Tân', 'Lũng Cao', 'Lũng Niêm', 'Lương Điền', 'Lương Ngoại', 'Lương Nội', 'Lương Trung', 'Tân Lập', 'Thành Lâm', 'Thành Sơn', 'Thiết Kế', 'Thiết Ống', 'Văn Nho'] },
            'thuong-xuan': { name: 'Thường Xuân', wards: ['Bát Mọt', 'Luận Khê', 'Luận Thành', 'Lương Sơn', 'Ngọc Phụng', 'Tân Thành', 'Thọ Thanh', 'Thường Xuân', 'Vạn Xuân', 'Xuân Cao', 'Xuân Chinh', 'Xuân Dương', 'Xuân Lẹ', 'Xuân Lộc', 'Xuân Thắng'] },
            'nhu-xuan': { name: 'Như Xuân', wards: ['Bình Lương', 'Cát Văn', 'Hóa Quỳ', 'Tân Bình', 'Thanh Hòa', 'Thanh Lâm', 'Thanh Phong', 'Thanh Quân', 'Thanh Sơn', 'Thanh Xuân', 'Thượng Ninh', 'Xuân Bình', 'Xuân Hòa', 'Xuân Phú', 'Xuân Quang', 'Xuân Thái', 'Yên Cát', 'Yên Lễ'] },
            'nhu-thanh': { name: 'Như Thanh', wards: ['Bến Sung', 'Cán Khê', 'Hải Long', 'Hải Vân', 'Mậu Lâm', 'Phú Nhuận', 'Phúc Đường', 'Phượng Nghi', 'Thanh Kỳ', 'Thanh Tân', 'Xuân Du', 'Xuân Khang', 'Xuân Phúc', 'Xuân Thái', 'Xuân Vinh', 'Yên Lạc', 'Yên Thọ'] },
            'nong-cong': { name: 'Nông Cống', wards: ['Công Bình', 'Công Chính', 'Công Liêm', 'Hoàng Giang', 'Hoàng Sơn', 'Minh Khôi', 'Minh Nghĩa', 'Minh Tâm', 'Nông Cống', 'Tân Khang', 'Tân Phúc', 'Tân Thọ', 'Tế Lợi', 'Tế Nông', 'Tế Tân', 'Tế Thắng', 'Thăng Bình', 'Thăng Long', 'Thăng Thọ', 'Trung Chính', 'Trung Thành', 'Trung Ý', 'Trường Giang', 'Trường Minh', 'Trường Sơn', 'Trường Trung', 'Tượng Lĩnh', 'Tượng Sơn', 'Tượng Văn', 'Vạn Hòa', 'Vạn Thiện', 'Vạn Thắng', 'Vạn Thiện', 'Yên Mỹ'] }
        },
        departments: ['Sở Nội vụ', 'Sở Tài chính', 'Sở Kế hoạch và Đầu tư', 'Sở Tư pháp', 'Sở Y tế', 'Sở Giáo dục và Đào tạo', 'Sở Lao động - Thương binh và Xã hội', 'Sở Văn hóa và Thể thao', 'Sở Thông tin và Truyền thông', 'Sở Khoa học và Công nghệ', 'Sở Tài nguyên và Môi trường', 'Sở Giao thông Vận tải', 'Sở Xây dựng', 'Sở Công Thương', 'Sở Nông nghiệp và Phát triển nông thôn']
    },
    'nghe-an': {
        name: 'Nghệ An',
        districts: {
            'vinh': { name: 'Vinh', wards: ['Bến Thủy', 'Cửa Nam', 'Đội Cung', 'Đông Vĩnh', 'Hà Huy Tập', 'Hồng Sơn', 'Lê Lợi', 'Lê Mao', 'Nghi Phú', 'Nghi Thuỷ', 'Quang Trung', 'Quán Bàu', 'Trung Đô', 'Trường Thi', 'Vinh Tân'] },
            'cua-lo': { name: 'Cửa Lò', wards: ['Nghi Hải', 'Nghi Hòa', 'Nghi Hương', 'Nghi Tân', 'Nghi Thu', 'Nghi Thuận', 'Thu Thủy'] },
            'thai-hoa': { name: 'Thái Hòa', wards: ['Đông Hiếu', 'Hòa Hiếu', 'Long Sơn', 'Nghĩa Đức', 'Nghĩa Hưng', 'Nghĩa Hội', 'Nghĩa Hồng', 'Nghĩa Hưng', 'Nghĩa Lộc', 'Nghĩa Mỹ', 'Nghĩa Phúc', 'Nghĩa Sơn', 'Nghĩa Thành', 'Nghĩa Thịnh', 'Nghĩa Thuận', 'Nghĩa Tiến', 'Nghĩa Trung', 'Quang Phong', 'Quang Tiến', 'Tây Hiếu'] },
            'hoang-mai': { name: 'Hoàng Mai', wards: ['Mai Hùng', 'Quỳnh Diễn', 'Quỳnh Lập', 'Quỳnh Lộc', 'Quỳnh Phương', 'Quỳnh Thuận', 'Quỳnh Vinh', 'Quỳnh Xuân'] },
            'quy-hop': { name: 'Quỳ Hợp', wards: ['Châu Cường', 'Châu Đình', 'Châu Hạnh', 'Châu Hội', 'Châu Lộc', 'Châu Lý', 'Châu Nga', 'Châu Phong', 'Châu Quang', 'Châu Thái', 'Châu Thành', 'Châu Thịnh', 'Châu Tiến', 'Châu Yên', 'Đồng Hợp', 'Hạnh Phúc', 'Liên Hợp', 'Minh Hợp', 'Nam Sơn', 'Nghĩa Xuân', 'Quỳ Hợp', 'Tam Hợp', 'Thọ Hợp', 'Văn Lợi', 'Yên Hợp'] },
            'quynh-luu': { name: 'Quỳnh Lưu', wards: ['An Hòa', 'Cầu Giát', 'Quỳnh Bá', 'Quỳnh Bảng', 'Quỳnh Châu', 'Quỳnh Diễn', 'Quỳnh Đôi', 'Quỳnh Giang', 'Quỳnh Hậu', 'Quỳnh Hoa', 'Quỳnh Hồng', 'Quỳnh Hưng', 'Quỳnh Lâm', 'Quỳnh Long', 'Quỳnh Lương', 'Quỳnh Minh', 'Quỳnh Mỹ', 'Quỳnh Nghĩa', 'Quỳnh Ngọc', 'Quỳnh Tam', 'Quỳnh Tân', 'Quỳnh Thạch', 'Quỳnh Thanh', 'Quỳnh Thắng', 'Quỳnh Thuận', 'Quỳnh Văn', 'Quỳnh Yên', 'Sơn Hải', 'Tân Sơn', 'Tân Thắng', 'Tiến Thủy'] },
            'ky-son': { name: 'Kỳ Sơn', wards: ['Bảo Nam', 'Bảo Thắng', 'Bắc Lý', 'Chiêu Lưu', 'Mường Ải', 'Mường Lống', 'Mường Típ', 'Mỹ Lý', 'Na Loi', 'Na Ngoi', 'Nậm Cắn', 'Nậm Càn', 'Nậm Hu', 'Phà Đánh', 'Tà Cạ', 'Tây Sơn'] },
            'tuong-duong': { name: 'Tương Dương', wards: ['Bình Chuẩn', 'Lưu Kiền', 'Mai Sơn', 'Nga My', 'Nhôn Mai', 'Tam Đình', 'Tam Hợp', 'Tam Quang', 'Tam Thái', 'Thạch Giám', 'Xá Lượng', 'Xiêng My', 'Yên Hòa', 'Yên Na', 'Yên Thắng'] },
            'con-cuong': { name: 'Con Cuông', wards: ['Bình Chuẩn', 'Châu Khê', 'Chi Khê', 'Đôn Phục', 'Lạng Khê', 'Lục Dạ', 'Môn Sơn', 'Mậu Đức', 'Thạch Ngàn', 'Yên Khê'] },
            'tan-ky': { name: 'Tân Kỳ', wards: ['Đồng Văn', 'Giai Xuân', 'Hương Sơn', 'Kỳ Sơn', 'Kỳ Tân', 'Nghĩa Bình', 'Nghĩa Đồng', 'Nghĩa Dũng', 'Nghĩa Hành', 'Nghĩa Hoàn', 'Nghĩa Hợp', 'Nghĩa Phúc', 'Nghĩa Thái', 'Phúc Sơn', 'Tân An', 'Tân Hợp', 'Tân Hương', 'Tân Long', 'Tân Phú', 'Tân Xuân', 'Tiên Kỳ', 'Tường Sơn'] },
            'yen-thanh': { name: 'Yên Thành', wards: ['Bắc Thành', 'Công Thành', 'Đại Thành', 'Đô Thành', 'Đồng Thành', 'Hậu Thành', 'Hoa Thành', 'Hồng Thành', 'Hợp Thành', 'Kim Thành', 'Lăng Thành', 'Long Thành', 'Lý Thành', 'Mã Thành', 'Minh Thành', 'Mỹ Thành', 'Nam Thành', 'Nhân Thành', 'Phú Thành', 'Phúc Thành', 'Quang Thành', 'Sơn Thành', 'Tân Thành', 'Tây Thành', 'Thịnh Thành', 'Thọ Thành', 'Tiến Thành', 'Trung Thành', 'Văn Thành', 'Viên Thành', 'Vĩnh Thành', 'Xuân Thành'] }
        },
        departments: ['Sở Nội vụ', 'Sở Tài chính', 'Sở Kế hoạch và Đầu tư', 'Sở Tư pháp', 'Sở Y tế', 'Sở Giáo dục và Đào tạo', 'Sở Lao động - Thương binh và Xã hội', 'Sở Văn hóa và Thể thao', 'Sở Thông tin và Truyền thông', 'Sở Khoa học và Công nghệ', 'Sở Tài nguyên và Môi trường', 'Sở Giao thông Vận tải', 'Sở Xây dựng', 'Sở Công Thương', 'Sở Nông nghiệp và Phát triển nông thôn']
    },
    'thua-thien-hue': {
        name: 'Thừa Thiên Huế',
        districts: {
            'hue': { name: 'Huế', wards: ['An Cựu', 'An Đông', 'An Hòa', 'An Tây', 'Hương Long', 'Hương Sơ', 'Kim Long', 'Phú Bình', 'Phú Cát', 'Phú Hậu', 'Phú Hiệp', 'Phú Hòa', 'Phú Hội', 'Phú Nhuận', 'Phú Thượng', 'Phước Vĩnh', 'Tây Lộc', 'Thuận Hòa', 'Thuận Lộc', 'Thuận Thành', 'Trường An', 'Vĩ Dạ', 'Vĩnh Ninh', 'Xuân Phú'] },
            'huong-thuy': { name: 'Hương Thủy', wards: ['Dương Hòa', 'Phú Bài', 'Phú Dương', 'Phú Gia', 'Phú Lương', 'Phú Mậu', 'Phú Thanh', 'Thủy Bằng', 'Thủy Châu', 'Thủy Dương', 'Thủy Lương', 'Thủy Phù', 'Thủy Phương', 'Thủy Tân', 'Thủy Thanh', 'Thủy Vân'] },
            'huong-tra': { name: 'Hương Trà', wards: ['Bình Điền', 'Bình Thành', 'Hải Dương', 'Hồng Tiến', 'Hương An', 'Hương Bình', 'Hương Chữ', 'Hương Hồ', 'Hương Phong', 'Hương Thọ', 'Hương Toàn', 'Hương Vân', 'Hương Vinh', 'Tứ Hạ'] },
            'phu-vang': { name: 'Phú Vang', wards: ['Phú An', 'Phú Diên', 'Phú Đa', 'Phú Hải', 'Phú Hồ', 'Phú Lương', 'Phú Mỹ', 'Phú Thanh', 'Phú Thuận', 'Phú Thượng', 'Phú Xuân', 'Vinh An', 'Vinh Hà', 'Vinh Thanh', 'Vinh Xuân'] },
            'quang-dien': { name: 'Quảng Điền', wards: ['Quảng An', 'Quảng Công', 'Quảng Lợi', 'Quảng Ngạn', 'Quảng Phú', 'Quảng Phước', 'Quảng Thành', 'Quảng Thọ', 'Quảng Vinh'] },
            'phong-dien': { name: 'Phong Điền', wards: ['Điền Hải', 'Điền Hòa', 'Điền Hương', 'Điền Lộc', 'Điền Môn', 'Phong An', 'Phong Bình', 'Phong Chương', 'Phong Hiền', 'Phong Hòa', 'Phong Mỹ', 'Phong Sơn', 'Phong Thu'] },
            'a-luoi': { name: 'A Lưới', wards: ['A Đớt', 'A Ngo', 'A Roàng', 'A Đớt', 'Bồng Sơn', 'Hồng Bắc', 'Hồng Hạ', 'Hồng Kim', 'Hồng Quảng', 'Hồng Thái', 'Hồng Thượng', 'Hồng Thủy', 'Hồng Vân', 'Lâm Đớt', 'Phú Vinh', 'Sơn Thủy', 'Tư Hạ'] },
            'nam-dong': { name: 'Nam Đông', wards: ['Hương Giang', 'Hương Hòa', 'Hương Hữu', 'Hương Lộc', 'Hương Phú', 'Hương Sơn', 'Khe Tre', 'Thượng Lộ', 'Thượng Long', 'Thượng Nhật', 'Thượng Quảng'] }
        },
        departments: ['Sở Nội vụ', 'Sở Tài chính', 'Sở Kế hoạch và Đầu tư', 'Sở Tư pháp', 'Sở Y tế', 'Sở Giáo dục và Đào tạo', 'Sở Lao động - Thương binh và Xã hội', 'Sở Văn hóa và Thể thao', 'Sở Thông tin và Truyền thông', 'Sở Khoa học và Công nghệ', 'Sở Tài nguyên và Môi trường', 'Sở Giao thông Vận tải', 'Sở Xây dựng', 'Sở Công Thương', 'Sở Nông nghiệp và Phát triển nông thôn', 'Sở Du lịch']
    },
    'lam-dong': {
        name: 'Lâm Đồng',
        districts: {
            'da-lat': { name: 'Đà Lạt', wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Xuân Thọ', 'Xuân Trường', 'Tà Nung', 'Trạm Hành', 'Xuân Trường'] },
            'bao-loc': { name: 'Bảo Lộc', wards: ['B\'Lao', 'Lộc Phát', 'Lộc Sơn', 'Lộc Tiến', 'Lộc Nga', 'Lộc Châu', 'Đại Lào', 'Đạm Bri', 'Đạ Tông', 'Đạ K\'Nàng', 'Đạ Ploa', 'Đạ M\'ri', 'Đạ Oai', 'Đạ Pal'] },
            'da-teh': { name: 'Đạ Tẻh', wards: ['Đạ Tẻh', 'An Nhơn', 'Đạ Kho', 'Đạ Lây', 'Đạ Oai', 'Đạ Pal', 'Đạ Ploa', 'Đạ Tông', 'Hà Lâm', 'Mỹ Đức', 'Quảng Trị', 'Quốc Oai', 'Triệu Hải'] },
            'cat-tien': { name: 'Cát Tiên', wards: ['Cát Tiên', 'Đồng Nai Thượng', 'Đức Phổ', 'Gia Viễn', 'Mỹ Lâm', 'Nam Ninh', 'Phước Cát', 'Phước Cát 1', 'Phước Cát 2', 'Quảng Ngãi', 'Tiên Hiệp', 'Tiên Phước'] },
            'da-hoai': { name: 'Đạ Huoai', wards: ['Đạ M\'ri', 'Đạ Oai', 'Đạ Ploa', 'Đạ Tông', 'Đạ Tẻh', 'Đạ Kho', 'Đạ Lây', 'Hà Lâm', 'Mỹ Đức', 'Quảng Trị', 'Quốc Oai', 'Triệu Hải'] },
            'da-rang': { name: 'Đạ Rằng', wards: ['Đạ Rằng', 'Đạ M\'ri', 'Đạ Oai', 'Đạ Ploa', 'Đạ Tông', 'Đạ Tẻh', 'Đạ Kho', 'Đạ Lây', 'Hà Lâm', 'Mỹ Đức', 'Quảng Trị', 'Quốc Oai', 'Triệu Hải'] },
            'don-duong': { name: 'Đơn Dương', wards: ['Đơn Dương', 'Đạ Ròn', 'Đạ Tông', 'Đạ Tẻh', 'Đạ Kho', 'Đạ Lây', 'Hà Lâm', 'Mỹ Đức', 'Quảng Trị', 'Quốc Oai', 'Triệu Hải', 'Ka Đơn', 'Suối Thông'] },
            'duc-trong': { name: 'Đức Trọng', wards: ['Liên Nghĩa', 'Hiệp An', 'Hiệp Thạnh', 'Bình Thạnh', 'N\'Thol Hạ', 'Tân Hội', 'Tân Thành', 'Phú Hội', 'Tà Năng', 'Đa Quyn', 'Tà Hine', 'Đà Loan', 'Ninh Gia', 'Tà Nung'] },
            'lam-ha': { name: 'Lâm Hà', wards: ['Đinh Văn', 'Liên Hà', 'Tân Hà', 'Tân Thanh', 'Tân Văn', 'Tân An', 'Đạ Đờn', 'Nam Ban', 'Đạ Kho', 'Đạ Lây', 'Hà Lâm', 'Mỹ Đức', 'Quảng Trị', 'Quốc Oai', 'Triệu Hải'] },
            'bao-lam': { name: 'Bảo Lâm', wards: ['Lộc Thắng', 'Lộc Bảo', 'Lộc Lâm', 'Lộc Phú', 'Lộc Thành', 'Lộc Thạnh', 'Lộc Bắc', 'Lộc Nam', 'Lộc Quảng', 'Lộc Tân', 'Lộc Hưng', 'Lộc An', 'Lộc Đức'] }
        },
        departments: ['Sở Nội vụ', 'Sở Tài chính', 'Sở Kế hoạch và Đầu tư', 'Sở Tư pháp', 'Sở Y tế', 'Sở Giáo dục và Đào tạo', 'Sở Lao động - Thương binh và Xã hội', 'Sở Văn hóa và Thể thao', 'Sở Thông tin và Truyền thông', 'Sở Khoa học và Công nghệ', 'Sở Tài nguyên và Môi trường', 'Sở Giao thông Vận tải', 'Sở Xây dựng', 'Sở Công Thương', 'Sở Nông nghiệp và Phát triển nông thôn', 'Sở Du lịch']
    },
    'ba-ria-vung-tau': {
        name: 'Bà Rịa - Vũng Tàu',
        districts: {
            'vung-tau': { name: 'Vũng Tàu', wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Nguyễn An Ninh', 'Rạch Dừa', 'Thắng Nhất', 'Thắng Nhì', 'Thắng Tam', 'Thắng Nhất', 'Thắng Nhì', 'Thắng Tam'] },
            'ba-ria': { name: 'Bà Rịa', wards: ['Long Hương', 'Kim Dinh', 'Tân Hưng', 'Long Tâm', 'Phước Hưng', 'Long Toàn', 'Hòa Long', 'Long Phước', 'Tân Hưng', 'Bàu Sen', 'Bàu Trâm', 'Hắc Dịch', 'Tân Thành', 'Phước Hòa', 'Long Tân', 'Phước Tân'] },
            'chau-duc': { name: 'Châu Đức', wards: ['Ngãi Giao', 'Bình Ba', 'Suối Nghệ', 'Xuân Sơn', 'Sơn Bình', 'Bình Giã', 'Bàu Chinh', 'Nghĩa Thành', 'Quảng Thành', 'Kim Long', 'Suối Rao', 'Đá Bạc', 'Bình Trung', 'Bình Châu', 'Xà Bang', 'Láng Lớn', 'Cù Bị'] },
            'xuyen-moc': { name: 'Xuyên Mộc', wards: ['Phước Bửu', 'Xuyên Mộc', 'Bông Trang', 'Bàu Lâm', 'Bưng Riềng', 'Bình Châu', 'Bưng Riềng', 'Hòa Bình', 'Hòa Hưng', 'Hòa Hiệp', 'Hòa Hội', 'Tân Lâm', 'Tân Lập', 'Tân Thành', 'Tân Hưng'] },
            'long-dien': { name: 'Long Điền', wards: ['Long Điền', 'Long Hải', 'An Ngãi', 'Tam Phước', 'An Nhứt', 'Phước Hưng', 'Phước Tỉnh', 'Phước Hải', 'An Ngãi Trung', 'An Ngãi Tây', 'An Ngãi Đông'] },
            'dat-do': { name: 'Đất Đỏ', wards: ['Đất Đỏ', 'Phước Hải', 'Phước Long Thọ', 'Long Mỹ', 'Long Tân', 'Láng Dài', 'Lộc An', 'Phước Hội', 'An Ngãi', 'An Nhứt', 'Phước Tỉnh'] },
            'con-dao': { name: 'Côn Đảo', wards: ['Côn Đảo', 'An Hải', 'An Hội'] }
        },
        departments: ['Sở Nội vụ', 'Sở Tài chính', 'Sở Kế hoạch và Đầu tư', 'Sở Tư pháp', 'Sở Y tế', 'Sở Giáo dục và Đào tạo', 'Sở Lao động - Thương binh và Xã hội', 'Sở Văn hóa và Thể thao', 'Sở Thông tin và Truyền thông', 'Sở Khoa học và Công nghệ', 'Sở Tài nguyên và Môi trường', 'Sở Giao thông Vận tải', 'Sở Xây dựng', 'Sở Công Thương', 'Sở Nông nghiệp và Phát triển nông thôn', 'Sở Du lịch']
    },
    'kien-giang': {
        name: 'Kiên Giang',
        districts: {
            'rach-gia': { name: 'Rạch Giá', wards: ['Vĩnh Bảo', 'Vĩnh Hiệp', 'Vĩnh Lạc', 'Vĩnh Lợi', 'Vĩnh Quang', 'Vĩnh Thanh', 'Vĩnh Thanh Vân', 'An Hòa', 'An Thới', 'Rạch Sỏi', 'Phi Thông', 'Vĩnh Thông', 'Vĩnh Thạnh', 'Vĩnh Trung', 'Vĩnh Hòa', 'Vĩnh Hòa Hiệp', 'Vĩnh Hòa Phú', 'Vĩnh Hòa Quy', 'Vĩnh Hòa Thạnh', 'Vĩnh Hòa Trung'] },
            'ha-tien': { name: 'Hà Tiên', wards: ['Đông Hồ', 'Bình San', 'Pháo Đài', 'Mỹ Đức', 'Tiên Hải', 'Thuận Yên', 'Tô Châu', 'Đông Hồ', 'Bình San', 'Pháo Đài'] },
            'kien-luong': { name: 'Kiên Lương', wards: ['Kiên Lương', 'Hòn Đất', 'Sơn Hải', 'Mỹ Thái', 'Mỹ Thuận', 'Mỹ Thạnh', 'Mỹ Đức', 'Mỹ Phước', 'Mỹ Hòa', 'Mỹ Lợi', 'Mỹ Thành', 'Mỹ Hiệp', 'Mỹ Trinh', 'Mỹ Thạnh Đông', 'Mỹ Thạnh Tây', 'Mỹ Thạnh Trung'] },
            'hon-dat': { name: 'Hòn Đất', wards: ['Hòn Đất', 'Sơn Hải', 'Mỹ Thái', 'Mỹ Thuận', 'Mỹ Thạnh', 'Mỹ Đức', 'Mỹ Phước', 'Mỹ Hòa', 'Mỹ Lợi', 'Mỹ Thành', 'Mỹ Hiệp', 'Mỹ Trinh', 'Mỹ Thạnh Đông', 'Mỹ Thạnh Tây', 'Mỹ Thạnh Trung', 'Sóc Sơn', 'Nam Thái Sơn', 'Mỹ Lâm', 'Mỹ Phú'] },
            'tan-hiep': { name: 'Tân Hiệp', wards: ['Tân Hiệp', 'Tân Hiệp A', 'Tân Hiệp B', 'Tân Thành', 'Tân Thạnh', 'Tân Lợi', 'Tân Lập', 'Tân Hưng', 'Tân Hòa', 'Tân An', 'Tân Bình', 'Tân Đông', 'Tân Đông Hiệp', 'Tân Đông Hòa', 'Tân Đông Thạnh', 'Tân Phú', 'Tân Phước', 'Tân Quy', 'Tân Quy Đông', 'Tân Quy Tây', 'Tân Thành', 'Tân Thạnh', 'Tân Thuận', 'Tân Trung'] },
            'chau-thanh': { name: 'Châu Thành', wards: ['Châu Thành', 'An Hòa', 'An Hòa Hải', 'An Hòa Tây', 'An Hòa Đông', 'An Hòa Nam', 'An Hòa Bắc', 'An Hòa Trung', 'An Hòa Thạnh', 'An Hòa Thành', 'An Hòa Thới', 'An Hòa Thuận', 'An Hòa Vĩnh', 'An Hòa Xuân', 'An Hòa Yên', 'An Hòa Lợi', 'An Hòa Phú', 'An Hòa Quy', 'An Hòa Tân', 'An Hòa Thạnh'] },
            'giang-thanh': { name: 'Giang Thành', wards: ['Giang Thành', 'Phú Mỹ', 'Phú Quốc', 'Tân Hội', 'Tân Hưng', 'Tân Lập', 'Tân Thành', 'Tân Thạnh', 'Tân Thuận', 'Vĩnh Phú', 'Vĩnh Thạnh', 'Vĩnh Thuận'] },
            'go-quao': { name: 'Gò Quao', wards: ['Gò Quao', 'Vĩnh Hòa', 'Vĩnh Hòa Hưng', 'Vĩnh Hòa Hiệp', 'Vĩnh Phước A', 'Vĩnh Phước B', 'Vĩnh Thạnh', 'Vĩnh Thuận', 'Vĩnh Bình', 'Vĩnh Lợi', 'Vĩnh Lợi A', 'Vĩnh Lợi B', 'Vĩnh Thạnh', 'Vĩnh Thạnh A', 'Vĩnh Thạnh B', 'Vĩnh Thạnh Đông', 'Vĩnh Thạnh Tây', 'Vĩnh Thạnh Trung', 'Vĩnh Thạnh Nam', 'Vĩnh Thạnh Bắc'] },
            'an-bien': { name: 'An Biên', wards: ['An Biên', 'An Biên A', 'An Biên B', 'An Hòa', 'An Hòa A', 'An Hòa B', 'An Minh', 'An Minh A', 'An Minh B', 'An Thạnh', 'An Thạnh A', 'An Thạnh B', 'An Thạnh Đông', 'An Thạnh Tây', 'An Thạnh Trung', 'An Thạnh Nam', 'An Thạnh Bắc', 'An Thạnh Thượng', 'An Thạnh Hạ', 'An Thạnh Thới'] },
            'an-minh': { name: 'An Minh', wards: ['An Minh', 'An Minh A', 'An Minh B', 'An Thạnh', 'An Thạnh A', 'An Thạnh B', 'An Thạnh Đông', 'An Thạnh Tây', 'An Thạnh Trung', 'An Thạnh Nam', 'An Thạnh Bắc', 'An Thạnh Thượng', 'An Thạnh Hạ', 'An Thạnh Thới', 'Vĩnh Hòa', 'Vĩnh Hòa A', 'Vĩnh Hòa B', 'Vĩnh Phước', 'Vĩnh Phước A', 'Vĩnh Phước B'] },
            'phu-quoc': { name: 'Phú Quốc', wards: ['Dương Đông', 'An Thới', 'Hàm Ninh', 'Cửa Cạn', 'Gành Dầu', 'Bãi Thơm', 'Cửa Dương', 'Dương Tơ', 'Hòn Thơm', 'Thổ Châu', 'An Thới', 'Hòn Tre', 'Hòn Một', 'Hòn Nghệ', 'Hòn Đất', 'Hòn Rỏi', 'Hòn Dừa', 'Hòn Ông', 'Hòn Bà', 'Hòn Ông Đốc'] }
        },
        departments: ['Sở Nội vụ', 'Sở Tài chính', 'Sở Kế hoạch và Đầu tư', 'Sở Tư pháp', 'Sở Y tế', 'Sở Giáo dục và Đào tạo', 'Sở Lao động - Thương binh và Xã hội', 'Sở Văn hóa và Thể thao', 'Sở Thông tin và Truyền thông', 'Sở Khoa học và Công nghệ', 'Sở Tài nguyên và Môi trường', 'Sở Giao thông Vận tải', 'Sở Xây dựng', 'Sở Công Thương', 'Sở Nông nghiệp và Phát triển nông thôn', 'Sở Du lịch']
    }
};

// Hàm tạo dữ liệu mẫu cho các tỉnh chưa có dữ liệu chi tiết
function generateGenericDistricts(provinceName) {
    // Tên huyện mẫu phổ biến
    const districtNames = [
        'An', 'Bình', 'Cẩm', 'Đông', 'Hòa', 'Hưng', 'Long', 'Mỹ', 
        'Nam', 'Phú', 'Quảng', 'Tân', 'Thạnh', 'Thanh', 'Thiện', 
        'Trung', 'Vĩnh', 'Xuân', 'Yên', 'Đức', 'Lộc', 'Sơn', 'Thủy',
        'Bắc', 'Tây', 'Hải', 'Kim', 'Lai', 'Minh', 'Phong', 'Thái'
    ];
    
    // Tên phường/xã mẫu phổ biến
    const wardNames = [
        'An', 'Bình', 'Cẩm', 'Đông', 'Hòa', 'Hưng', 'Long', 'Mỹ',
        'Nam', 'Phú', 'Quảng', 'Tân', 'Thạnh', 'Thanh', 'Thiện',
        'Trung', 'Vĩnh', 'Xuân', 'Yên', 'Đức', 'Lộc', 'Sơn', 'Thủy',
        'Bắc', 'Tây', 'Hải', 'Kim', 'Lai', 'Minh', 'Phong', 'Thái',
        'Đông', 'Tây', 'Nam', 'Bắc', 'Trung', 'Thượng', 'Hạ', 
        'Đông Nam', 'Tây Bắc', 'Đông Bắc', 'Tây Nam', 'Trung Tâm',
        'Phú', 'Hưng', 'Thịnh', 'Phúc', 'Lộc', 'Thọ', 'An', 'Bình'
    ];
    
    // Lấy tên tỉnh ngắn gọn (bỏ "Tỉnh" hoặc "Thành phố")
    const shortProvinceName = provinceName.replace(/^(Tỉnh|Thành phố)\s+/i, '');
    
    const genericDistricts = [
        { name: 'Thành phố ' + shortProvinceName, type: 'city' },
        { name: 'Thị xã ' + shortProvinceName, type: 'town' }
    ];
    
    // Thêm 15-20 huyện
    for (let i = 0; i < 18; i++) {
        genericDistricts.push({
            name: 'Huyện ' + districtNames[i % districtNames.length],
            type: 'district'
        });
    }
    
    const districts = {};
    genericDistricts.forEach((dist, index) => {
        const wards = [];
        if (dist.type === 'city') {
            // Thành phố có nhiều phường (15-25 phường)
            const numWards = 20 + Math.floor(Math.random() * 6);
            for (let i = 0; i < numWards; i++) {
                if (i < wardNames.length) {
                    wards.push('Phường ' + wardNames[i]);
                } else {
                    const wardNum = i + 1;
                    wards.push('Phường ' + wardNum);
                }
            }
        } else if (dist.type === 'town') {
            // Thị xã có ít phường hơn (10-15 phường)
            const numWards = 12 + Math.floor(Math.random() * 4);
            for (let i = 0; i < numWards; i++) {
                if (i < wardNames.length) {
                    wards.push('Phường ' + wardNames[i]);
                } else {
                    const wardNum = i + 1;
                    wards.push('Phường ' + wardNum);
                }
            }
        } else {
            // Huyện có nhiều xã (25-35 xã)
            const numWards = 30 + Math.floor(Math.random() * 6);
            const districtShortName = dist.name.replace('Huyện ', '');
            const wardPrefixes = ['Xã', 'Thị trấn'];
            for (let i = 0; i < numWards; i++) {
                const prefix = i === 0 ? 'Thị trấn' : 'Xã'; // Thị trấn đầu tiên
                if (i < wardNames.length) {
                    wards.push(prefix + ' ' + wardNames[i]);
                } else {
                    const wardNum = i + 1;
                    if (i === 0) {
                        wards.push('Thị trấn ' + districtShortName);
                    } else {
                        wards.push('Xã ' + districtShortName + ' ' + wardNum);
                    }
                }
            }
        }
        districts['district-' + index] = { name: dist.name, wards: wards };
    });
    
    return districts;
}

// Danh sách đầy đủ 63 tỉnh/thành phố Việt Nam (loại bỏ các tỉnh đã có dữ liệu chi tiết)
const allProvinces = [
    'Bạc Liêu', 
    'Bắc Giang', 
    'Bắc Kạn', 
    'Bắc Ninh', 
    'Bến Tre', 
    'Bình Định', 
    'Bình Phước', 
    'Bình Thuận', 
    'Cà Mau', 
    'Cao Bằng', 
    'Đắk Lắk', 
    'Đắk Nông', 
    'Điện Biên', 
    'Đồng Tháp', 
    'Gia Lai', 
    'Hà Giang', 
    'Hà Nam', 
    'Hà Tĩnh', 
    'Hải Dương', 
    'Hậu Giang', 
    'Hòa Bình', 
    'Hưng Yên', 
    'Kon Tum', 
    'Lai Châu', 
    'Lạng Sơn', 
    'Lào Cai', 
    'Long An', 
    'Nam Định', 
    'Ninh Bình', 
    'Ninh Thuận', 
    'Phú Thọ', 
    'Phú Yên', 
    'Quảng Bình', 
    'Quảng Nam', 
    'Quảng Ngãi', 
    'Quảng Trị', 
    'Sóc Trăng', 
    'Sơn La', 
    'Tây Ninh', 
    'Thái Bình', 
    'Thái Nguyên', 
    'Tiền Giang', 
    'Trà Vinh', 
    'Tuyên Quang', 
    'Vĩnh Long', 
    'Vĩnh Phúc', 
    'Yên Bái'
];

// Danh sách đầy đủ các Sở/Ban ngành
const allDepartments = [
    'Sở Nội vụ',
    'Sở Tài chính',
    'Sở Kế hoạch và Đầu tư',
    'Sở Tư pháp',
    'Sở Y tế',
    'Sở Giáo dục và Đào tạo',
    'Sở Lao động - Thương binh và Xã hội',
    'Sở Văn hóa và Thể thao',
    'Sở Thông tin và Truyền thông',
    'Sở Khoa học và Công nghệ',
    'Sở Tài nguyên và Môi trường',
    'Sở Giao thông Vận tải',
    'Sở Xây dựng',
    'Sở Công Thương',
    'Sở Nông nghiệp và Phát triển nông thôn',
    'Sở Du lịch',
    'Sở Quy hoạch - Kiến trúc',
    'Sở Tài chính - Kế hoạch',
    'Ban Dân tộc',
    'Ban Tôn giáo',
    'Ban Quản lý Khu công nghiệp',
    'Ban Quản lý Dự án',
    'Cục Thuế',
    'Cục Hải quan',
    'Cục Thống kê',
    'Cục Quản lý Thị trường',
    'Chi cục Bảo vệ Môi trường',
    'Chi cục Phát triển Nông thôn',
    'Trung tâm Dịch vụ Công',
    'Văn phòng UBND',
    'Phòng Nội vụ',
    'Phòng Tài chính - Kế hoạch',
    'Phòng Tư pháp',
    'Phòng Y tế',
    'Phòng Giáo dục và Đào tạo',
    'Phòng Lao động - Thương binh và Xã hội',
    'Phòng Văn hóa và Thông tin',
    'Phòng Tài nguyên và Môi trường',
    'Phòng Kinh tế',
    'Phòng Nông nghiệp và Phát triển nông thôn'
];

// Khởi tạo dropdown tỉnh thành
function initProvinceSelectors() {
    const provinceSelects = document.querySelectorAll('#province, #searchProvince');
    const wardSelects = document.querySelectorAll('#ward, #searchWard');
    // Chỉ populate departments cho searchDepartment, không populate cho soBanNganh (form đã có danh sách cố định)
    const searchDepartmentSelect = document.getElementById('searchDepartment');
    if (searchDepartmentSelect) {
        allDepartments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept;
            option.textContent = dept;
            searchDepartmentSelect.appendChild(option);
        });
    }
    
    // Populate provinces
    provinceSelects.forEach(select => {
        // Thêm các tỉnh có dữ liệu chi tiết
        const detailedProvinces = [
            { value: 'ha-noi', name: 'Hà Nội' },
            { value: 'ho-chi-minh', name: 'Hồ Chí Minh' },
            { value: 'da-nang', name: 'Đà Nẵng' },
            { value: 'can-tho', name: 'Cần Thơ' },
            { value: 'hai-phong', name: 'Hải Phòng' },
            { value: 'dong-nai', name: 'Đồng Nai' },
            { value: 'binh-duong', name: 'Bình Dương' },
            { value: 'an-giang', name: 'An Giang' },
            { value: 'khanh-hoa', name: 'Khánh Hòa' },
            { value: 'quang-ninh', name: 'Quảng Ninh' },
            { value: 'thanh-hoa', name: 'Thanh Hóa' },
            { value: 'nghe-an', name: 'Nghệ An' },
            { value: 'thua-thien-hue', name: 'Thừa Thiên Huế' },
            { value: 'lam-dong', name: 'Lâm Đồng' },
            { value: 'ba-ria-vung-tau', name: 'Bà Rịa - Vũng Tàu' },
            { value: 'kien-giang', name: 'Kiên Giang' }
        ];
        
        detailedProvinces.forEach(prov => {
            const option = document.createElement('option');
            option.value = prov.value;
            option.textContent = prov.name;
            select.appendChild(option);
        });
        
        // Thêm các tỉnh thành còn lại
        allProvinces.forEach(province => {
            const option = document.createElement('option');
            option.value = province.toLowerCase().replace(/\s+/g, '-').replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a').replace(/[èéẹẻẽêềếệểễ]/g, 'e').replace(/[ìíịỉĩ]/g, 'i').replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o').replace(/[ùúụủũưừứựửữ]/g, 'u').replace(/[ỳýỵỷỹ]/g, 'y').replace(/đ/g, 'd');
            option.textContent = province;
            select.appendChild(option);
        });
    });
    
    // Handle province change
    provinceSelects.forEach(select => {
        select.addEventListener('change', function() {
            const provinceId = this.value;
            const isSearch = this.id === 'searchProvince';
            const wardSelect = isSearch ? document.getElementById('searchWard') : document.getElementById('ward');
            const deptSelect = isSearch ? document.getElementById('searchDepartment') : document.getElementById('soBanNganh');
            
            // Reset wards
            if (wardSelect) {
                wardSelect.innerHTML = '<option value="">-- Chọn Phường/Xã --</option>';
                wardSelect.disabled = !provinceId;
            }
            // Departments không cần reset vì đã được load sẵn từ đầu
            
            if (provinceId && provincesData[provinceId]) {
                const province = provincesData[provinceId];
                
                // Populate all wards from all districts
                if (wardSelect) {
                    const allWards = [];
                    Object.keys(province.districts).forEach(districtId => {
                        const district = province.districts[districtId];
                        if (district.wards) {
                            district.wards.forEach(ward => {
                                if (!allWards.includes(ward)) {
                                    allWards.push(ward);
                                }
                            });
                        }
                    });
                    
                    allWards.sort().forEach(ward => {
                        const option = document.createElement('option');
                        option.value = ward;
                        option.textContent = ward;
                        wardSelect.appendChild(option);
                    });
                    wardSelect.disabled = false;
                }
                
                // Departments đã được populate từ đầu, không cần load lại
            } else if (provinceId) {
                // For other provinces, generate generic districts and departments
                const provinceName = this.options[this.selectedIndex].text;
                const genericDistricts = generateGenericDistricts(provinceName);
                
                // Populate all wards from all generic districts
                if (wardSelect) {
                    const allWards = [];
                    Object.keys(genericDistricts).forEach(districtId => {
                        const district = genericDistricts[districtId];
                        if (district.wards) {
                            district.wards.forEach(ward => {
                                if (!allWards.includes(ward)) {
                                    allWards.push(ward);
                                }
                            });
                        }
                    });
                    
                    allWards.sort().forEach(ward => {
                        const option = document.createElement('option');
                        option.value = ward;
                        option.textContent = ward;
                        wardSelect.appendChild(option);
                    });
                    wardSelect.disabled = false;
                }
                
                // Departments đã được populate từ đầu, không cần load lại
                
                // Store generic districts for later use
                if (!window.genericDistrictsData) {
                    window.genericDistrictsData = {};
                }
                window.genericDistrictsData[provinceId] = genericDistricts;
            }
        });
    });
}

// Kiểm tra trạng thái đăng ký liên kết ngân hàng
function checkBankSyncStatus() {
    const registrations = localStorage.getItem('bankSyncRegistrations');
    if (registrations) {
        const regs = JSON.parse(registrations);
        // Kiểm tra xem có đăng ký nào đã được phê duyệt không
        const approvedReg = regs.find(reg => reg.status === 'approved' || reg.status === 'pending');
        if (approvedReg) {
            // Tự động check checkbox nếu đã có đăng ký
            const bankSyncCheckbox = document.getElementById('bankSync');
            if (bankSyncCheckbox) {
                bankSyncCheckbox.checked = true;
            }
        }
    }
}

// Render danh sách khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo trường ngày hẹn
    initAppointmentDateField();
    // Khởi tạo select thời gian
    initAppointmentTimeSelect();
    initLogo();
    initThemeSelector();
    initProvinceSelectors();
    renderAppointments();
    checkBankSyncStatus();
});

