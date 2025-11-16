# 📖 Hướng Dẫn Cấu Hình Telegram Bot

## Mục Đích
Hướng dẫn chi tiết cách lấy Bot Token và Chat ID để cấu hình hệ thống gửi thông báo qua Telegram.

---

## Bước 1: Tạo Telegram Bot

### 1.1. Mở Telegram và tìm BotFather
1. Mở ứng dụng Telegram trên điện thoại hoặc máy tính
2. Tìm kiếm `@BotFather` trong thanh tìm kiếm
3. Nhấn vào kết quả tìm kiếm và bắt đầu chat

### 1.2. Tạo bot mới
1. Gửi lệnh `/newbot` cho BotFather
2. BotFather sẽ hỏi tên cho bot của bạn
   - Ví dụ: `Hệ Thống Đăng Ký Lịch Hẹn`
3. Tiếp theo, BotFather sẽ hỏi username cho bot (phải kết thúc bằng `bot`)
   - Ví dụ: `he_thong_dang_ky_lich_hen_bot`
4. Sau khi tạo thành công, BotFather sẽ cung cấp **Bot Token**
   - Token có dạng: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz1234567890`
   - ⚠️ **LƯU Ý QUAN TRỌNG**: Sao chép và lưu token này cẩn thận, không chia sẻ với người khác!

---

## Bước 2: Lấy Chat ID

### 2.1. Lấy Chat ID cá nhân (Chat với chính mình)

**Cách 1: Sử dụng @userinfobot**
1. Tìm kiếm `@userinfobot` trên Telegram
2. Bắt đầu chat với bot này
3. Bot sẽ tự động gửi thông tin của bạn, bao gồm **Chat ID**
   - Chat ID thường là số dương: `123456789`

**Cách 2: Sử dụng API Telegram**
1. Gửi một tin nhắn bất kỳ cho bot bạn vừa tạo
2. Truy cập URL sau (thay `YOUR_BOT_TOKEN` bằng token của bạn):
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   ```
3. Tìm trong kết quả JSON trả về, tìm trường `"chat":{"id":123456789}`
4. Số `123456789` chính là Chat ID của bạn

### 2.2. Lấy Chat ID nhóm (Group Chat)

**Cách 1: Thêm bot vào nhóm**
1. Tạo một nhóm Telegram mới hoặc chọn nhóm có sẵn
2. Thêm bot bạn vừa tạo vào nhóm (tìm username bot và thêm vào)
3. Gửi một tin nhắn bất kỳ trong nhóm (có thể là `/start` hoặc bất kỳ tin nhắn nào)
4. Truy cập URL sau (thay `YOUR_BOT_TOKEN` bằng token của bạn):
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   ```
5. Tìm trong kết quả JSON, tìm trường `"chat":{"id":-1001234567890,"title":"Tên Nhóm"}`
6. Số `-1001234567890` (số âm) chính là Chat ID của nhóm
   - ⚠️ **LƯU Ý**: Chat ID nhóm thường bắt đầu bằng `-100` và có nhiều chữ số hơn

**Cách 2: Sử dụng bot @getidsbot**
1. Thêm bot `@getidsbot` vào nhóm của bạn
2. Bot sẽ tự động gửi Chat ID của nhóm

---

## Bước 3: Cấu Hình Trong Hệ Thống

### 3.1. Truy cập trang cấu hình
1. Mở trang chủ của hệ thống
2. Tìm và nhấn vào **"Cấu Hình Telegram Bot"** trong menu **CÔNG DÂN**
3. Hoặc truy cập trực tiếp: `telegram-config.html`

### 3.2. Nhập thông tin
1. **Bot Token**: 
   - Dán token bạn đã lấy từ BotFather vào ô này
   - Ví dụ: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz1234567890`

2. **Chat ID**: 
   - Nhập Chat ID bạn đã lấy (cá nhân hoặc nhóm)
   - Chat ID cá nhân: `123456789`
   - Chat ID nhóm: `-1001234567890`

### 3.3. Thêm nhiều Chat ID (Tùy chọn)
- Nếu muốn nhận thông báo ở nhiều nơi (cá nhân + nhóm), nhấn nút **"+ Thêm Chat ID"**
- Thêm các Chat ID khác vào danh sách
- Có thể xóa Chat ID bằng nút **"Xóa"** bên cạnh mỗi Chat ID

