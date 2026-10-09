# TRIỂN KHAI từ nghiên cứu + Spike (đọc khi: chế độ TRIỂN KHAI, hoặc gặp rủi ro chưa rõ)

## TRIỂN KHAI
- Nguồn sự thật = `SPEC.md` + `tests/acceptance/`. Việc đầu tiên: builder dựng scaffold đúng `kien_truc.md` + run file (`run_file.md`), rồi acceptance test chạy trên code chính thức (tái lập kết quả nghiên cứu trong dung sai SPEC).
- Code thí nghiệm KHÔNG copy nguyên — viết lại sạch theo kiến trúc. Sản phẩm không import từ `thi_nghiem/`; giữ `thi_nghiem/` mà `cmd` trong sổ cái trỏ tới (bằng chứng tái lập), chỉ xóa phần không ai trỏ.
- Giả định SPEC sai khi triển khai → KHÔNG vá vòng: spike (dưới).

## Spike = luồng phụ NC
Rủi ro chưa rõ trong XD/TK → `sp:chuyen NC phạm vi:<thành phần>`: giả thuyết `blk` + kill vào so_cai, ≤3 vòng, thí nghiệm trong `thi_nghiem/E<n>/` (`_spike/` chỉ cho thử bỏ đi), việc build phụ thuộc → `[!] chờ H<n>`, việc khác chạy tiếp.
confirmed → đóng luồng phụ, build tiếp · refuted → báo user, đề xuất chuyển chính sang NC (user quyết) · parked → phương án an toàn nếu có, giữ `[!]`, báo user.
