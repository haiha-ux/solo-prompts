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
// Brief đầu phiên (ý tưởng sp_brief của crew/HYPIAN, đo: resume rẻ hơn ~26%): đưa sẵn STATE + git + findings → skill không phải `cat` lại.
if (['startup', 'resume', 'clear', ''].includes(input.source || '')) {
  const cap = (t, n) => (t.length > n ? t.slice(0, n) + '\n…(cắt)' : t);
  const rdf = (p) => { try { return fs.readFileSync(path.join(project, p), 'utf8').replace(/\r\n/g, '\n'); } catch { return ''; } };
  const git = (a) => { try { return execSync('git ' + a, { cwd: project, encoding: 'utf8', timeout: 3000, stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return ''; } };
  const state = rdf('.ai/STATE.md');
  const st = state.length > 4000 ? state.slice(0, 1500) + '\n…(lược giữa)…\n' + state.slice(-2400) : state;
  const lg = git('log --oneline -5'), gs = git('status --short');
  let b = '[sp brief — đã nạp sẵn, KHÔNG cat lại]\n## .ai/STATE.md\n' + st +
    (lg ? '\n## git log -5\n' + lg : '') + (gs ? '\n## git status --short\n' + cap(gs, 1200) : '');
  if (/NGHIÊN CỨU|Luồng phụ: NC/.test(state)) b += '\n## .ai/findings.md\n' + cap(rdf('.ai/findings.md'), 2500);
  notes.push(cap(b, 8000));
}
if (input.source === 'compact') {
  let mode = '';
  try { mode = (fs.readFileSync(path.join(project, '.ai', 'STATE.md'), 'utf8').match(/Chế độ:\s*([^\n]*?)(?:\s{2,}|$)/m) || [])[1] || ''; } catch { /* bỏ qua */ }
  notes.push(`[sp] context vừa nén (chế độ: ${mode || '?'}): đọc lại .ai/STATE.md rồi GỌI LẠI skill của chế độ trước khi làm tiếp. LUẬT CỨNG còn hiệu lực: không tự chạy test/đo/thí nghiệm (→ sp:grunt) · không tự search (→ sp:scout) · phân kỳ trước việc đầu mốc/đóng khung giả thuyết · critic kết mốc · chạm kill → failing + phân tích thất bại trước khi refuted.`);
}
if (notes.length) console.log(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: notes.join('\n') } }));
