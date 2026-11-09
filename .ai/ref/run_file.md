# Run file ở root (đọc khi: dựng project, sửa bootstrap, tách startup/)

**Mục tiêu:** copy project sang máy khác → chạy 1 lệnh → chạy được, HOẶC biết chính xác thiếu gì.
1. ĐẶT Ở ROOT — `run.py` / `run.sh` / `run.js`… không nằm trong src/.
2. TỰ KIỂM: phiên bản runtime, packages, file cần (.env, config, DB file), service ngoài (DB, Redis, API).
3. TỰ SỬA khi an toàn: cài packages vào **venv/node_modules của project** (không cài global), tạo `.env` từ `.env.example`.
4. IN RÕ mọi thứ đã tự sửa; cái không sửa được → in thiếu gì + cách fix → thoát mã ≠ 0.
5. KHÔNG logic nghiệp vụ — chỉ bootstrap + start.
6. Có cờ `--check`: chỉ kiểm, không start (dùng cho test/CI/`/goal`).

~~~python
# run.py — mẫu, chỉnh theo stack
import os, subprocess, sys
from importlib import metadata

def check() -> list[str]:
    errs = []
    if sys.version_info < (3, 10): errs.append("Cần Python >= 3.10")
    if sys.prefix == sys.base_prefix: print("[!] Không chạy trong venv — khuyến nghị: python -m venv .venv")
    reqs = [l.split("==")[0].split(">=")[0].strip() for l in open("requirements.txt") if l.strip() and not l.startswith("#")]
    missing = [r for r in reqs if not _installed(r)]
    if missing:
        print(f"[!] Cài thiếu: {missing}")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
    if not os.path.exists(".env"):
        if os.path.exists(".env.example"):
            import shutil; shutil.copy(".env.example", ".env")
            errs.append(".env vừa tạo từ .env.example — điền giá trị rồi chạy lại")
        else: errs.append("Thiếu .env")
    # kiểm DB/service ngoài ở đây
    return errs

def _installed(name):
    try: metadata.version(name); return True
    except metadata.PackageNotFoundError: return False

if __name__ == "__main__":
    errs = check()
    for e in errs: print(f"[✗] {e}")
    if errs: sys.exit(1)
    if "--check" in sys.argv: print("[✓] OK"); sys.exit(0)
    from src.app import create_app
    create_app().run()
~~~
Node: `run.js` kiểm `process.versions.node`, `fs.existsSync('node_modules')` → `npm ci`, `.env` tương tự, rồi `require('./src/app').start()`.

**Tách khi >300 dòng code:**
~~~
run.py (<30 dòng)  →  from startup import bootstrap; app = bootstrap(); app.run()
startup/__init__.py   export bootstrap()
startup/checks.py     kiểm môi trường + deps
startup/config.py     load + validate config
startup/services.py   khởi tạo services → facades
~~~
