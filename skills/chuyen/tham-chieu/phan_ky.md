# PHÂN KỲ → HỘI TỤ (động não triệt để, mọi chế độ) — chống suy luận tuyến tính 1–2 hướng

## Khi nào BẮT BUỘC
Yêu cầu mới có >1 cách hiểu hoặc chưa có tiêu chí chấp nhận · chọn kiến trúc/stack · trước khi build tính năng dùng THẬT (người dùng/dữ liệu/phần cứng thật) · đóng khung giả thuyết NC · trước khi chốt giả thuyết `blk` · mở mốc · lỗi lạ sau 1 lượt fix thất bại · user hỏi "còn gì nữa / đã nghĩ đủ chưa".
Bỏ qua: việc ≤1 file đã có test; đã có `.ai/phan_ky/<chủ đề>.md` cùng chủ đề và yêu cầu không đổi.
TRẦN: 1 phân kỳ / mốc (XD/TK) hoặc / nhóm giả thuyết (NC) — biến thể của cùng H dùng lại file cũ, chỉ chạy thêm lăng kính #9 + #0 · ≤8 scout tổng (chạy theo đợt ≤3) · vòng bổ sung của #0 ≤3 scout · chi phí ≈ (overhead ~15k + 3–5k việc) × số scout, tính theo giá haiku.

## Bước 1 — CHỌN LĂNG KÍNH (điều phối viên, ≤2 phút)
Thư viện dưới đây là GỢI Ý, KHÔNG phải danh sách đóng. Chọn 4–8 lăng kính hợp với việc này, VÀ luôn thêm lăng kính **#0 "lăng kính còn thiếu"**.
| # | Lăng kính | Câu hỏi dẫn |
|---|---|---|
| 0 | **Lăng kính còn thiếu** (bắt buộc) | Với việc NÀY, cần lập những danh sách nào khác chưa có trong bảng? Đề xuất ≥3 loại danh sách mới + liệt kê luôn mục cho chúng |
| 1 | Use case / người dùng | Ai dùng, dùng thế nào, kể cả cách dùng lạ, sai mục đích |
| 2 | Lỗi & sự cố thực tế (FMEA) | Mỗi bước/phụ thuộc hỏng thế nào, tác động, phát hiện ra sao |
| 3 | Đầu vào biên / dữ liệu xấu | Rỗng, cực lớn, sai định dạng, Unicode/tiếng Việt có dấu, múi giờ, trùng lặp |
| 4 | Môi trường thực tế | OS/phần cứng/mạng chập chờn, offline, thiết bị yếu, khác phiên bản, Windows vs Linux |
| 5 | Bảo mật / lạm dụng | Input độc, leo quyền, rò dữ liệu, chi phí bị khai thác |
| 6 | Vận hành / quy mô / chi phí | Tải, tăng trưởng, quota, hóa đơn API, giám sát, sao lưu |
| 7 | Pre-mortem | "6 tháng sau đã THẤT BẠI — viết 10 lý do" |
| 8 | Phương án thay thế | ≥4 cách khác đạt cùng mục tiêu, kể cả "không làm"/mua sẵn |
| 9 | Giả định ngầm | Mình đang mặc nhiên tin điều gì? Cái nào sai thì sụp cả kế hoạch |
| 10 | Phụ thuộc & chuỗi cung ứng | Thư viện/API/dịch vụ ngừng, đổi giá, đổi giấy phép, breaking change |
| 11 | Hệ quả bậc hai | Làm xong thì kéo theo thay đổi gì khác, ai/cái gì bị ảnh hưởng gián tiếp |
| 12 | Tiêu chí thành công / đo lường | Đo bằng gì để biết đúng, chỉ số nào dễ bị đánh lừa |
| 13 | Kiểm thử | Cần test gì: đơn vị, tích hợp, hồi quy, tải, thủ công; cái gì khó test |
| 14 | Trải nghiệm / khả năng tiếp cận | Người mới, lỗi hiển thị, thông báo lỗi, ngôn ngữ |
| 15 | Pháp lý / đạo đức / dữ liệu cá nhân | Giấy phép, quyền riêng tư, quy định ngành |
| 16 | Di trú / tương thích ngược / đảo ngược | Dữ liệu cũ, phiên bản cũ, rollback được không |
| 17 | Quan sát được (observability) | Khi hỏng lúc 3h sáng, log/metric nào cho biết vì sao |
| 18 | Câu hỏi chưa biết | Điều gì mình chưa biết mà cần biết, kiểm bằng cách nào |
| 19 | Đối thủ / hiện trạng ngành | Người khác đã làm gì, vì sao họ thất bại/thành công (NC: bắt buộc) |

