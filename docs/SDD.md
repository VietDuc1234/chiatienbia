# SDD — Web Tính Điểm & Chia Tiền Bi-a

**Tên dự án:** chiatienbia
**Phiên bản tài liệu:** 0.5 (thêm double-tap cân bằng zero-sum)
**Ngày:** 2026-06-24

> **Changelog 0.5:** thêm **FR-14 — double-tap vào thẻ người chơi để tự động cân bằng điểm về tổng 0** (zero-sum), dùng để dồn nhanh phần lệch do `cháy` (mục 5.1 không zero-sum) về 1 người. Xem FR-14, §5.1, §12.
>
> **Changelog 0.4:** chốt thiết kế giao diện chi tiết ở [`UI-DESIGN.md`](UI-DESIGN.md) (ảnh wireframe ở [`wireframes/`](wireframes/)). Thay thanh công cụ 6 icon bằng **header tối giản** (☰ + 🌗) + **sidebar** chứa Thêm người/Phiên mới/Lịch sử/Cài đặt; thêm **nút −/+ chỉnh điểm thủ công** trên thẻ người chơi; **layout dọc (portrait)** nay là layout đầy đủ chức năng, không còn màn chặn xoay ngang; gộp modal Chia tiền vào luồng Phiên mới; Undo/Reset bị bỏ, âm thanh & đổi tên/xoá người chuyển vào Cài đặt.

---

## 1. Tổng quan

### 1.1 Mục tiêu
Web app đơn giản, dùng trên điện thoại (cả 2 chiều ngang/dọc), để:
- Ghi điểm cho người chơi bi-a bằng cách **kéo–thả** các chip điểm (`.`, `14`, `15`, `cháy`) vào người chơi.
- Cuối ván nhập **giá mỗi điểm** để quy ra tiền: ai trả, ai nhận.
- **Lưu lại từng phiên chơi** (lịch sử) để xem lại / copy chia sẻ.
- Có nút **"Phiên mới"** để bắt đầu ván mới.

### 1.2 Phạm vi
- **Deploy lên Vercel** (Next.js). Cũng chạy được **local** khi dev.
- **Không dùng database quan hệ.** Dữ liệu lưu dưới dạng **một file JSON** trên **Vercel Blob** (prod). Khi dev local, fallback ghi `data.json` ở thư mục gốc (nếu chưa có Blob token).
- Một trạng thái dùng chung (một bảng điểm), không cần đăng nhập.

### 1.3 Ngoài phạm vi (v1)
- Đăng nhập / tài khoản nhiều người; phân quyền.
- Đồng bộ real-time đa thiết bị (chỉ load lại khi mở/refresh).
- Thống kê/biểu đồ nâng cao.

---

## 2. Đối tượng & ngữ cảnh sử dụng
- **Người dùng:** nhóm bạn chơi bi-a, **2–4 người**.
- **Thiết bị:** điện thoại cạnh bàn, dùng được cả khi đặt ngang (landscape) hoặc dọc (portrait); có thể mở trên laptop.
- **Ngữ cảnh:** vừa chơi vừa ghi điểm nhanh; chữ to, thao tác kéo–thả 1 tay.

---

## 3. Yêu cầu chức năng (FR)

> Chi tiết bố cục/kích thước UI cho các FR dưới đây xem [`UI-DESIGN.md`](UI-DESIGN.md).

