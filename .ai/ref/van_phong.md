# Văn phong cho tài liệu người đọc

Tệp này áp cho mọi thứ một con người sẽ đọc: README, tài liệu trong `docs/`, SPEC, báo cáo nghiên cứu, ADR, postmortem, ghi chú bàn giao, mô tả PR, tin nhắn báo cáo cho user và mọi tài liệu user yêu cầu viết. Nó không áp cho sổ máy đọc trong `.ai/` (STATE, so_cai, runs, MAP), vốn cố ý viết cô đọng theo khuôn.

Người đọc là một lập trình viên bận, đọc tiếng Việt, hiểu thuật ngữ kỹ thuật tiếng Anh và ghét văn máy. Họ cần biết điều gì đúng, vì sao, và phải làm gì tiếp. Hãy viết như một kỹ sư giỏi viết cho đồng nghiệp ngang hàng: thẳng, cụ thể, có quan điểm, câu dài ngắn xen nhau.

## Viết thế nào

Mở bằng kết luận. Câu đầu tài liệu, và câu đầu mỗi đoạn, nói điều quan trọng nhất; lý do và bằng chứng theo sau. Người chỉ đọc câu đầu vẫn phải nắm được ý chính.

Viết thành đoạn văn liền mạch. Một đoạn làm một việc, câu sau nối từ thông tin câu trước vừa đưa ra, thông tin mới đặt cuối câu. Quan hệ giữa các ý (vì, nên, nhưng, trừ khi) là thứ người đọc cần nhất, và chính danh sách gạch đầu dòng là thứ xóa mất quan hệ đó. Khi định viết ba gạch đầu dòng, hãy thử viết một câu "A, nhưng vì B nên C" trước.

Cụ thể hơn chung chung. Mỗi mục có ít nhất một con số, một tên riêng, một đường dẫn, một lệnh, hoặc một ví dụ thật lấy từ code hay dữ liệu của dự án. "Chạy chậm với file lớn" là văn máy; "200 nghìn dòng mất 4 giây, bộ nhớ khoảng 300 MB vì giữ toàn bộ dòng trong RAM" là văn người. Không biết số thì nói không biết, đừng tô vẽ.

Nói thẳng điều mình nghĩ. Có khuyến nghị thì nêu khuyến nghị và lý do; có rủi ro thì gọi tên rủi ro và khả năng xảy ra. Đừng rải "có thể", "tương đối", "khá" lên mọi câu, và đừng cân bằng giả tạo kiểu mọi phương án đều có ưu nhược rồi không chọn.

Dừng khi đã nói xong. Không mở bài kiểu "Trong bối cảnh…", không đoạn "Tóm lại" lặp lại những gì vừa viết, không câu chào kết "Hy vọng hữu ích". Nếu cần một câu cuối, đó phải là việc cần làm tiếp hoặc điều còn chưa chắc.

## Các tật cần sửa, kèm cách sửa

Mỗi cặp dưới đây là lỗi thường gặp và bản viết lại. Sửa bằng cách đổi cấu trúc câu, không phải thay từ đồng nghĩa: thay "đóng vai trò quan trọng" bằng "giữ vai trò then chốt" vẫn là văn máy.

| Tật | Viết kiểu máy | Viết lại |
|---|---|---|
| Gạch đầu dòng cho ý cần lý do | "- Nhanh\n- Dễ dùng\n- Ổn định" | "Bản này nhanh gấp ba nhờ đọc theo luồng, nhưng đổi lại không còn đếm được tổng số dòng trước khi chạy." |
| Dòng nhãn "X: Y" | "Hiệu năng: tốt. Rủi ro: thấp." | "Chạy 200 nghìn dòng trong 4 giây; rủi ro chính là số điện thoại nước ngoài bị chuẩn hóa sai." |
| In đậm rải khắp | "Hàm **dedup** dùng **union-find** để **gộp** khách" | Bỏ in đậm. Thuật ngữ đặt trong `code` nếu là tên trong code. |
| "Không chỉ… mà còn" | "Không chỉ nhanh mà còn chính xác." | "Nhanh, và trên bộ test 12 ca không sai ca nào." |
| Bộ ba sáo | "đơn giản, hiệu quả và linh hoạt" | Chọn một tính chất có bằng chứng, nêu bằng chứng. |
| Ý nghĩa rỗng | "đóng vai trò quan trọng trong việc nâng cao hiệu suất" | Nói nó làm gì: "bỏ 48% dòng trùng trước khi gửi email". |
| Câu đuôi "-ing" / "cho thấy" | "…, điều này cho thấy tầm quan trọng của việc chuẩn hóa." | Xóa câu đuôi, hoặc nói cụ thể điều gì được chứng minh. |
| Gạch ngang dài | "Kết quả — như mong đợi — rất tốt" | Dùng dấu phẩy, dấu chấm, hoặc tách câu. |
| Mục nào cũng một khuôn | Mỗi mục: định nghĩa, lợi ích, cách dùng, tóm tắt | Hình dạng mỗi mục theo nội dung của nó; mục ngắn thì viết một đoạn. |

Cụm sáo tiếng Việt cần tránh (một lần lỡ tay không sao; hai cụm trong một đoạn là phải viết lại): trong bối cảnh, đóng vai trò quan trọng/then chốt, không chỉ… mà còn, góp phần, một cách hiệu quả/toàn diện, có thể nói rằng, đáng chú ý là, điều này cho thấy, nhìn chung, tóm lại, kết luận lại, hãy cùng, đa dạng và phong phú, nền tảng vững chắc, chìa khóa để, hành trình, bức tranh toàn cảnh, kỷ nguyên, cách mạng hóa, tiềm năng to lớn, vô cùng, hết sức, đánh dấu bước ngoặt, minh chứng cho, giải pháp toàn diện, tối ưu hóa hiệu quả, mang lại giá trị vượt trội, tiến hành thực hiện. Tiếng Anh: delve, crucial, pivotal, robust, seamless, leverage, showcase, underscore, testament, tapestry, landscape, "it's important to note", "let's dive in", "in summary".