## Bước 2 — PHÂN KỲ (haiku, rẻ, song song)
Mỗi lăng kính = 1 `sp:scout` CHẾ ĐỘ `phan_ky` chạy nền (≤8 con; lăng kính nhỏ có thể gộp 2 vào 1 scout). Mỗi con ≤15 mục, KHÔNG lọc, KHÔNG xếp hạng, ưu tiên cái lạ; ≤3 search nếu lăng kính cần sự cố/thực tế có thật (2, 4, 10, 19).
Brief mẫu:
~~~
CHẾ ĐỘ: phan_ky — lăng kính <#, tên>
MỤC TIÊU: liệt kê ≤15 mục theo lăng kính, KHÔNG lọc/xếp hạng/giải pháp, ưu tiên điều người khác dễ bỏ sót
VÀO: "<yêu cầu/brief/SPEC>"
RA: ".ai/runs/<ngày>-phan-ky-<chủ đề>-<lăng kính>.md"   (1 mục/dòng: id | mô tả | tác động | cách kiểm/phát hiện)
TRA CỨU: không cần | ≤3 search sự cố thật
TRẢ VỀ: đường dẫn + 3 mục lạ nhất
~~~
Lăng kính #0 trả thêm `LĂNG KÍNH MỚI:` → nếu có loại danh sách quan trọng chưa phủ → chạy thêm 1 vòng scout cho nó (tối đa 1 vòng bổ sung).

## Bước 3 — HỘI TỤ (1 lần)
1 scout (haiku) GỘP: đọc các file phân kỳ → gộp trùng, giữ id nguồn → bản nháp. Rồi MÌNH (điều phối viên) xếp hạng `xác suất × tác động` → giữ top ≤25, ghi `.ai/phan_ky/<chủ đề>.md` (≤50 dòng):
~~~
Chủ đề: … · Ngày: … · Kích hoạt vì: … · Lăng kính đã dùng: #0,#1,#2,… (+ lăng kính mới: …)
## Rủi ro/sự cố   (R# | mô tả | xác suất C/T/Th | tác động | dấu hiệu sớm | giảm thiểu)
## Use case        (U# | ai | làm gì | kỳ vọng | ưu tiên)
## Biên & môi trường (B# | trường hợp | xử lý mong muốn)
## Phương án khác  (A# | cách | ưu | nhược | giữ/loại vì)
## Giả định & câu hỏi chưa biết (Q# | điều cần biết | cách kiểm)
## Danh sách khác do lăng kính #0 đề xuất (tên danh sách → mục)
## Dùng làm (BẮT BUỘC điền): …
~~~

## Bước 4 — BIẾN DANH SÁCH THÀNH HÀNH ĐỘNG (không để danh sách nằm chết)
U# → tiêu chí chấp nhận (brief/SPEC) · R# cao + B# → test case cho builder và dòng Rủi ro của mốc · Q# → giả thuyết `blk` (NC, có kill) hoặc việc tra cứu · A# → CLAUDE.md Quyết định (phương án đã loại + lý do) · R#/B# chưa có test → critic `code`/`ke_hoach` BLOCK (brief critic phải trỏ file phân kỳ) · debug: R#/Q# → danh sách giả thuyết nguyên nhân giao critic `loi`.
Chi phí tham khảo: 6 scout haiku ≈ 6×(15k overhead + 4k) ≈ 115k tok haiku ≈ 29k quy đổi giá Opus — vẫn rẻ hơn 1 vòng builder làm sai hướng; vì vậy giữ đúng TRẦN.