| Mã | Tính năng | Mô tả |
|----|-----------|-------|
| FR-1 | Hiển thị người chơi | Mỗi người 1 thẻ: TÊN — ĐIỂM. Là **vùng thả** (drop target). Điểm có thể âm. Thẻ cỡ lớn, dễ bấm/kéo (UI-DESIGN §4). |
| FR-2 | Ghi điểm bằng kéo–thả | 4 **chip** cỡ lớn: `.`, `14`, `15`, `cháy` (cột dọc ở landscape, hàng ngang ở portrait). Kéo 1 chip thả vào thẻ người chơi → áp dụng luật điểm (mục 5). Hỗ trợ cả chuột & cảm ứng. |
| FR-3 | Chỉnh điểm thủ công | Mỗi thẻ người chơi có 2 nút **−/+** để sửa nhanh điểm của chính người đó (không qua kéo–thả, không áp dụng công thức zero-sum mục 5.1). *(Thay cho Undo ở bản cũ — đã bỏ, xem §12.)* |
| FR-4 | Thêm người chơi | Mục **"👤+ Thêm người"** trong sidebar → nhập tên → người mới (điểm 0, tự gán màu). **Tối đa 4 người** (đủ 4 thì khoá mục). |
| FR-5 | Đổi tên / Xoá người | Thực hiện trong modal **"⚙️ Cài đặt"** (sidebar): danh sách người chơi, mỗi người có nút đổi tên & xoá (có xác nhận). |
| FR-6 | Bật/tắt âm thanh | Trong modal **"⚙️ Cài đặt"** (sidebar): bật/tắt tiếng khi ghi điểm. Lưu trạng thái. *(Trước đây là icon riêng trên thanh công cụ.)* |
| FR-7 | Phiên mới & chia tiền | Mục **"➕ Phiên mới"** trong sidebar → nhập **giá mỗi điểm (VND)** → xem bảng: điểm, **tiền = điểm × giá**, nhãn TRẢ/NHẬN → **"Lưu & phiên mới"** lưu phiên vào lịch sử rồi reset điểm về 0 (**giữ người chơi**). Giá = 0 → **cảnh báo xác nhận** trước khi lưu. *(Gộp 2 chức năng Chia tiền + Lưu phiên/Phiên mới của bản cũ thành 1 luồng.)* |
| FR-8 | Lịch sử | Mục **"📜 Lịch sử"** trong sidebar → danh sách phiên đã lưu (mới nhất trên cùng): ngày giờ, giá, điểm & tiền từng người. Mỗi mục có nút **Copy** (text) và **Xoá**. |
| FR-9 | Tự động lưu | Mọi thay đổi tự ghi `data.json`/Blob (debounce ~350ms). Mở lại vẫn còn dữ liệu. |
| FR-10 | Layout dọc & ngang đầy đủ chức năng | App dùng được ở **cả 2 chiều màn hình**: portrait (thẻ xếp chồng, chip hàng ngang) và landscape (thẻ xếp ngang, chip cột dọc) — không có màn hình chặn/nhắc xoay ngang. *(Thay thế hành vi "nhắc xoay ngang" của bản cũ.)* |
| FR-11 | Header tối giản | Thanh header chỉ có 2 icon: **☰** (trái, mở/đóng sidebar) và **🌗** (phải, đổi theme). |
| FR-12 | Sidebar điều hướng | Trượt ra từ trái kèm backdrop mờ, mở/đóng bằng ☰. Gồm 4 mục: Thêm người, Phiên mới, Lịch sử, Cài đặt (xem FR-4, FR-7, FR-8, FR-6, FR-5). |
| FR-13 | Light/dark theme | Icon 🌗 trên header đổi theme sáng/tối; lưu lựa chọn cục bộ (localStorage), không cần lưu server. |
| FR-14 | Cân bằng zero-sum (double-tap) | **Double-tap** (nhấn đúp/chạm đúp) vào thẻ người chơi → tự động đặt lại điểm người đó để **tổng điểm tất cả người chơi = 0**: `điểm mới = điểm cũ − tổng hiện tại`. Dùng để dồn nhanh phần lệch do `cháy` (không zero-sum, mục 5.1) về 1 người, hoặc sửa sai số sau khi chỉnh tay (FR-3). Nếu tổng đã = 0 → double-tap không đổi gì. |

---

## 4. Yêu cầu phi chức năng (NFR)
- **NFR-1 (Khả dụng):** chữ to, chip & thẻ lớn; kéo–thả mượt trên cảm ứng.
- **NFR-2 (Hiệu năng):** ghi điểm phản hồi tức thì (<50ms), không chờ mạng.
- **NFR-3 (Bền dữ liệu):** không mất dữ liệu khi tắt/mở lại.
- **NFR-4 (Triển khai đơn giản):** `npm install` → `npm start`.
- **NFR-5 (Tương thích):** Chrome/Safari/Edge điện thoại & desktop hiện đại; @dnd-kit với Pointer/Touch sensor (chạy cả chuột lẫn chạm).

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

**Cân bằng zero-sum (double-tap, FR-14):** vì `cháy` không zero-sum, tổng điểm tất cả người chơi (`total = Σ score`) có thể lệch khỏi 0 theo thời gian. Double-tap vào thẻ người chơi **X** → `X.score = X.score − total`, làm `total` về đúng 0 (điểm các người khác giữ nguyên). Đây là phép gán trực tiếp (giống FR-3), không lưu lịch sử bước riêng.

### 5.2 Chia tiền (theo giá mỗi điểm)
- Nhập `pricePerPoint` (VND) cuối ván. Mỗi người: `tien = score × pricePerPoint`.
  - `< 0` → **TRẢ** `|tien|`; `> 0` → **NHẬN** `tien`; `= 0` → không.
