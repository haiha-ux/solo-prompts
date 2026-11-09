// sp plugin — số liệu rẻ từ các hook (0 token Opus): append TSV vào <dự án>/.ai/hook_stats.log
//   ngày ISO \t sự kiện \t trường… (gate_block, deny_test, deny_web, deny_agent, effort, browser_deny)
// Bảo trì: `node "<plugin>/hooks/stat.js" --summary [thư mục dự án]` → đếm theo sự kiện + trường đầu, 30 ngày gần nhất.
const fs = require('fs');
const path = require('path');

function project(start) {
  for (let dir = path.resolve(start || process.cwd()); ; dir = path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, '.ai', 'STATE.md'))) return dir;
    if (path.dirname(dir) === dir) return null;
  }
}

function log(cwd, event, ...fields) {
  try {
    const p = project(cwd);
    if (!p) return;
    const f = path.join(p, '.ai', 'hook_stats.log');
    const clean = (x) => String(x == null ? '' : x).replace(/[\t\r\n]+/g, ' ').slice(0, 120);
    fs.appendFileSync(f, [new Date().toISOString().slice(0, 19), event, ...fields.map(clean)].join('\t') + '\n');
    if (fs.statSync(f).size > 64e3) { // giữ ~300 dòng mới nhất
      const lines = fs.readFileSync(f, 'utf8').trimEnd().split('\n');
      fs.writeFileSync(f, lines.slice(-300).join('\n') + '\n');
    }
  } catch { /* số liệu không bao giờ được làm hỏng hook */ }
}

function summary(dir) {
  const p = project(dir);
  const f = p && path.join(p, '.ai', 'hook_stats.log');
  if (!f || !fs.existsSync(f)) return 'hook_stats: chưa có số liệu';
  const since = new Date(Date.now() - 30 * 864e5).toISOString();
  const count = {};
  for (const l of fs.readFileSync(f, 'utf8').split('\n')) {
    const [ts, ev, a, b] = l.split('\t');
    if (!ev || ts < since) continue;
    const k = ev === 'effort' ? `${ev} ${a}→${b}` : `${ev} ${a || ''}`.trim();
    count[k] = (count[k] || 0) + 1;
  }
  const rows = Object.entries(count).sort((x, y) => y[1] - x[1]);
  return rows.length ? 'hook_stats 30 ngày:\n' + rows.map(([k, n]) => `${String(n).padStart(4)}  ${k}`).join('\n') : 'hook_stats: 30 ngày không có sự kiện';
}

if (require.main === module && process.argv.includes('--summary')) {
  console.log(summary(process.argv[process.argv.indexOf('--summary') + 1]));
}
module.exports = { log, summary };