## Khi nào ĐƯỢC dùng danh sách, bảng, in đậm, tiêu đề

Chống văn máy không có nghĩa là viết một bức tường chữ. Danh sách đánh số đúng chỗ cho các bước phải làm theo thứ tự. Gạch đầu dòng đúng chỗ khi các mục rời nhau, cùng loại, song song, mỗi mục ngắn và không cần lý do, ví dụ danh sách file, biến môi trường, lệnh; dẫn vào bằng một câu hoàn chỉnh, tối đa khoảng bảy mục, không bao giờ một mục. Bảng đúng chỗ khi mỗi mục có từ ba thuộc tính trở lên để so sánh; bảng hai dòng thì viết thành câu. Tiêu đề dùng để điều hướng tài liệu dài, từ khoảng 300 từ trở lên; tin nhắn, mô tả PR ngắn và tài liệu một trang không cần tiêu đề. In đậm gần như không dùng: tối đa một hai chỗ trong cả tài liệu cho một cảnh báo người đọc tuyệt đối không được bỏ qua.

Tiêu đề tiếng Việt chỉ viết hoa chữ đầu và tên riêng, không viết hoa mọi chữ. Dấu câu dính vào chữ đứng trước. Giữ nguyên thuật ngữ tiếng Anh khi đó là tên thật trong code hay công cụ, đặt trong `code`.

## Hình dạng theo loại tài liệu

| Loại | Người đọc cần | Hình dạng | Tật riêng của loại này |
|---|---|---|---|
| README | Cái này làm gì, chạy thế nào trong 2 phút | 1–2 câu mở, lệnh cài/chạy, ví dụ thật, link tài liệu sâu | Bảng "Tính năng" bullet in đậm kèm emoji |
| Hướng dẫn (how-to) | Làm được một việc cụ thể | Một câu mục tiêu, các bước đánh số mỗi bước một hành động, kết quả mong đợi | Trộn giải thích lý thuyết vào giữa các bước |
| Giải thích / thiết kế | Hiểu vì sao hệ thống như vậy | Văn xuôi: bối cảnh, mục tiêu và không-mục-tiêu, thiết kế, phương án đã loại, đánh đổi | Liệt kê ưu điểm, không nói cái giá phải trả |
| SPEC | Biết chính xác điều gì phải đúng | Yêu cầu đánh số có ID, mỗi dòng kiểm được, có ngưỡng | Yêu cầu mơ hồ không có số ("nhanh", "thân thiện") |
| ADR | Quyết định gì, vì sao, mất gì | Bối cảnh, Quyết định ("Chúng tôi sẽ…"), Hệ quả gồm cả mặt xấu, phương án đã loại | Hệ quả toàn lợi ích |
| Báo cáo nghiên cứu | Câu trả lời và độ tin cậy | Đoạn đầu là câu trả lời; tổ chức theo luận điểm, không theo từng nguồn; trích dẫn ngay sau câu nó chống đỡ; nói rõ điều chưa biết | "Nhiều nghiên cứu cho thấy" không nguồn; tóm từng bài nối đuôi |
| Báo cáo thí nghiệm | Có lặp lại được không, kết quả nói gì | Giả thuyết, thiết lập đủ để chạy lại (lệnh, seed), bảng số, diễn giải bằng văn, phán quyết | Trộn kết quả với diễn giải; thiếu dao động |
| Bàn giao / trạng thái | Đang ở đâu, kẹt gì, làm gì tiếp | Câu đầu là trạng thái thật, rồi chỗ kẹt, rồi bước tiếp đánh số | Kể việc đã làm theo thời gian, giấu vấn đề ở cuối |
| Postmortem | Chuyện gì, vì sao, sửa gì để không lặp lại | Tóm tắt, tác động, dòng thời gian (danh sách), nguyên nhân gốc bằng văn xuôi nhân quả, hành động có người và hạn | "Lỗi con người" là nguyên nhân gốc |
| Changelog | Bản này đổi gì với tôi | Theo phiên bản và ngày; nhóm Thêm/Đổi/Sửa/Bỏ; mỗi dòng nói tác động tới người dùng | Đổ nguyên git log |
| Commit / PR | Đổi gì và vì sao | Commit: tiêu đề ≤50 ký tự thể mệnh lệnh, thân nói vì sao. PR: lý do, cách kiểm, điều cần soát | PR năm dòng có ba mục in đậm |
| Tin nhắn báo cáo cho user | Kết quả, và điều họ cần biết hoặc quyết | Câu đầu là kết quả; 1–3 đoạn ngắn; một câu về phần chưa kiểm hoặc rủi ro; đường dẫn đầy đủ | Tiêu đề, bảng, bullet cho tin nhắn ba ý |

## Lượt soát cuối (bắt buộc với tài liệu dài hơn nửa trang)

Viết xong, chạy `node "<plugin>/hooks/lint_van.js" <file>` (hook cũng tự chạy khi ghi file tài liệu và báo lại nếu vượt ngưỡng). Mỗi cờ là một gợi ý xem lại, không phải phán quyết: danh sách thật sự song song thì giữ. Sau đó đọc lại với ba câu hỏi. Người đọc chỉ đọc câu đầu mỗi đoạn có nắm được ý chính không? Mỗi mục có ít nhất một chi tiết cụ thể không? Có câu nào xóa đi mà nghĩa không đổi không? Câu đó thì xóa.