- Hiển thị **net** = tổng `tien`. Do `cháy` không zero-sum nên net có thể ≠ 0 → hiện ghi chú (phần lệch là tiền phạt "cháy"); có thể double-tap (FR-14) vào 1 người trước khi chia tiền nếu muốn net về đúng 0.
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
- *Ghi chú:* theme (light/dark) lưu ở `localStorage` phía client, không lưu trong `data.json`/Blob.

### 6.1 Nơi lưu
- **Prod (Vercel):** lưu nguyên object trên dưới dạng **một blob JSON** tên `state.json` trong **Vercel Blob** (`@vercel/blob`). Mỗi lần ghi: `put('state.json', json, { access:'public', allowOverwrite:true, addRandomSuffix:false })`; đọc: `fetch(blobUrl)` hoặc `head`/`list`.
- **Dev (local):** nếu không có `BLOB_READ_WRITE_TOKEN` → đọc/ghi `data.json` ở thư mục gốc bằng `fs` (để dev không cần token).
- Tách **lớp lưu trữ** `lib/storage.ts` với 2 hàm `readState()` / `writeState(state)`; tự chọn Blob hay fs theo env. Code phía trên không phụ thuộc nơi lưu.

---

## 7. Thiết kế giao diện (UI)

> Bố cục, kích thước, ảnh wireframe chi tiết đã chốt ở tài liệu riêng: **[`UI-DESIGN.md`](UI-DESIGN.md)**. Mục này chỉ tóm tắt để khớp với các FR ở mục 3.

### 7.1 Bố cục chính (landscape)
```
┌───────────────────────────────────────────────────────┐
│ [☰]                                              [🌗] │  ← header tối giản
├──────────────────────────────────────┬────────────────┤
│  ┌────────────────────────────────┐  │     ( . )      │
│  │  THANH        +20      [−][+]  │  │                │
│  └────────────────────────────────┘  │    ( 14 )      │
│  ┌────────────────────────────────┐  │                │
│  │  DAC          -10      [−][+]  │  │    ( 15 )      │
│  └────────────────────────────────┘  │                │
│  ┌────────────────────────────────┐  │   ( cháy )     │
│  │  DUC          -10      [−][+]  │  │                │
│  └────────────────────────────────┘  │                │
└──────────────────────────────────────┴────────────────┘
```
- **Thẻ người chơi** cỡ lớn, là vùng thả chip, có 2 nút **−/+** chỉnh điểm thủ công (FR-3); double-tap vào thẻ để cân bằng zero-sum (FR-14).
- **Cột phải**: 4 **chip** kéo được, cỡ lớn: `.`, `14`, `15`, `cháy` (viền/màu đỏ riêng). Khi đang kéo: chip "bay" theo ngón tay, thẻ người chơi nào ở dưới thì **sáng viền** (highlight) báo sẽ thả vào đó.
- **Header** chỉ 2 icon: ☰ (mở/đóng sidebar, FR-12) và 🌗 (đổi theme, FR-13). Ở portrait, thẻ xếp chồng và chip xếp hàng ngang dưới thẻ (xem UI-DESIGN.md §6).
- Khi thả chip thành công: thẻ target nhấp nháy nhẹ + (nếu bật âm thanh) phát tiếng.

### 7.2 Sidebar điều hướng
- Trượt ra từ trái, kèm backdrop mờ, mở/đóng bằng icon ☰ trên header (FR-12).
- 4 mục: **👤+ Thêm người** (FR-4) · **➕ Phiên mới** (FR-7) · **📜 Lịch sử** (FR-8) · **⚙️ Cài đặt** (FR-5, FR-6).

### 7.3 Tương tác kéo–thả (@dnd-kit + Framer Motion)
- Chip = `useDraggable`; thẻ người chơi = `useDroppable`. Dùng `PointerSensor` + `TouchSensor` (kích hoạt sau khi giữ/nhích nhẹ để không cản scroll).
- `DragOverlay` hiển thị chip "bay" theo ngón tay; thẻ đang hover → highlight (đổi viền/scale qua Framer Motion).
- `onDragEnd`: nếu thả trúng 1 thẻ → áp luật điểm (mục 5.1); animate số điểm nhảy + thẻ nảy nhẹ; (nếu bật) phát tiếng.
- Nút **−/+** trên thẻ (FR-3): bấm trực tiếp, không qua drag, chỉ đổi điểm của chính thẻ đó (không zero-sum).
- Double-tap vào thẻ (FR-14, ngoài 2 nút −/+): tính lại điểm thẻ đó để tổng = 0 (mục 5.1); nên có animation/feedback ngắn (số điểm nhấp nháy) để báo đã cân bằng.
- Animation khác bằng Framer Motion: `AnimatePresence` cho sidebar trượt/backdrop, thêm/xoá người chơi & mục lịch sử, transition modal.

