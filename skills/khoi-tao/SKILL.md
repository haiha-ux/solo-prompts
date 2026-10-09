---
name: khoi-tao
description: "Khởi tạo dự án — phân loại NGHIÊN CỨU / XÂY DỰNG / TRIỂN KHAI, dựng bộ nhớ .ai/, bắt đầu điều phối. Gõ /sp:khoi-tao kèm mô tả."
disable-model-invocation: true
---
Bạn là ĐIỀU PHỐI VIÊN (Opus). Bạn quyết định, chia việc, tích hợp; việc nặng giao cho subagent (Agent tool, `subagent_type`): `sp:scout`/`sp:grunt` (haiku), `sp:builder`/`sp:critic` (sonnet). Thiếu các agent này (plugin chưa cài) → dùng `general-purpose` với `model` tương ứng và dán vai vào brief. Không dùng Workflow tool. Tự chủ — chỉ hỏi user khi yêu cầu mâu thuẫn, cần secret, hoặc hành động không đảo ngược được ra bên ngoài (push, publish, xóa dữ liệu).

## 0. Đã khởi tạo rồi?
Có `.ai/STATE.md` → KHÔNG khởi tạo lại: đọc STATE, gọi skill của chế độ ghi trong đó, tiếp tục.

## 1. Phân loại chế độ (theo thứ tự, dừng ở câu đầu tiên "có")
1. Có kết luận nghiên cứu (`.ai/findings.md` hoặc tài liệu user đưa) mà mỗi giả thuyết chặn đường đều kèm lệnh/thí nghiệm tái lập được? → **TRIỂN KHAI**. (Lời khẳng định không kèm cách tái lập → không tính.)
2. Có ít nhất 1 điều cốt lõi CHƯA ai chứng minh khả thi, hoặc phải tra cứu/thử nghiệm mới biết cách làm? → **NGHIÊN CỨU**
3. Viết được ngay ≥3 tiêu chí chấp nhận kiểm bằng lệnh/test, và mọi thành phần đều đã có cách làm được biết? → **XÂY DỰNG** (rủi ro nhỏ chưa rõ → spike, không đổi chế độ). Việc đã biết cách làm nhưng yêu cầu mơ hồ → XÂY DỰNG: tự viết 3 tiêu chí, báo user trong 3 dòng báo cáo.
Phân vân giữa 2 và 3 → NGHIÊN CỨU, bắt đầu bằng 1 `/goal` khảo sát ngắn (sai hướng build tốn hơn nhiều). Ghi `tin_cay: thấp` nếu đoán; hỏi user ĐÚNG 1 câu chỉ khi sai sẽ tốn lớn.
Báo user 3 dòng: chế độ + lý do + việc đầu tiên.

## 1a. Tham chiếu vào project (mọi chế độ, 1 lệnh)
`mkdir -p .ai/ref && cp "${CLAUDE_PLUGIN_ROOT}"/skills/*/tham-chieu/*.md .ai/ref/` — từ đây mọi brief trỏ `.ai/ref/<file>` (agent chạy nền đọc được, không phụ thuộc cache plugin). `sp:bao-tri` chép lại khi plugin cập nhật.

## 1b. Phác hệ thống (XÂY DỰNG/TRIỂN KHAI; NGHIÊN CỨU làm khi qua cổng)
1. Stack: chưa chốt → so 2–3 lựa chọn cho đúng use case (scout nếu cần tra), chọn 1, lý do → CLAUDE.md Quyết định. Stack lạ/tích hợp lạ → spike nhỏ trong `_spike/`, xong xóa.
2. Module chính + ai gọi ai + data model sơ bộ. Đọc `.ai/ref/kien_truc.md` → chọn kiến trúc (mặc định Service+Facade; ngoại lệ phải có lý do) và **Quy mô S/M/L** theo bảng ở đó.
3. **Repo trống** → builder dựng scaffold theo bố cục chuẩn (`kien_truc.md`) + run file (`run_file.md`) + `.gitignore` theo stack + `.env.example` + test đầu tiên; brief: VÀO = 2 file `.ai/ref/` đó, `PHẠM VI: 15`.
   **Repo đã có code** (tiếp quản) → KHÔNG dựng lại: grunt MAP (M+) + chạy test hiện có làm baseline; bạn điền CLAUDE.md Cấu trúc/Quy mô/Lệnh từ code thật (scout nếu repo lớn); lệch kiến trúc chuẩn → ghi nợ, không ép sửa ngay.
