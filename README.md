# Bộ prompt Solo v4

`sp` là plugin Claude Code cho lập trình viên đơn lẻ, trong đó Opus điều phối các agent Sonnet và Haiku qua ba chế độ NGHIÊN CỨU, XÂY DỰNG, TRIỂN KHAI, chuyển qua lại được và chạy được với `/goal`. Nó đáng cài khi bạn làm dự án nhiều phiên, có dữ liệu hay người dùng thật, hoặc có một giả thuyết cốt lõi chưa ai chứng minh. Với việc nhỏ đã rõ, Opus một mình rẻ hơn (xem mục "Số đo"), và plugin tự chọn chế độ TRỰC TIẾP cho việc đó. Giấy phép MIT.

## Cài đặt

Cách A cài từ GitHub (repo public):

```
/plugin marketplace add haiha-ux/solo-prompts
/plugin install sp@solo-prompts
```

Cách B cài từ thư mục local hoặc ổ đồng bộ:

```
claude plugin marketplace add "<đường dẫn tới v4>"
claude plugin install sp@solo-prompts
```

Marketplace bên thứ ba mặc định tắt auto-update. Muốn bật, vào `/plugin`, chọn Marketplaces, `solo-prompts`, Enable auto-update. Cập nhật thủ công rồi khởi động lại Claude Code:

```
claude plugin marketplace update solo-prompts && claude plugin update sp@solo-prompts
```

Gỡ: `claude plugin uninstall sp@solo-prompts`. Phát hành bản mới: sửa file, tăng `version` trong `.claude-plugin/plugin.json` (không tăng thì máy khác không thấy), chạy `claude plugin validate .`, rồi commit và push. Máy không cài được plugin thì dán `skills/khoi-tao/SKILL.md` kèm mô tả để chữa cháy (mất skill theo chế độ).

Máy cần Claude Code (đã kèm Node, hook chạy bằng `node`) và git; trên Windows, các lệnh grep/xargs tạo bản đồ code cần Git Bash. `gh` là tùy chọn, codegraph cần Node từ 22.5.

Agent chạy nền cần quyền sẵn, thiếu thì trả `DENIED`. Thêm khối sau vào `.claude/settings.json` của dự án (hoặc `~/.claude/settings.json`) và sửa dòng lệnh test cho đúng dự án:

```json
{"permissions":{"allow":["WebSearch","WebFetch","Bash(git status:*)","Bash(git diff:*)","Bash(git log:*)","Bash(git add:*)","Bash(git commit:*)","Bash(git worktree:*)","Bash(git branch:*)","Bash(git merge:*)","Bash(git ls-files:*)","Edit","Write","Bash(node:*)","Bash(codegraph:*)","Bash(echo:*)","Bash(grep:*)","Bash(ls:*)","Bash(wc:*)","Bash(cat:*)","Bash(xargs:*)","Bash(pytest:*)","Bash(npm test:*)"],"deny":["Bash(git push:*)","Bash(rm -rf:*)"]}}
```

## Dùng hằng ngày

| Khi | Gõ |
|---|---|
| Dự án mới, ý tưởng mơ hồ cũng được | `/sp:khoi-tao <mô tả>`, hoặc bàn trước rồi gõ `/sp:khoi-tao theo những gì vừa bàn` trong cùng phiên |
| Phiên mới của dự án cũ | `/sp:tiep-tuc` |
| Vòng lặp dài (nghiên cứu, cụm việc, debug) | `/goal <điều kiện>` |
| Sau mỗi mốc hoặc khi thấy rối | `/sp:bao-tri` |
| Đổi hướng | `/sp:chuyen <NC\|XD\|TK> [phạm vi:<thành phần>] [lý do]`, hoặc nói tự nhiên ("chuyển sang build"), hoặc `/sp:tiep-tuc chuyển sang triển khai` |
| Viết tài liệu cho người đọc (README, ADR, SPEC, báo cáo, postmortem, PR) | `/sp:viet <loại tài liệu, người đọc, nguồn>` |

Gọi lại `/sp:khoi-tao <yêu cầu mới>` trên dự án có sẵn thì không ghi đè: cùng chế độ thì thêm việc, khác chế độ thì chạy `sp:chuyen`. Nếu `/goal` kẹt, gõ `/goal clear` rồi `/sp:tiep-tuc`; `.ai/STATE.md` là nguồn sự thật nên không mất việc. Điều kiện `/goal` tốt phải là bằng chứng in ra màn hình (output test, `grep` sổ cái) cộng trần vòng (`Tối đa N vòng`, agent in `Vòng k/N`), vì giám khảo `/goal` đọc transcript chứ không đọc file; mẫu ở `.ai/ref/goal.md` và `.ai/ref/goal_nghien_cuu.md`. Với `claude -p` và thí nghiệm dài, đặt `CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS=0`, nếu không agent nền chạy quá 10 phút sau lượt cuối sẽ bị dừng.

