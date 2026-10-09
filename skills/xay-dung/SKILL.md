---
name: xay-dung
description: "Vòng xây dựng / triển khai (từ SPEC.md) / debug, điều phối builder-critic-grunt. Dùng ở chế độ XÂY DỰNG hoặc TRIỂN KHAI và cho mọi vòng sửa lỗi."
---
# Xây dựng — điều phối viên đọc 1 lần mỗi phiên (đọc lại sau khi context bị nén)

## Vòng một việc
1. Lấy việc kế trong STATE (`[ ]` đầu tiên, không bị `[!]`). Việc >4 giờ → tách nhỏ trong STATE trước.
2. **Tự làm hay giao?** Theo luật "KHÔNG spawn khi" trong CLAUDE.md. Việc nhỏ → tự làm, vẫn theo Luật code.
3. **Giao builder**: brief đủ 6 trường; VÀO = file liên quan + tiêu chí chấp nhận. Song song/rủi ro → `isolation: "worktree"`. Sửa tiếp theo review → SendMessage cùng builder.
4. **critic CHẾ ĐỘ code** (spawn mới) khi: diff >30 dòng, đụng auth/thanh toán/dữ liệu/bảo mật, hoặc đổi interface dùng chung. `BLOCK` → builder sửa → critic mới. Tối đa 2 lượt, quá → bạn tự đọc và quyết.
5. **Kiểm chứng tự mình**: chạy lệnh test toàn bộ (hoặc grunt chạy) — không tin "OK" suông.
6. Merge worktree/nhánh vào nhánh chính tại máy. Push/PR/deploy → hỏi user.
7. STATE: tick việc, 1 dòng nhật ký, chi phí. Gotcha builder đề xuất mà sẽ lặp lại → thêm vào CLAUDE.md.

## Kiến trúc (mặc định, đổi được nếu có lý do ghi vào CLAUDE.md)
Một lệnh chạy ở root (ghi trong CLAUDE.md). Luồng phụ thuộc một chiều: entry → điều phối (facade/handler) → logic (service, mỗi cái 1 việc, không import lẫn nhau) → dữ liệu/tiện ích. Script nhỏ/CLI/thư viện → cấu trúc chuẩn của hệ sinh thái, không ép tầng.

## TRIỂN KHAI (từ nghiên cứu)
- Nguồn sự thật = `SPEC.md` + `tests/acceptance/`. Việc đầu tiên: acceptance test chạy trên code chính thức (tái lập kết quả nghiên cứu, sai lệch nằm trong ngưỡng ghi ở SPEC).
- Code thí nghiệm KHÔNG copy nguyên vào sản phẩm — viết lại sạch theo Luật code. Sản phẩm không được import từ `thi_nghiem/`; giữ nguyên `thi_nghiem/` mà `cmd` trong sổ cái trỏ tới (bằng chứng tái lập), chỉ xóa phần không ai trỏ.
- Giả định của SPEC sai khi triển khai → KHÔNG vá vòng: spike (dưới).

## Spike (rủi ro chưa rõ trong XÂY DỰNG/TRIỂN KHAI)
Ghi giả thuyết vào `.ai/so_cai.md` (tạo file nếu chưa có), làm theo mục Spike của `sp:nghien-cuu`, kết quả 1 dòng Gotchas. Không đổi chế độ cả dự án trừ khi spike sụp.

## Debug
1. critic CHẾ ĐỘ loi (spawn mới) → Tầng / Nguyên nhân gốc / Bằng chứng / Fix.
2. builder: test tái hiện (đỏ) → fix đúng gốc + mọi chỗ cùng lỗi → toàn bộ test xanh.
3. Lỗi loại sẽ lặp lại → 1 dòng Gotchas. Sau 2 lượt fix thất bại → dừng, báo user: tầng, đã thử gì, giả thuyết.

## Dự án lớn (tùy chọn)
Việc >10 hoặc nhiều mốc → `.ai/ke_hoach.md` (mốc → việc, có NGOÀI phạm vi cho mỗi mốc); STATE chỉ giữ mốc hiện tại. Không tạo tài liệu kiến trúc riêng — codegraph/CLAUDE.md đủ; cần sơ đồ thì gọi `sp:bao-tri`.

## Mẫu /goal (giám khảo đọc transcript → bằng chứng IN RA MÀN HÌNH; luôn có trần, in `Vòng k/N`)
- Cụm việc: `/goal Đã in mục Việc của .ai/STATE.md cho thấy mọi việc của mốc hiện tại là [x]; lệnh test trong CLAUDE.md chạy ở cuối với output in ra toàn bộ pass; critic code cho diff lớn nhất trả PASS hoặc chỉ WARN; đã in dòng Tiếp theo của STATE. Tối đa 15 vòng việc (in Vòng k/15).`
- Debug: `/goal Có test tái hiện lỗi <X> với output đỏ in ra trước khi sửa và xanh in ra sau khi sửa; toàn bộ test pass (output in ra); nguyên nhân gốc ghi trong STATE. Tối đa 4 lượt fix (in Lượt k/4), quá thì dừng báo user.`
- Triển khai: `/goal tests/acceptance chạy xanh trên code chính thức (output in ra); đã in kết quả grep -rn "thi_nghiem" <thư mục src> rỗng; lệnh chạy ở root khởi động không lỗi (output in ra). Tối đa 12 vòng việc.`
