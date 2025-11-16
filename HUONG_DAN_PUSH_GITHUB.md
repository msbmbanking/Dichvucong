# 🔧 Hướng Dẫn Push Code Lên GitHub

## ❌ Lỗi: Permission denied (publickey)

Lỗi này xảy ra khi chưa cấu hình SSH key hoặc SSH key chưa được thêm vào GitHub.

## ✅ Giải Pháp

### Cách 1: Sử Dụng HTTPS (Đơn Giản Nhất)

Đã chuyển remote URL sang HTTPS:
```bash
git remote set-url origin https://github.com/msbmbanking/Dichvucong.git
```

Sau đó push lại:
```bash
git push -u origin main
```

GitHub sẽ yêu cầu đăng nhập:
- **Username:** Tên tài khoản GitHub của bạn
- **Password:** Sử dụng Personal Access Token (không phải mật khẩu GitHub)

### Cách 2: Cấu Hình SSH Key

#### Bước 1: Kiểm tra SSH key có sẵn
```bash
ls -al ~/.ssh
```

#### Bước 2: Tạo SSH key mới (nếu chưa có)
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

Nhấn Enter để chấp nhận đường dẫn mặc định.

#### Bước 3: Xem public key
```bash
cat ~/.ssh/id_ed25519.pub
```

#### Bước 4: Thêm SSH key vào GitHub
1. Copy toàn bộ nội dung public key
2. Truy cập GitHub → Settings → SSH and GPG keys
3. Nhấn "New SSH key"
4. Dán key vào và lưu

#### Bước 5: Test kết nối
```bash
ssh -T git@github.com
```

#### Bước 6: Đổi lại remote về SSH
```bash
git remote set-url origin git@github.com:msbmbanking/Dichvucong.git
```

#### Bước 7: Push lại
```bash
git push -u origin main
```

## 🔑 Tạo Personal Access Token (Cho HTTPS)

Nếu sử dụng HTTPS, bạn cần Personal Access Token:

1. Truy cập GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Nhấn "Generate new token (classic)"
3. Đặt tên token (ví dụ: "Netlify Deploy")
4. Chọn quyền: `repo` (Full control of private repositories)
5. Nhấn "Generate token"
6. **Copy token ngay** (chỉ hiển thị 1 lần)
7. Khi push, sử dụng token này làm password

## 📝 Lưu Ý

- **HTTPS:** Dễ sử dụng nhưng cần token mỗi lần push
- **SSH:** Cấu hình 1 lần, sau đó không cần nhập mật khẩu

## ✅ Sau Khi Push Thành Công

Code đã được push lên GitHub, bạn có thể:
1. Deploy lên Netlify từ GitHub
2. Hoặc sử dụng Netlify CLI: `netlify deploy --prod`

---

**Chúc bạn thành công! 🎉**

