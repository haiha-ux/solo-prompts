---
name: chuyen
description: "Chuyển chế độ NC/XD/TK hoặc mở/đóng luồng phụ nghiên cứu, kèm bàn giao + dựng phần thiếu. Dùng khi user đổi hướng (vd chuyển sang build, nghiên cứu lại X) hoặc skill khác cần."
---
# Chuyển chế độ — 1 giao dịch, không sửa tay dòng `Chế độ:`
Cú pháp: `sp:chuyen <NC|XD|TK> [phạm vi:<thành phần>] [lý do]` hoặc câu tự nhiên. Đích chưa rõ → `.ai/ref/phan_loai.md` (thiếu `.ai/ref/` → `node "${CLAUDE_PLUGIN_ROOT}/hooks/probe.js" --sync`).
- **Chuyển chính**: đổi chế độ chính. Chưa có chế độ chính (khởi tạo) → luôn là chuyển chính.
- **Luồng phụ**: CHỈ NC, CHỈ khi có `phạm vi:` và đã có chế độ chính XD/TK. Tối đa 1 luồng phụ; đã có mà mở thêm → hỏi user đóng cái nào.
- `ĐẢM BẢO <chế độ>` (không đổi chế độ): chỉ chạy mục ĐẢM BẢO — dùng khi tiep-tuc thấy thiếu file.

## Bước
1. Đọc STATE (+ `grep` findings/so_cai nếu có). Xác định `từ → đến`, chính hay phụ.
2. Chuyển chính khi đang có luồng phụ → đóng luồng phụ trước (hàng "Đóng luồng phụ").
3. **ĐẢM BẢO** chế độ đích (dưới) — kiểm bằng `ls`, có rồi KHÔNG ghi đè, thiếu mới tạo — rồi **bàn giao** theo bảng (ghi vào file vừa đảm bảo). Riêng bước critic ke_hoach của ĐẢM BẢO XD/TK chạy SAU bàn giao, để soát cả "Giả định chưa kiểm".
4. Ghi STATE (`từ` = giá trị cũ của `Chế độ:`; "(chưa)" = mới): dòng đầu `Chế độ: <đích>  Luồng phụ: <không | NC:<phạm vi> (vòng k/3 — sp:nghien-cuu tăng k sau mỗi vòng)>` + 1 dòng nhật ký `chuyển A→B | chính/phụ | lý do | bàn giao | cảnh báo`. Chuyển chính → sửa `Chế độ:` trong CLAUDE.md. Commit `.ai/`.
5. **Được khoi-tao/tiep-tuc/skill khác gọi → DỪNG ở đây, trả quyền** (skill gọi sẽ báo user và chạy tiếp). User gọi trực tiếp → báo user 2 dòng (chuyển gì · cảnh báo) rồi gọi skill theo bảng "Chế độ → skill" trong `phan_loai.md`. Mỗi `/goal` chỉ chạy 1 chế độ.

