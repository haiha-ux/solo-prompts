// sp plugin — PreToolUse: biến LUẬT CỨNG thành ràng buộc thật (đo thật: luật dạng chữ bị Opus bỏ qua).
// Phiên CHÍNH (điều phối viên) của dự án sp không tự chạy test / tự search web → giao sp:grunt / sp:scout.
// Agent con (hook input có agent_id) luôn được qua. Ý tưởng phân biệt bằng agent_id: plugin "crew" (HYPIAN, MIT).
// Van thoát: cùng 1 lệnh test / cùng 1 truy vấn web bị chặn 2 lần → lần 3 cho qua (không làm kẹt phiên). Mọi lỗi → cho qua.
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

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
  const inner = s.match(/\b(?:bash|sh|cmd)\s+(?:-c|\/c)\s+(["'])([\s\S]*?)\1/);
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
function deny(reason) {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason } }));
}

function main() {
  const input = readInput();
  if (input.agent_id || String(input.transcript_path || '').replace(/\\/g, '/').includes('/subagents/')) return; // agent con
  if (!isSpProject(input.cwd)) return; // không phải dự án sp (việc TRỰC TIẾP / ngoài sp)
  const tool = input.tool_name;
  const ti = input.tool_input || {};
  if (tool === 'Bash' || tool === 'PowerShell') {
    const cmd = String(ti.command || '');
    if (!isTestCommand(cmd)) return;
    if (bump(input.session_id, 'test:' + h(cmd)) > 2) return; // van thoát theo đúng lệnh
    return deny('[sp] LUẬT CỨNG 1: điều phối viên không tự chạy test/kiểm chứng. Giao `sp:grunt` (haiku, rẻ ~1/40 Opus) chạy lệnh này và trả OK/FAIL + test hỏng. (Cùng lệnh bị chặn 2 lần thì lần 3 được qua.)');
  }
  if (WEB_TOOLS.has(tool)) {
    const target = ti.query || ti.url || ti.prompt || JSON.stringify(ti);
    if (bump(input.session_id, 'web:' + h(target)) > 2) return; // van thoát theo đúng truy vấn/URL
    return deny('[sp] LUẬT CỨNG: điều phối viên không tự search/fetch web. Spawn `sp:scout` (haiku) với brief MỤC TIÊU/VÀO/RA/DỪNG KHI; scout dùng Exa/Context7 và ghi nguồn vào .ai/runs/. (Cùng truy vấn/URL bị chặn 2 lần thì lần 3 được qua — dùng khi chỉ cần mở đúng 1 URL user đưa.)');
  }
}

if (require.main === module) {
  try { main(); } catch { /* fail-open */ }
  process.exit(0);
}
module.exports = { isTestCommand };
