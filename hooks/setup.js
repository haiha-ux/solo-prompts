// sp plugin — SessionStart (async, chạy nền, không làm chậm phiên): tự cài / cập nhật công cụ bộ skill cần.
//  • codegraph: thiếu → npm i -g @colbymchenry/codegraph (Node ≥22.5) · có → `codegraph upgrade` mỗi 7 ngày · chưa đăng ký MCP → claude mcp add (user)
//  • Playwright MCP: thiếu gói → npm i vào ${CLAUDE_PLUGIN_DATA} · cập nhật mỗi 7 ngày · máy không có Chrome → cài Chromium của Playwright
// Kiểm tối đa 1 lần/ngày (dấu thời gian trong DATA/setup.json). Tắt: biến môi trường SP_NO_AUTOINSTALL=1. Mọi lỗi → ghi log, không chặn.
const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const root = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, '..');
const data = process.env.CLAUDE_PLUGIN_DATA || path.join(os.homedir(), '.claude', 'plugins', 'data', 'sp-solo-prompts');
const DAY = 864e5;
const force = process.argv.includes('--force');
const done = [], failed = [];

const sh = (cmd, t = 240e3) => execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', timeout: t, windowsHide: true });
const has = (c) => { try { sh((process.platform === 'win32' ? 'where ' : 'command -v ') + c, 10e3); return true; } catch { return false; } };
const step = (name, fn) => { try { const r = fn(); if (r) done.push(r); } catch (e) { failed.push(`${name}: ${String(e.stderr || e.message).trim().split('\n').pop().slice(0, 160)}`); } };
const nodeOk = () => { const [a, b] = process.versions.node.split('.').map(Number); return a > 22 || (a === 22 && b >= 5); };
const pwPkg = () => [root, data].map((b) => path.join(b, 'node_modules', '@playwright', 'mcp', 'package.json')).find((p) => fs.existsSync(p));
const hasChrome = () => require('./pw.js').hasChrome();

function main() {
  if (process.env.SP_NO_AUTOINSTALL === '1') return;
  fs.mkdirSync(data, { recursive: true });
  const stampF = path.join(data, 'setup.json');
  let st = {};
  try { st = JSON.parse(fs.readFileSync(stampF, 'utf8')); } catch { /* lần đầu */ }
  const now = Date.now();
  if (!force && now - (st.checked || 0) < DAY) return;
  const weekly = force || now - (st.upgraded || 0) > 7 * DAY;

  // codegraph
  step('codegraph', () => {
    if (!has('codegraph')) {
      if (!nodeOk()) throw new Error(`cần Node ≥22.5 (đang ${process.versions.node}) — cài Node mới rồi mở lại phiên`);
      sh('npm i -g @colbymchenry/codegraph@latest');
      return 'đã cài codegraph ' + sh('codegraph --version', 30e3).trim();
    }
    if (weekly) {
      const before = sh('codegraph --version', 30e3).trim();
      sh('codegraph upgrade');
      const after = sh('codegraph --version', 30e3).trim();
      return before !== after ? `codegraph ${before} → ${after}` : '';
    }
    return '';
  });
  step('codegraph MCP', () => {
    if (!has('codegraph') || !has('claude')) return '';
    let cfg = {};
    try { cfg = JSON.parse(fs.readFileSync(path.join(os.homedir(), '.claude.json'), 'utf8')); } catch { /* chưa có */ }
    if (cfg.mcpServers && cfg.mcpServers.codegraph) return '';
    sh('claude mcp add --scope user codegraph -- codegraph serve --mcp', 60e3);
    return 'đã đăng ký MCP codegraph (scope user, có hiệu lực từ phiên sau)';
  });

  // Playwright MCP + trình duyệt
  step('playwright-mcp', () => {
    if (pwPkg() && !weekly) return '';
    const inRoot = fs.existsSync(path.join(root, 'node_modules', '@playwright', 'mcp'));
    if (inRoot && !weekly) return '';
    const before = pwPkg() ? JSON.parse(fs.readFileSync(pwPkg(), 'utf8')).version : '';
    sh(`npm i --prefix "${data}" --no-audit --no-fund @playwright/mcp@latest`);
    const after = JSON.parse(fs.readFileSync(path.join(data, 'node_modules', '@playwright', 'mcp', 'package.json'), 'utf8')).version;
    return before === after ? '' : `Playwright MCP ${before || 'mới'} → ${after}`;
  });
  step('trình duyệt', () => {
    if (hasChrome() || (st.chromium && !weekly)) return ''; // bản Playwright mới cần bản Chromium mới → kiểm lại hằng tuần (đã có thì install bỏ qua nhanh)
    const cli = [root, data].map((b) => path.join(b, 'node_modules', 'playwright', 'cli.js')).find((p) => fs.existsSync(p));
    sh(cli ? `"${process.execPath}" "${cli}" install chromium` : 'npx -y playwright@latest install chromium');
    st.chromium = true;
    return 'máy không có Chrome → đã cài Chromium cho Playwright';
  });

  st.checked = now;
  if (weekly && !failed.length) st.upgraded = now; // lỗi → mai thử lại, không chờ 7 ngày
  fs.writeFileSync(stampF, JSON.stringify(st));
  const msg = [...done.map((d) => '✓ ' + d), ...failed.map((f) => '✗ ' + f)];
  try { fs.appendFileSync(path.join(data, 'setup.log'), `${new Date().toISOString()} ${msg.join(' | ') || 'ok'}\n`); } catch { /* bỏ qua */ }
  if (msg.length) console.log(JSON.stringify({ systemMessage: '[sp setup] ' + msg.join(' · ') }));
}

if (require.main === module) {
  try { main(); } catch { /* fail-open */ }
  process.exit(0);
}
