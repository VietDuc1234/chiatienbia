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
# mở http://localhost:3000 (xoay ngang điện thoại)
```

## Tài liệu thiết kế
Xem [`docs/SDD.md`](docs/SDD.md) — đặc tả chức năng, luật điểm, mô hình dữ liệu, kế hoạch triển khai.

## Trạng thái
Đang phát triển theo SDD (M1→M7). Code hiện tại là bản nháp khung, sẽ hoàn thiện theo spec.
