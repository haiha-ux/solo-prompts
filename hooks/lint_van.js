// sp plugin — đo dấu hiệu "văn máy" (AI slop) trong tài liệu cho người đọc. Ngưỡng là điểm xuất phát, chỉnh theo tài liệu bạn cho là tốt.
//   CLI:  node lint_van.js <file.md> [--json]      → in các cờ + số dòng, thoát 0
//   Hook: PostToolUse Write|Edit (không đối số)    → file tài liệu vượt ngưỡng → báo lại cho agent vừa ghi (tối đa 2 lần/file/phiên)
// Không đo sổ máy đọc (.ai/, CLAUDE.md, skills/, agents/…). Mỗi cờ là gợi ý xem lại, không phải phán quyết.
const fs = require('fs');
const os = require('os');
const path = require('path');

const SKIP_RE = /(^|[\\/])(\.ai|\.claude|node_modules|skills|agents|\.git|memory)([\\/]|$)|(^|[\\/])(CLAUDE|SKILL|MEMORY|STATE|AGENTS)\.md$/i;
const DOC_RE = /\.(md|markdown|mdx|txt|rst)$/i;
const LIST_HEAVY_RE = /(CHANGELOG|SPEC|HISTORY|RELEASE|requirements|todo)[^\\/]*$/i;
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2705}\u{274C}]/u;

let PHRASES = { manh: [], thuong: [] };
try { PHRASES = JSON.parse(fs.readFileSync(path.join(__dirname, 'van_phong_tu.json'), 'utf8')); } catch { /* dùng rỗng */ }