## Cách hoạt động

### Mức công sức và chế độ

Việc nhỏ đã rõ, không dữ liệu hay người dùng thật, hoặc bạn nói "nhẹ", chạy ở mức TRỰC TIẾP: Opus tự làm, không tạo `.ai/`, không spawn agent. Việc cỡ S/M không chạm vùng nhạy cảm chạy ở mức VỪA (một scout phân kỳ gọn, một critic kết mốc). Việc dùng thật hoặc nghiên cứu chạy quy trình ĐẦY ĐỦ, và agent tự xếp dự án vào một chế độ. NGHIÊN CỨU dành cho dự án có điều cốt lõi chưa ai chứng minh khả thi. XÂY DỰNG dành cho dự án viết được ít nhất ba tiêu chí chấp nhận và mọi phần đã biết cách làm. TRIỂN KHAI dành cho kết quả nghiên cứu đã chốt và có cách tái lập. Phân vân thì chọn NGHIÊN CỨU khảo sát ngắn, vì build sai hướng đắt hơn; giả định sai giữa chừng thì spike một vòng, sụp thì đề xuất chuyển phần đó về NGHIÊN CỨU để bạn quyết.

NGHIÊN CỨU đi theo chuỗi phân kỳ đa lăng kính, giả thuyết (lõi hoặc phụ trợ, điều kiện `kill` viết trước), scout hai pha, thí nghiệm trong worktree, critic red-team, phán quyết, rồi bạn chọn hướng sau mỗi `/goal`. Giả thuyết chạm `kill` không bị bác ngay: grunt chạy đối chứng và ablation, critic `that_bai` phân loại nguyên nhân từ F1 (bug thí nghiệm) đến F5 (lõi sai), rồi hoặc sửa bug hoặc sinh tối đa 3 biến thể giữ lõi với `kill` và dự đoán mới. Chỉ khi lõi sai có bằng chứng hoặc đã cạn biến thể thì giả thuyết thành `refuted`, kèm bài học cho hướng sau; luật chống dời cột gôn áp ở bước này. XÂY DỰNG đi theo chuỗi việc, builder (TDD), critic code, test toàn bộ, ghi STATE. TRIỂN KHAI dựng `SPEC.md` và `tests/acceptance/` từ thí nghiệm rồi build sạch lại; acceptance có smoke trình duyệt trên URL ở mục "Môi trường" của SPEC, tài khoản test lấy từ biến môi trường.

Chế độ là chế độ chính của dự án và đổi bằng giao dịch `sp:chuyen`: bàn giao artifact (findings thành brief hoặc SPEC, test fail thành giả thuyết), dựng phần còn thiếu (kiểm bằng `ls`, không dựa vào chế độ cũ) và ghi nhật ký chuyển. `khoi-tao` cũng chỉ là "chuyển từ mới sang X", nên dùng chung nguồn. Luồng phụ (tối đa 1, chỉ NC) cho nghiên cứu một thành phần tối đa 3 vòng trong khi build phần còn lại; việc gắn thẻ `[NC:…]`, việc phụ thuộc chờ ở `[!]`. Chuyển sớm (build khi nghiên cứu chưa qua cổng) vẫn được: hệ thống ghi "Giả định chưa kiểm" trỏ tới H#, và code phụ thuộc nằm sau interface cùng test xfail. Agent tự đề xuất chuyển khi cổng NC đủ, việc bị chặn hai lần vì điều chưa biết, spike sụp, hoặc luồng phụ quá 3 vòng.

### Agent

Opus là điều phối viên của phiên chính: phân loại, kế hoạch, chia việc, phán quyết, và là người duy nhất ghi STATE, CLAUDE.md, MAP.md, findings, so_cai. Chỉ dùng Agent tool (`model`, `run_in_background`, `isolation: "worktree"`, SendMessage), không dùng Workflow tool.

