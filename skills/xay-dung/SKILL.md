---
name: xay-dung
description: "Vòng xây dựng / triển khai (từ SPEC.md) / debug / mở mốc, điều phối builder-critic-grunt, giữ kiến trúc và bản đồ codebase. Dùng ở chế độ XÂY DỰNG hoặc TRIỂN KHAI và cho mọi vòng sửa lỗi."
---
# Xây dựng — điều phối viên đọc 1 lần mỗi phiên (đọc lại sau khi context bị nén)

## Tham chiếu: `.ai/ref/` của project (thiếu → `node "${CLAUDE_PLUGIN_ROOT}/hooks/probe.js" --sync`)
`kien_truc.md` 4 tầng, luật luồng, bố cục thư mục, quy mô → file quản lý, MAP, debug theo tầng · `run_file.md` run file root + startup/ · `bugfix.md` sửa lỗi 7 bước · `moc.md` mở mốc, ảnh hưởng, scope check, contracts, ADR · `trien_khai.md` TRIỂN KHAI + spike · `goal.md` mẫu /goal.
Brief cho builder/critic ghi tên file tham chiếu cần đọc (`.ai/ref/<file>` tuyệt đối) — KHÔNG dán nội dung, và mình KHÔNG `cat` cả file (context của Opus là phần đắt nhất); cần thì `grep -n`/`sed -n` đúng mục.

## Mức việc (chọn ở đầu mỗi mốc, in 1 dòng: mức + lý do)
- **TRỰC TIẾP** — việc nhỏ đã rõ, không dữ liệu/người dùng thật: không dùng skill này (xem `sp:khoi-tao`).
- **VỪA** — S/M, không chạm auth/tiền/dữ liệu nhạy cảm/interface dùng chung: phân kỳ GỌN = 1 scout gộp 3 lăng kính (lỗi thực tế · đầu vào biên · pre-mortem) + #0; critic CHỈ 1 lượt kết mốc; không critic ke_hoach. Ghi `vừa` cạnh mốc trong STATE.
- **ĐẦY ĐỦ** — mọi trường hợp còn lại, hoặc user nói "đầy đủ": áp nguyên LUẬT CỨNG dưới.
Giữa chừng phát sinh rủi ro thật (dữ liệu thật, bảo mật, interface chung) → nâng mức, ghi lý do.

## LUẬT CỨNG (đã thấy Opus bỏ qua khi chạy thật — mức VỪA chỉ được thu gọn luật 2 (phân kỳ gọn) và 3 (1 lượt critic) như trên; vi phạm = làm lại bước đó. Luật 1 còn được hook `guard.js` CHẶN thật: phiên chính chạy lệnh test sẽ bị từ chối)
1. **Mình KHÔNG tự chạy** test / benchmark / lint / build / sinh dữ liệu thử / grep nhiều file. Mọi lệnh kiểm chứng → `Agent(subagent_type: "sp:grunt")`. Được tự chạy: `git status|diff|log`, `ls`, đọc ≤2 file, ghi sổ `.ai/`.
2. **Việc đầu tiên của MỖI mốc** (kể cả mốc 1 ngay sau khởi tạo, kể cả dự án S) → PHÂN KỲ TRƯỚC khi giao builder: đọc `.ai/ref/phan_ky.md`, spawn `sp:scout` CHẾ ĐỘ phan_ky ≥3 lăng kính + #0 → `.ai/phan_ky/<mốc>.md` → U#/R#/B# vào tiêu chí + brief builder. Chỉ bỏ khi file phân kỳ của mốc này đã có.
3. **Kết mốc** → `sp:critic` CHẾ ĐỘ code trên TOÀN diff của mốc (VÀO có file phân kỳ) — luôn, không miễn vì "diff nhỏ".
4. Báo cáo kết mỗi việc/mốc in dòng `ĐỊNH TUYẾN: haiku <n> · sonnet <m> · lệnh mình tự chạy <k>`. haiku = 0 mà mình đã tự chạy lệnh/tra cứu/đọc nhiều file → vi phạm: ghi lý do vào STATE và sửa ở mốc sau (không spawn haiku chỉ để đủ số). Hook gắn `effort` theo dòng `CHẾ ĐỘ:`/`LƯỢT:` của brief (`[sp effort]` trong context) — đừng tự chọn effort, chỉ ghi `LƯỢT: <n>` khi giao lại.

