---
name: nghien-cuu
description: "Vòng nghiên cứu giả thuyết → bằng chứng/thí nghiệm → phán quyết, điều phối scout/builder/critic. Dùng ở chế độ NGHIÊN CỨU hoặc khi spike một giả thuyết rủi ro."
---
# Nghiên cứu — điều phối viên đọc 1 lần mỗi phiên (đọc lại sau khi context bị nén)

## LUẬT CỨNG (không được tự miễn — vi phạm = làm lại bước đó)
1. **Đóng khung = phân kỳ trước**: chưa có `.ai/phan_ky/<nhóm>.md` → spawn `sp:scout` CHẾ ĐỘ phan_ky ≥3 lăng kính + #0 trong CÙNG 1 lượt; chưa có file đó thì KHÔNG ghi dòng H.
2. **Mình không tự chạy lệnh thí nghiệm/đo/ablation** → `sp:grunt`. Không tự search web → `sp:scout`.
3. **Chạm kill → bước 3b** (failing → grunt đối chứng/ablation → critic `that_bai`). Trước MỌI dòng `V … refuted` chạy `node "${CLAUDE_PLUGIN_ROOT}/hooks/lint_so_cai.js"` và in kết quả; lint báo lỗi thì KHÔNG ghi refuted.
4. **Chốt confirmed/refuted** chỉ sau khi critic `gia_thuyet` trả KẾT. **Confirmed** còn phải qua TÁI LẬP SẠCH: 1 `sp:grunt` chạy lại `cmd` từ checkout sạch (`git stash -u` / worktree mới), seed mới, ghi dòng `E` thứ hai — lệch ngoài dung sai → không được confirmed. ≥3 giả thuyết cùng chủ đề → critic nêu rủi ro "thử nhiều lần mới trúng".
5. Kết mỗi `/goal` in `ĐỊNH TUYẾN: haiku n · sonnet m · tự chạy k` + output của `node "${CLAUDE_PLUGIN_ROOT}/hooks/lint_so_cai.js"`.

## File (trong `.ai/`, chỉ điều phối viên ghi)
**`findings.md`** — file DUY NHẤT đọc mỗi phiên, ≤60 dòng:
```
Câu hỏi gốc: <...>
## Rủi ro chặn đường (liệt kê ngay từ đầu → mỗi cái thành ≥1 giả thuyết blk)
## Đã chốt (id | kết luận | bằng chứng)
## Đang sống (id | giả thuyết | kill | trạng thái | biến thể n/3)
## Đường chết (id | bác bỏ vì F? | bài học / ràng buộc mới) ← KHÔNG thử lại nếu không có lý do mới
## Hướng tiếp (≤3)
## Cổng triển khai: <chưa | đủ>
```
Chạm 60 dòng → gộp Đường chết/Đã chốt cũ thành cụm theo chủ đề (vd `H3,H9,H14 — tokenizer`) — KHÔNG xóa; chi tiết vẫn ở dòng V của sổ cái.

**`so_cai.md`** — sổ cái append-only, KHÔNG đọc cả file. Tra đúng id: `grep "H7 |" .ai/so_cai.md` (dấu ` |` để H7 không khớp H70). Tra theo nội dung: `grep -i "<từ khóa>"`.
```
H7 | <giả thuyết đo được> | lõi:<điều cốt lõi> | phụ trợ:<giả định đi kèm> | kill: <điều kiện bác bỏ, viết TRƯỚC khi thử> | test: <cách kiểm, ngưỡng, dung sai> | n:<số lần lặp/seed CỐ ĐỊNH trước khi chạy> | blk | scope:<thành phần — chỉ khi thuộc luồng phụ>
E12 | H7 | <setup: commit, tham số, seed> | <kết quả số ± dao động qua các lần chạy lại> | cmd: <lệnh tái lập> | runs/<file>
V | H7 | failing|confirmed|refuted|parked | <lý do 1 câu> | <bằng chứng: E12, runs/<file>#S3> | lesson:<bắt buộc khi refuted>
F7 | H7 | F1..F5 | <bằng chứng: E12, runs/x> | giả định ngầm:<…> | đề xuất:<H7.1,H7.2>
H7.1 | <giả thuyết> | kill: <MỚI, viết trước> | test: … | blk | parent:H7 | đổi:<phụ trợ> | giữ:<lõi> | dự đoán mới:<…>
```
`blk` = chặn đường triển khai. Trạng thái hiện tại = dòng V cuối của id. Nguồn web nằm trong run của scout, trích `runs/<file>#S<n>`.

