// sp plugin — khởi chạy Playwright MCP (stdio) với HỒ SƠ TRÌNH DUYỆT RIÊNG cho từng dự án.
// Hồ sơ (cookie/đăng nhập) để NGOÀI repo: ${CLAUDE_PLUGIN_DATA}/browser/<tên dự án>-<hash> → không commit nhầm, không bị OneDrive/Dropbox đồng bộ.
// Hồ sơ đang bị phiên Claude khác giữ → chạy --isolated (không đăng nhập) thay vì hỏng.
const { spawn } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const root = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, '..');
const data = process.env.CLAUDE_PLUGIN_DATA || path.join(os.homedir(), '.claude', 'plugins', 'data', 'sp-solo-prompts');
const project = path.resolve(process.env.SP_PROJECT || process.env.CLAUDE_PROJECT_DIR || process.cwd());

function profileDir() {
  const id = path.basename(project).replace(/[^\w.-]/g, '_').slice(0, 40) + '-' + crypto.createHash('sha1').update(project.toLowerCase()).digest('hex').slice(0, 8);
  return path.join(data, 'browser', id);
}
// Chrome giữ khóa hồ sơ: Windows = file "lockfile" bị mở (xóa được = khóa cũ), Linux/mac = symlink SingletonLock "host-pid".
function profileBusy(dir) {
  try {
    if (process.platform === 'win32') {
      const f = path.join(dir, 'lockfile');
      if (!fs.existsSync(f)) return false;
      try { fs.unlinkSync(f); return false; } catch { return true; }
    }
    const pid = Number(String(fs.readlinkSync(path.join(dir, 'SingletonLock'))).split('-').pop());
    try { process.kill(pid, 0); return true; } catch { return false; }
  } catch { return false; }
}
function hasChrome() {
  const c = process.platform === 'win32'
    ? [process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)'], process.env.LOCALAPPDATA].filter(Boolean).map((d) => path.join(d, 'Google', 'Chrome', 'Application', 'chrome.exe'))
    : process.platform === 'darwin' ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome']
      : ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/opt/google/chrome/chrome'];
  return c.some((p) => fs.existsSync(p));
}
// Gói @playwright/mcp: node_modules của plugin (cài khi cache plugin) → bản setup.js cài vào DATA → npx @latest.
function mcpCli() {
  for (const base of [data, root]) { // DATA = bản setup.js cập nhật hằng tuần (mới hơn); root = bản ghim trong package-lock (cài khi cache plugin)
    const p = path.join(base, 'node_modules', '@playwright', 'mcp', 'cli.js');
    if (fs.existsSync(p)) return [process.execPath, [p]];
  }
  return [process.platform === 'win32' ? 'npx.cmd' : 'npx', ['-y', '@playwright/mcp@latest']];
}

function buildArgs() {
  const dir = profileDir();
  const out = path.join(dir, '..', path.basename(dir) + '-out');
  const a = ['--output-dir', out, '--image-responses', 'omit'];
  const headless = /^(1|true|yes)$/i.test(process.env.SP_PW_HEADLESS || '') ||
    (process.platform === 'linux' && !process.env.DISPLAY && !process.env.WAYLAND_DISPLAY);
  if (headless) a.push('--headless');
  a.push('--browser', process.env.SP_PW_BROWSER || (hasChrome() ? 'chrome' : 'chromium'));
  fs.mkdirSync(dir, { recursive: true });
  if (profileBusy(dir)) { a.push('--isolated'); process.stderr.write(`[sp pw] hồ sơ ${dir} đang bị phiên khác dùng → chạy --isolated (không có đăng nhập đã lưu)\n`); }
  else a.push('--user-data-dir', dir);
  return a;
}

if (require.main === module) {
  if (process.argv.includes('--print')) { console.log(JSON.stringify({ profile: profileDir(), args: buildArgs(), cli: mcpCli() })); process.exit(0); }
  const [cmd, pre] = mcpCli();
  const child = spawn(cmd, [...pre, ...buildArgs()], { stdio: 'inherit', shell: cmd.endsWith('.cmd') });
  child.on('exit', (c) => process.exit(c ?? 0));
  for (const s of ['SIGINT', 'SIGTERM']) process.on(s, () => child.kill(s));
}
module.exports = { profileDir, hasChrome };
