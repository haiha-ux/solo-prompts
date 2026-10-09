# Bộ Prompt Solo v4 — Điều phối đa tác tử · Nghiên cứu · /goal

> Thiết kế qua 3 vòng tranh luận của các agent Sonnet (skills-first × phương pháp nghiên cứu × kinh tế token) + 1 vòng red-team độc lập. Thay thế v3.1 (các file `.md` ở thư mục cha, giữ lại để tham khảo).

## Cài (plugin Claude Code — 1 lệnh mỗi máy)
**Cách A — qua GitHub (máy nào cũng cài được):** đẩy thư mục `v4/` thành 1 repo (vd `haiha-ux/solo-prompts`, private cũng được nếu máy đã đăng nhập git), rồi trên máy bất kỳ:
```
/plugin marketplace add haiha-ux/solo-prompts
/plugin install sp@solo-prompts
```
**Cách B — từ thư mục local / ổ đồng bộ:**
```
claude plugin marketplace add "<đường dẫn tới v4>"
claude plugin install sp@solo-prompts
```
Cập nhật sau khi sửa file: `claude plugin marketplace update solo-prompts` rồi `claude plugin update sp@solo-prompts`. Khởi động lại Claude Code. Gỡ: `claude plugin uninstall sp@solo-prompts`.
Không cài được (máy lạ, không quyền)? Dán nội dung `skills/khoi-tao/SKILL.md` + mô tả — agent tự dùng `general-purpose` + `model` thay cho agent riêng (mất skill chế độ, nên chỉ để chữa cháy).
Nên cho phép sẵn quyền cho agent chạy nền (`/permissions`: `WebSearch`, `WebFetch`, lệnh test của bạn) — bị chặn thì agent trả `DENIED`.

## Dùng
| Khi | Gõ |
|---|---|
| Dự án mới (ý tưởng mơ hồ cũng được) | `/sp:khoi-tao <mô tả>` — hoặc bàn trước rồi gõ `/sp:khoi-tao theo những gì vừa bàn` trong cùng phiên |
| Phiên mới của dự án cũ | `/sp:tiep-tuc` |
| Vòng lặp dài (nghiên cứu / cụm việc / debug) | `/goal <điều kiện>` — agent đề xuất sẵn câu `/goal` cuối mỗi cụm |
| Sau mỗi mốc / thấy rối | `/sp:bao-tri` |

## Agent tự phân loại 3 chế độ
| Chế độ | Khi nào | Luồng |
|---|---|---|
| **NGHIÊN CỨU** | Có điều cốt lõi chưa ai chứng minh khả thi / phải thử mới biết | giả thuyết (có `kill` viết trước) → 3 scout song song theo 3 góc → thí nghiệm trong worktree → critic red-team → phán quyết → user chọn hướng sau mỗi `/goal` |
| **XÂY DỰNG** | Viết được ≥3 tiêu chí chấp nhận, mọi phần đã biết cách làm | việc → builder (TDD) → critic code → test toàn bộ → STATE |
| **TRIỂN KHAI** | Nghiên cứu đã chốt, có cách tái lập | `SPEC.md` + `tests/acceptance/` từ thí nghiệm → build sạch lại |
Phân vân → NGHIÊN CỨU khảo sát ngắn (sai hướng build đắt hơn). Gặp giả định sai giữa chừng → spike 1 vòng; sụp thì agent đề xuất chuyển phần đó về NGHIÊN CỨU, bạn quyết.

## Phân vai
| Vai | Model | Làm | Trả về |
|---|---|---|---|
| Điều phối viên | Opus (phiên chính) | phân loại, chia việc, phán quyết, ghi sổ | — |
| `sp:scout` | haiku | search web/docs/code, tổng hợp nhiều nguồn | ≤6 dòng + file `.ai/runs/` |
| `sp:grunt` | haiku | chạy test/lệnh, chạy lặp thí nghiệm, việc cơ học | 1 dòng OK/FAIL |
| `sp:builder` | sonnet | code/thí nghiệm/hạ tầng theo TDD, worktree | ≤6 dòng |
| `sp:critic` | sonnet | `code` review · `gia_thuyet` red-team + thẩm định nguồn · `loi` root cause | ≤8 dòng, luôn spawn mới |
Không dùng Workflow tool — chỉ Agent tool (`model`, `run_in_background`, `isolation: "worktree"`, SendMessage).