function analyze(text, file = '') {
  const raw = String(text).replace(/\r\n/g, '\n').split('\n');
  const lines = []; let inCode = false;
  raw.forEach((l, i) => { if (/^\s*(```|~~~)/.test(l)) { inCode = !inCode; return; } if (!inCode) lines.push({ n: i + 1, t: l }); });
  const nonblank = lines.filter((l) => l.t.trim());
  const table = (l) => /^\s*\|/.test(l.t);
  const bullet = (l) => /^\s*([-*+]|\d+[.)])\s+/.test(l.t);
  const heading = (l) => /^\s*#{1,6}\s/.test(l.t);
  const prose = nonblank.filter((l) => !table(l) && !heading(l));
  const plain = prose.map((l) => l.t.replace(/`[^`]*`/g, ' X ').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')).join('\n');
  const words = (plain.match(/[\p{L}\p{N}]+/gu) || []).length || 1;
  const per = (n, k) => (n * k) / words;
  const at = (arr) => arr.slice(0, 3).map((l) => l.n).join(',');
  const flags = [];
  const listHeavy = LIST_HEAVY_RE.test(path.basename(file));

  const bl = prose.filter(bullet);
  if (!listHeavy && words >= 150 && bl.length / Math.max(prose.length, 1) > 0.4)
    flags.push(`gạch đầu dòng ${bl.length}/${prose.length} dòng (>40%) — ý cần lý do/quan hệ thì viết thành đoạn (dòng ${at(bl)})`);
  const shortBl = bl.filter((l) => (l.t.match(/[\p{L}\p{N}]+/gu) || []).length < 8);
  if (!listHeavy && bl.length >= 5 && shortBl.length / bl.length > 0.6)
    flags.push(`${shortBl.length}/${bl.length} gạch đầu dòng cụt (<8 từ) — gộp thành câu "A, B và C" hoặc thêm lý do (dòng ${at(shortBl)})`);

  const boldLines = nonblank.filter((l) => /\*\*[^*]+\*\*|__[^_]+__/.test(l.t));
  const boldCount = (nonblank.map((l) => l.t).join('\n').match(/\*\*[^*]+\*\*|__[^_]+__/g) || []).length;
  if (boldCount >= 3 && per(boldCount, 100) > 1)
    flags.push(`in đậm ${boldCount} chỗ (${per(boldCount, 100).toFixed(1)}/100 từ) — tối đa 1–2 chỗ cho cảnh báo thật (dòng ${at(boldLines)})`);

  const hs = nonblank.filter(heading);
  if (words < 300 && hs.length >= 2) flags.push(`${hs.length} tiêu đề cho tài liệu ${words} từ — dưới ~300 từ không cần tiêu đề (dòng ${at(hs)})`);
  else if (hs.length >= 3 && words / hs.length < 60) flags.push(`${hs.length} tiêu đề, ~${Math.round(words / hs.length)} từ/mục — mục quá vụn, gộp lại`);
  const titleCase = hs.filter((l) => { const w = l.t.replace(/^\s*#+\s*/, '').split(/\s+/).filter((x) => /^\p{L}/u.test(x)); return w.length >= 3 && w.every((x) => /^\p{Lu}/u.test(x)); });
  if (titleCase.length) flags.push(`tiêu đề Viết Hoa Mọi Chữ — chỉ hoa chữ đầu và tên riêng (dòng ${at(titleCase)})`);

  const label = prose.filter((l) => /^\s*([-*+]\s+)?(\*\*)?[^:*\n]{1,32}(\*\*)?\s*:\s+\S/.test(l.t) && !/^\s*(https?|[A-Z]:\\)/.test(l.t));
  if (prose.length >= 6 && label.length / prose.length > 0.3)
    flags.push(`${label.length}/${prose.length} dòng dạng nhãn "X: Y" — viết câu có chủ ngữ, động từ (dòng ${at(label)})`);

  const dashLines = prose.filter((l) => /\S\s?—\s?\S|\S\s–\s\S|[\p{L}\p{N}]\s-\s[\p{L}\p{N}]/u.test(l.t.replace(/^\s*[-*+]\s+/, '')));
  const dashes = dashLines.reduce((s, l) => s + (l.t.replace(/^\s*[-*+]\s+/, '').match(/—|\s–\s|[\p{L}\p{N}]\s-\s[\p{L}\p{N}]/gu) || []).length, 0);
  if (dashes >= 2 && per(dashes, 1000) > 3)
    flags.push(`gạch ngang giữa câu ${dashes} lần (${per(dashes, 1000).toFixed(1)}/1000 từ; người viết ~2.5) — dùng dấu phẩy/chấm hoặc tách câu (dòng ${at(dashLines)})`);

  const emo = nonblank.filter((l) => EMOJI_RE.test(l.t.replace(/[✓✔✗✘]/g, '')));
  if (emo.length) flags.push(`emoji trong tài liệu (dòng ${at(emo)})`);

  let rows = 0, tables = [], start = 0;
  lines.concat([{ n: 0, t: '' }]).forEach((l) => {
    if (table(l)) { if (!rows) start = l.n; rows++; }
    else { if (rows && rows - 2 <= 2 && rows >= 3) tables.push(start); rows = 0; }
  });
  if (tables.length) flags.push(`bảng chỉ 1–2 dòng dữ liệu — viết thành câu (dòng ${tables.slice(0, 3).join(',')})`);

  const closer = nonblank.filter((l) => /^\s*(#+\s*)?(\*\*)?(tóm lại|tổng kết|kết luận|nhìn chung|tóm tắt|in summary|in conclusion|key takeaways|summary|conclusion)\b/i.test(l.t));
  if (closer.length) flags.push(`đoạn/mục kết kiểu "Tóm lại" — dừng khi đã nói xong, hoặc kết bằng việc cần làm tiếp (dòng ${at(closer)})`);
  const opener = nonblank.slice(0, 4).filter((l) => /(trong bối cảnh|trong thời đại|in today's|certainly|of course|chắc chắn rồi|câu hỏi hay)/i.test(l.t));
  if (opener.length) flags.push(`mở bài rào đón — câu đầu phải là kết luận/việc chính (dòng ${at(opener)})`);

  const low = plain.toLowerCase().replace(/"[^"\n]{0,200}"|“[^”\n]{0,200}”/g, ' '); // trích dẫn ví dụ không tính
  const hits = [];
  for (const [k, w] of [['manh', 3], ['thuong', 1]]) for (const p of PHRASES[k] || []) {
    const re = new RegExp('(^|[^\\p{L}])' + p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?=$|[^\\p{L}])', 'giu');
    const m = low.match(re); if (m) hits.push({ p, n: m.length, w });
  }
  const score = hits.reduce((s, h) => s + h.n * h.w, 0);
  if (score >= 3 && per(score, 1000) >= 4)
    flags.push(`cụm sáo: ${hits.sort((a, b) => b.w * b.n - a.w * a.n).slice(0, 6).map((h) => `"${h.p}"×${h.n}`).join(', ')} — viết lại câu bằng chi tiết cụ thể, đừng thay từ đồng nghĩa`);

  const neg = (low.match(/không (chỉ|những|phải)[^.!?\n]{1,80}(mà còn|mà là|mà)|not (just|only|merely)[^.!?\n]{1,80}but|it'?s not [^.!?\n]{1,60}it'?s/g) || []).length;
  if (neg >= 2 && neg * 500 / words > 1) flags.push(`"không chỉ… mà còn / không phải… mà là" ${neg} lần — nói thẳng điều khẳng định`);

  const spec = (plain.match(/\d+/g) || []).length + (lines.map((l) => l.t).join('\n').match(/`[^`]+`|\]\(|https?:\/\//g) || []).length;
  if (words >= 200 && per(spec, 100) < 1)
    flags.push(`ít chi tiết cụ thể (${spec} số/lệnh/đường dẫn cho ${words} từ) — thêm số đo, tên file, lệnh, ví dụ thật`);

  return { words, flags };
}

function hookMode() {
  let input = {};
  try { input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch { return; }
  const f = (input.tool_input || {}).file_path || (input.tool_input || {}).path;
  if (!f || !DOC_RE.test(f) || SKIP_RE.test(f.replace(/\\/g, '/')) || !fs.existsSync(f)) return;
  const { words, flags } = analyze(fs.readFileSync(f, 'utf8'), f);
  if (words < 120 || flags.length < 2) return;
  const cf = path.join(os.tmpdir(), `sp-van-${String(input.session_id || 'x').replace(/[^\w-]/g, '')}.json`);
  let c = {}; try { c = JSON.parse(fs.readFileSync(cf, 'utf8')); } catch { /* mới */ }
  c[f] = (c[f] || 0) + 1; try { fs.writeFileSync(cf, JSON.stringify(c)); } catch { /* bỏ qua */ }
  if (c[f] > 2) return; // đã nhắc 2 lần cho file này — không làm phiền thêm
  try { require('./stat.js').log(input.cwd, 'van_phong', input.agent_type || 'main', path.basename(f), flags.length); } catch { /* bỏ qua */ }
  const ref = fs.existsSync(path.join(input.cwd || '', '.ai', 'ref', 'van_phong.md')) ? '.ai/ref/van_phong.md' : path.join(__dirname, '..', 'skills', 'khoi-tao', 'tham-chieu', 'van_phong.md');
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PostToolUse',
    additionalContext: `[sp văn phong] ${path.basename(f)} có ${flags.length} dấu hiệu văn máy:\n- ${flags.join('\n- ')}\nSửa bằng cách viết lại cấu trúc (đoạn văn, chi tiết cụ thể), không thay từ đồng nghĩa; danh sách thật sự song song thì giữ. Hướng dẫn: ${ref}` } }));
}

if (require.main === module) {
  try {
    const file = process.argv[2];
    if (file && !file.startsWith('--')) {
      const r = analyze(fs.readFileSync(file, 'utf8'), file);
      if (process.argv.includes('--json')) console.log(JSON.stringify(r));
      else console.log(`${path.basename(file)}: ${r.words} từ, ${r.flags.length} cờ${r.flags.length ? '\n- ' + r.flags.join('\n- ') : ' — sạch'}`);
    } else hookMode();
  } catch { /* fail-open */ }
  process.exit(0);
}
module.exports = { analyze };