| Vai | Model | Làm | Trả về |
|---|---|---|---|
| `sp:scout` | haiku | search web, docs, code; phân tích ảnh hưởng có số liệu; phân kỳ theo lăng kính | ≤8 dòng + file `.ai/runs/` |
| `sp:grunt` | haiku | chạy test và lệnh, quét dead code, sinh `MAP.auto.md`, số liệu sức khỏe, chạy lặp thí nghiệm, kiểm UI web bằng trình duyệt thật | 1 dòng OK/FAIL |
| `sp:builder` | sonnet | code, scaffold, thí nghiệm theo TDD trong worktree (UI thì dùng kịch bản trình duyệt thay TDD); qua cổng TÁI DÙNG, LIÊN KẾT, PHẠM VI, CHECK, MAP | ≤10 dòng có nhãn |
| `sp:critic` | sonnet | 9 chế độ: `code` (8 nhóm), `gia_thuyet`, `that_bai`, `loi`, `ke_hoach`, `kien_truc`, `suc_khoe`, `tu_van`, `van_phong`; luôn spawn mới | ≤10 dòng |
| `sp:writer` | sonnet | viết README, hướng dẫn, SPEC, ADR, báo cáo, postmortem, bàn giao, changelog, PR theo `van_phong.md`, tự chạy `lint_van.js` | ≤5 dòng: đường dẫn, số từ, số cờ lint, điểm chưa biết, `CHẶN` |

Alias `haiku` hiện là Haiku 5.5, khoảng 1/40 giá Opus (mỗi lần chạy $0.02 đến $0.06), Sonnet khoảng một nửa Opus. Bảng định tuyến trong CLAUDE.md dự án vì vậy đẩy việc cơ học, tra cứu và động não sang haiku, chỉ logic và phản biện lên sonnet, còn Opus giữ quyết định. Claude Code cho agent con gọi agent con (tối đa 3 tầng), nhưng plugin cố ý tắt vì mỗi spawn tốn khoảng 15 đến 20k token cố định và lồng nhau làm mất kiểm soát chi phí; builder hay critic cần tra cứu hoặc việc cơ học thì trả `CHẶN: CẦN TRA CỨU` hoặc `CẦN GRUNT` để Opus spawn scout hay grunt. Không có agent "advisor" sẵn, nên cho quyết định đắt (chọn stack, kiến trúc, trước khi chuyển TK) plugin dùng critic `tu_van`: Sonnet, effort high, tự search tối đa 6 nguồn mới. Tri thức dự án nằm ở CLAUDE.md và findings, không có kho nhớ thứ tư dễ lệch.

Trước việc quan trọng, `.ai/ref/phan_ky.md` yêu cầu nhiều scout haiku chạy song song, mỗi con một lăng kính (use case, FMEA, đầu vào biên, bảo mật, pre-mortem, giả định ngầm, pháp lý…) cộng một lăng kính "còn thiếu" tự đề xuất; kết quả hội tụ thành tiêu chí chấp nhận, test case, rủi ro mốc hoặc giả thuyết. Luật tra cứu T1 đến T6 trong CLAUDE.md dự án bắt buộc tra trước khi dùng thư viện hay API lần đầu, chọn stack, gặp lỗi lạ, khẳng định "chưa ai làm" hoặc chốt giả thuyết; nguồn ghi ngày và quá 12 tháng coi là hết hạn. `hooks/lint_so_cai.js` (tất định) kiểm sổ cái: `kill` có trước, `refuted` có dòng F và bài học, tối đa 3 biến thể, findings tối đa 60 dòng, và bắt buộc chạy trước khi ghi `refuted` và khi kết `/goal`.

### Hook

Luật quan trọng được ép bằng hook chứ không chỉ bằng chữ, và hook không tốn token Opus.

`hooks/guard.js` (PreToolUse) chặn phiên chính chạy lệnh test (pytest, uv/poetry run, npm/pnpm/yarn/bun test, make test, tox, go/cargo/dotnet test, node --test, playwright, kể cả trong `pwsh -c`) hoặc search/fetch web, kèm hướng dẫn giao `sp:grunt` hay `sp:scout`; `hooks/guard.test.js` có 29 ca chặn và 15 ca không chặn. Agent con (hook input có `agent_id`) luôn được qua. Cùng mục tiêu bị chặn hai lần thì lần ba cho qua, và hook lỗi thì cho qua. `guard.js` còn chặn phiên chính spawn `Explore`, `general-purpose`, `Plan` vì chúng chạy trên Opus; hãy dùng `sp:scout`, `sp:grunt`, `sp:builder`, `sp:critic` hoặc truyền `model: "haiku"|"sonnet"`.

