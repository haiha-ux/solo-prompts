// sp plugin — PreToolUse: biến LUẬT CỨNG thành ràng buộc thật (đo thật: luật dạng chữ bị Opus bỏ qua).
// Phiên CHÍNH (điều phối viên) của dự án sp không tự chạy test / tự search web → giao sp:grunt / sp:scout.
// Agent con (hook input có agent_id) luôn được qua. Ý tưởng phân biệt bằng agent_id: plugin "crew" (HYPIAN, MIT).
// Van thoát: cùng 1 lệnh test / cùng 1 truy vấn web bị chặn 2 lần → lần 3 cho qua (không làm kẹt phiên). Mọi lỗi → cho qua.
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const stat = require('./stat.js');

const OPUS_BUILTIN = new Set(['Explore', 'general-purpose', 'Plan']);
const WEB_TOOLS = new Set(['WebSearch', 'WebFetch', 'mcp__plugin_sp_exa__web_search_exa', 'mcp__plugin_sp_exa__web_fetch_exa']);
// Tiền tố được bóc trước khi xét lệnh: biến môi trường, timeout, trình bọc chạy lệnh.
const PREFIX_RE = /^(?:\w+=\S*\s+|env\s+|timeout\s+\S+\s+|(?:uv|poetry|pipenv|pdm|hatch)\s+run\s+|npx\s+|bunx\s+|pnpm\s+(?:exec|dlx)\s+|yarn\s+(?:exec|dlx)\s+|python3?(?:\.exe)?\s+-m\s+|py\s+-m\s+)+/;
const RUNNER_RE = /^(?:\.\/)?(?:pytest|py\.test|vitest|jest|mocha|ava|tox|nox|phpunit|rspec|ctest|unittest)(?:\.exe)?(?:\s|$)/;
const TOOL_TEST_RE = /^(?:\.\/)?(?:make|npm|pnpm|yarn|bun|deno|cargo|go|dotnet|mvn|gradle|gradlew|swift|mix|flutter|dart)(?:\.\w+)?\s+(?:run\s+)?(?:t|test(?::\S+)?|tests|nextest|verify|check)(?:\s|$)/;
const PLAYWRIGHT_RE = /^playwright\s+test(?:\s|$)/;
const PESTER_RE = /^invoke-pester\b/i;
const NODE_TEST_RE = /^(?:node|bun|deno)(?:\.exe)?\s+--test(?:\s|$)/;

