# chiatienbia — Tính điểm & chia tiền bi-a

Web app đơn giản (chạy local) để ghi điểm khi chơi bi-a và chia tiền cuối ván.

- Ghi điểm bằng **kéo–thả** chip (`.`, `14`, `15`, `cháy`) vào người chơi.
- Điểm zero-sum; cuối ván nhập **giá mỗi điểm** để ra tiền (ai trả / ai nhận).
- Lưu lịch sử từng phiên; có nút **Phiên mới**.
- Lưu trữ: **Vercel Blob** (1 file JSON) khi deploy; fallback `data.json` khi dev local.

## Tech stack
Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS · Framer Motion · @dnd-kit · Vercel Blob.

## Chạy thử
```bash
npm install
npm run dev
# mở http://localhost:3000 — dùng được cả khi xoay ngang hoặc dọc màn hình
```

## Deploy lên Vercel
1. Tạo project trên Vercel từ repo này.
2. Tạo một **Vercel Blob store**, gắn vào project — Vercel sẽ tự thêm biến môi trường `BLOB_READ_WRITE_TOKEN`. Không có biến này thì app tự fallback ghi vào `data.json` (chỉ phù hợp dev local, không bền trên serverless).
3. Deploy — không cần cấu hình gì thêm.

## Tài liệu thiết kế
Xem [`docs/SDD.md`](docs/SDD.md) — đặc tả chức năng, luật điểm, mô hình dữ liệu, kế hoạch triển khai. Xem [`docs/UI-DESIGN.md`](docs/UI-DESIGN.md) cho chi tiết giao diện.

## Trạng thái
Hoàn thành theo SDD (M0→M7): kéo–thả ghi điểm, chỉnh tay ±/double-tap cân bằng, quản lý người chơi, phiên mới & chia tiền, lịch sử, âm thanh, theme sáng/tối, layout dọc & ngang.
