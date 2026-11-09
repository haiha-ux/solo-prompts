---
name: viet
description: "Viết tài liệu cho người đọc (README, hướng dẫn, thiết kế, ADR, SPEC, báo cáo nghiên cứu/thí nghiệm, postmortem, bàn giao, changelog, mô tả PR) theo văn phong người viết chuyên nghiệp, không văn máy: giao sp:writer, đo bằng lint_van, soát bằng critic. Dùng khi user nhờ viết/sửa một tài liệu, hoặc khi cần biến kết quả nghiên cứu/mốc thành tài liệu đọc được."
---
# Viết tài liệu cho người đọc

Bạn là điều phối viên. Tài liệu do `sp:writer` (sonnet) viết; bạn chỉ xác định đề bài, gom nguồn và quyết định có cần soát hay không. Hướng dẫn văn phong nằm ở `.ai/ref/van_phong.md`; dự án chưa khởi tạo sp thì dùng `${CLAUDE_PLUGIN_ROOT}/skills/khoi-tao/tham-chieu/van_phong.md`. Đừng tự `cat` tệp đó, writer và critic tự đọc.

1. Xác định bốn thứ và ghi vào brief: loại tài liệu (theo bảng "Hình dạng theo loại tài liệu" trong van_phong.md), người đọc, mục đích (người đọc xong phải làm được gì), và nguồn sự thật (file code, `.ai/findings.md`, `.ai/runs/…`, SPEC, log, đoạn user dán). User không nói người đọc thì mặc định là đồng nghiệp lập trình viên mới vào dự án.
2. Nguồn chưa đủ (thiếu số đo, phiên bản, trích dẫn) thì spawn `sp:scout` hoặc `sp:grunt` lấy trước, ghi vào `.ai/runs/`. Writer không được bịa phần thiếu.
3. Spawn `sp:writer` với brief: `LOẠI: … · NGƯỜI ĐỌC: … · MỤC ĐÍCH: … · NGUỒN: <đường dẫn> · RA: <đường dẫn file> · VĂN PHONG: <đường dẫn van_phong.md> · ĐỘ DÀI: <ước lượng>`. Sửa tài liệu có sẵn thì thêm `SỬA: <file>` và nói rõ giữ gì.
4. Tài liệu quan trọng (ADR, SPEC, báo cáo nghiên cứu, README công khai, postmortem, tài liệu user sẽ gửi người khác) thì spawn `sp:critic` mới với `CHẾ ĐỘ: van_phong`, VÀO = file + nguồn. Critic trả BLOCK thì SendMessage writer cũ sửa đúng các điểm đó, tối đa 2 lượt. Tài liệu nội bộ ngắn thì lint của writer là đủ.
5. Báo user bằng văn xuôi, hai ba câu: đường dẫn file, tài liệu nói gì trong một câu, điều gì nguồn không nói nên tài liệu ghi là chưa biết. Không dán lại nội dung tài liệu vào chat.

Chưa có `.ai/STATE.md` (dự án không dùng sp) thì vẫn làm đúng các bước trên, bỏ phần ghi `.ai/runs/`.
