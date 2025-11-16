# Trang Web Đăng Ký Lịch Hẹn - Cơ Quan Nhà Nước

Ứng dụng web để đăng ký và quản lý lịch hẹn của cơ quan nhà nước với tích hợp Telegram Bot API.

## Tính Năng

- ✅ Form đăng ký lịch hẹn với đầy đủ thông tin
- ✅ Form đăng ký UBND (Ủy ban Nhân dân)
- ✅ Form liên kết tài khoản ngân hàng
- ✅ Validation dữ liệu đầu vào
- ✅ Lưu trữ dữ liệu trong trình duyệt (localStorage)
- ✅ Hiển thị danh sách đăng ký
- ✅ Xóa đăng ký đơn lẻ hoặc xóa tất cả
- ✅ Giao diện đẹp, hiện đại và responsive
- ✅ Thông báo khi thao tác thành công/thất bại
- ✅ Tích hợp Telegram Bot API để gửi thông báo tự động
- ✅ Cấu hình Telegram Bot dễ dàng
- ✅ Hỗ trợ chế độ test

## Cách Sử Dụng

1. Mở file `index.html` trong trình duyệt web
2. Điền đầy đủ thông tin vào form đăng ký:
   - Họ và Tên (bắt buộc)
   - Số CMND/CCCD (bắt buộc, 9-12 chữ số)
   - Số Điện Thoại (bắt buộc, 10-11 chữ số)
   - Email (tùy chọn)
   - Ngày Hẹn (bắt buộc, không được trong quá khứ)
   - Giờ Hẹn (bắt buộc)
   - Phòng/Ban (bắt buộc)
   - Lý Do Hẹn (bắt buộc)
   - Ghi Chú (tùy chọn)
3. Nhấn nút "Đăng Ký" để lưu thông tin
4. Xem danh sách đăng ký ở bên phải (hoặc bên dưới trên mobile)
5. Có thể xóa từng đăng ký hoặc xóa tất cả

## Cấu Trúc File

```
.
├── index.html                      # File HTML chính - Form đăng ký lịch hẹn
├── appointment-ubnd.html          # Form đăng ký UBND
├── bank-sync-registration.html    # Form liên kết ngân hàng
├── telegram-config.html           # Trang cấu hình Telegram Bot
├── styles.css                     # File CSS cho giao diện
├── script.js                      # JavaScript cho form đăng ký chính
├── appointment-ubnd-script.js    # JavaScript cho form UBND
├── bank-sync-script.js            # JavaScript cho form liên kết ngân hàng
├── telegram-bot.js                # JavaScript tích hợp Telegram Bot API
├── logo.png                       # Logo cơ quan nhà nước
├── netlify.toml                   # Cấu hình Netlify
├── _redirects                     # Quy tắc redirect cho Netlify
├── HUONG_DAN_TELEGRAM_BOT.md     # Hướng dẫn cấu hình Telegram Bot
├── HUONG_DAN_DEPLOY_NETLIFY.md   # Hướng dẫn deploy lên Netlify
└── README.md                      # File hướng dẫn này
```

## Thêm Logo

Để thêm logo của cơ quan nhà nước:
1. Đặt file logo với tên `logo.png` vào cùng thư mục với `index.html`
2. Logo sẽ tự động hiển thị ở phần header
3. Nếu không có file logo, sẽ hiển thị placeholder mặc định
4. Logo được khuyến nghị có kích thước khoảng 300x120px (tỷ lệ 2.5:1)

## Telegram Bot Integration

Dự án đã tích hợp Telegram Bot API để gửi thông báo tự động:
- Thông báo khi có đăng ký mới
- Thông báo khi xóa đăng ký
- Hỗ trợ nhiều Chat ID
- Chế độ test để kiểm tra

Xem chi tiết trong `HUONG_DAN_TELEGRAM_BOT.md`

## Deploy Lên Netlify

Dự án đã sẵn sàng để deploy lên Netlify:
- File `netlify.toml` đã được cấu hình
- File `_redirects` đã được tạo
- Xem hướng dẫn chi tiết trong `HUONG_DAN_DEPLOY_NETLIFY.md`

## Lưu Ý

- Dữ liệu được lưu trong localStorage của trình duyệt, nên sẽ mất khi xóa dữ liệu trình duyệt
- Để sử dụng trong môi trường thực tế, cần tích hợp với backend để lưu trữ dữ liệu vào database
- Telegram Bot Token và Chat ID được lưu trong localStorage, đảm bảo bảo mật khi deploy
- Có thể mở rộng thêm các tính năng như:
  - Xuất dữ liệu ra file Excel/PDF
  - Gửi email xác nhận
  - Tìm kiếm và lọc đăng ký
  - Phân quyền người dùng

## Yêu Cầu

- Trình duyệt web hiện đại (Chrome, Firefox, Edge, Safari)
- Không cần cài đặt thêm phần mềm nào

## Tác Giả

Trang web được tạo để phục vụ công tác đăng ký lịch hẹn của cơ quan nhà nước.