`hooks/gate.js` (SubagentStop) trả báo cáo sai khuôn về cho agent sửa ngay, trước khi tới Opus: builder thiếu nhãn, critic có dòng đầu không phải `KẾT:`, grunt không phải đúng một dòng `OK|FAIL`. Mỗi agent chỉ bị trả về một lần, hook lỗi thì cho qua.

`hooks/effort.js`, gọi từ `guard.js` khi phiên chính spawn agent, đặt `effort` theo dòng `CHẾ ĐỘ:` hoặc `LƯỢT:` trong brief (nhận cả nhãn markdown như `**CHẾ ĐỘ:**`, `LƯỢT 2`). Quy tắc (đã kiểm trong transcript agent con):

| Tình huống | effort | Lý do |
|---|---|---|
| critic `that_bai`; critic `loi` từ `LƯỢT: 2` | xhigh | bác bỏ sai hoặc sửa sai lần hai là chỗ đắt nhất |
| critic `suc_khoe`, `kien_truc`; critic `LƯỢT ≥2` không dính an toàn | medium | đối chiếu bảng, hoặc chỉ xác minh BLOCK cũ |
| critic còn lại | high (frontmatter) | Opus chỉ được nâng; truyền thấp hơn sẽ bị đưa lên high |
| builder `LƯỢT ≥2` hoặc `HẾT LƯỢT`; code `thi_nghiem/`; auth, thanh toán, migration, deploy, prod, secret | high | bug thí nghiệm (F1) làm hỏng kết luận; làm lại phải nghĩ sâu hơn |
| builder còn lại | medium (Opus tự truyền thì giữ, ví dụ low cho docs) | |
| scout, grunt | low, không đổi | đa dạng nhờ fan-out; việc cơ học |

Muốn nâng effort khi sửa lại thì spawn agent mới kèm `LƯỢT: n`, vì resume bằng SendMessage giữ effort cũ. Biến `CLAUDE_CODE_EFFORT_LEVEL` của user đè tất cả.

`hooks/probe.js` (SessionStart) nạp sẵn `[sp brief]` gồm STATE, git log/status và findings (tối đa 8k ký tự), nên `/sp:tiep-tuc` không phải đọc lại, và đặt tên phiên `sp <chế độ> · <dự án>`. Nó cũng chép mọi file `skills/*/tham-chieu` (gồm `van_phong.md`, `trinh_duyet.md`) vào `.ai/ref/` của dự án. Khi resume lúc cache hết hạn và context trên 60k token, nó báo số token cùng số tiền sẽ ghi lại và gợi ý `/clear` rồi `/sp:tiep-tuc` cho rẻ hơn. Khi nén context (PreCompact), nó chỉ dẫn bản tóm tắt giữ goal, agent đang chạy, BLOCK/FAIL và giả thuyết.

`hooks/setup.js` (SessionStart, chạy nền, tối đa một lần mỗi ngày) tự cài và nâng cấp công cụ, in một dòng `[sp setup] …`, log ở `~/.claude/plugins/data/sp-solo-prompts/setup.log`. Mỗi bước chờ tối đa 240 giây, bước nâng cấp lỗi thì thử lại hôm sau. Tắt bằng `SP_NO_AUTOINSTALL=1`, chạy ngay bằng `node "<plugin>/hooks/setup.js" --force`. `hooks/browser.js` (PreToolUse trên Playwright MCP) chỉ cho một agent dùng trình duyệt tại một thời điểm; phiên chính chỉ mở và đóng trang, việc đọc giao `sp:scout`, và không giữ khóa. `hooks/stat.js` ghi số liệu hook (gate trả về, guard chặn, effort đổi, trình duyệt bị chặn) vào `.ai/hook_stats.log`; `/sp:bao-tri` đọc bản `--summary` thay vì đoán.

`hooks/lint_van.js` (PostToolUse trên Write và Edit) đo dấu hiệu văn máy trong tài liệu cho người đọc: tỷ lệ gạch đầu dòng, in đậm, tiêu đề, emoji và cụm sáo. Nó bỏ qua sổ máy đọc (`.ai/`, CLAUDE.md, `skills/`, `agents/`), nhắc agent vừa ghi tối đa hai lần mỗi file mỗi phiên, và đọc danh sách cụm từ ở `hooks/van_phong_tu.json`, nơi bạn thêm hay bớt cụm. Chạy tay: `node hooks/lint_van.js <file.md> [--json]`; hướng dẫn văn phong ở `skills/khoi-tao/tham-chieu/van_phong.md`. Test hook:  `node --test hooks/*.test.js`.

`sp:scout` và `sp:grunt` đặt `omitClaudeMd: true` vì brief đã tự đủ (đã kiểm thật).

