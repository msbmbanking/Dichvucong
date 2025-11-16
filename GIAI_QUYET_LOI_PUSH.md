# 🔧 Giải Quyết Lỗi Push Code Lên GitHub

## ❌ Lỗi Hiện Tại

```
remote: Permission to msbmbanking/Dichvucong.git denied to chamtichbong.
fatal: unable to access 'https://github.com/msbmbanking/Dichvucong.git/': The requested URL returned error: 403
```

**Nguyên nhân:** Bạn đang đăng nhập với tài khoản `chamtichbong` nhưng repository thuộc về `msbmbanking`.

## ✅ Giải Pháp

### Cách 1: Đăng Nhập Đúng Tài Khoản (Khuyến nghị)

1. **Xóa thông tin đăng nhập cũ:**
   ```bash
   # Windows
   git credential-manager-core erase
   # Hoặc xóa trong Windows Credential Manager
   ```

2. **Push lại và đăng nhập:**
   ```bash
   git push -u origin main
   ```
   - Khi được yêu cầu, đăng nhập với tài khoản `msbmbanking`
   - Sử dụng Personal Access Token làm password (không phải mật khẩu GitHub)

### Cách 2: Sử Dụng Personal Access Token

1. **Tạo Personal Access Token:**
   - Truy cập: https://github.com/settings/tokens
   - Nhấn "Generate new token (classic)"
   - Đặt tên: "Netlify Deploy"
   - Chọn quyền: `repo` (Full control)
   - Nhấn "Generate token"
   - **Copy token ngay** (chỉ hiển thị 1 lần)

2. **Push với token:**
   ```bash
   git push -u origin main
   ```
   - Username: `msbmbanking`
   - Password: Dán Personal Access Token vừa tạo

### Cách 3: Thêm Collaborator (Nếu bạn là chamtichbong)

Nếu bạn là `chamtichbong` và cần quyền truy cập:
1. Yêu cầu `msbmbanking` thêm bạn làm collaborator
2. Hoặc fork repository về tài khoản của bạn

### Cách 4: Xóa Credential và Đăng Nhập Lại

**Windows:**
1. Mở "Credential Manager" (Windows)
2. Tìm "git:https://github.com"
3. Xóa entry đó
4. Push lại và đăng nhập với tài khoản đúng

**Hoặc dùng lệnh:**
```bash
# Xóa credential
cmdkey /list
cmdkey /delete:git:https://github.com

# Push lại
git push -u origin main
```

## 🔑 Tạo Personal Access Token

1. Đăng nhập vào GitHub với tài khoản `msbmbanking`
2. Truy cập: https://github.com/settings/tokens
3. Nhấn "Generate new token (classic)"
4. Đặt tên token
5. Chọn scope: `repo` (Full control of private repositories)
6. Nhấn "Generate token"
7. **Copy token** (chỉ hiển thị 1 lần!)

## 📝 Lưu Ý

- Personal Access Token thay thế mật khẩu GitHub
- Token có thể có thời hạn (hoặc không giới hạn)
- Giữ token an toàn, không chia sẻ công khai

## ✅ Sau Khi Push Thành Công

Code sẽ được push lên: `https://github.com/msbmbanking/Dichvucong`

Sau đó bạn có thể:
1. Deploy lên Netlify từ GitHub Dashboard
2. Hoặc dùng Netlify CLI: `netlify deploy --prod`

---

**Chúc bạn thành công! 🎉**

