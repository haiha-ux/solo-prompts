---
name: nghien-cuu
description: "Vòng nghiên cứu giả thuyết → bằng chứng/thí nghiệm → phán quyết, điều phối scout/builder/critic. Dùng ở chế độ NGHIÊN CỨU hoặc khi spike một giả thuyết rủi ro."
---
# Nghiên cứu — điều phối viên đọc 1 lần mỗi phiên (đọc lại sau khi context bị nén)

## File (trong `.ai/`, chỉ điều phối viên ghi)
**`findings.md`** — file DUY NHẤT đọc mỗi phiên, ≤60 dòng:
```
Câu hỏi gốc: <...>
## Rủi ro chặn đường (liệt kê ngay từ đầu → mỗi cái thành ≥1 giả thuyết blk)
## Đã chốt (id | kết luận | bằng chứng)
## Đang sống (id | giả thuyết | kill | trạng thái)
## Đường chết (id | đã bác bỏ vì) ← KHÔNG thử lại nếu không có lý do mới
## Hướng tiếp (≤3)
## Cổng triển khai: <chưa | đủ>
```
Chạm 60 dòng → gộp Đường chết/Đã chốt cũ thành cụm theo chủ đề (vd `H3,H9,H14 — tokenizer`) — KHÔNG xóa; chi tiết vẫn ở dòng V của sổ cái.

**`so_cai.md`** — sổ cái append-only, KHÔNG đọc cả file. Tra đúng id: `grep "H7 |" .ai/so_cai.md` (dấu ` |` để H7 không khớp H70). Tra theo nội dung: `grep -i "<từ khóa>"`.
```
H7 | <giả thuyết đo được> | kill: <điều kiện bác bỏ, viết TRƯỚC khi thử> | test: <cách kiểm, ngưỡng, dung sai> | blk
E12 | H7 | <setup: commit, tham số, seed> | <kết quả số ± dao động qua các lần chạy lại> | cmd: <lệnh tái lập> | runs/<file>
V | H7 | confirmed|refuted|parked | <lý do 1 câu> | <bằng chứng: E12, runs/<file>#S3>
```
`blk` = chặn đường triển khai. Trạng thái hiện tại = dòng V cuối của id. Nguồn web nằm trong run của scout, trích `runs/<file>#S<n>`.

## Một vòng
1. **Đóng khung** (tự làm): từ Hướng tiếp/Rủi ro → 1–5 giả thuyết có `kill` + `test`. Trước khi ghi: grep từ khóa trong sổ cái — trùng hướng đã refuted thì phải nêu lý do mới.
2. **Thu thập** (scout, chạy nền, ≤3 con, chia theo GÓC không trùng): (a) nguồn gốc: paper/docs/spec, (b) thực chiến: benchmark/GitHub issue/repo, (c) phản bác: ai nói nó KHÔNG chạy, giới hạn đã biết. Mỗi brief ≤4–6 search. Đã có run trả lời trong `runs/INDEX.md` → không spawn.
3. **Thí nghiệm** (khi `test` cần số đo): builder dựng trong worktree, `thi_nghiem/E<n>/` có 1 lệnh chạy, cố định seed. merge `thi_nghiem/E<n>/` về nhánh chính TRƯỚC khi ghi dòng `E` (cmd phải chạy được từ cây chính). grunt chạy lặp/quét tham số, trả về sẵn nội dung dòng `E`. Kết quả gần ngưỡng → CHẠY LẠI cùng thí nghiệm ≥3 lần (vẫn là 1 E, ghi dao động).
4. **Phản biện** (critic CHẾ ĐỘ gia_thuyet, spawn MỚI, không đưa lập luận của bạn): giả thuyết sắp chốt/bác bỏ, gộp ≤3 cái cùng chủ đề vào 1 critic. `KẾT: sụp` → không được confirmed.
5. **Phán quyết** (tự làm): nguồn tier A quyết định kết luận → tự mở kiểm (tier do haiku gán, có thể sai). Ghi dòng V, cập nhật findings.md, kết quả bất ngờ → giả thuyết con. 1 dòng STATE.

