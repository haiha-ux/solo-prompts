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
**Cập nhật / tự cập nhật:** marketplace bên thứ 3 mặc định TẮT auto-update → bật: `/plugin` → Marketplaces → `solo-prompts` → Enable auto-update. Thủ công: `claude plugin marketplace update solo-prompts && claude plugin update sp@solo-prompts`, rồi khởi động lại Claude Code. Gỡ: `claude plugin uninstall sp@solo-prompts`.
**Phát hành bản mới (người bảo trì):** sửa file → TĂNG `version` trong `.claude-plugin/plugin.json` (không tăng thì máy khác không thấy bản mới) → `claude plugin validate .` → commit + push.
Không cài được (máy lạ, không quyền)? Dán nội dung `skills/khoi-tao/SKILL.md` + mô tả — agent tự dùng `general-purpose` + `model` thay cho agent riêng (mất skill chế độ, nên chỉ để chữa cháy).
**Yêu cầu máy:** Claude Code (đã kèm Node — hook của plugin chạy bằng `node`, nên Windows không cần Git Bash cho hook) · git. Tùy chọn: `codegraph` (tra code nhanh hơn; thiếu → agent dùng grep, hook báo 1 dòng), `gh` (PR/repo). Windows: các lệnh grep/xargs của bản đồ code cần Git Bash (Claude Code dùng nó cho Bash tool).
**Quyền cho agent chạy nền** (thiếu → agent trả `DENIED`): thêm vào `.claude/settings.json` của dự án (hoặc `~/.claude/settings.json`), sửa dòng lệnh test cho đúng dự án:
```json
{"permissions":{"allow":["WebSearch","WebFetch","Bash(git status:*)","Bash(git diff:*)","Bash(git log:*)","Bash(git add:*)","Bash(git commit:*)","Bash(git worktree:*)","Bash(git branch:*)","Bash(git merge:*)","Bash(git ls-files:*)","Edit","Write","Bash(node:*)","Bash(codegraph:*)","Bash(echo:*)","Bash(grep:*)","Bash(ls:*)","Bash(wc:*)","Bash(cat:*)","Bash(xargs:*)","Bash(pytest:*)","Bash(npm test:*)"],"deny":["Bash(git push:*)","Bash(rm -rf:*)"]}}
```

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
| **NGHIÊN CỨU** | Có điều cốt lõi chưa ai chứng minh khả thi / phải thử mới biết | phân kỳ đa lăng kính → giả thuyết (lõi/phụ trợ, `kill` viết trước) → scout 2 pha → thí nghiệm trong worktree → chạm kill thì phân tích thất bại F1–F5 + ≤3 biến thể trước khi bác bỏ → critic red-team → phán quyết → user chọn hướng sau mỗi `/goal` |
| **XÂY DỰNG** | Viết được ≥3 tiêu chí chấp nhận, mọi phần đã biết cách làm | việc → builder (TDD) → critic code → test toàn bộ → STATE |
| **TRIỂN KHAI** | Nghiên cứu đã chốt, có cách tái lập | `SPEC.md` + `tests/acceptance/` từ thí nghiệm → build sạch lại |
Phân vân → NGHIÊN CỨU khảo sát ngắn (sai hướng build đắt hơn). Gặp giả định sai giữa chừng → spike 1 vòng; sụp thì agent đề xuất chuyển phần đó về NGHIÊN CỨU, bạn quyết.

