# ⚡ Deploy Nhanh Lên Netlify

## ✅ Netlify CLI Đã Được Cài Đặt
- **Version:** netlify-cli/23.11.0
- **Node:** v24.11.1

## 🚀 Các Bước Deploy

### Bước 1: Đăng Nhập Netlify

```bash
netlify login
```

Lệnh này sẽ mở trình duyệt để bạn đăng nhập vào Netlify.

### Bước 2: Khởi Tạo Site

```bash
netlify init
```

Lệnh này sẽ:
- Hỏi bạn muốn tạo site mới hay liên kết với site có sẵn
- Hỏi tên site (hoặc để trống để tự động tạo)
- Tự động tạo file `netlify.toml` nếu chưa có

### Bước 3: Deploy

#### Deploy Preview (Test):
```bash
netlify deploy
```

#### Deploy Production:
```bash
netlify deploy --prod
```

## 📋 Hoặc Deploy Từ GitHub

### 1. Push Code Lên GitHub

```bash
# Cấu hình Git (nếu chưa có)
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Thêm và commit
git add .
git commit -m "Initial commit: Dự án đăng ký lịch hẹn"

# Đổi tên branch
git branch -M main

# Thêm remote (nếu chưa có)
git remote add origin git@github.com:msbmbanking/Dichvucong.git

# Push lên GitHub
git push -u origin main
```

### 2. Kết Nối Với Netlify

1. Truy cập [app.netlify.com](https://app.netlify.com)
2. Nhấn "Add new site" → "Import an existing project"
3. Chọn GitHub và chọn repository `msbmbanking/Dichvucong`
4. Cấu hình:
   - **Build command:** (để trống)
   - **Publish directory:** `.`
5. Nhấn "Deploy site"

## ✅ File Đã Sẵn Sàng

- ✅ `netlify.toml` - Cấu hình Netlify
- ✅ `_redirects` - Quy tắc redirect
- ✅ `.gitignore` - Loại trừ file không cần thiết

## 🔗 Repository GitHub

- **URL:** `git@github.com:msbmbanking/Dichvucong.git`
- **SSH:** `git@github.com:msbmbanking/Dichvucong.git`

## 📝 Lưu Ý

- Sau khi deploy, Netlify sẽ cung cấp URL dạng: `https://your-site-name.netlify.app`
- Bạn có thể đổi tên site trong Netlify Dashboard
- Mỗi lần push code lên GitHub, Netlify sẽ tự động deploy lại (nếu đã kết nối)

---

**Sẵn sàng deploy! 🎉**

