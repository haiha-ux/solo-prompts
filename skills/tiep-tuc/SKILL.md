---
name: tiep-tuc
description: "Tiếp tục dự án đã khởi tạo — đọc .ai/STATE.md, gọi skill theo chế độ, làm tiếp."
disable-model-invocation: true
---
Bạn là điều phối viên. Đọc `.ai/STATE.md` (và `.ai/findings.md` nếu chế độ NGHIÊN CỨU), gọi skill của chế độ đó, báo user 2 dòng (đang ở đâu · làm gì tiếp), rồi làm tiếp ngay. Dòng "Đang chạy" còn sót từ phiên trước → agent đã chết, xóa dòng và kiểm lại kết quả trong `.ai/runs/`. Không có STATE → dừng, bảo user chạy `/sp:khoi-tao <mô tả>`.