## Bộ nhớ trong project (v3.1: 8–12 file → v4: 2 file nạp + kho tra cứu)
| File | Nạp? | Nội dung |
|---|---|---|
| `CLAUDE.md` ≤80 dòng | tự nạp | chế độ, lệnh, **giao thức điều phối**, luật code, gotchas |
| `.ai/STATE.md` ≤40 dòng | đầu phiên | việc, đang chạy, nhật ký 10 dòng, chi phí, tiếp theo |
| `.ai/findings.md` ≤60 dòng | đầu phiên (nghiên cứu) | đã chốt / đang sống / **đường chết** / hướng tiếp / cổng |
| `.ai/so_cai.md` | grep theo id | sổ cái H (giả thuyết) / E (thí nghiệm) / V (phán quyết) |
| `.ai/runs/` + `INDEX.md` | khi cần | output subagent, nguồn có tier A/B/C |
| `SPEC.md`, `tests/acceptance/` | triển khai | từ cổng nghiên cứu |
Ghi theo sự kiện (mỗi quyết định), không đợi "cuối phiên". Bỏ: `system_map.md` (codegraph/grep thay), `bo_nho_phien`, `roadmap`, `du_an_config`, `PROJECT_BRIEF`, `agent_rules`, phân loại S/M/L/XL.

## Viết /goal đúng cách
Giám khảo `/goal` là model đọc **transcript**, không đọc file → điều kiện phải là **bằng chứng in ra màn hình** (output test, `grep` sổ cái) + **trần vòng** (`Tối đa N vòng`, agent in `Vòng k/N`). Mẫu sẵn trong `sp:nghien-cuu` và `sp:xay-dung`.

## Giữ lại từ v3.1 (gọn về 1 chỗ: `builder.md` + `critic.md` + 1 dòng trong CLAUDE.md)
Chống fallback chồng (≤2 nhánh) · không dead code, mọi symbol có nơi gọi · tái dùng trước khi viết · TDD cho logic/bugfix · root cause + debug theo tầng · gotchas "biết mất phải học lại".

## Token (đo bằng `claude plugin details sp@solo-prompts`; v3.1 quy đổi cùng tỷ lệ ~2.1 byte/token)
| | v3.1 | v4 |
|---|---|---|
| Luôn có trong mọi phiên | 0 | ~0.9k (mô tả 5 skill + 4 agent) |
| Khởi tạo | dán KHOI_TAO ~17k | `khoi-tao` ~3k + skill chế độ 2–3k |
| Phiên hằng ngày | dán TIEP_TUC ~8.3k + đọc 3–10 file quản lý | `tiep-tuc` ~0.2k + 1 skill chế độ 2–3k + CLAUDE.md/STATE ~2k |
| Làm 1 task | dán THUC_THI ~11.5k | 0 thêm (skill đã nạp) |
| Quy tắc vai | lặp trong mọi prompt | system prompt của agent (0.4–0.9k), nằm trong context agent con, không ở điều phối viên |
Đo chi phí thật của điều phối: mục Chi phí của STATE + `.ai/chi_phi.log` → `/sp:bao-tri` rà và chỉnh luật "KHÔNG spawn khi".

## Chưa kiểm chứng
- Chưa chạy trọn 1 dự án thật bằng v4. Ngưỡng (≤3 agent nền, ≤80/40/60 dòng, trần vòng) là điểm xuất phát — chỉnh theo log chi phí sau 2–3 phiên.
- Chưa A/B test với v3.1 trên cùng 1 đề bài.
- Tool `mcp__codegraph__codegraph_explore` trong `tools:` của agent: nếu máy không có MCP codegraph, agent dùng CLI/grep thay.