## Luật phán quyết (cố định trước khi xem kết quả)
- **confirmed**: đạt `test` trong dung sai bằng `cmd` chạy lại được — hoặc, với khẳng định không thí nghiệm được: ≥1 nguồn tier A hoặc ≥2 tier B độc lập (khác tác giả, không trích lại nhau); VÀ critic không `sụp`.
- **refuted**: chạm `kill`, hoặc thí nghiệm của chính mình mâu thuẫn trực tiếp → Đường chết.
- **parked**: 3 thí nghiệm KHÁC NHAU (không tính chạy lại) hoặc hết trần vòng mà chưa ngã ngũ → ghi điều kiện mở lại.
- Tier C không bao giờ đủ để chốt. Không có điểm tin cậy số — chỉ 4 trạng thái.

## Trọng tài là user
Mỗi `/goal` = một cụm vòng có trần. Hết `/goal` → báo user ≤8 dòng: số H open / đã đóng / hướng chết, đã chốt gì, chết gì, 2–3 hướng tiếp + đề xuất 1, kèm câu `/goal` cho hướng đó. User chọn hướng — con người phán "tiến triển thật hay chỉ bận rộn".

## Cổng NGHIÊN CỨU → TRIỂN KHAI
Đủ khi: có ≥1 giả thuyết `blk` và mọi rủi ro chặn đường đã có giả thuyết `blk` · mọi `blk` confirmed (hoặc parked kèm phương án thay thế đã confirmed) · mỗi confirmed có `cmd` chạy được · critic đã chạy trên kết luận tổng. Khi đủ:
1. `SPEC.md` ≤80 dòng: mỗi yêu cầu trỏ id (vd "dùng X vì H7/E12"), ghi ngưỡng + dung sai.
2. Thí nghiệm quyết định → `tests/acceptance/` (test hồi quy đầu tiên).
3. Đổi Chế độ trong STATE + CLAUDE.md → TRIỂN KHAI, gọi `sp:xay-dung`.

## Mẫu /goal (giám khảo đọc transcript → yêu cầu bằng chứng IN RA MÀN HÌNH; luôn có trần, in `Vòng k/N`)
- Một giả thuyết: `/goal Đã in ra kết quả grep "H7 |" .ai/so_cai.md có dòng V (confirmed/refuted/parked); nếu confirmed thì cmd của E tương ứng đã chạy lại trong phiên và output in ra đạt ngưỡng; critic gia_thuyet đã trả KẾT cho H7; đã in wc -l .ai/findings.md ≤60. Tối đa 6 vòng (in Vòng k/6), tới vòng 6 chưa xong thì ghi V parked kèm lý do và dừng.`
- Khảo sát hướng: `/goal .ai/runs/INDEX.md có ≥3 run scout theo 3 góc khác nhau cho câu hỏi Q (in các dòng đó); findings.md có ≥3 giả thuyết mới đủ kill+test (in ra); đã gửi user báo cáo hướng tiếp. Tối đa 3 vòng spawn.`
- Chạy tới cổng: `/goal Cổng triển khai = đủ: đã in kết quả grep "^H" .ai/so_cai.md | grep -vc "kill:" bằng 0; mọi blk có dòng V confirmed (in grep); cmd của chúng đã chạy lại trong phiên với output in ra (cmd >10 phút → in log lần chạy gần nhất trong runs/); SPEC.md tồn tại; tests/acceptance chạy xanh (output in ra). Tối đa 10 vòng; 2 vòng liên tiếp không có dòng V mới → dừng, báo user.`

## Spike (gọi từ sp:xay-dung)
1 giả thuyết `blk` + kill, tối đa 1 vòng trên. confirmed → build tiếp. refuted → dừng build, báo user đề xuất chuyển sang NGHIÊN CỨU cho phần đó (user quyết). parked → build tiếp bằng phương án an toàn nếu có, ghi `[!]` trong STATE và báo user.