## Đổi hướng (không bị "dính" chế độ khởi tạo)
- Chế độ là **chế độ chính** của dự án, đổi bằng giao dịch `sp:chuyen`: bàn giao artifact (findings → brief/SPEC, test fail → giả thuyết) + **dựng lười** phần còn thiếu (kiểm bằng `ls`, không dựa chế độ cũ) + ghi nhật ký chuyển. `khoi-tao` cũng chỉ là "chuyển từ mới → X", nên khởi tạo và chuyển dùng chung 1 nguồn.
- **Luồng phụ** (tối đa 1, chỉ NC): `sp:chuyen NC phạm vi:<thành phần>` — nghiên cứu 1 thành phần ≤3 vòng trong khi build phần còn lại; việc gắn thẻ `[NC:…]`, việc phụ thuộc chờ `[!]`.
- **Chuyển sớm** (vd build/triển khai khi nghiên cứu chưa qua cổng) vẫn được — hệ thống ghi "Giả định chưa kiểm" trỏ H#, code phụ thuộc nằm sau interface + test xfail.
- Gọi lại `/sp:khoi-tao <yêu cầu mới>` trên dự án có sẵn: không ghi đè, cùng chế độ thì thêm việc, khác chế độ thì `sp:chuyen`.
- Agent tự ĐỀ XUẤT chuyển khi: cổng NC đủ · việc bị chặn 2 lần vì điều chưa biết · spike sụp · luồng phụ quá 3 vòng.

## Việc NHẸ (tiết kiệm cho việc nhỏ)
Quy mô S, ≤2 file, không dữ liệu/người dùng thật — hoặc bạn nói "nhẹ"/"dùng 1 lần" → bỏ động não và critic kết mốc, vẫn giữ grunt chạy test. Việc dùng thật/nghiên cứu vẫn chạy quy trình đầy đủ.

