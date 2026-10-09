# Kiến trúc & cấu trúc thư mục (đọc khi: dựng scaffold, tiếp quản repo, thêm module, critic báo vi phạm tầng)

## Mặc định: Service + Facade, 4 tầng (mọi hạ tầng: monolith, microservices, serverless)
~~~
TẦNG 4  RUN FILE (root, 1 file)  kiểm môi trường + deps + file/service cần → khởi tạo app. KHÔNG logic nghiệp vụ.
TẦNG 3  APP ENTRY (src/app|main) chỉ khởi tạo facade + gọi method.
TẦNG 2  FACADE                    gom service → 1 interface `facade.method()`; nhận config, quản lý lifecycle.
TẦNG 1  SERVICE                   1 class = 1 việc nghiệp vụ; độc lập, test riêng được.
NỀN     MODELS / UTILS            data + helper dùng chung.
~~~
**Luật luồng (critic BLOCK nếu vi phạm):** chỉ đi xuống `run → entry → facade → service → models/utils` ·
service KHÔNG import service · facade KHÔNG import facade · entry KHÔNG gọi service trực tiếp · run file KHÔNG chứa logic ·
logic mới → service mới → inject vào facade → facade import ở entry.

**Không dùng Service+Facade khi:** script <100 dòng (viết thẳng) · CLI nhỏ (commands + utils) · thư viện/package (chuẩn hệ sinh thái, không cần run file).
→ Ghi lý do vào CLAUDE.md mục Cấu trúc.

## Bố cục chuẩn của project (mọi thứ ở một chỗ)
~~~
du_an/
├── run.py | run.js | run.sh   ← tầng 4 (trừ thư viện/script)
├── startup/                   ← chỉ khi run file >300 dòng code
├── src/  app.py · facades/ · services/ · models/ · utils/   (microservices: + api/routes.py)
├── tests/            tests/acceptance/ ← từ nghiên cứu (TRIỂN KHAI)
├── thi_nghiem/E<n>/  ← thí nghiệm (NGHIÊN CỨU), mỗi cái 1 lệnh chạy
├── _spike/           ← thử nhanh, xóa sau khi xong
├── docs/             kien_truc.md · contracts/ · quyet_dinh/   (L)
├── .ai/              STATE.md · MAP.md · MAP.auto.md · brief.md · ke_hoach.md · no_ky_thuat.md · reuse.md
│                     findings.md · so_cai.md · runs/ · ref/ (bản sao tham chiếu của plugin — hook đồng bộ, KHÔNG commit: thêm `.ai/ref/` vào .gitignore)
├── CLAUDE.md · .env.example · requirements.txt|package.json|go.mod
└── .gitignore        ← `.env` · `.venv/` · `node_modules/` · `__pycache__/` · `dist/` · `build/` · `.codegraph/` · `.ai/chi_phi.log` · `.ai/runs/*-grunt-*.md` (log thô; run của scout/critic VẪN commit vì là bằng chứng); .gitattributes: `* text=auto eol=lf`
~~~
Microservices: mỗi service 1 repo/container cùng khung; API client NẰM TRONG facade (code gọi facade không biết bên dưới là import hay mạng) + retry/timeout/circuit breaker ở đó. Chỉ chọn khi quy mô L và cần scale/deploy riêng.

## Quy mô → file quản lý
Điều phối viên tự suy (lấy mức cao nhất), ghi `Quy mô:` trong CLAUDE.md. Chỉ TỰ tăng bậc khi vượt ngưỡng >20% (tránh dao động); giảm bậc → hỏi user.
| Quy mô | Tiêu chí | File quản lý thêm |
|---|---|---|
| S | <20 file code, 1–2 module, không tích hợp ngoài | — (vai trò module nằm trong CLAUDE.md Cấu trúc ≤8 dòng; việc/mốc nằm trong STATE) |
| M | 20–200 file, hoặc 3–8 module, hoặc có DB/API ngoài | `.ai/MAP.md` + `.ai/MAP.auto.md` · `.ai/brief.md` · `.ai/ke_hoach.md` · `.ai/no_ky_thuat.md` |
| L | >200 file, hoặc >8 module, hoặc ≥4 tích hợp ngoài | + `docs/kien_truc.md` · `docs/contracts/` · `docs/quyet_dinh/` · `.ai/reuse.md` |

## Bản đồ hệ thống (M+) — 2 file, mỗi file 1 chủ
**`.ai/MAP.md`** — VAI TRÒ, điều phối viên ghi (từ dòng `MAP:` builder đề xuất), đọc đầu mỗi phiên, ≤40 dòng, cấp module:
~~~
run.py | tầng 4 | check deps → start
src/facades/ | tầng 2 | UserFacade(auth, db), OrderFacade(db, payment)
src/services/ | tầng 1 | nghiệp vụ, mỗi file 1 việc: auth, db, payment
Luồng: run → src/app → user_facade → auth_service, db_service
~~~
**`.ai/MAP.auto.md`** — SINH BẰNG LỆNH, grunt ghi đè cả file, không ai sửa tay; builder/critic đọc khi cần chi tiết file:
~~~
git ls-files '*.py' '*.ts' '*.js' '*.go' | grep -v -E 'test|thi_nghiem|_spike'                        # cây file
git ls-files '*.py' | xargs grep -nE '^(class |def |async def )'                                          # Python public
git ls-files '*.ts' '*.js' | xargs grep -nE '^export (default )?(async )?(function|class|const)'         # JS/TS
git ls-files 'src/facades/*' 'src/services/*' | xargs grep -nE '^\s+(async )?def [a-z]|^\s+(async )?[a-z]\w*\(.*\)\s*\{'   # method public của facade/service
git ls-files '*.py' '*.ts' '*.js' | xargs grep -nE '^(from|import) |require\(' | grep -v node_modules     # luồng import
~~~
(L: chỉ giữ cấp thư mục + symbol của facade/service. Có codegraph → `codegraph` cho phần import/callers.)
**Đồng bộ:** sau mỗi việc `git diff --name-status <base>..HEAD | grep -E '^[ADR]'` có kết quả → grunt MAP. Đầu phiên: `git diff --name-status $(git log -1 --format=%h -- .ai/MAP.auto.md)..HEAD | grep -E '^[ADR]'` có kết quả → grunt MAP trước khi giao việc. Module trong MAP.auto mà thiếu trong MAP.md → điều phối viên thêm dòng vai trò.

## Run file quá dài → tách `startup/`
>300 dòng code (không tính comment/trống): `run.py` còn <30 dòng gọi `bootstrap()`; `startup/{checks,config,services}.py`, mỗi file 1 trách nhiệm, không logic nghiệp vụ. Mẫu: `run_file.md`.

## Debug theo tầng (xác định tầng TRƯỚC, không nhảy lung tung)
| Triệu chứng | Tầng | Kiểm |
|---|---|---|
| run file crash | 4 | deps / môi trường / .env / config thiếu |
| entry crash khi khởi tạo | 3 | config / params truyền vào facade |
| facade sai kết quả | 2 | gọi sai service, sai thứ tự, thiếu xử lý |
| service logic sai | 1 | test riêng service đó |
| data bất thường | nền | schema, validation, input |
| timeout/503 (microservices) | mạng | API client trong facade: URL, retry, auth |
| hành vi "lúc đúng lúc sai" | — | nghi fallback chồng: logic cũ chạy song song logic mới? test TỪNG nhánh |
