// node --test hooks/syntax.test.js — mọi hook phải parse được (probe.js từng vỡ cú pháp mà không test nào bắt)
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
test('mọi hooks/*.js qua node --check, hooks.json/.mcp.json/dinh_tuyen.json là JSON hợp lệ', () => {
  for (const f of fs.readdirSync(__dirname).filter((x) => x.endsWith('.js')))
    assert.doesNotThrow(() => execFileSync(process.execPath, ['--check', path.join(__dirname, f)], { stdio: 'pipe' }), f);
  for (const f of ['hooks.json', 'dinh_tuyen.json', 'van_phong_tu.json', '../.mcp.json', '../.claude-plugin/plugin.json'])
    assert.doesNotThrow(() => JSON.parse(fs.readFileSync(path.join(__dirname, f), 'utf8')), f);
});
