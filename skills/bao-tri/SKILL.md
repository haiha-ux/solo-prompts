---
name: bao-tri
description: "Bảo trì định kỳ — sức khỏe code, dọn bộ nhớ .ai/, rà chi phí điều phối, sơ đồ kiến trúc khi cần. Dùng sau mỗi mốc hoặc khi file nhớ vượt trần dòng."
---
# Bảo trì — chạy theo thứ tự, mỗi mục chỉ báo vấn đề có thật

1. **Bộ nhớ** (tự làm): CLAUDE.md ≤80 dòng, STATE ≤40, findings ≤60. Vượt → gộp dòng cũ (Gotchas không còn đúng → xóa; Đường chết/Đã chốt chỉ GỘP theo cụm, không xóa). Dòng "Đang chạy" mồ côi → xóa. `runs/INDEX.md` thiếu run nào → bổ sung. Gotcha xuất hiện ≥2 lần trong nhật ký mà chưa có trong CLAUDE.md → thêm.
2. **Sức khỏe code** (grunt chạy, ghi `.ai/runs/<ngày>-bao-tri.md`): toàn bộ test; linter/type-check sẵn có của dự án (vd `ruff`, `tsc --noEmit`, `eslint`); `git status`, nhánh/worktree đã merge chưa xóa (`git worktree list`, `git branch --merged`); file >500 dòng; TODO/FIXME; print/console.log debug.
3. **Cấu trúc** (critic CHẾ ĐỘ code, spawn mới, VÀO = báo cáo bước 2 + codegraph nếu có): file/hàm không ai gọi, phụ thuộc vòng, fallback chồng, logic cũ song song logic mới, trùng chức năng. Chỉ `BLOCK/WARN`.
4. **Chi phí** (tự làm, từ mục Chi phí của STATE + `.ai/chi_phi.log`): vai nào tốn nhất, spawn nào lẽ ra tự làm rẻ hơn → chỉnh luật "KHÔNG spawn khi" trong CLAUDE.md nếu lặp lại.
5. **Sơ đồ** (chỉ khi user yêu cầu hoặc >8 module): 1 sơ đồ Mermaid module + phụ thuộc vào `docs/kien_truc.md`, dựng từ codegraph/import thật, không vẽ theo trí nhớ.
6. Báo user ≤10 dòng: BLOCK cần sửa ngay, WARN, đề xuất. Sửa BLOCK theo vòng `sp:xay-dung`. Ghi 1 dòng STATE.
