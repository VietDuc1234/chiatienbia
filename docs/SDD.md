# SDD — Web Tính Điểm & Chia Tiền Bi-a

**Tên dự án:** chiatienbia
**Phiên bản tài liệu:** 0.2 (cập nhật cơ chế kéo–thả)
**Ngày:** 2026-06-24

---

## 1. Tổng quan

### 1.1 Mục tiêu
Web app đơn giản, dùng trên điện thoại (xoay ngang), để:
- Ghi điểm cho người chơi bi-a bằng cách **kéo–thả** các chip điểm (`.`, `14`, `15`, `cháy`) vào người chơi.
- Cuối ván nhập **giá mỗi điểm** để quy ra tiền: ai trả, ai nhận.
- **Lưu lại từng phiên chơi** (lịch sử) để xem lại / copy chia sẻ.
- Có nút **"Phiên mới"** để bắt đầu ván mới.

### 1.2 Phạm vi
- Chạy **local** (1 thiết bị / LAN), không cần Internet.
- **Không dùng database.** Toàn bộ dữ liệu lưu trong **một file `data.json`**.
- Một người dùng/thiết bị tại một thời điểm, không cần đăng nhập.

### 1.3 Ngoài phạm vi (v1)
- Đăng nhập / tài khoản; đồng bộ real-time nhiều thiết bị; thống kê/biểu đồ nâng cao.
- Triển khai serverless production (xem ghi chú mục 9 về `data.json`).

---

## 2. Đối tượng & ngữ cảnh sử dụng
- **Người dùng:** nhóm bạn chơi bi-a, **2–4 người**.
- **Thiết bị:** điện thoại đặt ngang (landscape) cạnh bàn; có thể mở trên laptop.
- **Ngữ cảnh:** vừa chơi vừa ghi điểm nhanh; chữ to, thao tác kéo–thả 1 tay.

---

## 3. Yêu cầu chức năng (FR)

| Mã | Tính năng | Mô tả |
|----|-----------|-------|
| FR-1 | Hiển thị người chơi | Mỗi người 1 thẻ màu: TÊN — ĐIỂM. Là **vùng thả** (drop target). Điểm có thể âm. |
| FR-2 | Ghi điểm bằng kéo–thả | Cột phải có 4 **chip**: `.`, `14`, `15`, `cháy`. Kéo 1 chip thả vào thẻ người chơi → áp dụng luật điểm (mục 5). Hỗ trợ cả chuột & cảm ứng. |
| FR-3 | Hoàn tác (Undo) | Nút "↩" hoàn tác lần ghi điểm gần nhất (lưu ngăn xếp các bước). |
| FR-4 | Thêm người chơi | Nút "👤+" → nhập tên → người mới (điểm 0, tự gán màu). **Tối đa 4 người** (đủ 4 thì khoá nút). |
| FR-5 | Đổi tên / Xoá người | Nhấn đúp tên để đổi tên; nhấn giữ thẻ để xoá (có xác nhận). |
| FR-6 | Reset điểm | Nút "⟳" → đưa điểm tất cả về 0 (giữ danh sách người), có xác nhận. |
| FR-7 | Bật/tắt âm thanh | Nút "🔊/🔇" → bật/tắt tiếng khi ghi điểm. Lưu trạng thái. |
| FR-8 | Chia tiền | Nút "💰" → nhập **giá mỗi điểm (VND)** → bảng mỗi người: điểm, **tiền = điểm × giá**, nhãn TRẢ (điểm âm) / NHẬN (điểm dương). |
| FR-9 | Lưu phiên & Phiên mới | Trong bảng chia tiền: **"Lưu & phiên mới"** → lưu phiên vào lịch sử (thời gian, điểm, giá, tiền) rồi bắt đầu phiên mới (**giữ người, điểm về 0**). Giá = 0 → **cảnh báo xác nhận** trước khi lưu. |
| FR-10 | Lịch sử | Nút "📜" → danh sách phiên đã lưu (mới nhất trên cùng): ngày giờ, giá, điểm & tiền từng người. Mỗi mục có nút **Copy** (text) và **Xoá**. |
| FR-11 | Tự động lưu | Mọi thay đổi tự ghi `data.json` (debounce ~350ms). Mở lại vẫn còn dữ liệu. |
| FR-12 | Nhắc xoay ngang | Màn hình dọc → hiện thông báo "Vui lòng xoay ngang". |

---

## 4. Yêu cầu phi chức năng (NFR)
- **NFR-1 (Khả dụng):** chữ to, chip & thẻ lớn; kéo–thả mượt trên cảm ứng.
- **NFR-2 (Hiệu năng):** ghi điểm phản hồi tức thì (<50ms), không chờ mạng.
- **NFR-3 (Bền dữ liệu):** không mất dữ liệu khi tắt/mở lại.
- **NFR-4 (Triển khai đơn giản):** `npm install` → `npm start`.
- **NFR-5 (Tương thích):** Chrome/Safari/Edge điện thoại & desktop hiện đại; dùng Pointer Events cho kéo–thả (chạy cả chuột lẫn chạm).

