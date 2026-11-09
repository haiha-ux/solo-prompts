// node --test hooks/browser.test.js
const test = require('node:test');
const assert = require('node:assert');
const { decide, HOLD_MS } = require('./browser.js');
const T = (n) => 'mcp__plugin_sp_playwright__' + n;

test('main session: chỉ mở/đóng trang', () => {
  assert.strictEqual(decide({ tool_name: T('browser_navigate') }, 0, null), '');
  assert.match(decide({ tool_name: T('browser_snapshot') }, 0, null), /sp:scout/);
  assert.match(decide({ tool_name: T('browser_evaluate') }, 0, null), /sp:scout/);
});
test('khóa theo agent', () => {
  const lock = { who: 'a1', type: 'sp:scout', ts: 1000 };
  assert.strictEqual(decide({ agent_id: 'a1', tool_name: T('browser_snapshot') }, 2000, lock), '');
  assert.match(decide({ agent_id: 'a2', tool_name: T('browser_snapshot') }, 2000, lock), /đang được sp:scout/);
  assert.strictEqual(decide({ agent_id: 'a2', tool_name: T('browser_snapshot') }, 1000 + HOLD_MS + 1, lock), '');
});
