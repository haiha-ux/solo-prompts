# Quy trình sửa lỗi (critic CHẾ ĐỘ loi làm 1–4, builder làm 5–7)

1. **TÁI HIỆN** — test hoặc lệnh tái hiện, PHẢI đỏ. Không đỏ = chưa hiểu đúng lỗi.
2. **THU HẸP** — xác định tầng (bảng trong `kien_truc.md`) → file → hàm → dòng (binary search, log ở đầu vào/đầu ra của tầng nghi ngờ, test cô lập từng phần). Không nhảy sang tầng khác trước khi loại trừ tầng hiện tại.
3. **ROOT CAUSE** — hỏi "tại sao?" đến khi không hỏi được nữa. Có fallback → test TỪNG nhánh.
4. **PHẠM VI** — codegraph (MCP/CLI nếu có) hoặc grep liệt kê mọi call site; tìm chỗ copy-paste cùng lỗi ở module khác. Liệt kê TẤT CẢ chỗ phải sửa trước khi sửa.
5. **FIX** — đúng gốc, ở mọi chỗ bước 4; phẫu thuật tối thiểu, không refactor tiện tay.
6. **HỒI QUY** — chạy TOÀN BỘ test; vỡ test khác → quay lại bước 3.
7. **ROLLBACK** (L hoặc fix phức tạp) — ghi cách revert (commit hash / bước) vào nhật ký STATE.

~~~
❌ Triệu chứng: "API trả 500" → bọc try/catch → lỗi bị giấu
✅ Gốc:        "API trả 500" → trace → field X nullable nhưng code giả định non-null → sửa query + validation
~~~
Bug khác phát hiện giữa chừng: nhỏ + cùng file → sửa luôn, commit riêng · lớn/khác file → 1 dòng `.ai/no_ky_thuat.md`.
1 lượt fix thất bại với lỗi lạ → scout tra message lỗi NGUYÊN VĂN + docs/changelog đúng phiên bản + GitHub issue (≤6 search) TRƯỚC lượt 2. 3 lượt vẫn thất bại → dừng, báo user:
~~~
Vấn đề: … | Tầng: … | Đã thử: 1) … 2) … | Lỗi: <message chính xác> | Giả thuyết: … | Cần từ bạn: …
~~~
