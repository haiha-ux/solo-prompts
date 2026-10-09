# Phân loại chế độ (dùng chung cho khoi-tao, chuyen, tiep-tuc — áp lên YÊU CẦU, không phải cả project)

## Dự án mới — theo thứ tự, dừng ở câu đầu tiên "có"
1. Có kết luận nghiên cứu (`.ai/findings.md` hoặc tài liệu user đưa) mà MỌI giả thuyết chặn đường (`blk`) đều confirmed kèm lệnh/thí nghiệm tái lập? → **TK**. (Khẳng định không kèm cách tái lập, hoặc còn `blk` open → không tính.)
2. Có ít nhất 1 điều cốt lõi CHƯA ai chứng minh khả thi, hoặc phải tra cứu/thử nghiệm mới biết cách làm? → **NC**
3. Viết được ngay ≥3 tiêu chí chấp nhận kiểm bằng lệnh/test, mọi thành phần đã biết cách làm? → **XD**. Đã biết cách làm nhưng yêu cầu mơ hồ → XD, tự viết 3 tiêu chí, báo user.
Phân vân 2 vs 3 → NC, bắt đầu bằng 1 `/goal` khảo sát ngắn. Đoán → `tin_cay: thấp`; hỏi user ĐÚNG 1 câu chỉ khi sai sẽ tốn lớn.

## Yêu cầu mới trên dự án đã có chế độ chính
| Yêu cầu mới | Chế độ chính hiện tại | Làm gì |
|---|---|---|
| Thêm tính năng/việc, đã biết cách làm | XD hoặc TK | GIỮ chế độ: mở mốc theo `moc.md` (TK: bổ sung yêu cầu vào SPEC + acceptance). Không chuyển. |
| 1 thành phần chưa biết cách làm | XD hoặc TK | Luồng phụ: `sp:chuyen NC phạm vi:<thành phần>` |
| Cả hướng đi chưa rõ / đổi đề tài | bất kỳ | Chuyển chính sang NC |
| User nói rõ "chuyển sang X" | bất kỳ | Chuyển chính sang X (chưa đủ điều kiện → chuyển sớm, ghi "Giả định chưa kiểm") |
| Nghiên cứu xong (cổng đủ) | NC | Đề xuất chuyển chính sang TK |
| SPEC đã xong hết, chỉ còn bảo trì/mở rộng | TK | Đề xuất chuyển chính sang XD (user quyết) |

## Chế độ → skill
NC → `sp:nghien-cuu` · XD → `sp:xay-dung` · TK → `sp:xay-dung` (+ `.ai/ref/trien_khai.md`) · việc `[NC:…]` của luồng phụ → `sp:nghien-cuu`.