## Ràng buộc bằng hook (không chỉ bằng chữ)
- `hooks/guard.js` (PreToolUse): trong dự án sp, **phiên chính** chạy lệnh test (pytest, npm test, node --test, go test, cargo test…) hoặc search/fetch web → bị TỪ CHỐI, kèm hướng dẫn giao `sp:grunt`/`sp:scout`. Agent con (hook input có `agent_id`) luôn được qua. Van thoát: cùng mục tiêu bị chặn 2 lần thì lần 3 cho qua. Lỗi → cho qua.
- `hooks/probe.js` (SessionStart): nạp sẵn `[sp brief]` = STATE + git log/status + findings (≤8k ký tự) → `/sp:tiep-tuc` không phải đọc lại.
- Ghi công: ý tưởng phân biệt phiên chính/agent con bằng `agent_id`, brief đầu phiên, kickoff nhẹ và các số đo giới hạn codegraph lấy từ plugin **crew** — [HYPIAN](https://github.com/TianAn2411/HYPIAN) (An Thien Truong, MIT). Không lấy: memory DB, daemon, đa vai trò (nặng, chưa thử trên Windows, ở quy mô solo ngang grep theo chính số đo của họ).

## Plugin & MCP đi kèm
- **Context7** (docs thư viện đúng phiên bản) được cài TỰ ĐỘNG cùng plugin (`.mcp.json`, server từ xa, không cần key, chỉ 2 tool; Claude Code hoãn nạp schema MCP nên gần như không tốn context). Builder/scout/critic tra docs ở đây trước, web chỉ khi cần issue/changelog/benchmark.
- **codegraph** (tra code, giảm token đọc file): CLI cài riêng mỗi máy — `npm i -g @colbymchenry/codegraph` (Node ≥22.5) rồi `codegraph init` trong dự án. Thiếu thì agent dùng grep, hook báo 1 dòng.
- **Exa** (search/fetch web) cũng cài TỰ ĐỘNG cùng plugin (từ xa, không cần key; lỗi/giới hạn → agent tự dùng WebSearch).
- **Đo thật (2026-10-31, mỗi phép 1 phiên haiku, câu trả lời đúng như nhau)**: Context7 $0.023 vs WebFetch $0.060 (3 câu docs, rẻ hơn ~62%) · Exa $0.022 vs WebSearch $0.072 (2 câu search, rẻ hơn ~70%, ít lượt hơn).
- **Tùy chọn, tự thêm khi cần**: arXiv (paper) `claude mcp add arxiv -- uvx arxiv-mcp-server` · Playwright (test trình duyệt) `claude mcp add playwright -- npx @playwright/mcp@latest`.
- **Cố ý KHÔNG dùng**: GitHub MCP (schema rất nặng, `gh` CLI làm được) · Serena (trùng codegraph, nhiều tool, GPL).

## Câu hỏi thường gặp khi vận hành
- **Sonnet có gọi được Haiku không?** Claude Code cho phép agent con gọi agent con (≤3 tầng) — nhưng plugin CỐ Ý tắt: mỗi spawn tốn ~15–20k token cố định, lồng nhau làm mất kiểm soát chi phí. Builder/critic cần tra cứu hay việc cơ học → trả `CHẶN: CẦN TRA CỨU/CẦN GRUNT`, Opus spawn scout/grunt (rẻ, có ghi chi phí).
- **Có agent cố vấn không?** Claude Code không có "advisor" sẵn. Plugin dùng `sp:critic` CHẾ ĐỘ `tu_van` (Sonnet, effort high, tự search ≤6 nguồn mới) cho quyết định đắt: chọn stack, kiến trúc, trước khi chuyển TK. Tri thức dự án nằm ở CLAUDE.md (Quyết định, Phiên bản, Gotchas) + findings — không tạo kho nhớ thứ 4 dễ lệch.
- **Agent ít search web?** Đã có LUẬT TRA CỨU T1–T6 trong CLAUDE.md dự án: bắt buộc tra trước khi dùng thư viện/API lần đầu, chọn stack, gặp lỗi lạ, khẳng định "chưa ai làm", dùng số liệu, chốt giả thuyết. Builder không viết theo trí nhớ — thiếu thì trả `CẦN TRA CỨU`. Nguồn ghi ngày, >12 tháng coi là hết hạn. Nghiên cứu thu thập 2 pha (mở rộng thuật ngữ + theo dấu trích dẫn).
- **Máy không có codegraph?** Chạy bình thường bằng grep/git ls-files; hook báo 1 dòng "máy thiếu: codegraph".
- **Vì sao Haiku được dùng nhiều hơn?** Thước đo là TIỀN, không phải số lần spawn: alias `haiku` hiện là Haiku 5.5 ≈ 1/40 giá Opus, Sonnet ≈ ½ Opus (đo thật: haiku $0.02–0.06/lần chạy). Bảng định tuyến trong CLAUDE.md dự án: chạy lệnh, đọc log, grep, tra docs/web, phân tích ảnh hưởng, động não → haiku; chỉ logic/phản biện mới lên sonnet; Opus giữ quyết định.
- **Động não triệt để?** `.ai/ref/phan_ky.md`: trước việc quan trọng, nhiều scout haiku song song mỗi con 1 lăng kính (use case, lỗi thực tế/FMEA, đầu vào biên, môi trường thật, bảo mật, vận hành/chi phí, pre-mortem, phương án khác, giả định ngầm, phụ thuộc, hệ quả bậc hai, kiểm thử, pháp lý…) + LUÔN có lăng kính "còn thiếu" tự đề xuất loại danh sách mới → hội tụ, xếp hạng → biến thành tiêu chí chấp nhận, test case, rủi ro mốc, giả thuyết.
- **Sổ cái có được kiểm tự động?** `hooks/lint_so_cai.js` (node, tất định): kill có trước, refuted phải có dòng F + lesson, ≤3 biến thể, findings ≤60 dòng — bắt buộc chạy trước khi ghi refuted và khi kết `/goal`.
- **Giả thuyết fail có bị bỏ phí?** Không: chạm kill → `failing` → grunt chạy đối chứng/ablation → critic `that_bai` phân loại F1 (bug) … F5 (lõi sai) → sửa bug hoặc sinh ≤3 biến thể (giữ lõi, kill mới viết trước, phải có dự đoán mới) → chỉ `refuted` khi lõi sai có bằng chứng hoặc cạn biến thể, kèm bài học cho hướng sau. Có luật chống dời cột gôn.
- **`/goal` kẹt?** `/goal clear` rồi `/sp:tiep-tuc` — STATE là nguồn sự thật, không mất việc.
- **Context bị nén giữa phiên?** Hook nhắc agent đọc lại STATE và gọi lại skill.

## Phân vai
| Vai | Model | Làm | Trả về |
|---|---|---|---|
| Điều phối viên | Opus (phiên chính) | phân loại, kế hoạch, chia việc, phán quyết, **người duy nhất ghi** STATE / CLAUDE.md / MAP.md / findings / so_cai | — |
| `sp:scout` | haiku | search web/docs/code, phân tích ảnh hưởng (call site, test) có số liệu | ≤8 dòng + file `.ai/runs/` |
| `sp:grunt` | haiku | chạy lệnh: test, QUÉT rác/dead code, sinh `MAP.auto.md`, số liệu sức khỏe, chạy lặp thí nghiệm | 1 dòng OK/FAIL |
| `sp:builder` | sonnet | code/scaffold/thí nghiệm theo TDD trong worktree; **cổng bắt buộc**: TÁI DÙNG · LIÊN KẾT · PHẠM VI · CHECK · MAP | ≤10 dòng có nhãn |
| `sp:critic` | sonnet | 8 chế độ: `code` (8 nhóm) · `gia_thuyet` · `that_bai` · `loi` · `ke_hoach` · `kien_truc` · `suc_khoe` · `tu_van` — luôn spawn mới | ≤10 dòng |
Không dùng Workflow tool — chỉ Agent tool (`model`, `run_in_background`, `isolation: "worktree"`, SendMessage).

## Bộ nhớ + quản lý codebase trong project (theo quy mô, tự suy)
| File | Quy mô | Ai ghi | Nạp |
|---|---|---|---|
| `CLAUDE.md` ≤90 dòng: chế độ, **quy mô**, lệnh, giao thức điều phối, **Cấu trúc** (kiến trúc, run file, luồng tầng; S: vai trò module), luật code, **Quyết định**, Gotchas | mọi | điều phối viên | tự nạp |
| `.ai/STATE.md` ≤40 dòng: việc, đang chạy, nhật ký, **sức khỏe**, chi phí, tiếp theo | mọi | điều phối viên | đầu phiên |
| `.ai/ref/` — bản sao tham chiếu của plugin (kiến trúc, run file, bugfix, mốc, sức khỏe, sơ đồ, mẫu /goal) | mọi | hook SessionStart (node) | khi cần |
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
| Luôn có trong mọi phiên | 0 | ~1.1k (mô tả 6 skill + 4 agent; hook không tốn context) |
| Khởi tạo | dán KHOI_TAO ~17k | `khoi-tao` ~3k + skill chế độ 2–3k |
| Phiên hằng ngày | dán TIEP_TUC ~8.3k + đọc 3–10 file quản lý | `tiep-tuc` ~1.3k + 1 skill chế độ 2–3k + CLAUDE.md/STATE ~2k |
| Làm 1 task | dán THUC_THI ~11.5k | 0 thêm (skill đã nạp) |
| Quy tắc vai | lặp trong mọi prompt | system prompt của agent (0.4–0.9k), nằm trong context agent con, không ở điều phối viên |
Đo chi phí thật của điều phối: mục Chi phí của STATE + `.ai/chi_phi.log` → `/sp:bao-tri` rà và chỉnh bảng định tuyến / ngân sách.

## Đo thật (2026-10-31, cùng đề bài XD "CLI demtu", claude -p, Opus điều phối)
| Bản | Haiku | Sonnet | Lượt Opus | Opus $ | Tổng $ | Ghi chú |
|---|---|---|---|---|---|---|
| 4.5.0 | 0 | 1 | — | — | 1.00 | Opus tự chạy test, không phân kỳ, bỏ critic |
| 4.5.2 | 4 | 3 | — | 1.85 | 2.61 | luật cứng: phân kỳ + grunt + critic; critic bắt 2 lỗi thật, 7 → 37 test |
| 4.5.3 | 6 | 3 | 35 | 1.84 | 2.68 | 6 lượt Opus chỉ để ghi log |
| 4.6.0 | 5 | 3 | 29 | 1.50 | 2.13 | ghi sổ gộp, spawn cùng lượt |
TK (từ kết quả nghiên cứu có lệnh tái lập): tự phân loại TRIỂN KHAI → SPEC.md + tests/acceptance + phân kỳ + 5 haiku + critic, 13 test xanh · $1.84.
Luồng phụ (thêm từ ghép tiếng Việt vào dự án XD): giữ XÂY DỰNG + mở `NC:tach-tu-ghep`; 6 scout + 2 grunt; H1 F1=0.885 < 0.90 → failing → tái lập ×3 + đối chứng oracle (0.985) + ablation → mở H3, không bác bỏ vội.
NC (giả thuyết sai thật): failing → grunt đối chứng dương + ablation → critic that_bai loại F1–F4 → F5 → refuted kèm bài học + hướng mới · $1.58.
v4.7.1 NC (join vs +=): phân kỳ trước khi ghi H → kill viết trước → grunt đo + biến thể → failing → critic that_bai F1–F4 loại → F5 → critic gia_thuyet → refuted; `lint_so_cai.js` gọi 4 lần, 0 lỗi; in dòng ĐỊNH TUYẾN · $0.98 + $1.70.
v4.7.1 luồng phụ (tiếp tục phiên cũ): khôi phục 2 agent chết từ STATE → hỏi user 1 quyết định thật (đăng ký dataset) → H3 failing → biến thể H3.1 có dự đoán mới → vẫn hụt → PARKED (không refuted vì nguyên nhân F2 quy mô corpus chưa loại) kèm điều kiện mở lại → đóng luồng phụ sau 3/3 vòng, giữ XÂY DỰNG · lint 0 lỗi · $3.08.
Chạy không giao diện (`claude -p`) với thí nghiệm dài: đặt `CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS=0`, nếu không agent nền chạy >10 phút sau lượt cuối sẽ bị dừng.
v4.8.1 (bản chốt): việc NHẸ (script dùng 1 lần) → builder + grunt, 8 lượt Opus, $0.77, 6 test xanh · XD đầy đủ "demtu" → 3 scout phân kỳ + builder + 2 grunt + 2 critic, 47 test xanh, $2.86 (Opus $1.66). Đo thêm: Context7 rẻ hơn WebFetch ~57% (7 câu), Exa rẻ hơn WebSearch ~73% (5 câu).
v4.9.0 (tích hợp từ HYPIAN): hook `guard.js` kiểm trong phiên thật — phiên chính gọi pytest bị CHẶN và tự chuyển sang sp:grunt (chạy được); agent con chạy cùng lệnh được qua · việc NHẸ $0.70 (8 lượt Opus, 4 test xanh) · XD đầy đủ $3.49 (6 haiku + builder + 3 critic, 27 test xanh; chi phí dao động giữa các lần chạy $2.1–3.5).
Chi phí còn lại chủ yếu là context Opus đọc lại mỗi lượt + suy nghĩ của Opus; haiku (alias = Haiku 5.5) chỉ $0.02–0.06 mỗi lần chạy.

## Chưa kiểm chứng
- Context7/Exa: đã đo trên 5 câu hỏi — mẫu nhỏ, kết quả có thể khác với câu hỏi khác; free tier của Exa có thể giới hạn khi dùng nhiều.
- Ngân sách theo đơn vị giá (400k/800k) và trần phân kỳ là điểm xuất phát — chỉnh theo `.ai/chi_phi.log`.
- Chưa chạy trọn 1 dự án thật bằng v4. Ngưỡng (≤3 agent nền, ≤80/40/60 dòng, trần vòng) là điểm xuất phát — chỉnh theo log chi phí sau 2–3 phiên.
- Chưa A/B test với v3.1 trên cùng 1 đề bài.
- Tool `mcp__codegraph__codegraph_explore` trong `tools:` của agent: nếu máy không có MCP codegraph, agent dùng CLI/grep thay.
