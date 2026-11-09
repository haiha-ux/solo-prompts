// node --test hooks/effort.test.js
const test = require('node:test');
const assert = require('node:assert');
const { decide } = require('./effort.js');
const e = (t, p, x) => (decide(t, p, x) || {}).effort || null;

test('critic', () => {
  assert.strictEqual(e('sp:critic', 'CHẾ ĐỘ: code\nVÀO: diff'), null);            // frontmatter high
  assert.strictEqual(e('sp:critic', 'CHẾ ĐỘ: that_bai\nH3 kill'), 'xhigh');
  assert.strictEqual(e('sp:critic', 'CHẾ ĐỘ: loi\nLƯỢT: 2'), 'xhigh');
  assert.strictEqual(e('sp:critic', 'CHẾ ĐỘ: loi'), null);
  assert.strictEqual(e('sp:critic', 'CHẾ ĐỘ: `suc_khoe`'), 'medium');
  assert.strictEqual(e('sp:critic', 'CHẾ ĐỘ: code\nLƯỢT: 2\nBLOCK cũ: 1'), 'medium');
  assert.strictEqual(e('sp:critic', 'CHẾ ĐỘ: code\nLƯỢT: 2\nBLOCK AN TOÀN: sql injection'), null);
  assert.strictEqual(e('sp:critic', 'CHẾ ĐỘ: code', 'low'), 'high');               // không được hạ
  assert.strictEqual(e('sp:critic', 'CHẾ ĐỘ: code', 'xhigh'), null);              // nâng: giữ nguyên lời gọi
  assert.strictEqual(e('sp:critic', 'CHẾ ĐỘ: suc_khoe', 'medium'), null);
});
test('builder', () => {
  assert.strictEqual(e('sp:builder', 'VIỆC: thêm route'), null);
  assert.strictEqual(e('sp:builder', 'VIỆC: sửa\nLƯỢT: 3'), 'high');
  assert.strictEqual(e('sp:builder', 'dựng thi_nghiem/E2/ run.py'), 'high');
  assert.strictEqual(e('sp:builder', 'VIỆC: đăng nhập auth JWT'), 'high');
  assert.strictEqual(e('sp:builder', 'LƯỢT: 3', 'low'), null);                     // điều phối viên quyết
});
test('scout/grunt untouched', () => {
  assert.strictEqual(e('sp:scout', 'CHẾ ĐỘ: phan_ky'), null);
  assert.strictEqual(e('sp:grunt', 'LƯỢT: 3'), null);
});
