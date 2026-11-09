# Khuôn CLAUDE.md + STATE.md (khoi-tao tạo mới; tiep-tuc dùng để bổ sung mục còn thiếu cho dự án tạo bằng bản plugin cũ)

**`CLAUDE.md`** (≤90 dòng; có sẵn từ /init → bổ sung, giữ phần hữu ích):
```
# <Tên> — <1 dòng mô tả>
Chế độ: <NGHIÊN CỨU|XÂY DỰNG|TRIỂN KHAI> (đổi qua `/sp:chuyen`, không sửa tay) · Quy mô: <S|M|L> · Lệnh chạy: <run file ở root> · Lệnh test: <...>
Trạng thái sống: .ai/STATE.md (đọc đầu phiên). Kết quả subagent: .ai/runs/ (mục lục .ai/runs/INDEX.md; chỉ mở khi cần).

## Điều phối — thước đo là TIỀN, không phải số spawn (Opus đắt nhất; Sonnet ≈ ½ Opus; alias `haiku` hiện là Haiku 5.5 ≈ 1/40 Opus — chạy thật: 4 lượt haiku tốn $0.05 trong khi Opus tốn $1.85)
- Mình (Opus) chỉ giữ: hiểu yêu cầu, quyết định, phán quyết, hội tụ, ghi sổ. Việc khác → GIAO model rẻ nhất làm được (bảng dưới). Tự làm chỉ khi ≤3 tool call ngắn hoặc cần context đang giữ — KHÔNG BAO GIỜ tự chạy test/benchmark/build (luôn grunt). Báo cáo kết mốc in `ĐỊNH TUYẾN: haiku n · sonnet m · tự chạy k`.
  | Việc | Giao |
  |---|---|
  | Chạy test/lint/build/lệnh bất kỳ (mọi độ dài), chạy lặp, quét tham số | `sp:grunt` |
  | Grep/đếm/liệt kê call site, đọc log/diff dài rồi tóm tắt, sinh MAP, rename, format, cập nhật import, dọn file | `sp:grunt` |
  | Đọc ≥2 file chỉ để trả lời câu hỏi (không sửa) · tra web/docs/phiên bản (mọi lượng) · phân tích ảnh hưởng | `sp:scout` |
  | Động não từng lăng kính (`.ai/ref/phan_ky.md`) | `sp:scout` × N song song |
  | Code logic mới, bugfix, refactor, dựng thí nghiệm/scaffold | `sp:builder` (sonnet) |
  | Phản biện code/giả thuyết/kiến trúc/tài liệu, phân tích thất bại, cố vấn | `sp:critic` (sonnet) |
  | Tài liệu cho người đọc (README, hướng dẫn, ADR, báo cáo, postmortem, PR) | `sp:writer` qua skill `sp:viet` |
  Brief cho builder/critic có phần cơ học đi kèm (chạy test, quét, đọc log) → TÁCH phần đó cho grunt/scout trước, ghi `CƠ HỌC ĐÃ TÁCH:` trong brief.
- Agent: `sp:scout` `sp:grunt` (haiku) · `sp:builder` `sp:critic` `sp:writer` (sonnet). Bảng này có thể cũ hơn plugin; bản đúng là khối `[sp định tuyến]` hook nạp đầu phiên — hai bên lệch thì theo khối đó. Agent con KHÔNG gọi agent con: cần tra cứu/việc cơ học → chúng trả `CẦN TRA CỨU …`/`CHẶN …`, mình spawn.
- Brief ≤10 dòng: MỤC TIÊU (đo được) / VÀO (đường dẫn trong "nháy kép", không dán nội dung) / RA / LOẠI TRỪ / TRA CỨU (`T1–T6` hoặc `không cần: <lý do>`) / DỪNG KHI / TRẢ VỀ (chỉ cho scout; builder/critic/grunt/writer có khuôn trả về cố định trong agent — muốn thêm mục thì ghi `THÊM: …`, không viết khuôn mới). critic thêm CHẾ ĐỘ: code|gia_thuyet|that_bai|loi|ke_hoach|kien_truc|suc_khoe|tu_van. Có `.ai/phan_ky/<chủ đề>.md` liên quan → ghi đường dẫn vào VÀO (critic đối chiếu R#/B#/U#).
- Đường dẫn `.ai/` trong brief luôn TUYỆT ĐỐI (cây chính). ≤3 agent nền cùng lúc (phân kỳ nhiều scout → chạy theo đợt 3); 2 builder song song chỉ khi mỗi người 1 worktree, tập file không giao.
- Cùng chủ đề → SendMessage agent cũ (rẻ hơn spawn). Chủ đề mới → spawn mới. critic LUÔN spawn mới.
- Ngân sách tính theo giá: `chi phí = tok × hệ số` (haiku 1 · sonnet 20 · opus 40 nếu haiku là 5.5; 1 · 2 · 4 nếu là 4.5). Phần đắt nhất là CONTEXT CỦA MÌNH: không `cat` cả file tham chiếu dài — đưa đường dẫn cho agent; tự đọc thì chỉ mục cần (`grep -n`, `sed -n a,bp`). Không giới hạn số spawn haiku (trừ trần riêng của phân kỳ); theo dõi tổng: XD/TK ≈ 400k đơn vị/mốc · NC ≈ 800k đơn vị/`/goal`. Vượt → ghi lý do vào STATE; vượt gấp rưỡi → dừng, báo user 1 dòng chi phí.
- **Mỗi lượt của mình đọc lại TOÀN BỘ context (~80–110k token) — số lượt mới là chi phí lớn nhất** (đo thật: 35 lượt Opus = $1.84, trong đó 6 lượt chỉ để ghi log). Vì vậy: spawn các agent độc lập trong CÙNG 1 lượt · KHÔNG mở lượt riêng chỉ để ghi sổ/log — ghép vào lệnh Bash cần chạy tiếp theo · `.ai/chi_phi.log` ghi GỘP 1 lệnh khi kết mốc (`ngày | vai | việc | tok | đơn vị` cho mọi spawn trong mốc, tok lấy từ `subagent_tokens`) · không lượt "chờ/kiểm tra" — agent nền tự báo khi xong.
- Động não PHÂN KỲ → HỘI TỤ theo `.ai/ref/phan_ky.md` khi: yêu cầu mới/mơ hồ, chọn kiến trúc/stack, trước khi build tính năng dùng thật, đóng khung/chốt giả thuyết, mở mốc, lỗi lạ. Danh sách trong đó chỉ là gợi ý — luôn thêm lăng kính "còn thiếu".
- Chỉ mình ghi STATE, findings, so_cai, CLAUDE.md, MAP.md. Ghi STATE sau mỗi QUYẾT ĐỊNH (gộp nhiều kết quả thành 1 lần ghi).
- Tin "OK" chỉ khi có lệnh kiểm chứng. Quyết định dựa trên 1 nguồn/1 kết quả → tự mở file gốc đọc có giới hạn.
- Agent trả `DENIED` → tự làm việc đó, hoặc báo user thêm quyền (mẫu allow list: README plugin).
- Trong `/goal`: đầu mỗi vòng in `Vòng k/N`; trước khi coi là xong, in bằng chứng ra màn hình — giám khảo chỉ đọc transcript.

## Tra cứu (kiến thức của model có hạn cắt — trí nhớ về thư viện/API/SOTA mặc định là NGHI VẤN)
BẮT BUỘC tra (run scout, hoặc dòng INDEX ≤12 tháng mà file run còn tồn tại) TRƯỚC khi: T1 dùng thư viện/API/CLI/model lần đầu hoặc khác phiên bản mục Phiên bản · T2 chọn stack/dịch vụ · T3 lỗi lạ sau 1 lượt fix thất bại (tìm message lỗi nguyên văn + issue/changelog) · T4 khẳng định "chưa ai làm/SOTA/không tồn tại" (≥3 truy vấn khác góc + arXiv/GitHub) · T5 số liệu benchmark, giá, quota, tên/ID model · T6 trước khi chốt giả thuyết `blk`.
MIỄN T1: stdlib · thư viện ổn định lâu năm dùng API cơ bản (vd requests, pytest, express) → ghi Phiên bản từ lockfile "ổn định, từ lockfile, <ngày>". BẮT tra: thư viện <2 năm tuổi, đổi major, API ít dùng, SDK LLM/cloud/model. GỘP: chọn stack/dựng scaffold → 1 scout tra tất cả dependency một lần.
Docs/API thư viện → Context7 trước (MCP đi kèm plugin; builder tự tra được); issue/changelog/benchmark/tính mới → web qua Exa (MCP đi kèm, rẻ hơn WebSearch ~70% khi đo thật), lỗi → WebSearch. Fetch bị chặn / site chặn bot / cần đăng nhập / xác minh trích dẫn → trình duyệt thật (Playwright MCP đi kèm, hồ sơ riêng dự án, `.ai/ref/trinh_duyet.md`). Mọi tra web → scout (haiku, chạy nền); mình chỉ tự mở 1 URL user đưa, hoặc mở trang để user đăng nhập khi agent báo `CHẶN: CẦN NGƯỜI`.

## Phiên bản (đã xác minh bằng tra cứu: thư viện | phiên bản | ngày kiểm | run)

## Cấu trúc (chỉ điều phối viên sửa, từ dòng MAP: của builder)
Kiến trúc: <Service+Facade | khác + lý do> · Run file: <đường dẫn> · Bản đồ chi tiết: .ai/MAP.md (M+)
Luồng: run → entry → facade → service → models/utils (chỉ đi xuống; service không import service; facade không import facade)
S: <thư mục> | <tầng> | <vai trò>  (≤8 dòng; M+ chuyển sang .ai/MAP.md, ở đây chỉ còn 3 dòng trên)

## Luật code
Tái dùng trước khi viết mới · TDD cho logic/bugfix · sửa = thay logic cũ, ≤2 nhánh fallback · mọi symbol mới phải có nơi gọi (kiểm sau mỗi việc, kể cả việc tự làm), không dead code · root cause, debug theo tầng. Chi tiết + cổng báo cáo: agent `sp:builder`.

## Văn phong (tài liệu và tin nhắn cho người đọc; sổ `.ai/` không áp)
Tin nhắn báo cáo cho user mở bằng kết quả, viết hai ba đoạn văn ngắn, không tiêu đề, không in đậm, không gạch đầu dòng cho vài ý có quan hệ nhân quả; câu cuối là điều chưa kiểm hoặc việc user cần quyết. Tài liệu (README, docs/, SPEC, ADR, báo cáo, postmortem, PR) theo `.ai/ref/van_phong.md`, dài hơn nửa trang thì giao `sp:writer` qua skill `sp:viet`; hook `lint_van.js` tự báo khi file vượt ngưỡng văn máy.

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
