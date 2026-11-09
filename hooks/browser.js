// sp plugin — Playwright MCP: 1 trình duyệt dùng chung cho cả phiên (mọi agent cùng 1 server) → khóa theo agent.
// PreToolUse (mcp__plugin_sp_playwright__*): agent khác đang dùng (<90s) → từ chối, báo dùng Exa/WebFetch hoặc chờ.
// Phiên chính chỉ được mở/đóng trang (để nhờ user đăng nhập/captcha) — đọc/trích dẫn giao sp:scout.
// SubagentStop (--release): agent xong → nhả khóa. Mọi lỗi → cho qua.
const fs = require('fs');
const os = require('os');
const path = require('path');

const HOLD_MS = 90e3;
const MAIN_OK = /__(browser_navigate|browser_tabs|browser_close|browser_wait_for|browser_take_screenshot|browser_install)$/;
const lockFile = (s) => path.join(os.tmpdir(), `sp-browser-${String(s || 'x').replace(/[^\w-]/g, '')}.json`);
const read = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
const out = (o) => process.stdout.write(JSON.stringify(o));
const deny = (r) => out({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: r } });

// Trả lý do từ chối hoặc '' — tách riêng để test.
function decide(input, now, lock) {
  const who = input.agent_id || 'main';
  if (who === 'main' && !MAIN_OK.test(String(input.tool_name))) {
    return '[sp] điều phối viên chỉ mở/đóng trang trình duyệt (để nhờ user đăng nhập). Đọc trang, trích dẫn, tương tác → giao sp:scout (haiku).';
  }
  if (lock && lock.who !== who && now - lock.ts < HOLD_MS) {
    return `[sp] trình duyệt đang được ${lock.type || 'agent khác'} dùng. Làm phần không cần trình duyệt trước (Exa/WebFetch), thử lại sau ~1 phút; vẫn cần → trả \`CHẶN: CẦN TRÌNH DUYỆT: <url>\`.`;
  }
  return '';
}

function main() {
  let input = {};
  try { input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch { return; }
  const f = lockFile(input.session_id);
  const lock = read(f);
  if (process.argv.includes('--release')) {
    if (lock && lock.who === input.agent_id) fs.unlinkSync(f);
    return;
  }
  const now = Date.now();
  const r = decide(input, now, lock);
  if (r) return deny(r);
  fs.writeFileSync(f, JSON.stringify({ who: input.agent_id || 'main', type: input.agent_type || 'điều phối viên', ts: now }));
}

if (require.main === module) {
  try { main(); } catch { /* fail-open */ }
  process.exit(0);
}
module.exports = { decide, HOLD_MS };
