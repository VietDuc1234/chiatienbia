# UI Design — chiatienbia

**Phiên bản:** 1.2 (màu thẻ riêng, bước +/-, chặn xoá khi điểm ≠ 0)
**Ngày:** 2026-06-24
**Liên quan:** [`SDD.md`](SDD.md) §7 (Thiết kế giao diện), FR-3, FR-5, FR-14

Tài liệu này mô tả chi tiết giao diện đã chốt với người dùng, thay thế bố cục cũ (thanh công cụ 6 icon) ở SDD §7.1. Ảnh wireframe tham chiếu nằm ở [`wireframes/`](wireframes/).

---

## 1. Nguyên tắc thiết kế

- **Tối giản trên màn hình chính:** chỉ hiển thị thẻ người chơi + chip điểm. Mọi hành động phụ (thêm người, phiên mới, lịch sử, cài đặt) ẩn trong **sidebar**.
- **Chữ to, vùng bấm/kéo lớn:** ưu tiên thao tác 1 tay trên điện thoại, kể cả khi đang đứng cạnh bàn bi-a.
- **Dùng được cả 2 chiều màn hình:** landscape (ngang) và portrait (dọc) đều là layout đầy đủ chức năng — không có màn hình nào chỉ hiện thông báo "vui lòng xoay ngang" (khác với bản SDD gốc).

---

## 2. Header

Thanh header cố định trên cùng, cao ~46px, chỉ có **2 icon ở 2 góc**:

| Vị trí | Icon | Hành động |
|--------|------|-----------|
| Góc trái | ☰ (hamburger) | Mở/đóng sidebar |
| Góc phải | 🌗 | Chuyển light/dark theme |

Không còn icon nào khác trên header (loại bỏ thanh công cụ 6 icon của thiết kế cũ).

---

## 3. Sidebar

- Trượt ra từ bên trái, đè lên nội dung chính, kèm **backdrop mờ đen** (rgba(0,0,0,0.35)) phía sau để bấm ra ngoài là đóng lại.
- Mở/đóng bằng icon ☰ trên header.
- Rộng ~200–220px (landscape) / ~200px (portrait), cao từ dưới header xuống đáy màn hình.
- Gồm 4 mục, mỗi mục là 1 hàng icon + label:

| Icon | Label | Hành động |
|------|-------|-----------|
| 👤+ | Thêm người | Mở modal thêm người chơi (tối đa 4 người) |
| ➕ | Phiên mới | Lưu phiên hiện tại vào lịch sử (nếu giá = 0 → cảnh báo trước) rồi reset điểm về 0, giữ người chơi. Thay thế modal "Chia tiền" riêng — giá mỗi điểm nhập ngay trong bước này. |
| 📜 | Lịch sử | Mở modal xem các phiên đã lưu, copy/xoá từng phiên |
| ⚙️ | Cài đặt | Mở modal cài đặt: bật/tắt âm thanh, đổi tên/xoá người chơi (nút xoá **mờ/disable** nếu điểm người đó ≠ 0, kèm gợi ý đưa điểm về 0 trước) |

> **Cài đặt** gộp các chức năng phụ trước đây nằm rời trên thanh công cụ (âm thanh FR-7, đổi tên/xoá người FR-5) để giữ sidebar gọn 4 mục.

---

## 4. Thẻ người chơi (Player card)

Kích thước **lớn hơn** bản nháp đầu để dễ bấm/kéo, áp dụng cho cả 2 layout.

**Nội dung mỗi thẻ:**
- Tên người chơi: chữ đậm, cỡ chữ **`32px`** cho cả 2 chiều layout. Hỗ trợ **nhấn giữ (long-press) 500ms** để đổi tên trực tiếp tại chỗ (inline input, tối đa 12 ký tự, không để trống).
- Điểm hiện tại: số lớn, là **vùng thả** chip, cỡ chữ **`48px`** (portrait) và **`52px`** (landscape).
- 2 nút **+** và **−** để chỉnh điểm thủ công: xếp chồng dọc (nút `+` nằm trên nút `−`), nằm ở phía bên phải của thẻ. **Tap = ±1 điểm; nhấn giữ = lặp liên tục** (auto-repeat) tới khi thả tay.
- Nền/viền thẻ theo **màu riêng của người chơi** (đỏ/vàng/cam/xanh dương — gán tự động theo thứ tự thêm, xem SDD §6). Wireframe ở [`wireframes/`](wireframes/) tô xám đồng nhất chỉ vì là mockup layout thấp-fi — màu thật áp dụng khi code (đủ độ tương phản để chữ đậm đọc rõ trên cả light/dark theme).

**Cử chỉ double-tap (FR-14 — cân bằng zero-sum):**
- Double-tap (chạm đúp trên điện thoại / double-click trên desktop) vào vùng thẻ (ngoài 2 nút +/− và phần tên) → tự tính lại điểm người đó để **tổng điểm tất cả người chơi = 0**: `điểm mới = điểm cũ − tổng hiện tại`.
- Dùng khi cần dồn nhanh phần lệch do chip `cháy` (không zero-sum) về 1 người, hoặc chốt lại trước khi mở "Phiên mới" chia tiền.
- Phản hồi: số điểm trên thẻ nhấp nháy/đổi nhẹ qua Framer Motion để báo đã cân bằng; nếu tổng đã = 0 thì không có gì thay đổi (vẫn có thể phát hiệu ứng ngắn xác nhận "đã cân bằng").
- Không có bước xác nhận (theo đúng tinh thần bỏ Undo/Reset) — muốn sửa lại thì dùng nút −/+ hoặc double-tap sang thẻ khác.