## Một vòng
0. Đang là luồng phụ → ĐẦU mỗi vòng tăng `vòng k/3` ở dòng `Luồng phụ` của STATE (gộp vào lệnh ghi sổ đầu tiên của vòng); k đã là 3 → không mở vòng mới, phán quyết/đóng.
1. **Đóng khung**: PHÂN KỲ trước (`.ai/ref/phan_ky.md`, scout haiku theo lăng kính: giả định ngầm, phương án thay thế, đối thủ/hiện trạng ngành, pre-mortem, câu hỏi chưa biết, + #0 lăng kính còn thiếu) → hội tụ thành 1–5 giả thuyết có `kill` + `test`, mỗi giả thuyết tách rõ LÕI và giả định PHỤ TRỢ. Trước khi ghi: grep từ khóa trong sổ cái — trùng hướng đã refuted thì phải nêu lý do mới.
2. **Thu thập — 2 pha** (scout, chạy nền, chia theo GÓC không trùng; đã có run còn hạn trong `runs/INDEX.md` → không spawn):
   Pha 1 (≤3 scout, ≤6 search/con): (a) nguồn gốc: paper/docs/spec · (b) thực chiến: benchmark/GitHub issue/repo · (c) phản bác: ai nói nó KHÔNG chạy, giới hạn đã biết. Mỗi scout trả thêm `THUẬT NGỮ MỚI` + `THEO DẤU`.
   Pha 2 (CHỈ cho giả thuyết `blk` hoặc khẳng định tính mới; 1–2 scout, ≤6 search/con): truy vấn bằng thuật ngữ mới + đi theo trích dẫn (arXiv cited-by, GitHub used-by/issues), tìm paper/repo GỐC thay vì blog, tìm repo cùng ý tưởng theo mô tả hành vi. Dừng khi 2 truy vấn liên tiếp không thêm nguồn tier A/B mới. Trần: ≤5 scout cho 1 giả thuyết `blk`.
3. **Thí nghiệm** (khi `test` cần số đo): builder dựng trong worktree, `thi_nghiem/E<n>/` có 1 lệnh chạy, cố định seed. merge `thi_nghiem/E<n>/` về nhánh chính TRƯỚC khi ghi dòng `E` (cmd phải chạy được từ cây chính). grunt chạy lặp/quét tham số, trả về sẵn nội dung dòng `E`. Kết quả gần ngưỡng → CHẠY LẠI cùng thí nghiệm ≥3 lần (vẫn là 1 E, ghi dao động).
3b. **Chạm kill → PHÂN TÍCH THẤT BẠI, KHÔNG bác bỏ ngay** (1 lượt = 1 lần sửa bug F1 HOẶC 1 biến thể; tối đa 3 lượt cho 1 nhóm H):
   ① ghi `V | H | failing` GỘP trong cùng lệnh/lượt với việc spawn grunt · ② code thí nghiệm chưa có công tắc bật/tắt từng thành phần → builder thêm (SendMessage builder cũ) · ③ grunt ĐỐI CHỨNG/ABLATION (đối chứng dương tính, ≥3 seed, đổi 1 biến/lần) · ④ critic `that_bai` (spawn MỚI) phân loại F1→F5, ghi dòng `F` · ⑤ critic trả `CẦN GRUNT` → (cần công tắc mới thì quay lại ②) → ③ → critic `that_bai` MỚI (không tính thêm lượt).
   F1 (bug) → builder sửa, chạy lại; vẫn chạm kill → quay lại ① · F2–F4 → **vòng nâng cấp**: F4 thì chạy thêm phân kỳ lăng kính #9 giả định ngầm + #0 (dùng lại file phân kỳ của nhóm) → sinh biến thể H<n>.<k> (đổi phụ trợ, giữ lõi, kill MỚI viết + commit TRƯỚC khi chạy, ≥1 dự đoán MỚI). Biến thể chạm kill → lại 3b cho chính nó.
   Ngân sách nhóm H: ≤3 biến thể, ≤6 thí nghiệm KHÁC NHAU (đối chứng/ablation/chạy lại KHÔNG tính) — hết → `parked`. Đang là luồng phụ mà hết 3 vòng giữa chừng → `parked`.
   Biến thể confirmed → ghi V của H cha `confirmed qua H<n>.<k>` (cổng đọc V của H cha). Tra cả nhóm: `grep -E "H7(\.[0-9]+)? \|" .ai/so_cai.md`.
4. **Phản biện** (critic CHẾ ĐỘ gia_thuyet, spawn MỚI, không đưa lập luận của bạn): giả thuyết sắp chốt/bác bỏ, gộp ≤3 cái cùng chủ đề vào 1 critic. `KẾT: sụp` → không được confirmed.
5. **Phán quyết** (tự làm; luồng phụ hết vòng 3/3 → đóng theo `sp:chuyen`): nguồn tier A quyết định kết luận → tự mở kiểm (tier do haiku gán, có thể sai). Ghi dòng V, cập nhật findings.md, kết quả bất ngờ → giả thuyết con. 1 dòng STATE.

## Luật phán quyết (cố định trước khi xem kết quả)
- **confirmed**: đạt `test` trong dung sai bằng `cmd` chạy lại được — hoặc, với khẳng định không thí nghiệm được: ≥1 nguồn tier A hoặc ≥2 tier B độc lập (khác tác giả, không trích lại nhau); VÀ critic không `sụp`.
- **failing**: chạm `kill` — trạng thái tạm, BẮT BUỘC có dòng `F` trong cùng vòng trước mọi phán quyết khác.
- **refuted** chỉ khi: (a) F5 có bằng chứng — F1–F4 đã loại có ghi nhận, hoặc mâu thuẫn trực tiếp nguồn tier A; hoặc (b) cạn biến thể — 3 biến thể đều chạm kill mới. Dòng V phải có `lesson: <nguyên nhân F?> | ràng buộc mới: <điều kiện để thử lại/né>` → Đường chết. Kết quả âm là tri thức: hướng sau phải đọc ràng buộc này.
- **Chống dời cột gôn**: KHÔNG nới ngưỡng `kill` cũ (đổi ngưỡng chỉ khi F3 có bằng chứng thước đo sai, ghi lý do) · dữ liệu dùng để chẩn đoán KHÔNG dùng để xác nhận — biến thể confirmed phải qua lần chạy MỚI (seed mới/tập giữ riêng) · biến thể chỉ giải thích lại số cũ, không có dự đoán mới = vá ad hoc, không hợp lệ · biến thể confirmed ghi `đã qua N lần sửa`.
- **parked**: hết ngân sách (6 thí nghiệm KHÁC NHAU cho nhóm H, hoặc hết trần vòng/`/goal`) mà chưa ngã ngũ → ghi điều kiện mở lại (KHÔNG phải refuted).
- Tier C không bao giờ đủ để chốt. Không có điểm tin cậy số — chỉ 5 trạng thái (open, failing, confirmed, refuted, parked).

## Trọng tài là user
Mỗi `/goal` = một cụm vòng có trần. Hết `/goal` → báo user ≤8 dòng: số H open / đã đóng / hướng chết, đã chốt gì, chết gì, 2–3 hướng tiếp + đề xuất 1, kèm câu `/goal` cho hướng đó. User chọn hướng — con người phán "tiến triển thật hay chỉ bận rộn".

## Cổng NGHIÊN CỨU → TRIỂN KHAI
Đủ khi (luồng phụ: chỉ xét `blk` thuộc phạm vi đó): có ≥1 giả thuyết `blk` và mọi rủi ro chặn đường đã có giả thuyết `blk` · mọi `blk` confirmed (hoặc parked kèm phương án thay thế đã confirmed) · mỗi confirmed có `cmd` chạy được · critic đã chạy trên kết luận tổng. Khi đủ → kết thúc `/goal` hiện tại, đề xuất user `sp:chuyen TK` — nó viết SPEC trỏ id, chuyển thí nghiệm quyết định thành `tests/acceptance/`, chọn kiến trúc + quy mô, dựng scaffold. Luồng phụ đủ cổng → đóng luồng phụ (hợp nhất vào SPEC/brief). User muốn build/triển khai TRƯỚC khi đủ cổng → vẫn `sp:chuyen`, nó ghi "Giả định chưa kiểm".

## Mẫu /goal
Đọc `.ai/ref/goal_nghien_cuu.md` khi đề xuất `/goal` (giám khảo đọc transcript → bằng chứng in ra màn hình + trần vòng).

## Spike / luồng phụ NC (từ XD/TK)
Mở bằng `sp:chuyen NC phạm vi:<thành phần>`: ≤3 vòng chỉ cho thành phần đó, rồi phán quyết và đóng luồng phụ (bảng trong `sp:chuyen`).
