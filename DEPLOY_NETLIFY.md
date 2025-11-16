# 🚀 Hướng Dẫn Deploy Lên Netlify Từ GitHub

## 📋 Repository GitHub
- **URL:** `git@github.com:msbmbanking/Dichvucong.git`
- **Repository:** `msbmbanking/Dichvucong`

## 🔧 Các Bước Deploy

### Bước 1: Push Code Lên GitHub

```bash
# Khởi tạo git (nếu chưa có)
git init

# Thêm tất cả file
git add .

# Commit
git commit -m "Initial commit: Dự án đăng ký lịch hẹn với tích hợp Telegram Bot API"

# Đổi tên branch thành main
git branch -M main

# Thêm remote (nếu chưa có)
git remote add origin git@github.com:msbmbanking/Dichvucong.git

# Push code lên GitHub
git push -u origin main
```

### Bước 2: Kết Nối Với Netlify

1. **Truy cập Netlify:**
   - Đi tới [app.netlify.com](https://app.netlify.com)
   - Đăng nhập/Đăng ký tài khoản

2. **Import Project:**
   - Nhấn "Add new site" → "Import an existing project"
   - Chọn "GitHub" và cấp quyền truy cập
   - Tìm và chọn repository: `msbmbanking/Dichvucong`

3. **Cấu Hình Build Settings:**
   - **Build command:** (để trống - không cần build)
   - **Publish directory:** `.` (root directory)
   - Nhấn "Deploy site"

### Bước 3: Kiểm Tra Deploy

- Netlify sẽ tự động deploy và cung cấp URL: `https://your-site-name.netlify.app`
- Kiểm tra website hoạt động đúng
- Kiểm tra các form và chức năng

### Bước 4: Cấu Hình Domain (Tùy chọn)

1. **Đổi tên site:**
   - Site settings → General → Site details
   - Đổi tên site thành tên bạn muốn

2. **Thêm domain tùy chỉnh:**
   - Site settings → Domain management
   - Thêm domain của bạn
   - Làm theo hướng dẫn để cấu hình DNS

## ✅ File Đã Được Cấu Hình

- ✅ `netlify.toml` - Cấu hình Netlify
- ✅ `_redirects` - Quy tắc redirect cho SPA
- ✅ `.gitignore` - Loại trừ file không cần thiết

## 🔒 Lưu Ý Bảo Mật

- **Telegram Bot Token:** Đã được lưu trong `telegram-bot.js` với giá trị mặc định
- **Chat ID:** Đã được lưu trong `telegram-bot.js` với giá trị mặc định
- Token và Chat ID được lưu trong localStorage của trình duyệt, không phải trên server

## 📊 Sau Khi Deploy

1. **Kiểm tra website:**
   - Truy cập URL được cung cấp
   - Test các form đăng ký
   - Test tích hợp Telegram Bot

2. **Cấu hình Telegram Bot:**
   - Truy cập `/telegram-config.html`
   - Nhập Bot Token và Chat ID
   - Test kết nối

3. **Monitoring:**
   - Xem deploy logs trong Netlify Dashboard
   - Kiểm tra Analytics (nếu bật)
   - Xem Function logs (nếu có)

## 🆘 Xử Lý Lỗi

### Lỗi Build
- Kiểm tra `netlify.toml` đã đúng chưa
- Đảm bảo publish directory là `.`

### Lỗi Redirect
- Kiểm tra file `_redirects` đã có chưa
- Đảm bảo format đúng: `/*    /index.html   200`

### Lỗi Telegram Bot
- Kiểm tra Bot Token và Chat ID đã đúng chưa
- Kiểm tra bot đã được thêm vào group chưa
- Kiểm tra quyền của bot trong group

## 📝 Cập Nhật Code

Sau khi thay đổi code:

```bash
git add .
git commit -m "Mô tả thay đổi"
git push origin main
```

Netlify sẽ tự động deploy lại khi có commit mới.

---

**Chúc bạn deploy thành công! 🎉**