---

## 5. Luật nghiệp vụ

### 5.1 Ghi điểm (kéo–thả, zero-sum)
Gọi **n** = số người chơi hiện tại, **target** = người được thả chip vào.

| Chip | Đơn vị (u) | target nhận | mỗi người KHÁC | Tổng |
|------|-----------|-------------|----------------|------|
| **.** | 10 | `+u × (n−1)` | `−u` | 0 (zero-sum) |
| **14** | 2 | `+u × (n−1)` | `−u` | 0 (zero-sum) |
| **15** | 2 | `+u × (n−1)` | `−u` | 0 (zero-sum) |
| **cháy** | 10 | `−u` (chỉ trừ target) | không đổi | −10 (nộp phạt, không chia) |

Ví dụ (n = 3): `.` → target **+20**, hai người kia mỗi người **−10**. `14` → target **+4**, mỗi người kia **−2**. `cháy` → target **−10**, người khác giữ nguyên.
Ví dụ (n = 4): `.` → target **+30**, ba người kia mỗi người **−10**.

> Các đơn vị `u` để dạng hằng số cấu hình (`scoring` trong `data.json`) để sau dễ chỉnh, v1 không cần UI sửa.

**Trường hợp đặc biệt:** nếu chỉ có 1 người chơi (n=1) → `.`,`14`,`15` cộng 0 cho người khác và target +0 (không ý nghĩa) → có thể bỏ qua/cảnh báo; `cháy` vẫn −10.

### 5.2 Chia tiền (theo giá mỗi điểm)
- Nhập `pricePerPoint` (VND) cuối ván. Mỗi người: `tien = score × pricePerPoint`.
  - `< 0` → **TRẢ** `|tien|`; `> 0` → **NHẬN** `tien`; `= 0` → không.
- Hiển thị **net** = tổng `tien`. Do `cháy` không zero-sum nên net có thể ≠ 0 → hiện ghi chú (phần lệch là tiền phạt "cháy").
- Làm tròn tới **đồng**, định dạng `vi-VN` (vd `50.000 đ`).

---

## 6. Mô hình dữ liệu — `data.json`

```json
{
  "currentSession": {
    "id": 1750000000000,
    "startedAt": "2026-06-24T14:00:00.000Z",
    "pricePerPoint": 0,
    "players": [
      { "id": 1, "name": "THANH", "score": 20,  "color": "#ff4d4d" },
      { "id": 2, "name": "DAC",   "score": -10, "color": "#ffeb3b" },
      { "id": 3, "name": "DUC",   "score": -10, "color": "#ff9800" }
    ]
  },
  "soundOn": true,
  "scoring": { "dot": 10, "ball14": 2, "ball15": 2, "burn": 10 },
  "history": [
    {
      "id": 1749990000000,
      "startedAt": "2026-06-24T10:00:00.000Z",
      "endedAt": "2026-06-24T11:30:00.000Z",
      "pricePerPoint": 5000,
      "players": [
        { "name": "THANH", "score": 20,  "money": 100000 },
        { "name": "DUC",   "score": -10, "money": -50000 }
      ]
    }
  ]
}
```

- `currentSession`: ván đang chơi.
- `scoring`: đơn vị điểm các chip (mặc định như trên).
- `history`: mảng phiên đã lưu (mới nhất ở đầu), giới hạn ~100 mục.
- *Ghi chú:* ngăn xếp Undo giữ ở client (không cần lưu file).

---

## 7. Thiết kế giao diện (UI)

### 7.1 Bố cục chính (landscape)
```
┌───────────────────────────────────────────────────────┐
│ [👤+] [↩] [⟳] [💰] [📜] [🔊]        (thanh công cụ)     │
├──────────────────────────────────────┬────────────────┤
│  ┌────────────────────────────────┐  │     ( . )      │
│  │  THANH                    +20  │  │                │
│  └────────────────────────────────┘  │    ( 14 )      │
│  ┌────────────────────────────────┐  │                │
│  │  DAC                      -10  │  │    ( 15 )      │
│  └────────────────────────────────┘  │                │
│  ┌────────────────────────────────┐  │   ( cháy )     │
│  │  DUC                      -10  │  │                │
│  └────────────────────────────────┘  │                │
└──────────────────────────────────────┴────────────────┘
```
- **Nền** xanh navy `#0a0e2a`. **Thẻ người chơi** nền màu riêng, chữ đen in đậm, là vùng thả.
- **Cột phải**: 4 **chip** kéo được: `.` (xanh), `14`, `15`, `cháy` (đỏ). Khi đang kéo: chip "bay" theo ngón tay, thẻ người chơi nào ở dưới thì **sáng viền** (highlight) báo sẽ thả vào đó.
- **Thanh công cụ** trên: Thêm người, Undo, Reset, Chia tiền, Lịch sử, Âm thanh.
- Khi thả thành công: thẻ target nhấp nháy nhẹ + (nếu bật) phát tiếng.

