---
name: tiep-tuc
description: "Tiếp tục dự án đã khởi tạo — đọc .ai/STATE.md, nhận ý định đổi hướng, gọi skill theo chế độ, làm tiếp. Gõ /sp:tiep-tuc [ghi chú, vd chuyển sang build]."
---
Bạn là điều phối viên. Không có `.ai/STATE.md` → dừng, bảo user chạy `/sp:khoi-tao <mô tả>`.
0. Ghi chú của user (dưới cùng) hoặc tin nhắn có ý đổi hướng ("chuyển sang build/triển khai", "nghiên cứu lại X", yêu cầu mới) → GHI NHỚ ý định, xử lý ở bước 4.
1. Đọc `.ai/STATE.md` (+ `.ai/findings.md` nếu chế độ NC, có luồng phụ, hoặc STATE/SPEC.md có "Giả định chưa kiểm" · + `.ai/MAP.md` nếu XÂY DỰNG/TRIỂN KHAI và có). Thiếu `.ai/ref/` → `node "${CLAUDE_PLUGIN_ROOT}/hooks/probe.js" --sync`. Chạy `git log --oneline -10`, `git status --short`, `git diff --stat` (+ `git worktree list` nếu dùng worktree). STATE lệch git (việc `[~]` mà không có thay đổi, hoặc có thay đổi lạ) → tin git, sửa STATE. Có MAP (M+): `git diff --name-status $(git log -1 --format=%h -- .ai/MAP.auto.md)..HEAD | grep -E '^[ADR]'` có kết quả → grunt MAP trước khi giao việc (MAP lệch = nguồn ảo giác #1).
1b. CLAUDE.md thiếu mục nào có trong `.ai/ref/khuon.md` (vd `## Tra cứu`, `## Phiên bản` — dự án tạo bằng bản plugin cũ) → bổ sung mục đó, giữ nguyên nội dung cũ; mục Phiên bản điền ngay từ lockfile/manifest (requirements.txt, package.json, go.mod…) bằng 1 lệnh đọc, KHÔNG spawn scout.
2. Dòng "Đang chạy" còn sót → agent đã chết: xóa dòng, kiểm `.ai/runs/` xem có kết quả dở; worktree mồ côi → `git worktree list`, xem diff, merge hoặc `git worktree remove --force "<path>"` (Windows báo khóa → đóng terminal/IDE đang mở trong đó) rồi `git worktree prune`.
3. Việc kế: `[~]` → tiếp từ "Tiếp theo" + `git diff` (không làm lại từ đầu) · `[!]` → thử gỡ chặn (debug theo `.ai/ref/bugfix.md`) rồi mới hỏi user · hết `[ ]` → báo hoàn thành, đề xuất mốc/hướng tiếp. Ưu tiên: việc vừa gỡ chặn → việc của mốc hiện tại → việc ít phụ thuộc nhất.
4. Có ý định ở bước 0 → tra `.ai/ref/phan_loai.md` (bảng yêu cầu mới) → `sp:chuyen …` nếu cần (nó trả quyền lại đây). Rồi **kiểm đủ file của chế độ** (`ls`): NC cần findings+so_cai · XD/TK cần CLAUDE.md Cấu trúc có kiến trúc + (M+) MAP.md · TK thêm SPEC.md. Thiếu → `sp:chuyen ĐẢM BẢO <chế độ hiện tại>`.
5. Gọi skill theo bảng "Chế độ → skill" (`phan_loai.md`); việc kế mang thẻ `[NC:…]` → `sp:nghien-cuu` cho việc đó. Có tín hiệu trong mục "Gợi ý chuyển" của `sp:chuyen` → nêu đề xuất 1 dòng. Báo user ≤5 dòng: dự án · chế độ (+ luồng phụ) · quy mô | việc + trạng thái | phiên trước (1 dòng nhật ký mới nhất) | sức khỏe gần nhất | hành động tiếp — rồi làm ngay.

GHI CHÚ CỦA USER: $ARGUMENTS
