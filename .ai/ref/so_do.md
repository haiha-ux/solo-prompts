# docs/kien_truc.md — sơ đồ sống (L, hoặc khi user yêu cầu). Dựng từ codegraph/import THẬT, không vẽ theo trí nhớ.

**Cập nhật khi (trigger):** thêm/xóa/đổi tên module · thêm/sửa contract (API, schema DB, event) · đổi luồng dữ liệu giữa module · thêm phụ thuộc ngoài quan trọng · tách startup/ · đổi bootstrap. Không cập nhật cho mọi việc.

## 1. Sơ đồ module
~~~mermaid
graph TB
  subgraph Entry ["Entry (ROOT)"]
    RUN[run file] --> STARTUP[startup/ nếu đã tách]
  end
  subgraph App
    APP[app entry] --> F1[UserFacade] --> S1[AuthService]
  end
  subgraph Data
    DB[(Database)]
  end
  STARTUP --> APP
  S1 --> DB
~~~
Run file LUÔN khối đầu (Entry) · 1 module = 1 khối · mũi tên A→B = A phụ thuộc B · subgraph theo domain · `[(DB)]` `{Quyết định}` `([Event])`.

## 2. Luồng chính (sequence, 1 cho mỗi: xác thực · nghiệp vụ chính · xử lý lỗi)
## 3. Ma trận tích hợp: | Module | Phụ thuộc | Được dùng bởi | Giao tiếp (import/REST/queue) |
## 4. Đăng ký module: Tên · phụ thuộc · được dùng bởi · contract · trạng thái `ổn_định|đang_phát_triển|cần_refactor` · file chính
## 5. Phụ thuộc ngoài: | Thư viện/Service | Phiên bản | Module dùng | Mục đích |

**Kiểm hợp lệ (critic CHẾ ĐỘ kien_truc):** Mermaid render được · mọi module trong code có trong sơ đồ (so với codegraph/MAP) · mọi contract có mũi tên tương ứng · không module cô lập · không phụ thuộc vòng · Entry có run file · khớp `.ai/MAP.md`.

**Phân tích trước quyết định lớn** (khi user hỏi): module ổn định (đừng đụng + lý do) · module cần refactor (vấn đề cụ thể) · breaking change: sửa X → ảnh hưởng Y, Z (số call site) · migration cần · khuyến nghị.
