# Khuôn CLAUDE.md + STATE.md (khoi-tao tạo mới; tiep-tuc dùng để bổ sung mục còn thiếu cho dự án tạo bằng bản plugin cũ)

**`CLAUDE.md`** (≤90 dòng; có sẵn từ /init → bổ sung, giữ phần hữu ích):
```
# <Tên> — <1 dòng mô tả>
Chế độ: <NGHIÊN CỨU|XÂY DỰNG|TRIỂN KHAI> (đổi qua `/sp:chuyen`, không sửa tay) · Quy mô: <S|M|L> · Lệnh chạy: <run file ở root> · Lệnh test: <...>
Trạng thái sống: .ai/STATE.md (đọc đầu phiên). Kết quả subagent: .ai/runs/ (mục lục .ai/runs/INDEX.md; chỉ mở khi cần).

## Điều phối (mỗi spawn tốn ~15–20k token cố định — chỉ giao khi lời hơn)
- Luật SPAWN — spawn khi ≥1: việc >60 dòng hoặc >3 file · cần đọc >25k token tài liệu/web mình không cần giữ · ≥2 nhánh độc lập chạy song song · cần mắt độc lập (critic). Còn lại TỰ LÀM. Lệnh ngắn tự chạy Bash; grunt chỉ khi output >200 dòng hoặc lặp ≥5 lần.
- Agent: `sp:scout` `sp:grunt` (haiku) · `sp:builder` `sp:critic` (sonnet). Agent con KHÔNG gọi agent con: cần tra cứu/việc cơ học → chúng trả `CẦN TRA CỨU …`/`CHẶN …`, mình spawn.
- Brief ≤10 dòng: MỤC TIÊU (đo được) / VÀO (đường dẫn trong "nháy kép", không dán nội dung) / RA / LOẠI TRỪ / TRA CỨU (`T1–T6` hoặc `không cần: <lý do>`) / DỪNG KHI / TRẢ VỀ. critic thêm CHẾ ĐỘ: code|gia_thuyet|loi|ke_hoach|kien_truc|suc_khoe|tu_van.
- Đường dẫn `.ai/` trong brief luôn TUYỆT ĐỐI (cây chính). ≤3 agent nền cùng lúc; 2 builder song song chỉ khi mỗi người 1 worktree, tập file không giao.
- Cùng chủ đề → SendMessage agent cũ (rẻ hơn spawn). Chủ đề mới → spawn mới. critic LUÔN spawn mới.
- Ngân sách: XD/TK ≤6 spawn mỗi mốc · NC ≤12 spawn mỗi `/goal`. Vượt → ghi lý do vào STATE; vượt gấp rưỡi → dừng, báo user 1 dòng chi phí.
- Sau MỖI spawn: append `ngày | vai | việc | tok` (từ `subagent_tokens` trong thông báo hoàn thành; không có thì `?`) vào `.ai/chi_phi.log` — chỉ 1 lệnh; STATE Chi phí cộng dồn khi xong mốc / `sp:bao-tri`.
- Chỉ mình ghi STATE, findings, so_cai, CLAUDE.md, MAP.md. Ghi STATE sau mỗi QUYẾT ĐỊNH (gộp nhiều kết quả thành 1 lần ghi).
- Tin "OK" chỉ khi có lệnh kiểm chứng. Quyết định dựa trên 1 nguồn/1 kết quả → tự mở file gốc đọc có giới hạn.
- Agent trả `DENIED` → tự làm việc đó, hoặc báo user thêm quyền (mẫu allow list: README plugin).
- Trong `/goal`: đầu mỗi vòng in `Vòng k/N`; trước khi coi là xong, in bằng chứng ra màn hình — giám khảo chỉ đọc transcript.

## Tra cứu (kiến thức của model có hạn cắt — trí nhớ về thư viện/API/SOTA mặc định là NGHI VẤN)
BẮT BUỘC tra (run scout, hoặc dòng INDEX ≤12 tháng mà file run còn tồn tại) TRƯỚC khi: T1 dùng thư viện/API/CLI/model lần đầu hoặc khác phiên bản mục Phiên bản · T2 chọn stack/dịch vụ · T3 lỗi lạ sau 1 lượt fix thất bại (tìm message lỗi nguyên văn + issue/changelog) · T4 khẳng định "chưa ai làm/SOTA/không tồn tại" (≥3 truy vấn khác góc + arXiv/GitHub) · T5 số liệu benchmark, giá, quota, tên/ID model · T6 trước khi chốt giả thuyết `blk`.
MIỄN T1: stdlib · thư viện ổn định lâu năm dùng API cơ bản (vd requests, pytest, express) → ghi Phiên bản từ lockfile "ổn định, từ lockfile, <ngày>". BẮT tra: thư viện <2 năm tuổi, đổi major, API ít dùng, SDK LLM/cloud/model. GỘP: chọn stack/dựng scaffold → 1 scout tra tất cả dependency một lần.
Tra 1 câu hỏi/1 URL → tự search; >1 câu hỏi hoặc cần đọc nhiều nguồn → scout (haiku, chạy nền). Nguồn ghi ngày `[YYYY-MM]`; >12 tháng với thư viện đang phát triển → coi là hết hạn.

## Phiên bản (đã xác minh bằng tra cứu: thư viện | phiên bản | ngày kiểm | run)

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
Chế độ: (chưa — sp:chuyen điền)  Luồng phụ: <không | NC:<phạm vi> …>   tin_cay: <cao|thấp>
Mục tiêu: <...>
## Việc (≤10 dòng: [ ] / [x] / [~] đang làm / [!] chặn; việc luồng phụ gắn [NC:<phạm vi>]; "Giả định chưa kiểm" nếu có)
## Đang chạy (agent | việc | file/chủ đề)
## Nhật ký (mới nhất trên cùng, giữ 10 dòng; dòng cũ quan trọng → Gotchas hoặc findings)
## Sức khỏe: <điểm> (C T Th) <ngày> — từ sp:bao-tri
## Chi phí: tổng theo vai (scout/grunt/builder/critic: số spawn, tok) — chi tiết từng spawn append vào .ai/chi_phi.log
## Tiếp theo: <hành động cụ thể: file/hàm/lệnh>
```