### Công cụ MCP đi kèm

Context7 (docs thư viện đúng phiên bản) và Exa (search, fetch web) cài tự động qua `.mcp.json`, là server từ xa, không cần key. Context7 chỉ có 2 tool nên gần như không tốn context; agent tra docs ở đây trước, web chỉ khi cần issue, changelog hay benchmark. Exa lỗi hoặc chạm giới hạn thì agent dùng WebSearch. codegraph giúp tra code mà không đọc cả file: `setup.js` tự cài (`npm i -g @colbymchenry/codegraph`), tự `codegraph upgrade` mỗi 7 ngày và tự đăng ký MCP bằng `claude mcp add --scope user codegraph -- codegraph serve --mcp`; `/sp:khoi-tao` chạy `codegraph init` trong dự án. Máy thiếu codegraph vẫn chạy bằng grep và `git ls-files`, hook chỉ báo một dòng "máy thiếu: codegraph".

Playwright MCP là trình duyệt thật. Gói `@playwright/mcp` được ghim trong `package.json` và `package-lock.json` nên Claude Code tự cài khi cài plugin từ GitHub; `setup.js` kéo bản mới mỗi 7 ngày, `pw.js` ưu tiên bản đó, và máy không có Chrome thì tự cài Chromium. Hồ sơ trình duyệt riêng cho từng dự án, đặt ngoài repo ở `~/.claude/plugins/data/sp-solo-prompts/browser/<dự án>-<hash>` (không commit nhầm cookie, không bị OneDrive đồng bộ), nên đăng nhập một lần là các phiên sau dùng lại. Agent dùng nó khi fetch bị chặn hoặc site chặn bot (Scholar, X, LinkedIn), khi cần đăng nhập, khi xác minh trích dẫn (`✓tđ`, `≈tđ`, `✗tđ` trên dòng nguồn) và khi kiểm UI web, đọc trang bằng `browser_evaluate` innerText cho đỡ token. Gặp đăng nhập, captcha hay 2FA, agent trả `CHẶN: CẦN NGƯỜI`, Opus mở đúng trang trên máy bạn và hỏi một lần; site đã đăng nhập ghi ở `.ai/trinh_duyet.md` (không ghi mật khẩu). Chi tiết: `skills/nghien-cuu/tham-chieu/trinh_duyet.md`. Biến tùy chọn: `SP_PW_HEADLESS=1` (không cửa sổ; Linux không màn hình tự headless), `SP_PW_BROWSER=msedge|chrome|chromium|firefox`, `SP_PROJECT` (ép thư mục dự án cho hồ sơ trình duyệt).

Với UI web, grunt kiểm bằng trình duyệt theo tiêu chí U#/B#, lỗi front-end được tái hiện trước khi sửa, và critic `code` mở trang xác nhận ít nhất một tiêu chí. `[!] cần người` là điểm dừng hợp lệ của `/goal` (in url rồi kết thúc, không đốt vòng), và `/sp:tiep-tuc` mở trang nhờ bạn thay vì debug. Triển khai thêm `.gitignore` cho `playwright-report/`, `test-results/`, `tests/acceptance/.auth/`; phiên bản builder đã tra được thì chép vào CLAUDE.md.

Có thể thêm arXiv bằng `claude mcp add arxiv -- uvx arxiv-mcp-server`. Plugin cố ý không dùng GitHub MCP (schema nặng, `gh` làm được) và Serena (trùng codegraph, GPL). Đã cân nhắc nhưng chưa làm: agent teams (tốn khoảng 7 lần token), output style ép buộc, orchestrator agent làm phiên chính, hook cắt output tool (dễ giấu lỗi), `context: fork` cho skill (fork không spawn được agent con). Hook từ v4.11 dựa trên tài liệu code.claude.com/docs, đọc ngày 2026-11-09.

### Bộ nhớ trong dự án

Quy mô tự suy, lấy mức cao nhất: S dưới 20 file và 1 đến 2 module; M từ 20 đến 200 file, hoặc 3 đến 8 module, hoặc có DB hay API ngoài; L trên 200 file, trên 8 module, hoặc từ 4 tích hợp ngoài, và chỉ tự tăng khi vượt trên 20%. Ghi theo sự kiện, không đợi "cuối phiên".

