# TRIỂN KHAI từ nghiên cứu + Spike (đọc khi: chế độ TRIỂN KHAI, hoặc gặp rủi ro chưa rõ)

## TRIỂN KHAI
- Nguồn sự thật = `SPEC.md` + `tests/acceptance/`. Việc đầu tiên: builder dựng scaffold đúng `kien_truc.md` + run file (`run_file.md`), rồi acceptance test chạy trên code chính thức (tái lập kết quả nghiên cứu trong dung sai SPEC).
- Code thí nghiệm KHÔNG copy nguyên — viết lại sạch theo kiến trúc. Sản phẩm không import từ `thi_nghiem/`; giữ `thi_nghiem/` mà `cmd` trong sổ cái trỏ tới (bằng chứng tái lập), chỉ xóa phần không ai trỏ.
- Giả định SPEC sai khi triển khai → KHÔNG vá vòng: spike (dưới).

## Spike (rủi ro chưa rõ trong XÂY DỰNG/TRIỂN KHAI)
Ghi giả thuyết vào `.ai/so_cai.md` (tạo nếu chưa có; khuôn trong skill `sp:nghien-cuu`), 1 giả thuyết `blk` + kill, tối đa 1 vòng nghiên cứu, code thử trong `_spike/` (xóa sau). Kết quả 1 dòng Gotchas.
confirmed → build tiếp · refuted → dừng build, báo user đề xuất chuyển phần đó sang NGHIÊN CỨU (user quyết) · parked → build tiếp bằng phương án an toàn nếu có, ghi `[!]` trong STATE và báo user.
