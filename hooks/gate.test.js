// node --test hooks/gate.test.js
const test = require('node:test');
const assert = require('node:assert');
const { check } = require('./gate.js');

const FULL = `NHÁNH: feature/1 · COMMIT: abc123
TEST: đỏ 3 → xanh 12/12 · lệnh: pytest
TÁI DÙNG: không có tương đương
LIÊN KẾT: dedup.py ← run.py:3
PHẠM VI: sửa 2 file
CHECK: fallback 0 · quét sạch
MAP: không đổi module
REUSE/DOCS (L): không
GOTCHA/NỢ: không
CHẶN: không`;

test('builder', () => {
  assert.strictEqual(check('sp:builder', FULL), '');
  assert.match(check('sp:builder', FULL.replace(/^LIÊN KẾT.*\n/m, '')), /LIÊN KẾT/);
  assert.match(check('sp:builder', 'Done! All tests pass.'), /thiếu nhãn/);
  assert.strictEqual(check('sp:builder', 'CHẶN: THIẾU KIẾN THỨC: cách ký JWT'), '');
  assert.strictEqual(check('sp:builder', ''), '');
});
test('critic', () => {
  assert.strictEqual(check('sp:critic', 'KẾT: PASS'), '');
  assert.strictEqual(check('sp:critic', '**KẾT: BLOCK 2**\n[BLOCK] ...'), '');
  assert.match(check('sp:critic', 'Overall the code looks fine.\nKẾT: PASS'), /ĐẦU TIÊN/);
});
test('grunt', () => {
  assert.strictEqual(check('sp:grunt', 'OK 27/27 xanh [.ai/runs/t.md]'), '');
  assert.strictEqual(check('sp:grunt', 'Đã chạy xong.\nFAIL 2/27 | test_a: KeyError | RA:x.md'), '');
  assert.match(check('sp:grunt', 'Tests ran.\n' + 'x'.repeat(800)), /1 dòng/);
});
test('others pass', () => assert.strictEqual(check('sp:scout', 'anything'), ''));