| File | Quy mô | Ai ghi | Nạp |
|---|---|---|---|
| `CLAUDE.md` ≤90 dòng: chế độ, quy mô, lệnh, giao thức điều phối, Cấu trúc, luật code, Quyết định, Gotchas | mọi | điều phối viên | tự nạp |
| `.ai/STATE.md` ≤40 dòng: việc, đang chạy, nhật ký, sức khỏe, chi phí, tiếp theo | mọi | điều phối viên | đầu phiên |
| `.ai/ref/` bản sao tham chiếu của plugin (kiến trúc, run file, bugfix, mốc, sức khỏe, sơ đồ, mẫu /goal, văn phong) | mọi | hook SessionStart | khi cần |
| `.ai/MAP.md` vai trò module ≤40 dòng; `.ai/MAP.auto.md` sinh bằng lệnh | M+ | điều phối viên; grunt | đầu phiên; khi cần |
| `.ai/brief.md`, `.ai/ke_hoach.md`, `.ai/no_ky_thuat.md` | M+ | điều phối viên | khi lập kế hoạch |
| `docs/kien_truc.md` (Mermaid), `docs/contracts/`, `docs/quyet_dinh/` (ADR), `.ai/reuse.md` | L | builder; điều phối viên | khi cần |
| `.ai/findings.md`, `.ai/so_cai.md`, `.ai/runs/` + `INDEX.md`, `SPEC.md`, `tests/acceptance/` | nghiên cứu, triển khai | điều phối viên; scout | đầu phiên (findings); grep |

Các quy tắc của v3.1 nay nằm ở nơi được thực thi: kiến trúc 4 tầng ở `.ai/ref/kien_truc.md` và `sp:builder`, run file ở `run_file.md` (ngưỡng tách 300 dòng), `system_map` thành `MAP.md` cộng `MAP.auto.md`, quy tắc 70% và dead code ở cổng của builder cùng grunt quét, bugfix ở `bugfix.md`, mốc ở `moc.md`, nhánh và commit ở `sp:xay-dung`. Bỏ có chủ đích: mốc 5/15/30 phút, hỏi ba câu quy mô, `bo_nho_phien`, `roadmap`, `du_an_config`, `agent_rules` và tự merge PR.

## Số đo

Token cố định giảm mạnh (đo bằng `claude plugin details sp@solo-prompts`, v3.1 quy đổi cùng tỷ lệ khoảng 2.1 byte/token). Dòng "luôn có" đo trước khi thêm `sp:viet` và `sp:writer`, nên hiện cao hơn một chút.

| | v3.1 | v4 |
|---|---|---|
| Luôn có trong mọi phiên | 0 | ~1.1k (mô tả 6 skill + 4 agent) |
| Khởi tạo | dán KHOI_TAO ~17k | `khoi-tao` ~3k + skill chế độ 2–3k |
| Phiên hằng ngày | dán TIEP_TUC ~8.3k + đọc 3–10 file | `tiep-tuc` ~1.3k + skill chế độ 2–3k + CLAUDE.md/STATE ~2k |
| Làm 1 task | dán THUC_THI ~11.5k | 0 thêm |
| Quy tắc vai | lặp trong mọi prompt | system prompt của agent (0.4–0.9k) |

### Khi nào không cần sp (A/B ngày 2026-11-05)

Cùng đề CLI demtu, chấm bằng 12 test ẩn (NFD, CRLF, BOM, file một dòng 30MB, sai encoding, file thiếu), Opus một mình đạt 12/12 với $0.32 đến $0.38, còn sp đạt 12/12 với $0.66 đến $0.69. Ở v4.10.0, `/sp:khoi-tao` tự chọn TRỰC TIẾP: 12/12, $0.43, không tạo `.ai/`.

Việc rủi ro thật thì ngược lại. Với bài gộp trùng CSV khách hàng thật (đề cố ý mô tả thiếu, 12 test ẩn: số điện thoại nhiều định dạng, BOM, CRLF, NFD, dòng trống, trùng bắc cầu, 200k dòng…), Opus một mình được 10/12 ở cả hai lần ($0.34 đến $0.35), cùng sót dòng trống và traceback khi thiếu file. sp được 12/12 ở cả hai lần ($1.35 đến $1.53) nhờ 3 scout phân kỳ và critic. Việc có dữ liệu hay người dùng thật thì sp đáng thêm khoảng $1.

Với tài liệu, cùng đề viết `docs/huong_dan.md` cho `dedup.py`: bản 4.14 ra 921 từ với 28 chỗ in đậm, 31 trên 41 dòng là gạch đầu dòng và 12 tiêu đề ($0.53); bản 4.15, có `sp:writer` và `lint_van.js`, ra 1008 từ, 0 in đậm, lint 0 cờ ($0.46). Một đề, một lần chạy mỗi bản.