**Landscape** (3 thẻ xếp ngang, chia đều chiều rộng còn lại sau cột chip):
- Thẻ cao hết chiều cao vùng nội dung, tên `32px`, điểm `52px`, 2 nút +/− cỡ `52×52px` xếp chồng dọc ở rìa phải.

**Portrait** (3 thẻ xếp chồng, mỗi thẻ 1 hàng ngang):
- Cao **`110px`**/thẻ: Tên (trái, `32px`) — Điểm (giữa, `48px`) — 2 nút + và − xếp chồng dọc (phải, cỡ `42×42px` mỗi nút).

So với wireframe trước (v4), các kích thước trên đã được **tăng đáng kể** (ví dụ tên lên `32px`, điểm portrait 32px→48px, chiều cao thẻ portrait 84px→110px, các nút xếp dọc bên phải) theo phản hồi nâng cấp độ dễ dùng và bổ sung tính năng sửa tên tại chỗ.

---

## 5. Chip điểm (drag-and-drop)

4 chip tròn, viền đứt nét: `.`, `14`, `15`, `cháy` (viền/màu đỏ riêng để cảnh báo phạt).

- **Landscape:** xếp thành **cột dọc** bên phải các thẻ người chơi, đường kính 78px, cách nhau 14px.
- **Portrait:** xếp thành **hàng ngang** ngay dưới các thẻ người chơi, đường kính 64px, cách nhau 16px.
- Kéo 1 chip thả vào thẻ người chơi → áp dụng công thức điểm zero-sum ở SDD §5.1 (giữ nguyên luật điểm, chỉ đổi style/kích thước).
- Kích thước chip cũng tăng so với wireframe trước (46px→78px landscape, mới thêm biến thể 64px cho portrait) để dễ kéo bằng ngón tay cái.

---

## 6. Responsive: landscape vs portrait

| | Landscape | Portrait |
|---|---|---|
| Thẻ người chơi | Xếp ngang (cards-row), chia đều cột | Xếp chồng (cards-col), mỗi thẻ 1 hàng |
| Chip | Cột dọc bên phải | Hàng ngang dưới thẻ |
| Sidebar | Rộng ~220px, cao từ dưới header | Rộng ~200px, cao từ dưới header |

Không có trạng thái "khoá" màn hình theo chiều xoay — người dùng dùng app ở chiều nào cũng được, layout tự đổi theo `orientation`/`aspect-ratio` (CSS, không cần JS chặn).

---

## 7. Theming (light/dark)

- Icon 🌗 trên header chuyển đổi giữa 2 theme.
- Lưu lựa chọn theme vào local state/localStorage (không cần lưu server).
- Bảng màu cụ thể (light/dark) sẽ chốt khi vào giai đoạn code (Tailwind `dark:` variant); tài liệu này chỉ chốt vị trí & hành vi của control.

---

## 8. Wireframe tham chiếu

Ảnh trong [`wireframes/`](wireframes/), kích thước thẻ/chip đã tăng theo bản chốt cuối:

| File | Mô tả |
|------|-------|
| `landscape-closed.png` | Landscape, sidebar đóng — 3 thẻ ngang + cột chip |
| `landscape-open.png` | Landscape, sidebar mở — backdrop mờ + 4 mục |
| `portrait-closed.png` | Portrait, sidebar đóng — 3 thẻ chồng + hàng chip |
| `portrait-open.png` | Portrait, sidebar mở — backdrop mờ + 4 mục |

---

## 9. Khác biệt so với SDD gốc (§7 cũ)

- Bỏ thanh công cụ 6 icon trên đầu màn hình → header chỉ còn ☰ + 🌗.
- Thêm **sidebar** (4 mục: Thêm người / Phiên mới / Lịch sử / Cài đặt) chứa các hành động phụ.
- Thêm **nút −/+ chỉnh điểm thủ công** trên mỗi thẻ người chơi (ngoài cách kéo–thả chip).
- Thêm **layout portrait đầy đủ chức năng** (không còn màn chặn "vui lòng xoay ngang" — xem ghi chú cập nhật FR-12 ở SDD).
- Modal "Chia tiền" (FR-8 cũ) được gộp vào luồng **"Phiên mới"** trong sidebar — nhập giá mỗi điểm ngay khi kết thúc phiên, không còn là 1 modal/nút riêng trên thanh công cụ.
- Thêm **double-tap vào thẻ người chơi để cân bằng zero-sum** (FR-14) — tính năng hoàn toàn mới, không có ở bản SDD gốc.
- Thêm **nhấn giữ 500ms vào tên để sửa tên trực tiếp** (FR-15) bằng ô nhập (inline input), tự động lưu khi Enter/Blur và hủy bằng Esc.