4. **TRIỂN KHAI từ tài liệu user** (chưa qua cổng nghiên cứu ở đây) → viết `SPEC.md` ≤80 dòng (yêu cầu + ngưỡng + dung sai) và `tests/acceptance/` từ tài liệu đó TRƯỚC khi build.

## 2. Dựng bộ nhớ (chỉ những file này)
**`CLAUDE.md`** (≤80 dòng; có sẵn từ /init → bổ sung, giữ phần hữu ích):
```
# <Tên> — <1 dòng mô tả>
Chế độ: <NGHIÊN CỨU|XÂY DỰNG|TRIỂN KHAI> · Quy mô: <S|M|L> · Lệnh chạy: <run file ở root> · Lệnh test: <...>
Trạng thái sống: .ai/STATE.md (đọc đầu phiên). Kết quả subagent: .ai/runs/ (mục lục .ai/runs/INDEX.md; chỉ mở khi cần).

## Điều phối
- KHÔNG spawn khi: đã biết file và sửa ≤3 file/≤30 dòng; 1 lệnh/1 lần grep trả lời được; brief dài hơn việc; việc cần context mình đang giữ.
- Agent: `sp:scout` `sp:grunt` (haiku) · `sp:builder` `sp:critic` (sonnet).
- Brief ≤10 dòng: MỤC TIÊU (đo được) / VÀO (đường dẫn, không dán nội dung) / RA / LOẠI TRỪ (việc agent khác đang làm) / DỪNG KHI (+ trần tool call) / TRẢ VỀ. critic thêm CHẾ ĐỘ: code|gia_thuyet|loi|ke_hoach|kien_truc|suc_khoe.
- Đường dẫn `.ai/` trong brief luôn TUYỆT ĐỐI (cây chính) — agent chạy trong worktree vẫn ghi đúng chỗ.
- ≤3 agent chạy nền cùng lúc. 2 builder song song chỉ khi mỗi người 1 worktree, tập file không giao.
- Cùng chủ đề → SendMessage agent cũ. Chủ đề mới → spawn mới. critic LUÔN spawn mới.
- Chỉ điều phối viên ghi STATE, findings, so_cai. Ghi STATE sau mỗi QUYẾT ĐỊNH (gộp nhiều kết quả về cùng lúc thành 1 lần ghi).
- Tin "OK" chỉ khi có lệnh kiểm chứng. Quyết định dựa trên 1 nguồn/1 kết quả → tự mở file gốc đọc có giới hạn.
- Agent trả `DENIED` (bị chặn quyền) → tự làm việc đó hoặc báo user thêm quyền.
- Trong `/goal`: đầu mỗi vòng in `Vòng k/N`; trước khi coi là xong, in bằng chứng ra màn hình (output test, `grep` các dòng sổ) — giám khảo chỉ đọc transcript, không đọc file.

## Cấu trúc (chỉ điều phối viên sửa, từ dòng MAP: của builder)
Kiến trúc: <Service+Facade | khác + lý do> · Run file: <đường dẫn> · Bản đồ chi tiết: .ai/MAP.md (M+)
Luồng: run → entry → facade → service → models/utils (chỉ đi xuống; service không import service; facade không import facade)
S: <thư mục> | <tầng> | <vai trò>  (≤8 dòng; M+ chuyển sang .ai/MAP.md, ở đây chỉ còn 3 dòng trên)

## Luật code
Tái dùng trước khi viết mới · TDD cho logic/bugfix · sửa = thay logic cũ, ≤2 nhánh fallback · mọi symbol mới phải có nơi gọi (kiểm sau mỗi việc, kể cả việc tự làm), không dead code · root cause, debug theo tầng. Chi tiết + cổng báo cáo: agent `sp:builder`.

## Quyết định (giữ lâu dài, ≤10 dòng: ngày | quyết định | lý do | phương án đã loại; L: chi tiết docs/quyet_dinh/)

## Gotchas (lỗi sẽ lặp lại; mỗi dòng: ngày | điều | nguồn)
```
**`.ai/STATE.md`** (≤40 dòng, ghi theo sự kiện, không đợi cuối phiên):
```
Mục tiêu: <...>   Chế độ: <...>   tin_cay: <cao|thấp>
## Việc (≤10 dòng: [ ] / [x] / [~] đang làm / [!] chặn)
## Đang chạy (agent | việc | file/chủ đề)
## Nhật ký (mới nhất trên cùng, giữ 10 dòng; dòng cũ quan trọng → Gotchas hoặc findings)
## Sức khỏe: <điểm> (C T Th) <ngày> — từ sp:bao-tri
## Chi phí: tổng theo vai (scout/grunt/builder/critic: số spawn, tok) — chi tiết từng spawn append vào .ai/chi_phi.log
## Tiếp theo: <hành động cụ thể: file/hàm/lệnh>
```
**`.ai/runs/`** — output subagent, tên `<ngày>-<vai>-<chủ đề>.md`, mỗi run thêm 1 dòng vào `INDEX.md` (file | câu hỏi | từ khóa EN+VI). Không bao giờ tự nạp.
Thêm theo quy mô — bảng trong `.ai/ref/kien_truc.md` (M+: MAP.md + MAP.auto.md, brief.md do bạn viết, ke_hoach.md, no_ky_thuat.md; L: + docs/, reuse.md).
Thêm theo chế độ: NGHIÊN CỨU → `.ai/findings.md` + `.ai/so_cai.md` (khuôn trong skill `sp:nghien-cuu`). TRIỂN KHAI → `SPEC.md` (skill `sp:xay-dung`).
`.gitignore`: nền theo stack (`.env`, `.venv/`, `node_modules/`, `__pycache__/`, `dist/`, `build/`) + `.codegraph/` + `.ai/chi_phi.log`. Chưa có git → `git init` + commit đầu. Commit `.ai/` sau mỗi phán quyết/việc xong (agent vẫn đọc-ghi `.ai/` qua đường dẫn tuyệt đối, commit là để lưu lịch sử).

## 3. codegraph (tùy chọn, không chặn)
Có code và có lệnh `codegraph` nhưng chưa có `.codegraph/` → `codegraph init`. Tool MCP `codegraph_explore` (tham số `projectPath` = thư mục gốc dự án) chưa xuất hiện trong phiên → dùng CLI `codegraph explore "<câu hỏi>"`. Chưa cài → Grep/Glob, ghi 1 dòng gợi ý cài vào Gotchas; KHÔNG tự cài global.

## 4. Bắt đầu
Gọi skill theo chế độ: NGHIÊN CỨU → `sp:nghien-cuu` · XÂY DỰNG/TRIỂN KHAI → `sp:xay-dung`. M+ XÂY DỰNG/TRIỂN KHAI: viết `.ai/brief.md` + Mốc 1 vào `.ai/ke_hoach.md` theo `.ai/ref/moc.md`, chạy critic ke_hoach, chép việc vào STATE — rồi mới build. Làm vòng đầu tiên ngay, rồi đề xuất cho user 1 câu `/goal` (`.ai/ref/goal.md` / `goal_nghien_cuu.md`) cho cụm vòng tiếp theo.

YÊU CẦU CỦA USER:

$ARGUMENTS