### 7.4 Modal "Thêm người"
- Ô nhập tên (≤12 ký tự) + [Huỷ] [Thêm]. Khoá khi đã đủ 4 người.

### 7.5 Modal "Phiên mới" (gộp Chia tiền + Lưu phiên)
- Ô **Giá mỗi điểm (VND)**; bảng Tên | Điểm | Số tiền | TRẢ/NHẬN; dòng net.
- Nút **[Lưu & phiên mới]** (lưu vào lịch sử rồi reset điểm về 0, giữ người chơi), **[📜 Lịch sử]**, **[Đóng]**.

### 7.6 Modal "Lịch sử"
- Danh sách phiên (mới nhất trên cùng): ngày giờ, giá, bảng tóm tắt từng người (điểm, tiền). Mỗi mục: **[Copy]** (text gửi Zalo/Messenger), **[Xoá]**. Nút [Đóng].

### 7.7 Modal "Cài đặt"
- Bật/tắt âm thanh khi ghi điểm (FR-6).
- Danh sách người chơi: đổi tên, xoá (có xác nhận) — FR-5.

---

## 8. Kiến trúc & công nghệ
- **Framework:** **Next.js 16 (App Router) + React 19 + TypeScript**.
- **Styling:** **Tailwind CSS**.
- **Animation:** **Framer Motion** (`motion`).
- **Kéo–thả:** **@dnd-kit** (`@dnd-kit/core`).
- **Lưu trữ:** **Vercel Blob** (`@vercel/blob`) ở prod; fallback `fs` → `data.json` khi dev (xem 6.1).
- **API:** Route Handlers của Next (`app/api/state/route.ts`) chạy **Node.js runtime**.
- **Chạy:** `npm install` → `npm run dev` (local) → `http://localhost:3000`. Deploy: `vercel` / git push.

```
chiatienbia/
├─ app/
│  ├─ layout.tsx
│  ├─ page.tsx                 # man hinh chinh (board)
│  ├─ globals.css
│  └─ api/state/route.ts       # GET/POST trang thai (nodejs runtime)
├─ components/
│  ├─ Board.tsx                # khung chinh: header + sidebar + the + chip
│  ├─ Header.tsx               # thanh tren: toggle sidebar (☰) + theme (🌗)
│  ├─ Sidebar.tsx              # sidebar truot: Them nguoi/Phien moi/Lich su/Cai dat
│  ├─ PlayerCard.tsx           # the nguoi choi (droppable) + nut -/+
│  ├─ ScoreChip.tsx            # chip diem (draggable)
│  ├─ NewSessionModal.tsx      # gop Chia tien + Luu phien/Phien moi
│  ├─ AddPlayerModal.tsx
│  ├─ HistoryModal.tsx
│  └─ SettingsModal.tsx        # am thanh, doi ten/xoa nguoi choi
├─ lib/
│  ├─ storage.ts               # readState/writeState (Blob | fs)
│  ├─ scoring.ts               # luat diem (muc 5.1)
│  └─ types.ts                 # kieu du lieu (State, Player, Session...)
├─ data.json                   # chi dung khi dev local (gitignore)
├─ docs/SDD.md
├─ package.json
├─ tailwind.config.ts / postcss.config.mjs
├─ next.config.ts
└─ tsconfig.json
```

---

## 9. API (Next Route Handlers — `app/api/state/route.ts`)

| Method | Đường dẫn | Mô tả | Body / Trả về |
|--------|-----------|-------|----------------|
| GET | `/api/state` | Lấy toàn bộ trạng thái | → `{ currentSession, soundOn, scoring, history }` |
| POST | `/api/state` | Ghi đè toàn bộ trạng thái | Body: state đầy đủ → `{ ok: true }` |

- Khai báo `export const runtime = 'nodejs'` và `export const dynamic = 'force-dynamic'` (không cache).
- Handler gọi `lib/storage.ts` (Blob ở prod, fs ở dev). Validate dữ liệu trước khi ghi.

> **Env cần khi deploy:** `BLOB_READ_WRITE_TOKEN` (tự cấp khi tạo Vercel Blob store). Dev local không có token → tự fallback `data.json`.

---

