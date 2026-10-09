# Mẫu /goal — XÂY DỰNG / TRIỂN KHAI / debug / mốc / bảo trì
Giám khảo `/goal` là model đọc TRANSCRIPT, không đọc file → điều kiện phải là bằng chứng IN RA MÀN HÌNH; luôn có trần, in `Vòng k/N` mỗi vòng.

- **Cụm việc:** `/goal Đã in mục Việc của .ai/STATE.md cho thấy mọi việc của mốc hiện tại là [x] (hoặc `[!] chờ H<n>` khi đang có luồng phụ NC cho H đó); lệnh test trong CLAUDE.md chạy ở cuối với output in ra toàn bộ pass; critic code cho diff lớn nhất trả PASS hoặc chỉ WARN; grunt MAP đã chạy nếu có file thêm/xóa/đổi tên; đã in dòng Tiếp theo của STATE. Tối đa 15 vòng việc (in Vòng k/15).`
- **Debug:** `/goal Có test tái hiện lỗi <X> với output đỏ in ra trước khi sửa và xanh in ra sau khi sửa; toàn bộ test pass (output in ra); nguyên nhân gốc ghi trong STATE. Tối đa 4 lượt fix (in Lượt k/4), quá thì dừng báo user.`
- **Triển khai:** `/goal tests/acceptance chạy xanh trên code chính thức (output in ra); đã in kết quả grep -rn "thi_nghiem" <thư mục src> rỗng; run file --check thoát 0 (output in ra). Tối đa 12 vòng việc.`
- **Mở mốc:** `/goal .ai/ke_hoach.md có mốc mới đủ Trong/NGOÀI phạm vi/Tiêu chí/Rủi ro (in ra); critic ke_hoach trả PASS (in ra); mục Việc của STATE đã chép mốc. Tối đa 4 vòng.`
- **Bảo trì:** `/goal Đã in điểm sức khỏe mới trong STATE ≥ <ngưỡng> và lệnh test toàn bộ pass (output in ra); báo cáo bảo trì mới nhất không còn mục CAO (in ra). Tối đa 8 vòng.`
