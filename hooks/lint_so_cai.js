// Kiểm sổ cái nghiên cứu .ai/so_cai.md + findings.md — tất định, chạy: node "<plugin>/hooks/lint_so_cai.js" [thư mục dự án]
// Thoát 0 = sạch, 1 = có lỗi (in từng lỗi). Dùng làm bằng chứng trong /goal.
const fs = require('fs');
const path = require('path');

const dir = path.resolve(process.argv[2] || process.cwd());
const ledger = path.join(dir, '.ai', 'so_cai.md');
const findings = path.join(dir, '.ai', 'findings.md');
if (!fs.existsSync(ledger)) { console.log('[lint] chưa có .ai/so_cai.md'); process.exit(0); }

const errs = [];
const H = {}, F = new Set(), lastV = {};
const lines = fs.readFileSync(ledger, 'utf8').replace(/\s+$/, '').split(/\r?\n/);
const STATUS = new Set(['open', 'failing', 'confirmed', 'refuted', 'parked']);
const fLine = {};
lines.forEach((l, i) => {
  const n = i + 1;
  let m;
  if ((m = l.match(/^(H\d+(?:\.\d+)?) \|/))) {
    H[m[1]] = n;
    if (!/kill:/.test(l)) errs.push(`dòng ${n}: ${m[1]} thiếu kill`);
    if (!/lõi:/.test(l) && !/parent:/.test(l)) errs.push(`dòng ${n}: ${m[1]} thiếu lõi:/phụ trợ:`);
    if (/parent:/.test(l) && !/dự đoán mới:/.test(l)) errs.push(`dòng ${n}: biến thể ${m[1]} thiếu "dự đoán mới:"`);
  } else if ((m = l.match(/^F\d+ \| (H\d+(?:\.\d+)?) \|/))) {
    F.add(m[1]); fLine[m[1]] = fLine[m[1]] || n;
  } else if ((m = l.match(/^V \| (H\d+(?:\.\d+)?) \| (\w+)/))) {
    lastV[m[1]] = { status: m[2], line: n, text: l };
    if (!STATUS.has(m[2])) errs.push(`dòng ${n}: trạng thái "${m[2]}" không hợp lệ (open|failing|confirmed|refuted|parked)`);
    if (!H[m[1]]) errs.push(`dòng ${n}: V cho ${m[1]} nhưng chưa có dòng H`);
  } else if (l.trim() && /^\s*[HhEeVvFf]\s*\d*\s*\|?/.test(l) && !/^(E\d+|H\d|V \||F\d)/.test(l)) {
    errs.push(`dòng ${n}: sai định dạng (bắt đầu phải là H<n> | / E<n> | / V | / F<n> |)`);
  }
});
for (const [h, v] of Object.entries(lastV)) {
  if (v.status === 'refuted') {
    if (!F.has(h)) errs.push(`dòng ${v.line}: ${h} refuted mà KHÔNG có dòng F (phải phân tích thất bại trước)`);
    else if (fLine[h] > v.line) errs.push(`dòng ${v.line}: ${h} refuted TRƯỚC khi có dòng F (dòng ${fLine[h]})`);
    if (!/lesson:/.test(v.text)) errs.push(`dòng ${v.line}: ${h} refuted thiếu lesson:`);
  }
  if (v.status === 'failing' && !F.has(h)) errs.push(`${h}: đang failing nhưng chưa có dòng F`);
}
const variants = {};
for (const h of Object.keys(H)) { const p = h.split('.')[0]; if (h.includes('.')) { variants[p] = (variants[p] || 0) + 1; if (!H[p]) errs.push(`biến thể ${h}: không có dòng H cha ${p}`); } }
for (const [p, k] of Object.entries(variants)) if (k > 3) errs.push(`${p}: ${k} biến thể (> 3)`);
if (fs.existsSync(findings)) {
  const c = fs.readFileSync(findings, 'utf8').replace(/\s+$/, '').split(/\r?\n/).length;
  if (c > 60) errs.push(`findings.md ${c} dòng (> 60)`);
}
const open = Object.keys(H).filter((h) => !lastV[h]).length;
const st = Object.values(lastV).reduce((a, v) => ((a[v.status] = (a[v.status] || 0) + 1), a), {});
console.log(`[lint] H=${Object.keys(H).length} (chưa phán ${open}) · ${JSON.stringify(st)} · F=${F.size} · lỗi=${errs.length}`);
errs.forEach((e) => console.log('  ✗ ' + e));
process.exit(errs.length ? 1 : 0);
