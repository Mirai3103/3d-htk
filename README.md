# THCS Huỳnh Thúc Kháng — 3D Campus

Mô hình 3D low-poly tương tác của trường, dựng hoàn toàn bằng code (Three.js + Vite).

```bash
bun install
bun run dev      # chạy dev server
bun run check    # lint + build
bun run build    # xuất dist/index.html (mở trực tiếp, không cần mạng) + dist/videos/ (video kỷ niệm)
```

Hai cách xem: **toàn cảnh** (kéo để xoay, cuộn để zoom, bấm vào toà nhà để xem thông tin) và
**đi bộ góc nhìn thứ nhất** — bấm nút **Dạo bước**, rồi `↑ ↓` (hoặc `W S`) để đi, `← →` (hoặc `A D`)
để xoay người, giữ `Shift` để chạy, kéo chuột để ngó quanh, `Esc` để quay về toàn cảnh.

Cấu trúc code, quy ước và cách thêm công trình/vật liệu/thời tiết: xem [AGENTS.md](AGENTS.md).
