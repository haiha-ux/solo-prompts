---
name: xay-dung
description: "Vòng xây dựng / triển khai (từ SPEC.md) / debug / mở mốc, điều phối builder-critic-grunt, giữ kiến trúc và bản đồ codebase. Dùng ở chế độ XÂY DỰNG hoặc TRIỂN KHAI và cho mọi vòng sửa lỗi."
---
# Xây dựng — điều phối viên đọc 1 lần mỗi phiên (đọc lại sau khi context bị nén)

## Tham chiếu: `.ai/ref/` của project (thiếu → `mkdir -p .ai/ref && cp "${CLAUDE_PLUGIN_ROOT}"/skills/*/tham-chieu/*.md .ai/ref/`)
`kien_truc.md` 4 tầng, luật luồng, bố cục thư mục, quy mô → file quản lý, MAP, debug theo tầng · `run_file.md` run file root + startup/ · `bugfix.md` sửa lỗi 7 bước · `moc.md` mở mốc, ảnh hưởng, scope check, contracts, ADR · `trien_khai.md` TRIỂN KHAI + spike · `goal.md` mẫu /goal.
Brief cho builder/critic ghi tên file tham chiếu cần đọc (`.ai/ref/<file>` tuyệt đối) — KHÔNG dán nội dung.

## Vòng một việc
1. **Lấy việc** kế trong STATE (`[ ]` đầu tiên, không `[!]`; có luồng phụ → xen việc `[NC:…]` qua `sp:nghien-cuu`, ≤3 vòng). Hết việc của mốc → mở mốc mới theo `moc.md` (S: ghi thẳng vào STATE). Việc không vừa 1 lượt builder → tách nhỏ.
2. **Phân loại → nhánh/commit**: `fix/` `feature/` `test/` `refactor/` `perf/` `security/` + `<id>_<mô_tả>`; commit `<loai>/<id>: <mô tả>`. S: làm trên nhánh chính · M+: nhánh hoặc worktree mang tên đó. Ghi `base=<hash HEAD>` vào dòng "Đang chạy".
3. **Tự làm hay giao?** Luật "KHÔNG spawn khi" trong CLAUDE.md. Tự làm vẫn theo đủ luật + cổng của `sp:builder`.
4. **Giao builder**: brief 6 trường; VÀO = việc + tiêu chí chấp nhận + module liên quan (từ MAP.md) + tham chiếu cần đọc; LOẠI TRỪ = file agent khác đang giữ. Dựng scaffold → thêm `PHẠM VI: <n>`. Song song/rủi ro → `isolation: "worktree"`.
   `PHẠM VI VƯỢT` → bạn quyết (tách việc / nới brief) rồi SendMessage. Báo cáo thiếu nhãn (NHÁNH/TEST/TÁI DÙNG/LIÊN KẾT/PHẠM VI/CHECK/MAP/GOTCHA-NỢ/CHẶN; L: REUSE-DOCS) → SendMessage bắt bổ sung.
5. **grunt QUÉT** trên `<base>..HEAD` → **critic CHẾ ĐỘ code** (spawn mới; VÀO = diff + báo cáo builder + file quét) khi: diff >30 dòng, đổi module/cấu trúc, đụng auth/thanh toán/dữ liệu/bảo mật, hoặc đổi interface dùng chung. QUÉT có vi phạm mà không cần critic → SendMessage builder sửa. `BLOCK` → builder sửa → critic MỚI; tối đa 2 lượt, quá → bạn tự đọc và quyết.
6. **Tự kiểm chứng**: chạy test toàn bộ (+ `run --check` nếu có). Không tin "OK" suông.
7. **Merge** worktree/nhánh vào nhánh chính tại máy, xóa worktree/nhánh đã merge. Push/PR/deploy → hỏi user.
8. **Cập nhật** (gộp 1 lần ghi, chỉ bạn ghi): STATE tick + nhật ký + chi phí · `git diff --name-status <base>..HEAD | grep -E '^[ADR]'` có kết quả và quy mô ≥M → grunt MAP, rồi chép dòng `MAP:` của builder vào `.ai/MAP.md` (S: vào CLAUDE.md Cấu trúc) · [L] dòng REUSE → `.ai/reuse.md` · GOTCHA lặp lại → CLAUDE.md Gotchas · quyết định đắt → CLAUDE.md Quyết định (+ `docs/quyet_dinh/` ở L) · NỢ → `.ai/no_ky_thuat.md` (`mô tả | mức | ngày | file`). Không refactor "tiện tay".

## Bộ nhớ codebase theo quy mô (bảng + ngưỡng: `kien_truc.md`)
S: CLAUDE.md mục Cấu trúc đủ (≤8 dòng vai trò) · M: + `.ai/MAP.md` (đọc đầu phiên) + `.ai/MAP.auto.md` (sinh bằng lệnh, đọc khi cần) + `.ai/brief.md` + `.ai/ke_hoach.md` + `.ai/no_ky_thuat.md` · L: + `docs/kien_truc.md`, `docs/contracts/`, `docs/quyet_dinh/`, `.ai/reuse.md`.
`.ai/brief.md` (≤40 dòng: mục tiêu · trong/NGOÀI phạm vi · tiêu chí hoàn thành · module chính · rủi ro) — bạn viết khi khởi tạo/lên M, cập nhật khi mở mốc (thay nội dung, không chồng lịch sử — lịch sử ở ke_hoach.md); critic ke_hoach đọc nó.
Tăng bậc quy mô (bao-tri phát hiện) → bạn tạo file của bậc mới: brief từ STATE + ke_hoach, MAP qua grunt MAP.

## Chế độ khác
TRIỂN KHAI → đọc `trien_khai.md`. Builder trả `CHẶN: THIẾU KIẾN THỨC` lần 2 trên cùng việc → bạn đặt việc `[!]` và TỰ gọi `sp:chuyen NC phạm vi:<thành phần>` (luồng phụ ≤3 vòng, việc khác vẫn chạy, báo user 1 dòng). Hết việc của mốc, user đổi hướng → `sp:chuyen`. Debug → `bugfix.md` (critic CHẾ ĐỘ loi bước 1–4 → builder 5–7). Đề xuất `/goal` → `goal.md`.