### 7.2 Tương tác kéo–thả (Pointer Events)
- `pointerdown` trên chip → bắt đầu kéo (tạo bản sao chip đi theo con trỏ).
- `pointermove` → cập nhật vị trí; xác định thẻ người chơi dưới con trỏ (`elementFromPoint`) → highlight.
- `pointerup` → nếu trên 1 thẻ hợp lệ thì áp luật điểm; ngược lại huỷ.

### 7.3 Modal "Thêm người"
- Ô nhập tên (≤12 ký tự) + [Huỷ] [Thêm]. Khoá khi đã đủ 4 người.

### 7.4 Modal "Chia tiền"
- Ô **Giá mỗi điểm (VND)**; bảng Tên | Điểm | Số tiền | TRẢ/NHẬN; dòng net.
- Nút **[Lưu & phiên mới]**, **[📜 Lịch sử]**, **[Đóng]**.

### 7.5 Modal "Lịch sử"
- Danh sách phiên (mới nhất trên cùng): ngày giờ, giá, bảng tóm tắt từng người (điểm, tiền). Mỗi mục: **[Copy]** (text gửi Zalo/Messenger), **[Xoá]**. Nút [Đóng].

---

## 8. Kiến trúc & công nghệ
- **Frontend:** HTML + CSS + JavaScript thuần (SPA 1 trang), kéo–thả bằng Pointer Events.
- **Backend:** Node.js + **Express** — phục vụ `public/` và API đọc/ghi `data.json`.
- **Lưu trữ:** file `data.json` thư mục gốc.
- **Chạy:** `npm install` → `npm start` → `http://localhost:3000`.

```
chiatienbia/
├─ server.js          # Express + API
├─ data.json          # currentSession, history, soundOn, scoring
├─ package.json
├─ docs/SDD.md
└─ public/
   ├─ index.html
   ├─ style.css
   └─ app.js
```

---

## 9. API

| Method | Đường dẫn | Mô tả | Body / Trả về |
|--------|-----------|-------|----------------|
| GET | `/api/state` | Lấy toàn bộ trạng thái | → `{ currentSession, soundOn, scoring, history }` |
| POST | `/api/state` | Ghi đè toàn bộ trạng thái | Body: state đầy đủ → `{ ok: true }` |

> **Ghi chú:** `data.json` chỉ bền khi chạy server có ổ đĩa ghi (local/VPS). Trên Vercel/serverless filesystem là tạm thời → nếu deploy cloud sau này cần đổi sang Blob/KV/DB. v1 nhắm local.

---

## 10. Các trường hợp biên
- 0 người → không có vùng thả; chip kéo thả ra ngoài thì huỷ.
- 1 người → chip `.`/`14`/`15` không có "người khác" để trừ (target +0); cân nhắc cảnh báo; `cháy` vẫn −10.
- Tên trùng → cho phép (phân biệt bằng id).
- Giá điểm trống/0 → tiền = 0, lưu phiên cần xác nhận.
- `data.json` hỏng → server trả trạng thái mặc định (không crash).
- Undo khi chưa có bước nào → không làm gì.

---

## 11. Kế hoạch triển khai (milestones)
1. **M1 — Khung & lưu trữ:** `server.js`, schema `data.json` (currentSession/history/scoring), API.
2. **M2 — Giao diện:** layout landscape, thẻ người chơi, thanh công cụ, cột chip.
3. **M3 — Kéo–thả & luật điểm:** Pointer Events, áp công thức zero-sum + cháy, Undo.
4. **M4 — Người chơi:** thêm (≤4)/đổi tên/xoá, reset, âm thanh, tự lưu.
5. **M5 — Chia tiền:** modal giá điểm, tính tiền.
6. **M6 — Phiên & Lịch sử:** lưu phiên/phiên mới, lịch sử, copy/xoá.
7. **M7 — Hoàn thiện:** nhắc xoay ngang, kiểm thử thủ công, README.

---

## 12. Quyết định đã chốt
- Điểm ghi bằng **kéo–thả** chip vào người chơi.
- Công thức **mỗi đối thủ trừ mức cố định**, người được kéo nhận tổng (zero-sum). `.`=10, `14`=`15`=2 mỗi đối thủ.
- **`cháy` = −10 chỉ cho người đó** (không chia, coi như nộp phạt).
- Các số là **ĐIỂM**; cuối ván × giá mỗi điểm ra tiền.
- **Phiên mới giữ người, điểm về 0**; **Lịch sử có nút Copy**; **giá = 0 thì cảnh báo**; **tối đa 4 người**.
