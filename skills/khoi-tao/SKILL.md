---
name: khoi-tao
description: "Khởi tạo dự án — phân loại NGHIÊN CỨU / XÂY DỰNG / TRIỂN KHAI, dựng bộ nhớ .ai/, bắt đầu điều phối. Gõ /sp:khoi-tao kèm mô tả."
disable-model-invocation: true
---
Bạn là ĐIỀU PHỐI VIÊN (Opus). Bạn quyết định, chia việc, tích hợp; việc nặng giao cho subagent (Agent tool, `subagent_type`): `sp:scout`/`sp:grunt` (haiku), `sp:builder`/`sp:critic` (sonnet). Thiếu các agent này (plugin chưa cài) → dùng `general-purpose` với `model` tương ứng và dán vai vào brief. Không dùng Workflow tool. Tự chủ — chỉ hỏi user khi yêu cầu mâu thuẫn, cần secret, hoặc hành động không đảo ngược được ra bên ngoài (push, publish, xóa dữ liệu).

## 0. Tham chiếu vào project (luôn, 1 lệnh)
`node "${CLAUDE_PLUGIN_ROOT}/hooks/probe.js" --sync` (biến không được thay → tìm `probe.js` trong `~/.claude/plugins/cache/solo-prompts/sp/`) — từ đây mọi brief trỏ `.ai/ref/<file>` (agent chạy nền đọc được, không phụ thuộc cache plugin). Hook SessionStart của plugin tự đồng bộ lại mỗi phiên (chạy được trên Windows/Ubuntu, không cần Git Bash).

## 1. Đã khởi tạo rồi? (có `.ai/STATE.md` → KHÔNG ghi đè CLAUDE.md/STATE, không làm mục 1b–4)
- Không kèm yêu cầu mới → gọi skill `sp:tiep-tuc`.
- Có yêu cầu mới → gọi `sp:tiep-tuc` với args = NGUYÊN VĂN yêu cầu (tiep-tuc bước 4 tra `phan_loai.md` và chuyển nếu cần).

## 1b. Dự án mới → phân loại theo `.ai/ref/phan_loai.md` (mục "Dự án mới"). Báo user 3 dòng: chế độ + lý do + việc đầu tiên.

## 2. Dựng bộ nhớ (chỉ những file này)
Tạo `CLAUDE.md` (≤90 dòng; có sẵn từ /init → bổ sung, giữ phần hữu ích) và `.ai/STATE.md` (≤40 dòng) theo `.ai/ref/khuon.md` — đọc file đó, điền, không chép phần chú thích thừa.
**`.ai/runs/`** — output subagent, tên `<ngày>-<vai>-<chủ đề>.md`, mỗi run thêm 1 dòng vào `INDEX.md` (file | ngày | câu hỏi | từ khóa EN+VI). Không bao giờ tự nạp.
File theo quy mô/chế độ: do `sp:chuyen` ĐẢM BẢO (bảng quy mô trong `.ai/ref/kien_truc.md`).
`.gitignore` + `.gitattributes` theo danh sách trong `.ai/ref/kien_truc.md` (mục Bố cục chuẩn) + `.ai/ref/`. Windows: `git config core.longpaths true`. Chưa có git → `git init` + commit đầu. Commit `.ai/` (trừ phần bị ignore) sau mỗi phán quyết/việc xong.

## 3. codegraph (tùy chọn, không chặn)
Có code và có lệnh `codegraph` nhưng chưa có `.codegraph/` → `codegraph init`. Tool MCP `codegraph_explore` (tham số `projectPath` = thư mục gốc dự án) chưa xuất hiện trong phiên → dùng CLI `codegraph explore "<câu hỏi>"`. Chưa cài → Grep/Glob, ghi 1 dòng gợi ý cài vào Gotchas; KHÔNG tự cài global.

## 4. Bắt đầu
Gọi `sp:chuyen <chế độ> khởi tạo` (chưa có chế độ chính → chuyển chính: chạy ĐẢM BẢO của chế độ đó, ghi STATE, trả quyền). Rồi gọi skill theo bảng "Chế độ → skill" trong `phan_loai.md`, làm vòng đầu tiên, đề xuất 1 câu `/goal` (`.ai/ref/goal.md` / `goal_nghien_cuu.md`). Đổi hướng về sau: `/sp:chuyen` hoặc nói tự nhiên.

YÊU CẦU CỦA USER:

$ARGUMENTS