### Đo theo từng bản (2026-10-31, đề XD "CLI demtu", `claude -p`, Opus điều phối)

| Bản | Haiku | Sonnet | Lượt Opus | Opus $ | Tổng $ | Ghi chú |
|---|---|---|---|---|---|---|
| 4.5.0 | 0 | 1 | — | — | 1.00 | Opus tự chạy test, không phân kỳ, bỏ critic |
| 4.5.2 | 4 | 3 | — | 1.85 | 2.61 | luật cứng; critic bắt 2 lỗi thật, 7 lên 37 test |
| 4.5.3 | 6 | 3 | 35 | 1.84 | 2.68 | 6 lượt Opus chỉ để ghi log |
| 4.6.0 | 5 | 3 | 29 | 1.50 | 2.13 | ghi sổ gộp, spawn cùng lượt |

Các lần chạy sau: TK từ kết quả nghiên cứu có lệnh tái lập, 13 test xanh, $1.84. Luồng phụ (từ ghép tiếng Việt) giữ XÂY DỰNG, H1 đạt F1=0.885 dưới ngưỡng 0.90 nên `failing`, rồi đối chứng oracle (0.985) và ablation dẫn tới mở H3. NC với giả thuyết sai thật đi đến `refuted` kèm bài học, $1.58. v4.7.1: NC $0.98 + $1.70 với `lint_so_cai.js` 0 lỗi; luồng phụ khôi phục 2 agent chết từ STATE và `PARKED` H3.1, $3.08. v4.8.1: việc NHẸ $0.77, XD đầy đủ $2.86 (47 test). v4.9.0: `guard.js` chặn pytest của phiên chính trong phiên thật; việc NHẸ $0.70, XD đầy đủ $3.49, dao động $2.1 đến $3.5 giữa các lần.

Công cụ MCP, đo mỗi phép một phiên haiku với câu trả lời đúng như nhau: ngày 2026-10-31, Context7 $0.023 so với $0.060 của WebFetch trên 3 câu docs (rẻ hơn ~62%), Exa $0.022 so với $0.072 của WebSearch trên 2 câu (rẻ hơn ~70%); đo lại ở v4.8.1 cho ~57% (7 câu) và ~73% (5 câu).

## Giới hạn đã biết

Context7 và Exa mới đo trên 5 câu hỏi, mẫu nhỏ nên kết quả có thể khác, và free tier của Exa có thể giới hạn khi dùng nhiều. Ngân sách theo đơn vị giá (400k và 800k) và trần phân kỳ là điểm xuất phát, cần chỉnh theo `.ai/chi_phi.log`. Chưa chạy trọn một dự án thật bằng v4; các ngưỡng (tối đa 3 agent nền, 80/40/60 dòng, trần vòng) cũng là điểm xuất phát, nên chỉnh theo log sau 2 đến 3 phiên. Chưa A/B test với v3.1 trên cùng một đề. Máy không có MCP codegraph thì agent dùng CLI hoặc grep thay cho `mcp__codegraph__codegraph_explore`.

