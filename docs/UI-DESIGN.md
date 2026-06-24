# UI Design — chiatienbia

**Phiên bản:** 1.0
**Ngày:** 2026-06-24
**Liên quan:** [`SDD.md`](SDD.md) §7 (Thiết kế giao diện)

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
| ⚙️ | Cài đặt | Mở modal cài đặt: bật/tắt âm thanh, đổi tên/xoá người chơi |

> **Cài đặt** gộp các chức năng phụ trước đây nằm rời trên thanh công cụ (âm thanh FR-7, đổi tên/xoá người FR-5) để giữ sidebar gọn 4 mục.

---

## 4. Thẻ người chơi (Player card)

Kích thước **lớn hơn** bản nháp đầu để dễ bấm/kéo, áp dụng cho cả 2 layout.

**Nội dung mỗi thẻ:**
- Tên người chơi (chữ đậm)
- Điểm hiện tại (số lớn, là **vùng thả** chip — xem mục 5)
- 2 nút **−** / **+** để chỉnh điểm thủ công (không cần kéo chip), mỗi nút là ô vuông viền đậm

**Landscape** (3 thẻ xếp ngang, chia đều chiều rộng còn lại sau cột chip):
- Thẻ cao hết chiều cao vùng nội dung, font điểm 52px, nút −/+ cao 52px (xếp ngang dưới điểm).

**Portrait** (3 thẻ xếp chồng, mỗi thẻ 1 hàng ngang):
- Cao 84px/thẻ: Tên (trái) — Điểm (giữa, font 32px) — nút − — nút + (phải), nút 46×46px.

So với wireframe trước (v4), các kích thước trên đã được **tăng đáng kể** (ví dụ font điểm landscape 34px→52px, nút pm-btn 28px→52px, thẻ portrait 60px→84px) theo phản hồi "muốn thao tác dễ dàng".

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