## Bàn giao theo cặp
| Cặp | Bàn giao | Cảnh báo / ràng buộc |
|---|---|---|
| mới → bất kỳ | — | — |
| NC → XD | Điều đã chốt trong findings → `.ai/brief.md` (M+) hoặc STATE (S); ≥3 tiêu chí kiểm bằng lệnh | Mỗi `blk` chưa confirmed → mục **"Giả định chưa kiểm"** (trỏ H#) trong STATE (+ brief); code phụ thuộc nằm sau interface/facade + test xfail/skip có lý do |
| NC → TK | Cổng đủ → `SPEC.md` trỏ H#/E# + `tests/acceptance/` từ thí nghiệm quyết định | Cổng chưa đủ (TK sớm) → SPEC có mục "Giả định chưa kiểm" (H# open), findings giữ `Cổng: chưa` |
| XD → TK | Nguồn = findings (H confirmed → yêu cầu + acceptance từ cmd của E) hoặc tài liệu user; `SPEC.md` + `tests/acceptance/` viết TRƯỚC khi build tiếp | "Giả định chưa kiểm" của STATE/brief chuyển nguyên sang SPEC. Tài liệu không có lệnh tái lập → ghi là giả định |
| TK → XD | SPEC xong → acceptance thành test hồi quy thường | Ghi yêu cầu SPEC nào bị bỏ (nhật ký) |
| XD/TK → NC (chính hoặc phụ) | Test fail dai dẳng / gotcha / spike sụp / giả định SPEC sai → H `blk` trong so_cai (`scope:<phạm vi>` nếu phụ), `kill`+`test` lấy từ chính test đang fail | Việc build phụ thuộc → `[!] chờ H<n>`; giữ code; phần SPEC liên quan "đóng băng chờ NC". Thí nghiệm trong `thi_nghiem/E<n>/` (`_spike/` chỉ cho thử bỏ đi) |
| Đóng luồng phụ | confirmed → hợp nhất vào SPEC/brief, gỡ thẻ `[NC:…]` và `[!] chờ H` · refuted → báo user, đề xuất chuyển chính sang NC · parked/hết 3 vòng → phương án an toàn + giữ `[!]`, báo user | Ghi V trong so_cai trước khi đóng; xóa dòng `Luồng phụ` |

## ĐẢM BẢO theo chế độ
**Mọi chế độ:** `.ai/ref/` · `.ai/runs/INDEX.md` · git + `.gitignore`/`.gitattributes` theo `.ai/ref/kien_truc.md` (Bố cục chuẩn).
**NC (chính):** `.ai/findings.md` + `.ai/so_cai.md` (khuôn trong `sp:nghien-cuu`), câu hỏi gốc + "Rủi ro chặn đường" từ yêu cầu. CLAUDE.md: `Quy mô: S (tạm)`, mục Cấu trúc ghi "chưa chốt — làm khi chuyển XD/TK".
**NC (luồng phụ):** như trên nếu thiếu file; thêm vào findings mục `## Luồng phụ <phạm vi>: <câu hỏi>` (tạo mới dù findings đã có).
**XD:**
1. Stack chưa chốt → so 2–3 lựa chọn (scout nếu cần), chọn 1 → CLAUDE.md Quyết định. Stack/tích hợp lạ → thử bỏ đi trong `_spike/`.
2. Module chính + ai gọi ai + data model sơ bộ → kiến trúc + **Quy mô S/M/L** theo `.ai/ref/kien_truc.md` → CLAUDE.md Cấu trúc + `Quy mô:`.
3. **Chưa có code sản phẩm** (`thi_nghiem/`, `_spike/` không tính) → builder dựng scaffold theo bố cục chuẩn + run file (`run_file.md`) + `.gitignore` theo stack + `.env.example` + test đầu tiên (brief VÀO = 2 file `.ai/ref/` đó, `PHẠM VI: 15`). **Đã có code** → KHÔNG dựng lại: grunt MAP (M+) + test hiện có làm baseline; điền Cấu trúc/Quy mô/Lệnh từ code thật; lệch chuẩn → nợ.
4. M+: `.ai/brief.md` + Mốc 1 vào `.ai/ke_hoach.md` theo `moc.md` → critic ke_hoach → chép việc vào STATE · `.ai/no_ky_thuat.md` · L: `docs/`, `.ai/reuse.md`.
**TK:** mọi thứ của XD + `SPEC.md` ≤80 dòng (yêu cầu + ngưỡng + dung sai + mục "Giả định chưa kiểm") + `tests/acceptance/` viết trước khi build.

## Gợi ý chuyển (phát hiện → ĐỀ XUẤT 1 dòng, user quyết)
Cổng NC đủ → "chuyển TK" · builder trả `CHẶN: THIẾU KIẾN THỨC` lần 2 trên cùng việc → điều phối viên TỰ mở luồng phụ NC (đảo ngược được, báo user 1 dòng) · spike/luồng phụ sụp → "chuyển chính NC" · luồng phụ hết 3 vòng · còn "Giả định chưa kiểm" khi xong 1 mốc → "mở luồng phụ NC cho H<n>" · SPEC xong hết → "chuyển XD".
