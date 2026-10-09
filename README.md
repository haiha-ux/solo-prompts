# Bộ Prompt Solo v4 — Điều phối đa tác tử · Nghiên cứu · /goal

> Plugin Claude Code cho solo dev người Việt: Opus điều phối agent Sonnet/Haiku, 3 chế độ NGHIÊN CỨU / XÂY DỰNG / TRIỂN KHAI chuyển qua lại tự do, vòng lặp `/goal`, tiết kiệm token. Giấy phép MIT.

## Cài (plugin Claude Code — 1 lệnh mỗi máy)
**Cách A — từ GitHub (ai cũng cài được, repo public):**
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
| Đổi hướng bất kỳ lúc nào | `/sp:chuyen <NC\|XD\|TK> [phạm vi:<thành phần>] [lý do]` — hoặc nói tự nhiên ("chuyển sang build", "nghiên cứu lại phần X"), hoặc `/sp:tiep-tuc chuyển sang triển khai` |

## Agent tự phân loại 3 chế độ
| Chế độ | Khi nào | Luồng |
|---|---|---|
| **NGHIÊN CỨU** | Có điều cốt lõi chưa ai chứng minh khả thi / phải thử mới biết | giả thuyết (có `kill` viết trước) → 3 scout song song theo 3 góc → thí nghiệm trong worktree → critic red-team → phán quyết → user chọn hướng sau mỗi `/goal` |
| **XÂY DỰNG** | Viết được ≥3 tiêu chí chấp nhận, mọi phần đã biết cách làm | việc → builder (TDD) → critic code → test toàn bộ → STATE |
| **TRIỂN KHAI** | Nghiên cứu đã chốt, có cách tái lập | `SPEC.md` + `tests/acceptance/` từ thí nghiệm → build sạch lại |
Phân vân → NGHIÊN CỨU khảo sát ngắn (sai hướng build đắt hơn). Gặp giả định sai giữa chừng → spike 1 vòng; sụp thì agent đề xuất chuyển phần đó về NGHIÊN CỨU, bạn quyết.

## Đổi hướng (không bị "dính" chế độ khởi tạo)
- Chế độ là **chế độ chính** của dự án, đổi bằng giao dịch `sp:chuyen`: bàn giao artifact (findings → brief/SPEC, test fail → giả thuyết) + **dựng lười** phần còn thiếu (kiểm bằng `ls`, không dựa chế độ cũ) + ghi nhật ký chuyển. `khoi-tao` cũng chỉ là "chuyển từ mới → X", nên khởi tạo và chuyển dùng chung 1 nguồn.
- **Luồng phụ** (tối đa 1, chỉ NC): `sp:chuyen NC phạm vi:<thành phần>` — nghiên cứu 1 thành phần ≤3 vòng trong khi build phần còn lại; việc gắn thẻ `[NC:…]`, việc phụ thuộc chờ `[!]`.
- **Chuyển sớm** (vd build/triển khai khi nghiên cứu chưa qua cổng) vẫn được — hệ thống ghi "Giả định chưa kiểm" trỏ H#, code phụ thuộc nằm sau interface + test xfail.
- Gọi lại `/sp:khoi-tao <yêu cầu mới>` trên dự án có sẵn: không ghi đè, cùng chế độ thì thêm việc, khác chế độ thì `sp:chuyen`.
- Agent tự ĐỀ XUẤT chuyển khi: cổng NC đủ · việc bị chặn 2 lần vì điều chưa biết · spike sụp · luồng phụ quá 3 vòng.

## Phân vai
| Vai | Model | Làm | Trả về |
|---|---|---|---|
| Điều phối viên | Opus (phiên chính) | phân loại, kế hoạch, chia việc, phán quyết, **người duy nhất ghi** STATE / CLAUDE.md / MAP.md / findings / so_cai | — |
| `sp:scout` | haiku | search web/docs/code, phân tích ảnh hưởng (call site, test) có số liệu | ≤6 dòng + file `.ai/runs/` |
| `sp:grunt` | haiku | chạy lệnh: test, QUÉT rác/dead code, sinh `MAP.auto.md`, số liệu sức khỏe, chạy lặp thí nghiệm | 1 dòng OK/FAIL |
| `sp:builder` | sonnet | code/scaffold/thí nghiệm theo TDD trong worktree; **cổng bắt buộc**: TÁI DÙNG · LIÊN KẾT · PHẠM VI · CHECK · MAP | ≤9 dòng có nhãn |
| `sp:critic` | sonnet | 6 chế độ: `code` (8 nhóm) · `gia_thuyet` · `loi` · `ke_hoach` · `kien_truc` · `suc_khoe` — luôn spawn mới | ≤10 dòng |
Không dùng Workflow tool — chỉ Agent tool (`model`, `run_in_background`, `isolation: "worktree"`, SendMessage).

