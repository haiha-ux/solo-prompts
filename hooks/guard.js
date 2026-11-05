// sp plugin — PreToolUse: biến LUẬT CỨNG thành ràng buộc thật (đo thật: luật dạng chữ bị Opus bỏ qua).
// Phiên CHÍNH (điều phối viên) của dự án sp không tự chạy test / tự search web → giao sp:grunt / sp:scout.
// Agent con (hook input có agent_id) luôn được qua. Ý tưởng phân biệt bằng agent_id: plugin "crew" (HYPIAN, MIT).
// Van thoát: cùng 1 mục tiêu bị chặn 2 lần trong 1 phiên → lần 3 cho qua (không làm kẹt phiên). Mọi lỗi → cho qua.
const fs = require('fs');
const os = require('os');
const path = require('path');

const TEST_RE = /(^|[\s;&|(])(pytest|py\.test|python3?\s+-m\s+(pytest|unittest)|(npm|pnpm|yarn)\s+(run\s+)?test|npx\s+(vitest|jest|mocha)|vitest|jest|mocha|node\s+--test|go\s+test|cargo\s+test|dotnet\s+test|mvn\s+test|gradle\w*\s+test|phpunit|rspec|ctest)(\s|$|;|&|\|)/;
const WEB_TOOLS = new Set(['WebSearch', 'WebFetch', 'mcp__plugin_sp_exa__web_search_exa', 'mcp__plugin_sp_exa__web_fetch_exa']);

function readInput() {
  try { return JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch { return {}; }
}
function isSpProject(start) {
  for (let dir = path.resolve(start || process.cwd()); ; dir = path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, '.ai', 'STATE.md'))) return true;
    if (path.dirname(dir) === dir) return false;
  }
}
function bump(session, key) {
  const f = path.join(os.tmpdir(), `sp-guard-${String(session || 'x').replace(/[^\w-]/g, '')}.json`);
  let st = {};
  try { st = JSON.parse(fs.readFileSync(f, 'utf8')); } catch { /* mới */ }
  st[key] = (st[key] || 0) + 1;
  try { fs.writeFileSync(f, JSON.stringify(st)); } catch { /* bỏ qua */ }
  return st[key];
}
function deny(reason) {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason } }));
}

function main() {
  const input = readInput();
  if (input.agent_id || String(input.transcript_path || '').replace(/\\/g, '/').includes('/subagents/')) return; // agent con
  if (!isSpProject(input.cwd)) return; // không phải dự án sp
  const tool = input.tool_name;
  const ti = input.tool_input || {};
  if (tool === 'Bash' || tool === 'PowerShell') {
    const cmd = String(ti.command || '');
    if (!TEST_RE.test(cmd)) return;
    if (bump(input.session_id, 'test:' + cmd.slice(0, 120)) > 2) return; // van thoát
    return deny('[sp] LUẬT CỨNG 1: điều phối viên không tự chạy test/kiểm chứng. Giao `sp:grunt` (haiku, rẻ ~1/40 Opus) chạy lệnh này và trả OK/FAIL + đếm. (Cùng lệnh bị chặn 2 lần thì lần 3 được qua.)');
  }
  if (WEB_TOOLS.has(tool)) {
    if (bump(input.session_id, 'web:' + tool) > 2) return;
    return deny('[sp] LUẬT CỨNG: điều phối viên không tự search/fetch web. Spawn `sp:scout` (haiku) với brief MỤC TIÊU/VÀO/RA/DỪNG KHI; scout dùng Exa/Context7 và ghi nguồn vào .ai/runs/. (Bị chặn 2 lần thì lần 3 được qua — dùng khi chỉ cần mở đúng 1 URL user đưa.)');
  }
}

try { main(); } catch { /* fail-open */ }
process.exit(0);
