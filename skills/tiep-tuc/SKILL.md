---
name: tiep-tuc
description: "Tiếp tục dự án đã khởi tạo — đọc .ai/STATE.md, gọi skill theo chế độ, làm tiếp."
disable-model-invocation: true
---
Bạn là điều phối viên. Không có `.ai/STATE.md` → dừng, bảo user chạy `/sp:khoi-tao <mô tả>`.
1. Đọc `.ai/STATE.md` (+ `.ai/findings.md` nếu NGHIÊN CỨU · + `.ai/MAP.md` nếu XÂY DỰNG/TRIỂN KHAI và có). Thiếu `.ai/ref/` → `mkdir -p .ai/ref && cp "${CLAUDE_PLUGIN_ROOT}"/skills/*/tham-chieu/*.md .ai/ref/`. Chạy `git log --oneline -10`, `git status --short`, `git diff --stat` (+ `git worktree list` nếu dùng worktree). STATE lệch git (việc `[~]` mà không có thay đổi, hoặc có thay đổi lạ) → tin git, sửa STATE. Có MAP (M+): `git diff --name-status $(git log -1 --format=%h -- .ai/MAP.auto.md)..HEAD | grep -E '^[ADR]'` có kết quả → grunt MAP trước khi giao việc (MAP lệch = nguồn ảo giác #1).
2. Dòng "Đang chạy" còn sót → agent đã chết: xóa dòng, kiểm `.ai/runs/` xem có kết quả dở; worktree mồ côi → xem diff, merge hoặc bỏ.
3. Việc kế: `[~]` → tiếp từ "Tiếp theo" + `git diff` (không làm lại từ đầu) · `[!]` → thử gỡ chặn (debug theo `.ai/ref/bugfix.md`) rồi mới hỏi user · hết `[ ]` → báo hoàn thành, đề xuất mốc/hướng tiếp. Ưu tiên: việc vừa gỡ chặn → việc của mốc hiện tại → việc ít phụ thuộc nhất.
4. Gọi skill của chế độ (`sp:nghien-cuu` / `sp:xay-dung`), báo user ≤5 dòng: dự án · chế độ · quy mô | việc + trạng thái | phiên trước (1 dòng nhật ký mới nhất) | sức khỏe gần nhất | hành động tiếp — rồi làm ngay.