## Bộ nhớ + quản lý codebase trong project (theo quy mô, tự suy)
| File | Quy mô | Ai ghi | Nạp |
|---|---|---|---|
| `CLAUDE.md` ≤80 dòng: chế độ, **quy mô**, lệnh, giao thức điều phối, **Cấu trúc** (kiến trúc, run file, luồng tầng; S: vai trò module), luật code, **Quyết định**, Gotchas | mọi | điều phối viên | tự nạp |
| `.ai/STATE.md` ≤40 dòng: việc, đang chạy, nhật ký, **sức khỏe**, chi phí, tiếp theo | mọi | điều phối viên | đầu phiên |
| `.ai/ref/` — bản sao tham chiếu của plugin (kiến trúc, run file, bugfix, mốc, sức khỏe, sơ đồ, mẫu /goal) | mọi | lệnh `cp` | khi cần |
| `.ai/MAP.md` vai trò module ≤40 dòng · `.ai/MAP.auto.md` sinh bằng lệnh (file, class, method public, import) | M+ | điều phối viên · grunt | đầu phiên · khi cần |
| `.ai/brief.md` mục tiêu/phạm vi/NGOÀI/tiêu chí/rủi ro · `.ai/ke_hoach.md` mốc · `.ai/no_ky_thuat.md` | M+ | điều phối viên | khi lập kế hoạch |
| `docs/kien_truc.md` (Mermaid) · `docs/contracts/` · `docs/quyet_dinh/` (ADR) · `.ai/reuse.md` | L | builder (`docs/`) · điều phối viên (`reuse.md`, ADR) | khi cần |
| `.ai/findings.md` · `.ai/so_cai.md` · `.ai/runs/` + `INDEX.md` · `SPEC.md` · `tests/acceptance/` | nghiên cứu / triển khai | điều phối viên · scout | đầu phiên (findings) · grep |
Quy mô (lấy mức cao nhất): S <20 file, 1–2 module, không tích hợp ngoài · M 20–200 file hoặc 3–8 module hoặc có DB/API ngoài · L >200 file hoặc >8 module hoặc ≥4 tích hợp ngoài (chỉ tự tăng khi vượt >20%). Ghi theo sự kiện, không đợi "cuối phiên".

## Kế thừa từ v3.1 — đặt ở nơi được THỰC THI
| v3.1 | v4 |
|---|---|
| Kiến trúc 4 tầng Service+Facade, luật luồng, khi nào không dùng, cây monolith/microservices | `.ai/ref/kien_truc.md` + luật trong `sp:builder` + critic nhóm KIẾN TRÚC BLOCK |
| Run file ở root tự bootstrap, tách `startup/` | `run_file.md` (mẫu dùng `importlib.metadata`, venv, `--check`, ngưỡng tách 300 dòng) |
| `system_map` + verify đầu phiên/sau task | `MAP.md` (vai trò) + `MAP.auto.md` (sinh bằng lệnh, không ảo giác) + lệnh git phát hiện file A/D/R |
| Quy tắc 70%, liên kết module, phạm vi, fallback, dead code, self-review | cổng báo cáo của builder + grunt QUÉT (dead code 0 caller) + critic `code` 8 nhóm |
| Bugfix 7 bước, debug theo tầng | `bugfix.md` + critic `loi` |
| PHAT_TRIEN: mốc, NGOÀI phạm vi, rủi ro, rollback vùng nhạy cảm, scope check, contracts, ADR | `moc.md` + critic `ke_hoach` |
| KIEN_TRUC: Mermaid, sequence, ma trận, đăng ký module, kiểm hợp lệ | `so_do.md` + critic `kien_truc` |
| CHAT_LUONG: health check, ngưỡng, điểm, mức xử lý, reuse, dashboard, nợ | `suc_khoe.md` + grunt (số liệu) + critic `suc_khoe` (chấm) + `sp:bao-tri` |
| Nhánh `fix/feature/...`, commit format | `sp:xay-dung` bước 2 |
Bỏ có chủ đích: cài codegraph ở mọi prompt · mốc 5/15/30 phút · hỏi 3 câu quy mô · `bo_nho_phien`/`roadmap`/`du_an_config`/`agent_rules` (gộp vào STATE/CLAUDE.md/agent) · tự merge PR.

## Viết /goal đúng cách
Giám khảo `/goal` là model đọc **transcript**, không đọc file → điều kiện phải là **bằng chứng in ra màn hình** (output test, `grep` sổ cái) + **trần vòng** (`Tối đa N vòng`, agent in `Vòng k/N`). Mẫu sẵn: `.ai/ref/goal.md` và `.ai/ref/goal_nghien_cuu.md`.

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
