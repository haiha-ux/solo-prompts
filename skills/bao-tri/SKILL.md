---
name: bao-tri
description: "Bảo trì định kỳ — điểm sức khỏe code, đồng bộ bản đồ codebase (MAP/sơ đồ), dọn bộ nhớ .ai/, nợ kỹ thuật, tái dùng, rà chi phí điều phối. Dùng sau mỗi mốc, mỗi tuần (L), hoặc khi file nhớ vượt trần."
---
# Bảo trì — chạy theo thứ tự, mỗi mục chỉ báo vấn đề có thật
Bước 0: chép lại tham chiếu (plugin có thể đã cập nhật): `mkdir -p .ai/ref && cp "${CLAUDE_PLUGIN_ROOT}"/skills/*/tham-chieu/*.md .ai/ref/`. Dùng `.ai/ref/suc_khoe.md` (mục kiểm + ngưỡng + điểm) · `.ai/ref/so_do.md` (sơ đồ) · `.ai/ref/kien_truc.md` (quy mô, MAP).

1. **Quy mô** (tự làm/grunt): đếm file code + module + tích hợp ngoài → so bảng quy mô trong `kien_truc.md` (chỉ tự tăng khi vượt ngưỡng >20%; giảm → hỏi user). Tăng bậc → sửa `Quy mô:` CLAUDE.md, tạo file của bậc mới (cách tạo: `sp:xay-dung` mục Bộ nhớ codebase).
2. **Bản đồ** (M+): grunt MAP sinh lại `.ai/MAP.auto.md` + báo module thiếu ở `.ai/MAP.md` → bạn bổ sung dòng vai trò. CLAUDE.md mục Cấu trúc còn khớp?
3. **Sức khỏe**: grunt SỨC KHỎE theo bảng `suc_khoe.md` (ghi `.ai/runs/<ngày>-bao-tri.md`) → critic CHẾ ĐỘ suc_khoe (spawn mới, VÀO = file đó) gán CAO/TRUNG/THẤP, loại dương tính giả, tính điểm → ghi 1 dòng STATE `Sức khỏe: <điểm> (C T Th) <ngày>`, so lần trước.
4. **Kiến trúc** (L, hoặc user yêu cầu): `docs/kien_truc.md` theo `so_do.md`, dựng/cập nhật từ codegraph/import thật (builder) → critic CHẾ ĐỘ kien_truc soát.
5. **Bộ nhớ** (tự làm): CLAUDE.md ≤80 dòng, STATE ≤40, MAP.md ≤40, findings ≤60, brief ≤40. Vượt → gộp dòng cũ (Gotchas sai → xóa; Đường chết/Đã chốt chỉ GỘP theo cụm). "Đang chạy" mồ côi → xóa. `runs/INDEX.md` thiếu → bổ sung. Gotcha lặp ≥2 lần trong nhật ký → CLAUDE.md. Quyết định trong nhật ký đáng giữ → CLAUDE.md Quyết định.
6. **Nợ & tái dùng**: `.ai/no_ky_thuat.md` — mục CAO hoặc chạm mốc sắp tới → thành việc trong STATE; đã trả → xóa. [L] `.ai/reuse.md` (bảng: tên | file | mô tả | dùng bởi — tiện ích/middleware/pattern dùng chung): thêm cái mới, xóa cái đã mất (grep kiểm tồn tại).
7. **Chi phí** (STATE + `.ai/chi_phi.log`): vai nào tốn nhất, spawn nào lẽ ra tự làm rẻ hơn → chỉnh luật "KHÔNG spawn khi" trong CLAUDE.md nếu lặp lại.
8. **Báo user ≤10 dòng (dashboard)**: điểm sức khỏe (+xu hướng) · tiến độ (việc [x]/tổng của mốc, mốc k/n) · nợ (số, mức) · CAO cần sửa ngay · TRUNG · THẤP · đề xuất. Điểm <50 → đề xuất DỪNG tính năng mới. Sửa CAO theo vòng `sp:xay-dung`.

Mẫu `/goal` bảo trì: `.ai/ref/goal.md`.