### 3.4. Kiểm tra kết nối
1. Nhấn nút **"Kiểm Tra Kết Nối"**
2. Hệ thống sẽ gửi một tin nhắn test đến tất cả Chat ID đã cấu hình
3. Kiểm tra Telegram của bạn/nhóm để xem có nhận được tin nhắn không
4. Nếu thành công, bạn sẽ thấy thông báo: `✅ Kết nối thành công! Bot đã gửi tin nhắn kiểm tra đến X/Y Chat ID.`

### 3.5. Lưu cấu hình
1. Nhấn nút **"Lưu Cấu Hình"**
2. Hệ thống sẽ lưu thông tin vào trình duyệt
3. Bạn sẽ thấy thông báo: `Đã lưu cấu hình thành công! (X Chat ID)`

---

## Bước 4: Kiểm Tra Hoạt Động

Sau khi cấu hình xong, hệ thống sẽ tự động gửi thông báo qua Telegram khi có các sự kiện sau:

### ✅ Các sự kiện được gửi thông báo:
1. **Đăng ký lịch hẹn mới** - Khi có người đăng ký lịch hẹn
2. **Đăng ký UBND mới** - Khi có đăng ký làm việc với UBND
3. **Đăng ký đồng bộ ngân hàng** - Khi có đăng ký liên kết ngân hàng
4. **Xóa đăng ký** - Khi có đăng ký bị xóa
5. **Xóa tất cả đăng ký** - Khi xóa toàn bộ đăng ký

### 📱 Kiểm tra thông báo:
- Mở Telegram (cá nhân hoặc nhóm đã cấu hình)
- Bạn sẽ nhận được thông báo chi tiết về từng sự kiện

---

## Xử Lý Lỗi

### ❌ Lỗi: "Telegram Bot chưa được cấu hình"
- **Nguyên nhân**: Chưa nhập Bot Token hoặc Chat ID
- **Giải pháp**: Kiểm tra lại và nhập đầy đủ thông tin

### ❌ Lỗi: "Unauthorized" hoặc "Invalid token"
- **Nguyên nhân**: Bot Token không đúng hoặc đã bị thu hồi
- **Giải pháp**: 
  1. Kiểm tra lại token từ BotFather
  2. Nếu cần, tạo bot mới và lấy token mới

### ❌ Lỗi: "Chat not found" hoặc "Bad Request: chat not found"
- **Nguyên nhân**: 
  - Chat ID không đúng
  - Bot chưa được thêm vào nhóm (đối với nhóm)
  - Bot chưa được start (đối với chat cá nhân)
- **Giải pháp**:
  1. Kiểm tra lại Chat ID
  2. Đảm bảo bot đã được thêm vào nhóm (nếu là nhóm)
  3. Gửi lệnh `/start` cho bot (nếu là chat cá nhân)
  4. Thử lại với Chat ID mới

### ❌ Lỗi: "Forbidden: bot is not a member of the group chat"
- **Nguyên nhân**: Bot chưa được thêm vào nhóm
- **Giải pháp**: 
  1. Thêm bot vào nhóm
  2. Đảm bảo bot có quyền gửi tin nhắn trong nhóm
  3. Gửi một tin nhắn bất kỳ trong nhóm để bot nhận diện

---

## Lưu Ý Bảo Mật

⚠️ **QUAN TRỌNG**:
- **KHÔNG** chia sẻ Bot Token với người khác
- **KHÔNG** commit Bot Token vào Git hoặc chia sẻ công khai
- Bot Token cho phép ai đó kiểm soát bot của bạn
- Nếu token bị lộ, hãy tạo bot mới và lấy token mới từ BotFather

---

## Ví Dụ Cấu Hình

### Ví dụ 1: Chỉ nhận thông báo cá nhân
```
Bot Token: 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz1234567890
Chat ID 1: 123456789 (Chat ID cá nhân)
```

### Ví dụ 2: Nhận thông báo ở cả cá nhân và nhóm
```
Bot Token: 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz1234567890
Chat ID 1: 123456789 (Chat ID cá nhân)
Chat ID 2: -1001234567890 (Chat ID nhóm)
```

---

## Hỗ Trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra lại các bước trong hướng dẫn
2. Đảm bảo bot đã được cấu hình đúng
3. Kiểm tra kết nối internet
4. Thử lại với token và Chat ID mới

---

**Chúc bạn cấu hình thành công! 🎉**