## Vòng một việc
1. **Lấy việc** kế trong STATE (`[ ]` đầu tiên, không `[!]`; có luồng phụ → xen việc `[NC:…]` qua `sp:nghien-cuu`, ≤3 vòng). Hết việc của mốc → mở mốc mới theo `moc.md` (S: ghi thẳng vào STATE). Việc không vừa 1 lượt builder → tách nhỏ.
2. **Phân loại → nhánh/commit**: `fix/` `feature/` `test/` `refactor/` `perf/` `security/` + `<id>_<mô_tả>`; commit `<loai>/<id>: <mô tả>`. S: làm trên nhánh chính · M+: nhánh hoặc worktree mang tên đó. Ghi `base=<hash HEAD>` vào dòng "Đang chạy".
3. **Định tuyến** theo LUẬT CỨNG trên + bảng Điều phối trong CLAUDE.md: phần cơ học (chạy lệnh, đọc log, tra docs) → grunt/scout trước; logic → builder. Việc mới dùng thật / chưa có tiêu chí rõ → PHÂN KỲ (`.ai/ref/phan_ky.md`) trước, U#/R#/B# thành tiêu chí + test. Tự làm chỉ khi ≤3 tool call ngắn; vẫn theo đủ luật + cổng của `sp:builder`.
4. **Giao builder**: brief 6 trường; VÀO = việc + tiêu chí chấp nhận + module liên quan (từ MAP.md) + tham chiếu cần đọc; LOẠI TRỪ = file agent khác đang giữ. Dựng scaffold → thêm `PHẠM VI: <n>`. Song song/rủi ro → `isolation: "worktree"`.
   Thư viện/API chưa có trong CLAUDE.md Phiên bản: API cụ thể → builder tự tra Context7 trong lượt của nó; chọn thư viện / so phiên bản / tra issue-changelog → scout TRƯỚC (song song việc khác), ghi kết quả vào Phiên bản rồi mới giao builder.
   `PHẠM VI VƯỢT` → bạn quyết (tách việc / nới brief) rồi SendMessage. `CHẶN: CẦN TRA CỨU` → scout rồi SendMessage builder đường dẫn run. `CHẶN: CẦN GRUNT` → grunt (trừ khi ≤3 lệnh ngắn). Báo cáo thiếu nhãn → hook `gate.js` (SubagentStop) tự trả builder về bổ sung trước khi tới mình; vẫn thiếu (L: REUSE-DOCS) → SendMessage. Sửa tiếp / hết lượt → SendMessage builder CŨ (giữ context + cache), không spawn lại.
5. **grunt QUÉT** trên `<base>..HEAD` → **critic CHẾ ĐỘ code** (spawn mới; VÀO = diff + báo cáo builder + file quét + `.ai/phan_ky/<chủ đề>.md` nếu có) THEO TỪNG VIỆC chỉ khi đụng auth/thanh toán/dữ liệu/bảo mật hoặc đổi interface dùng chung; còn lại để critic KẾT MỐC (LUẬT CỨNG 3) soát một lần — không soát 2 lần cùng đoạn code. QUÉT có vi phạm mà không cần critic → SendMessage builder sửa. `BLOCK` → SendMessage builder sửa → critic MỚI với `LƯỢT: 2` + danh sách BLOCK cũ + diff delta (chỉ xác minh, không soát lại từ đầu); tối đa 2 lượt, quá → bạn tự đọc và quyết.
6. **Kiểm chứng** (LUẬT CỨNG 1): grunt chạy test toàn bộ (+ `run --check` nếu có), trả OK/FAIL kèm đếm; mình đọc dòng đó (in ra màn hình khi đang `/goal`). Không tin báo cáo builder suông.
7. **Merge** worktree/nhánh vào nhánh chính tại máy, xóa worktree/nhánh đã merge. Push/PR/deploy → hỏi user.
8. **Cập nhật** (gộp vào ĐÚNG 1 lệnh Bash cuối việc — không lượt riêng; chỉ bạn ghi): STATE tick + nhật ký + chi phí · `git diff --name-status <base>..HEAD | grep -E '^[ADR]'` có kết quả và quy mô ≥M → grunt MAP, rồi chép dòng `MAP:` của builder vào `.ai/MAP.md` (S: vào CLAUDE.md Cấu trúc) · [L] dòng REUSE → `.ai/reuse.md` · GOTCHA lặp lại → CLAUDE.md Gotchas · quyết định đắt → CLAUDE.md Quyết định (+ `docs/quyet_dinh/` ở L) · NỢ → `.ai/no_ky_thuat.md` (`mô tả | mức | ngày | file`). Không refactor "tiện tay".

## Bộ nhớ codebase theo quy mô (bảng + ngưỡng: `kien_truc.md`)
S: CLAUDE.md mục Cấu trúc đủ (≤8 dòng vai trò) · M: + `.ai/MAP.md` (đọc đầu phiên) + `.ai/MAP.auto.md` (sinh bằng lệnh, đọc khi cần) + `.ai/brief.md` + `.ai/ke_hoach.md` + `.ai/no_ky_thuat.md` · L: + `docs/kien_truc.md`, `docs/contracts/`, `docs/quyet_dinh/`, `.ai/reuse.md`.
`.ai/brief.md` (≤40 dòng: mục tiêu · trong/NGOÀI phạm vi · tiêu chí hoàn thành · module chính · rủi ro) — bạn viết khi khởi tạo/lên M, cập nhật khi mở mốc (thay nội dung, không chồng lịch sử — lịch sử ở ke_hoach.md); critic ke_hoach đọc nó.
Tăng bậc quy mô (bao-tri phát hiện) → bạn tạo file của bậc mới: brief từ STATE + ke_hoach, MAP qua grunt MAP.

## Chế độ khác
TRIỂN KHAI → đọc `trien_khai.md`. Builder trả `CHẶN: THIẾU KIẾN THỨC` lần 2 trên cùng việc → bạn đặt việc `[!]` và TỰ gọi `sp:chuyen NC phạm vi:<thành phần>` (luồng phụ ≤3 vòng, việc khác vẫn chạy, báo user 1 dòng). Hết việc của mốc, user đổi hướng → `sp:chuyen`. Debug → `bugfix.md` (grunt bước 1 → critic CHẾ ĐỘ loi bước 2–4 → builder 5–7). Đề xuất `/goal` → `goal.md`.
