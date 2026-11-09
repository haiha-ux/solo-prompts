// node --test hooks/dinh_tuyen.test.js — chống "thêm agent mà quên khai ở chỗ điều phối viên đọc"
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const table = JSON.parse(fs.readFileSync(path.join(__dirname, 'dinh_tuyen.json'), 'utf8')).agents;
const agents = fs.readdirSync(path.join(root, 'agents')).filter((f) => f.endsWith('.md')).map((f) => {
  const s = fs.readFileSync(path.join(root, 'agents', f), 'utf8');
  return { name: 'sp:' + (s.match(/^name:\s*(\S+)/m) || [])[1], model: (s.match(/^model:\s*(\S+)/m) || [])[1] };
});

test('mọi agent có dòng định tuyến, đúng model', () => {
  for (const a of agents) {
    const row = table.find((r) => r.agent === a.name);
    assert.ok(row, `${a.name} thiếu trong hooks/dinh_tuyen.json`);
    assert.strictEqual(row.model, a.model, `${a.name}: model trong bảng ≠ frontmatter`);
    assert.ok(row.giao && row.khong, `${a.name}: thiếu giao/khong`);
  }
  for (const r of table) assert.ok(agents.some((a) => a.name === r.agent), `${r.agent} trong bảng nhưng không có agents/*.md`);
});
test('văn bản điều phối nhắc đủ mọi agent', () => {
  for (const f of ['skills/khoi-tao/SKILL.md', 'skills/khoi-tao/tham-chieu/khuon.md', 'hooks/guard.js', 'README.md']) {
    const s = fs.readFileSync(path.join(root, f), 'utf8');
    for (const a of agents) assert.ok(s.includes(a.name), `${f} không nhắc ${a.name}`);
  }
});
