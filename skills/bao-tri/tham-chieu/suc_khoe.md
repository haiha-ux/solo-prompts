# Kiểm tra sức khỏe — mục kiểm, ngưỡng, mức (grunt chạy lệnh, critic chấm, điều phối viên quyết)

Lịch: S khi thấy cần · M mỗi mốc · L mỗi tuần + mỗi mốc. Trước khi chạy: `codegraph sync` (nếu có) để tránh dương tính giả dead code. grunt chỉ chạy lệnh + ghi số liệu; critic CHẾ ĐỘ suc_khoe gán mức.

| Nhóm | Kiểm (lệnh gợi ý) | CAO | TRUNG | THẤP |
|---|---|---|---|---|
| Test | lệnh test; coverage nếu có | test fail · coverage <30% | coverage <50% · module 0 test | — |
| Liên kết | file không ai import, export 0 caller, module cô lập, phụ thuộc vòng (codegraph/grep/madge) | dead file · cycle · module cô lập | dead export · import thừa | — |
| Fallback | grep `legacy\|old_\|v1_\|use_new\|v2_enabled\|deprecated\|fallback`; lồng try/if | >2 nhánh fallback · logic cũ song song logic mới | cờ legacy · lồng >3 tầng · comment "old logic" | — |
| Kích thước | `wc -l` file code (trừ run file) | file >1000 dòng | file >500 dòng | — |
| Rác | TODO/FIXME/HACK, print/console.log, code comment-out | — | TODO >30 ngày · code comment-out | print/console.log |
| Run file (trừ thư viện/script — CLAUDE.md Cấu trúc ghi rõ) | có ở root? `run --check` thoát 0? `wc -l` | không có run file · `--check` lỗi | không tự kiểm deps · có logic nghiệp vụ · >300 dòng chưa tách startup/ | — |
| Kiến trúc | vi phạm luồng tầng (kien_truc.md) | import ngược tầng · service import service | entry gọi service trực tiếp | — |
| Contracts (L) | interface trong `docs/contracts/` vs code (grep tên endpoint/method) | contract lệch code | contract thiếu changelog | — |
| Bộ nhớ | MAP.auto cũ hơn thay đổi file (lệnh đồng bộ trong kien_truc.md) · module trong MAP.auto thiếu ở MAP.md · STATE/findings/CLAUDE.md vượt trần · "Đang chạy" mồ côi · runs/INDEX thiếu | MAP lệch thực tế (nguồn ảo giác #1) | file nhớ vượt trần | dòng mồ côi |
| Git | `git status`, `git branch --merged`, `git worktree list`, tuổi nhánh | nhánh >30 ngày không commit | uncommitted · nhánh >14 ngày | nhánh/worktree đã merge chưa xóa |
| Hạ tầng | `.gitignore` có `.codegraph/`, `.env`, `.ai/chi_phi.log`; codegraph stale | secret/.env bị track | codegraph stale >10% | — |

**Điểm** = 100 − 10×CAO − 5×TRUNG − 1×THẤP (tối thiểu 0). 90+ sạch · 70–89 dọn nhỏ · 50–69 dành 1 phiên dọn · <50 DỪNG tính năng mới, dọn trước.
Ghi 1 dòng STATE: `Sức khỏe: <điểm> (C<n> T<n> Th<n>) <ngày>` — so với lần trước để thấy xu hướng.

**Xử lý:** CAO → ngay trong phiên (qua vòng `sp:xay-dung`) · TRUNG → phiên này hoặc thành việc trong STATE · THẤP → khi rảnh / ghi `.ai/no_ky_thuat.md`.
Cách sửa chuẩn: dead file → xóa + cập nhật MAP · cycle → tách module C dùng chung (A→C←B) · fallback chồng → strategy riêng hoặc xóa nhánh cũ nhất + test · file quá dài → tách theo trách nhiệm · comment-out → xóa (git đã giữ lịch sử).
