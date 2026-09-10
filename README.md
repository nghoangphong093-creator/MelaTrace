# MelaTrace

Website full-stack demo cho bài toán truy xuất nguồn gốc hai chiều + Feedback.

## Stack
- Frontend: React + Vite + React Router + Recharts + Lucide
- Backend: Node.js + Express
- Database: SQLite (`better-sqlite3`)
- Auth: JWT + bcrypt
- Upload: Multer, tối đa 3 file/lần
- Persistence: dữ liệu nằm trong `server/melatrace.db`, không reset khi đóng trình duyệt.

## Chạy trong VS Code

Yêu cầu Node.js 20+.

```bash
npm install
npm run install-all
npm run dev
```

Mở:
- Customer: http://localhost:5173
- Admin: http://localhost:5173/admin
- API: http://localhost:4000

## Tài khoản demo
Admin:
- Email: admin@melatrace.vn
- Password: Admin@123456

Customer:
- Email: customer@melatrace.vn
- Password: Customer@123456

## Dữ liệu demo đúng cấu trúc
1 vùng/lô nguyên liệu:
- NL-2026-001

2 lô sản xuất:
- SX-2026-001
- SX-2026-002

2 sản phẩm:
- SP-2026-011
- SP-2026-012

2 kiểm nghiệm:
- KN-2026-021
- KN-2026-022

2 bảo quản:
- BQ-2026-021
- BQ-2026-022

2 phân phối:
- PP-2026-021
- PP-2026-022

## Lưu ý
- Đây là bản chạy thật ở local, database SQLite thật.
- Sửa sản phẩm trong Admin sẽ được API lưu vào SQLite và trang Customer đọc lại dữ liệu mới.
- Customer gửi CASE sẽ được lưu DB và xuất hiện ở Admin.
- Mở chi tiết CASE tự chuyển Mới → Đang xử lý.
- Nút Xác minh chuyển → Đã xác minh.
- Nút Đã xử lý chuyển → Đã giải quyết.
- Activity Log ghi các hành động admin.
- Analytics hiện đường ngang 0 đúng yêu cầu vì chưa có số liệu thật.
- Có thể mở rộng CRUD sâu cho từng entity, upload PDF chứng nhận, RBAC nhiều cấp và export CSV/PDF sau.