Ghi công: phân biệt phiên chính và agent con bằng `agent_id`, brief đầu phiên, kickoff nhẹ và số đo giới hạn codegraph lấy từ plugin crew của [HYPIAN](https://github.com/TianAn2411/HYPIAN) (An Thien Truong, MIT). Không lấy memory DB, daemon và đa vai trò (nặng, chưa thử trên Windows, ở quy mô solo chỉ ngang grep theo số đo của họ).

## Changelog

- 4.17.1: hook ép mọi agent sp spawn từ phiên chính chạy foreground (`run_in_background: false`); nhiều Agent trong cùng một lượt vẫn chạy song song. Lý do đo được: khi chạy nền, Opus tốn thêm các lượt chỉ có chữ để chờ, rồi một lượt thức dậy mỗi khi agent báo xong. Trên đề trộn 5 việc, hai lần chạy nền tốn 15 và 23 lượt gọi Opus ($1.30 và $1.72), còn hai lần foreground tốn 9 và 6 lượt ($1.15 và $0.82). Như vậy số lượt giảm khoảng 60% và chi phí khoảng 35%, mà vẫn đủ phân kỳ, test, critic và tài liệu lint 0 cờ. Đặt `SP_BACKGROUND=1` để tắt.
- 4.17: đã nghiên cứu [context-mode](https://github.com/mksglu/context-mode) và quyết định không tích hợp. Đo trên 9 transcript thật, output tool trả về phiên chính chỉ chiếm dưới 4% chi phí, vì grunt và scout đã ghi chi tiết ra `.ai/runs/`. Chi phí thật là số lượt Opus (khoảng $0.04 mỗi lượt) và context nền. Context-mode còn làm hỏng agent con (issue #1342, #1343 đang mở), viết lại output của codegraph và Context7, cần Node 24 và dùng giấy phép ELv2. Bản này gỡ `.ai/` khỏi repo, cho gate nhận mọi dạng `KẾT:` của critic, nới gate grunt, bỏ Playwright khỏi builder, cho writer bỏ qua CLAUDE.md, và bỏ bảng định tuyến chép trong khuôn CLAUDE.md. Nó cũng vá hai lỗ hổng của `guard.js` (chữ "trực tiếp" bất kỳ trong STATE, chữ "bug" bất kỳ trong brief), thêm dòng `[sp kiểm file]` vào brief, và thêm test cú pháp cho mọi hook. Câu hướng dẫn tiết kiệm lượt trong bảng định tuyến chưa đổi được số lượt đo được (32 lượt, $1.30, so với $1.12 đến $1.21 trước đó, trong mức dao động).
- 4.16: bảng định tuyến duy nhất `hooks/dinh_tuyen.json`, được nạp vào mỗi phiên và sau khi nén, có test bắt buộc khai đủ agent. `guard.js` chặn phiên chính tự ghi file code và tự `curl` web, và chặn giao builder khi chưa phân kỳ, trừ khi brief ghi `PHÂN KỲ: bỏ qua — <lý do>`. Đo trên một đề trộn 5 việc, Opus giao đúng 5 loại agent ở cả hai bản. Bản 4.15 có Opus tự vá code sau critic, 5 lệnh tự chạy và không phân kỳ. Bản 4.16.2 có 0 lần tự vá code, 3 lệnh tự chạy, và bỏ phân kỳ có ghi lý do ($1.24 so với $1.26). Bản 4.16.3 chặn thêm lệnh chờ (`sleep`, `echo waiting`) và việc spawn agent chỉ để chờ. Đề thứ hai là sửa lỗi kèm postmortem. Ở đề này Opus giao đúng builder (TDD), critic, grunt (xác nhận đỏ rồi xanh), writer và critic `van_phong`, và không tự sửa code lần nào ($1.16). Bản 4.16.4 sửa nguyên nhân khiến builder bị gate trả về ở mọi lần chạy. Brief của Opus tự đặt `TRẢ VỀ` theo khuôn riêng, nên giờ hook nối thêm một câu giữ khuôn nhãn, và khuôn brief trong CLAUDE.md ghi `TRẢ VỀ` chỉ dành cho scout. Brief sửa lỗi được miễn chặn phân kỳ. Lần chạy lại cả hai đề: 0 lần gate trả về, 0 lần tự sửa code, 0 lần tự tra web; test đạt 7/7 và 3/3 ($1.10 mỗi đề). Bản 4.16.6 bỏ lối "PHÂN KỲ: bỏ qua", vì Opus dùng nó cả cho tính năng mới. Bản này cũng chặn phiên chính tự viết tài liệu dài (giao `sp:writer`), nối câu giữ khuôn vào mọi SendMessage, và không còn coi thân heredoc là lệnh test. Lần chạy ba đề song song (trộn 5 việc, sửa lỗi kèm postmortem, tối ưu hiệu năng) đều giao đúng agent, có file phân kỳ ở hai đề việc mới, tài liệu của writer lint 0 cờ ở cả ba, test đạt hết. Không có lần nào Opus tự sửa code, tự tra web, tự viết tài liệu hay bị gate trả về. Chi phí $1.12, $0.69, $1.72.
- 4.15: thêm `/sp:viet`, `sp:writer`, critic `van_phong`, hook `lint_van.js` và `van_phong_tu.json`.
- 4.14: trình duyệt thật cho mọi quy trình, `stat.js`, sửa `effort.js`, `guard.js`, `setup.js`.
- 4.13: Playwright MCP đi kèm, `browser.js`, `CHẶN: CẦN NGƯỜI`.
- 4.12: `effort.js` tự đặt effort theo brief.
- 4.11: `gate.js`, mở rộng `probe.js`, `omitClaudeMd` cho scout và grunt.
- 4.10: mức TRỰC TIẾP, VỪA, ĐẦY ĐỦ.
- 4.9: `guard.js` và ý tích hợp từ HYPIAN.
- 4.5 đến 4.8: phân kỳ, grunt, critic, `lint_so_cai.js`, Context7, Exa, luồng phụ.