## 10. Các trường hợp biên
- 0 người → không có vùng thả; chip kéo thả ra ngoài thì huỷ.
- 1 người → chip `.`/`14`/`15` không có "người khác" để trừ (target +0); cân nhắc cảnh báo; `cháy` vẫn −10.
- Tên trùng → cho phép (phân biệt bằng id).
- Giá điểm trống/0 → tiền = 0, lưu phiên cần xác nhận.
- `data.json` hỏng → server trả trạng thái mặc định (không crash).
- Nút **−/+** chỉnh điểm thủ công: không giới hạn biên (điểm có thể âm); bấm liên tục vẫn áp dụng từng bước.
- Double-tap (FR-14) khi tổng đã = 0 → không đổi điểm (đã cân bằng).
- Double-tap khi chỉ có 1 người chơi → điểm người đó về 0 (vì `total` chính là điểm của họ).
- Double-tap không có Undo riêng — muốn sửa lại thì dùng nút −/+ (FR-3) hoặc double-tap sang người khác.

---

## 11. Kế hoạch triển khai (milestones)
1. **M0 — Scaffold:** tạo Next.js 16 + TS + Tailwind; cài `@dnd-kit/core`, `motion`, `@vercel/blob`; dọn scaffold Express/JS cũ.
2. **M1 — Lưu trữ & API:** `lib/types.ts`, `lib/storage.ts` (Blob|fs), `app/api/state/route.ts`, `lib/scoring.ts`.
3. **M2 — Giao diện khung:** `Header` (☰/🌗), `Sidebar` (trượt + backdrop), `Board` layout landscape & portrait, `PlayerCard` (gồm nút −/+), cột/hàng `ScoreChip`, theme light/dark (localStorage).
4. **M3 — Kéo–thả & luật điểm:** @dnd-kit + Framer Motion, áp công thức zero-sum + cháy; nút −/+ chỉnh điểm thủ công; double-tap cân bằng zero-sum (FR-14).
5. **M4 — Người chơi & cài đặt:** `AddPlayerModal` (thêm ≤4), `SettingsModal` (đổi tên/xoá người, bật/tắt âm thanh), tự lưu (debounce).
6. **M5 — Phiên mới & chia tiền:** `NewSessionModal` (giá điểm → tính tiền → lưu phiên → reset điểm về 0, giữ người).
7. **M6 — Lịch sử:** `HistoryModal`, copy/xoá phiên.
8. **M7 — Hoàn thiện & deploy:** kiểm thử cả 2 chiều màn hình (landscape/portrait) & 2 theme, tạo Vercel Blob store, deploy Vercel.

---

## 12. Quyết định đã chốt
- Điểm ghi bằng **kéo–thả** chip vào người chơi.
- Công thức **mỗi đối thủ trừ mức cố định**, người được kéo nhận tổng (zero-sum). `.`=10, `14`=`15`=2 mỗi đối thủ.
- **`cháy` = −10 chỉ cho người đó** (không chia, coi như nộp phạt).
- Các số là **ĐIỂM**; cuối ván × giá mỗi điểm ra tiền.
- **Phiên mới giữ người, điểm về 0**; **Lịch sử có nút Copy**; **giá = 0 thì cảnh báo**; **tối đa 4 người**.
- **Tech stack:** Next.js 16 (App Router) + React 19 + TypeScript; Tailwind CSS; Framer Motion; @dnd-kit; lưu trữ **Vercel Blob** (prod) / `data.json` fs (dev).
- **Header tối giản:** chỉ ☰ (toggle sidebar) + 🌗 (theme), không còn thanh công cụ nhiều icon.
- **Sidebar** chứa 4 hành động phụ: Thêm người / Phiên mới / Lịch sử / Cài đặt (gồm âm thanh, đổi tên/xoá người).
- Mỗi thẻ người chơi có thêm **nút −/+ chỉnh điểm thủ công**, độc lập với kéo–thả chip; **bỏ chức năng Undo/Reset riêng**.
- **Double-tap vào thẻ người chơi** (FR-14) tự động cân bằng điểm người đó để tổng tất cả = 0 (`điểm mới = điểm cũ − tổng hiện tại`) — công cụ nhanh xử lý phần lệch do `cháy`.
- **Layout dọc (portrait) là layout đầy đủ chức năng**, không còn màn chặn "vui lòng xoay ngang".
- Modal **Chia tiền** gộp vào luồng **Phiên mới** (1 modal, không tách riêng).
- Chi tiết bố cục/kích thước/ảnh wireframe: xem **[`UI-DESIGN.md`](UI-DESIGN.md)**.