function readInput() {
  try { return JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch { return {}; }
}
function isSpProject(start) {
  for (let dir = path.resolve(start || process.cwd()); ; dir = path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, '.ai', 'STATE.md'))) return true;
    if (path.dirname(dir) === dir) return false;
  }
}
// Lệnh có phải là CHẠY TEST không: bỏ chuỗi trong nháy, tách theo ; & | (, xét token đầu của từng đoạn.
function isTestCommand(cmd) {
  let s = String(cmd || '');
  const inner = s.match(/\b(?:bash|sh|cmd|pwsh|powershell)(?:\.exe)?\s+(?:-c|\/c|-Command)\s+(["'])([\s\S]*?)\1/i);
  if (inner) s += ' ; ' + inner[2];                       // bash -c "pytest" → xét cả nội dung
  s = s.replace(/"[^"]*"|'[^']*'/g, ' ');                  // echo "run pytest later" không tính
  for (let seg of s.split(/&&|\|\||[;|&\n()]/)) {
    seg = seg.trim().replace(PREFIX_RE, '').trim();
    if (!seg) continue;
    if (RUNNER_RE.test(seg) || TOOL_TEST_RE.test(seg) || PLAYWRIGHT_RE.test(seg) || PESTER_RE.test(seg) || NODE_TEST_RE.test(seg)) return true;
  }
  return false;
}
function bump(session, key) {
  const dir = os.tmpdir();
  const f = path.join(dir, `sp-guard-${String(session || 'x').replace(/[^\w-]/g, '')}.json`);
  let st = {};
  try { st = JSON.parse(fs.readFileSync(f, 'utf8')); } catch { /* mới */ }
  st[key] = (st[key] || 0) + 1;
  try { fs.writeFileSync(f, JSON.stringify(st)); } catch { /* bỏ qua */ }
  try { // dọn file đếm cũ > 7 ngày
    const now = Date.now();
    for (const n of fs.readdirSync(dir)) if (n.startsWith('sp-guard-')) {
      const p = path.join(dir, n);
      if (now - fs.statSync(p).mtimeMs > 7 * 864e5) fs.unlinkSync(p);
    }
  } catch { /* bỏ qua */ }
  return st[key];
}
const h = (x) => crypto.createHash('sha1').update(String(x)).digest('hex').slice(0, 12);
// File code (không phải .ai/, tài liệu, cấu hình) mà lệnh/tool này sẽ GHI — '' nếu không.
const CODE_EXT = 'py|pyi|js|mjs|cjs|ts|tsx|jsx|go|rs|java|kt|kts|c|cc|cpp|h|hpp|cs|rb|php|swift|scala|sh|ps1|sql|vue|svelte|dart|lua|r|jl';
const CODE_RE = new RegExp(`\\.(${CODE_EXT})$`, 'i');
const NOT_CODE_DIR = /(^|[\\/])(\.ai|\.claude|node_modules|\.git)[\\/]/;
function codeWriteTarget(tool, ti) {
  const isCode = (f) => f && CODE_RE.test(f) && !NOT_CODE_DIR.test(f.replace(/\\/g, '/') + '/');
  if (['Edit', 'Write', 'MultiEdit', 'NotebookEdit'].includes(tool)) {
    const f = String(ti.file_path || ti.notebook_path || '');
    return isCode(f) ? f : '';
  }
  if (tool !== 'Bash' && tool !== 'PowerShell') return '';
  const cmd = String(ti.command || '');
  const ext = `[\\w./\\\\-]+\\.(?:${CODE_EXT})\\b`;
  const pats = [
    new RegExp(`\\b(?:sed|perl)\\s+(?:-[a-zA-Z]*i[a-zA-Z]*|-pi)\\b[^|;&\\n]*?(${ext})`, 'i'),   // sed -i … file.py
    new RegExp(`(?:^|[^<>2&])>>?\\s*["']?(${ext})`, 'i'),                                       // > file.py
    new RegExp(`\\btee\\s+(?:-a\\s+)?["']?(${ext})`, 'i'),
    new RegExp(`(?:Set|Add|Out)-(?:Content|File)\\b[^|;\\n]*?(${ext})`, 'i'),
  ];
  for (const re of pats) { const m = cmd.match(re); if (m && isCode(m[1])) return m[1]; }
  // python/node heredoc tự mở file code để ghi: open('x.py', 'w') / writeFileSync('x.js'
  // open('x.py','w') / Path('x.py').write_text( / writeFileSync('x.js' — hoặc biến trỏ file code rồi .write(…) (heredoc sửa file đã đo thật)
  const direct = cmd.match(new RegExp(`open\\([^)]*?["'](${ext})["']\\s*,\\s*["'][wax]|(?:write_text|writeFileSync)\\([^)]*?["'](${ext})["']`, 'i'));
  if (direct && isCode(direct[1] || direct[2])) return direct[1] || direct[2];
  const viaVar = /open\([^)]*?,\s*["'][wax]|\.write_text\(|writeFileSync\(/.test(cmd) && cmd.match(new RegExp(`["'](${ext})["']`, 'i'));
  return viaVar && isCode(viaVar[1]) ? viaVar[1] : '';
}
function hasPhanKy(start) {
  for (let dir = path.resolve(start || process.cwd()); ; dir = path.dirname(dir)) {
    const ai = path.join(dir, '.ai');
    if (fs.existsSync(path.join(ai, 'STATE.md'))) {
      const st = fs.readFileSync(path.join(ai, 'STATE.md'), 'utf8');
      if (/trực tiếp/i.test(st)) return true;
      try { return fs.readdirSync(path.join(ai, 'phan_ky')).some((f) => f.endsWith('.md')); } catch { return false; }
    }
    if (path.dirname(dir) === dir) return true;
  }
}
function deny(reason) {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason } }));
}

function main() {
  const input = readInput();
  if (input.agent_id || String(input.transcript_path || '').replace(/\\/g, '/').includes('/subagents/')) return; // agent con
  if (!isSpProject(input.cwd)) return; // không phải dự án sp (việc TRỰC TIẾP / ngoài sp)
  const tool = input.tool_name;
  const ti = input.tool_input || {};
  const codeFile = codeWriteTarget(tool, ti);
  if (codeFile) {
    if (bump(input.session_id, 'code:' + h(codeFile)) > 2) return; // van thoát theo file (sửa 1 dòng gấp)
    stat.log(input.cwd, 'deny_code', path.basename(codeFile));
    return deny(`[sp] điều phối viên không tự sửa code (${path.basename(codeFile)}). Sửa sau critic BLOCK / test FAIL → SendMessage builder cũ kèm các điểm cần sửa (giữ context, có test đỏ trước); việc mới → spawn sp:builder. Được tự ghi: .ai/, CLAUDE.md, tài liệu .md, cấu hình. (Cùng file bị chặn 2 lần thì lần 3 được qua.)`);
  }
  if (tool === 'Bash' || tool === 'PowerShell') {
    const cmd = String(ti.command || '');
    // Đo thật (v4.16): Opus `echo waiting` / sleep để chờ agent nền — agent nền tự báo khi xong, lượt này là phí.
    if (/^\s*(sleep\s+\d+|Start-Sleep\b[^;|&]*|timeout\s+\/t\s+\d+|echo\s+["']?[^;|&\n]*(wait|chờ|đợi)[^;|&\n]*["']?)\s*$/i.test(cmd)) {
      stat.log(input.cwd, 'deny_wait');
      return deny('[sp] không cần chờ chủ động: agent nền tự gửi thông báo khi xong. Làm việc khác không phụ thuộc kết quả, hoặc kết thúc lượt.');
    }
    // Đo thật (v4.16): đã giao scout tra PyPI mà Opus vẫn tự curl → web qua lệnh shell cũng là tra web.
    const url = cmd.replace(/"[^"]*localhost[^"]*"|'[^']*localhost[^']*'/g, '').match(/\b(?:curl|wget|Invoke-WebRequest|Invoke-RestMethod|iwr|irm)\b[^|;&\n]*?(https?:\/\/(?!localhost|127\.0\.0\.1)[^\s"'|;)]+)/i);
    if (url) {
      if (bump(input.session_id, 'web:' + h(url[1])) > 2) return;
      stat.log(input.cwd, 'deny_web', 'shell');
      return deny('[sp] điều phối viên không tự tra web (kể cả curl/wget). Kết quả đã giao scout thì chờ scout; chưa giao → spawn sp:scout. localhost (kiểm dev server) được qua. (Cùng URL bị chặn 2 lần thì lần 3 được qua.)');
    }
    if (!isTestCommand(cmd)) return;
    if (bump(input.session_id, 'test:' + h(cmd)) > 2) return; // van thoát theo đúng lệnh
    stat.log(input.cwd, 'deny_test', cmd.slice(0, 60));
    return deny('[sp] LUẬT CỨNG 1: điều phối viên không tự chạy test/kiểm chứng. Giao `sp:grunt` (haiku, rẻ ~1/40 Opus) chạy lệnh này và trả OK/FAIL + test hỏng. (Cùng lệnh bị chặn 2 lần thì lần 3 được qua.)');
  }
  if (tool === 'Agent' || tool === 'Task') {
    // Agent dựng sẵn chạy trên model phiên chính (Opus) — docs sub-agents: Explore/Plan/general-purpose kế thừa model.
    if (!OPUS_BUILTIN.has(String(ti.subagent_type || 'general-purpose')) || /^(haiku|sonnet)$/i.test(String(ti.model || ''))) {
      const d = require('./effort.js').decide(ti.subagent_type, ti.prompt, ti.effort);
      if (d) stat.log(input.cwd, 'effort', ti.subagent_type, d.effort, d.why);
      if (/\b(wait|placeholder|chờ|đợi)\b/i.test(String(ti.description || '')) && String(ti.prompt || '').length < 400) {
        stat.log(input.cwd, 'deny_wait', ti.subagent_type);
        return deny('[sp] không spawn agent chỉ để chờ: agent nền tự báo khi xong. Kết thúc lượt hoặc làm việc khác.');
      }
      // Đo thật (v4.16): lời nhắc mềm bị bỏ qua, và van "lần 2 cho qua" bị Opus spawn lại ngay để lách.
      // → chỉ qua khi có file phân kỳ, hoặc brief ghi rõ quyết định bỏ: `PHÂN KỲ: bỏ qua — <lý do>` (được ghi vào số liệu).
      if (ti.subagent_type === 'sp:builder' && !hasPhanKy(input.cwd)) {
        const skip = String(ti.prompt || '').match(/PHÂN KỲ[\s*_`]*:[\s*_`]*bỏ qua\s*[—–:-]\s*(\S.{3,})/i);
        if (skip) stat.log(input.cwd, 'skip_phanky', skip[1].slice(0, 80));
        else {
          stat.log(input.cwd, 'deny_phanky');
          return deny('[sp] LUẬT CỨNG 2: chưa có .ai/phan_ky/ nào — việc đầu mốc cần phân kỳ TRƯỚC khi giao builder. Mức VỪA: spawn 1 sp:scout CHẾ ĐỘ phan_ky gộp 3 lăng kính (lỗi thực tế · đầu vào biên · pre-mortem) + #0, ghi .ai/phan_ky/<mốc>.md, đưa R#/B# vào brief builder. Chỉ khi thật sự không cần (vd sửa typo, đổi tên) mới thêm vào brief builder dòng `PHÂN KỲ: bỏ qua — <lý do cụ thể>`.');
        }
      }
      if (d) process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'allow', updatedInput: { ...ti, effort: d.effort }, additionalContext: `[sp effort] ${ti.subagent_type} → ${d.effort} (${d.why})` } }));
      return;
    }
    if (bump(input.session_id, 'agent:' + h(ti.description || ti.prompt)) > 2) return;
    stat.log(input.cwd, 'deny_agent', ti.subagent_type || 'general-purpose');
    return deny(`[sp] agent dựng sẵn "${ti.subagent_type || 'general-purpose'}" chạy trên Opus (đắt ~40× haiku). Dùng sp:scout (tìm/đọc/tra cứu), sp:grunt (lệnh), sp:builder (code), sp:critic (soát), sp:writer (tài liệu) — hoặc truyền model: "haiku"/"sonnet". (Bị chặn 2 lần cùng việc thì lần 3 được qua.)`);
  }
  if (WEB_TOOLS.has(tool)) {
    const target = ti.query || ti.url || ti.prompt || JSON.stringify(ti);
    if (bump(input.session_id, 'web:' + h(target)) > 2) return; // van thoát theo đúng truy vấn/URL
    stat.log(input.cwd, 'deny_web', tool);
    return deny('[sp] LUẬT CỨNG: điều phối viên không tự search/fetch web. Spawn `sp:scout` (haiku) với brief MỤC TIÊU/VÀO/RA/DỪNG KHI; scout dùng Exa/Context7 và ghi nguồn vào .ai/runs/. (Cùng truy vấn/URL bị chặn 2 lần thì lần 3 được qua — dùng khi chỉ cần mở đúng 1 URL user đưa.)');
  }
}

if (require.main === module) {
  try { main(); } catch { /* fail-open */ }
  process.exit(0);
}
module.exports = { isTestCommand, codeWriteTarget };
