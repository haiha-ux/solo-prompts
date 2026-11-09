# Trình duyệt thật (Playwright MCP `mcp__plugin_sp_playwright__*`) — scout/critic/grunt đọc khi brief cho dùng hoặc fetch thường bị chặn

Trình duyệt Chrome thật, **hồ sơ riêng của dự án** (cookie/đăng nhập giữ qua các phiên, nằm ngoài repo trong `~/.claude/plugins/data/…/browser/`), mặc định có cửa sổ. Ít bị chặn hơn bot fetch, đăng nhập được, tương tác được giao diện. Cả phiên dùng chung 1 trình duyệt → hook cho 1 agent dùng tại 1 thời điểm.

## Khi nào dùng (thang — đi từ rẻ lên)
1. Exa search/fetch, Context7 (rẻ nhất) → 2. WebFetch → 3. **Trình duyệt** khi một trong các điều sau:
   - fetch trả 403/429/captcha/"enable JavaScript"/trang rỗng/bản rút gọn, hoặc nội dung ≠ thứ người thật thấy;
   - site chặn bot hoặc cần đăng nhập: Google Scholar, ResearchGate, IEEE/ACM/Springer/Elsevier/Wiley, SSRN, X/Twitter, LinkedIn, Reddit, Medium, Discord/Slack web, dashboard SaaS;
   - **XÁC MINH TRÍCH DẪN** cho nguồn tier A/B mà một phán quyết dựa vào (bắt buộc trước khi critic `gia_thuyet` chấp nhận; xem dưới);
   - cần tương tác: lọc/tìm trong site, bấm "xem thêm", tải PDF/CSV, đọc bảng render bằng JS, kiểm UI web của chính dự án (TK/XD).

## Đọc tiết kiệm token (snapshot đầy đủ = hàng chục nghìn token)
- Đọc chữ: `browser_navigate` → `browser_evaluate` với `() => document.body.innerText.slice(0, 15000)` (hoặc `document.querySelector('article, main')?.innerText`). Trang dài → cắt theo đoạn cần, không đọc hết.
- Tìm trích dẫn: `browser_evaluate` `() => { const t = document.body.innerText.replace(/\s+/g,' '); const i = t.indexOf("<12–20 từ đầu của trích dẫn>"); return i < 0 ? 'KHÔNG THẤY' : t.slice(Math.max(0,i-200), i+400); }`.
- `browser_snapshot` CHỈ khi cần ref để bấm/gõ; xong thì quay lại evaluate. Ảnh chụp lưu file (`browser_take_screenshot`), không gửi ảnh vào context.
- PDF: tải về `.ai/runs/` (nút tải / URL PDF) rồi `Read` file, không cuộn PDF trong trình duyệt.
- Xong việc: `browser_close` các tab mình mở (không đóng tab đăng nhập user để lại).

## Xác minh trích dẫn (citation check)
Với mỗi nguồn S<n> được dùng làm bằng chứng chính: mở url gốc (DOI → trang nhà xuất bản/arXiv), tìm đúng câu trích. Ghi thêm cuối dòng S<n> trong file RA: `✓tđ <YYYY-MM-DD>` (thấy nguyên văn) · `≈tđ` (ý đúng, chữ khác — sửa trích cho đúng) · `✗tđ` (không thấy / trang đã đổi / 404 → hạ tier hoặc bỏ). Kiểm cả: tác giả, năm, số liệu, phiên bản trong câu trích.

## Cần người thật (đăng nhập / captcha / 2FA / xác minh email / paywall có tài khoản)
- Agent KHÔNG gõ mật khẩu, KHÔNG tìm cách vượt captcha, KHÔNG tạo tài khoản. Dừng thao tác đó, làm tiếp phần khác, trả thêm 1 dòng:
  `CHẶN: CẦN NGƯỜI: <url> — <đăng nhập <site> | captcha | 2FA | paywall> — để làm: <việc>`
- Điều phối viên (phiên chính): gom các dòng CẦN NGƯỜI → `browser_navigate` tới url (cửa sổ hiện trên máy user) → hỏi user 1 lần (AskUserQuestion, nhiều site cùng lúc): "Đã mở <site> trong trình duyệt của dự án — đăng nhập/giải xong rồi chọn Xong". Xong → ghi 1 dòng vào `.ai/trinh_duyet.md` và SendMessage agent cũ (hoặc spawn lại) làm tiếp. Đang chạy `/goal` không có user → để việc đó `[!] cần người` trong STATE, làm việc khác.
- Lần sau hồ sơ đã có đăng nhập → agent dùng luôn; phiên hết hạn → lại `CHẶN: CẦN NGƯỜI`.

## `.ai/trinh_duyet.md` (điều phối viên ghi; KHÔNG ghi mật khẩu/token)
~~~
site | cần đăng nhập | trạng thái (ok/hết hạn/bị chặn) | ngày | ghi chú (vd "Scholar: chặn sau ~30 truy vấn/giờ")
~~~
Scout đọc file này trước khi dùng trình duyệt: site `bị chặn`/`hết hạn` → không thử lại, báo CẦN NGƯỜI ngay.

## Lỗi thường gặp
Tool trả "trình duyệt đang được … dùng" → làm phần Exa/WebFetch trước, thử lại sau ~1 phút; vẫn kẹt → `CHẶN: CẦN TRÌNH DUYỆT: <url>` · "--isolated" trong log = hồ sơ đang mở ở phiên Claude khác (không có đăng nhập) · Linux không màn hình → tự chạy headless (không đăng nhập tay được; đăng nhập trên máy có màn hình rồi dùng lại hồ sơ) · tắt cửa sổ: đặt biến môi trường `SP_PW_HEADLESS=1` trước khi mở Claude Code.
