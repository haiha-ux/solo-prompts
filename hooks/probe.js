// sp plugin — SessionStart: đồng bộ .ai/ref, dò công cụ thiếu (chỉ lúc startup), nhắc sau khi nén context.
// Dùng tay: node probe.js --sync   (chép tham chiếu vào .ai/ref của thư mục hiện tại, kể cả khi chưa khởi tạo)
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, '..');
const force = process.argv.includes('--sync');

let input = {};
if (!force) {
  try { input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch { /* không có stdin */ }
}

// Gốc dự án = thư mục gần nhất (đi ngược lên) có .ai/STATE.md
function findProject(start) {
  for (let dir = path.resolve(start); ; dir = path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, '.ai', 'STATE.md'))) return dir;
    if (path.dirname(dir) === dir) return null;
  }
}

function syncRef(projectDir) {
  const ref = path.join(projectDir, '.ai', 'ref');
  fs.mkdirSync(ref, { recursive: true });
  let n = 0;
  for (const skill of fs.readdirSync(path.join(pluginRoot, 'skills'))) {
    const dir = path.join(pluginRoot, 'skills', skill, 'tham-chieu');
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) { fs.copyFileSync(path.join(dir, f), path.join(ref, f)); n++; }
  }
  return n;
}

if (force) { console.log(`[sp] đã chép ${syncRef(process.cwd())} file tham chiếu vào .ai/ref`); process.exit(0); }

const project = findProject(input.cwd || process.cwd());
if (!project) process.exit(0); // không phải dự án sp → im lặng, 0 token

try { syncRef(project); } catch { /* không chặn phiên */ }

const notes = [];
if ((input.source || 'startup') === 'startup') {
  const has = (c) => {
    try { execSync((process.platform === 'win32' ? 'where ' : 'command -v ') + c, { stdio: 'ignore' }); return true; }
    catch { return false; }
  };
  const missing = ['codegraph', 'gh'].filter((c) => !has(c));
  if (missing.length) notes.push(`[sp] máy thiếu: ${missing.join(', ')} → ${missing.includes('codegraph') ? 'dùng grep/git ls-files thay codegraph; ' : ''}${missing.includes('gh') ? 'không tạo PR/repo bằng gh.' : ''}`);
}
if (input.source === 'compact') notes.push('[sp] context vừa nén: đọc lại .ai/STATE.md rồi gọi lại skill của chế độ hiện tại trước khi làm tiếp.');
if (notes.length) console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: notes.join('\n') } }));
