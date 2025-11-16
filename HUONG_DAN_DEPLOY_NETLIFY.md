# 🚀 Hướng Dẫn Deploy Lên Netlify

## 📋 Yêu Cầu

- Tài khoản GitHub/GitLab/Bitbucket
- Tài khoản Netlify (miễn phí)

## 🔧 Các Bước Deploy

### Cách 1: Deploy Từ GitHub (Khuyến nghị)

1. **Đẩy code lên GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/username/repo-name.git
   git push -u origin main
   ```

2. **Kết nối với Netlify:**
   - Truy cập [netlify.com](https://www.netlify.com)
   - Đăng nhập/Đăng ký
   - Nhấn "Add new site" → "Import an existing project"
   - Chọn GitHub và chọn repository của bạn

3. **Cấu hình Build Settings:**
   - **Build command:** (để trống hoặc `echo 'No build needed'`)
   - **Publish directory:** `.` (root directory)
   - Nhấn "Deploy site"

### Cách 2: Deploy Thủ Công (Drag & Drop)

1. **Chuẩn bị file:**
   - Đảm bảo tất cả file trong thư mục dự án
   - Nén thành file ZIP (hoặc để nguyên thư mục)

2. **Deploy:**
   - Truy cập [app.netlify.com/drop](https://app.netlify.com/drop)
   - Kéo thả thư mục hoặc file ZIP vào
   - Netlify sẽ tự động deploy

### Cách 3: Sử dụng Netlify CLI

1. **Cài đặt Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Đăng nhập:**
   ```bash
   netlify login
   ```

3. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

## ⚙️ Cấu Hình Môi Trường

### Biến Môi Trường (Nếu cần)

Trong Netlify Dashboard:
- Site settings → Environment variables
- Thêm các biến cần thiết (nếu có)

## 📝 File Cấu Hình

Dự án đã có sẵn:
- `netlify.toml` - Cấu hình Netlify
- `_redirects` - Quy tắc redirect

## ✅ Sau Khi Deploy

1. **Kiểm tra URL:**
   - Netlify sẽ cung cấp URL dạng: `https://your-site-name.netlify.app`
   - Bạn có thể đổi tên trong Site settings

2. **Cấu hình Domain tùy chỉnh (tùy chọn):**
   - Site settings → Domain management
   - Thêm domain của bạn

3. **Kiểm tra HTTPS:**
   - Netlify tự động cung cấp SSL certificate
   - HTTPS được bật mặc định

## 🔒 Lưu Ý Bảo Mật

- **Telegram Bot Token:** Đảm bảo không commit token vào public repository
- **Chat ID:** Có thể giữ trong code hoặc sử dụng environment variables

## 📊 Monitoring

- Netlify Dashboard cung cấp:
  - Analytics
  - Form submissions (nếu có)
  - Deploy logs
  - Function logs (nếu có)

## 🆘 Hỗ Trợ

- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify Community](https://answers.netlify.com/)

---

**Chúc bạn deploy thành công! 🎉**

