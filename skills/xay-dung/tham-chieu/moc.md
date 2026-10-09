# Mốc phát triển / mở rộng phạm vi (đọc khi: mở mốc mới, thêm tính năng lớn, user đổi phạm vi)

**Nguyên tắc:** kế thừa 100%, không đập đi xây lại · APPEND mốc vào `.ai/ke_hoach.md` (không viết lại lịch sử); `.ai/brief.md` cập nhật mục tiêu/phạm vi HIỆN HÀNH (≤40 dòng) · mỗi mốc PHẢI có NGOÀI phạm vi (chống scope creep).

## 1. Phân tích ảnh hưởng (scout, có số liệu thật)
Brief scout: với mỗi module sẽ mở rộng → `codegraph explore "<module> callers callees"` / grep import: số call site, test bị ảnh hưởng, module cô lập; keyword chức năng mới → có code tương tự chưa. Ghi runs/. Rủi ro Cao/Trung/Thấp dựa trên số liệu đó.

## 2. Mẫu mốc (append vào `.ai/ke_hoach.md`)
~~~
## Mốc N: <tên> — <ngày>
Mục tiêu: <1–2 câu>
Trong phạm vi: - … 
NGOÀI phạm vi: - … (để mốc sau)
Tiêu chí hoàn thành (đo được): 1. … 2. …
Rủi ro: <rủi ro> | Cao/Trung/Thấp | <giảm thiểu> | <số liệu từ runs/…>
| ID | Việc | Phụ thuộc | Kết quả đo được |
| N.1 | … | — | test X xanh |
~~~
Vùng nhạy cảm (auth, thanh toán, phân quyền, migration dữ liệu) → BẮT BUỘC có kế hoạch migration + rollback trong mốc trước khi code.
Nợ kỹ thuật cao trong `.ai/no_ky_thuat.md` chạm vào vùng của mốc → trả trước.

## 3. Cổng trước khi code (critic CHẾ ĐỘ ke_hoach, spawn mới)
≤10 việc (hơn → tách 2 mốc) · mỗi việc 1 kết quả đo được, đủ nhỏ cho 1 builder 1 lượt · phụ thuộc rõ · NGOÀI phạm vi có · run file + MAP còn khớp · [L] kien_truc/contracts đã cập nhật. FAIL → sửa kế hoạch trước.
Đạt → chép mốc hiện tại vào mục Việc của STATE. (S: không có ke_hoach.md — VÀO của critic ke_hoach = mục Việc của STATE.)

## Contracts (L, khi có API/interface nội bộ dùng chung) — `docs/contracts/<ten>.md`
~~~
# <tên> — làm gì · Endpoints/Methods · Schema vào/ra · Changelog: <ngày> | thay đổi
~~~
Đổi contract → sửa contract TRƯỚC → builder code → grunt grep mọi nơi dùng bản cũ.

## Quyết định kiến trúc (ADR) — chỉ khi chọn giữa phương án mà đổi lại rất tốn
1 dòng vào CLAUDE.md mục Quyết định. [L] chi tiết `docs/quyet_dinh/QD_NNN_<mo_ta>.md`:
~~~
Bối cảnh · Phương án (A: ưu/nhược, B: ưu/nhược) · Chọn + lý do · Hậu quả/đánh đổi · Ngày
~~~
