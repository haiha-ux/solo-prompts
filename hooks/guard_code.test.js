// node --test hooks/guard_code.test.js — phiên chính không tự ghi file code
const test = require('node:test');
const assert = require('node:assert');
const { codeWriteTarget: c } = require('./guard.js');
const B = (command) => c('Bash', { command });

test('chặn ghi code', () => {
  assert.ok(c('Edit', { file_path: 'C:/p/dedup.py' }));
  assert.ok(c('Write', { file_path: 'src/app/page.tsx' }));
  assert.ok(c('MultiEdit', { file_path: 'tests/test_dedup.py' }));
  assert.ok(B("sed -i 's/a/b/' dedup.py"));
  assert.ok(B('cat > src/x.py <<EOF\nprint(1)\nEOF'));
  assert.ok(B("cd /p; python - <<'EOF'\np='dedup.py'; s=open(p,encoding='utf-8').read()\nopen(p,'w',encoding='utf-8').write(s.replace('a','b'))\nEOF"));
  assert.ok(B("node -e \"require('fs').writeFileSync('lib/a.js', 'x')\""));
  assert.ok(c('PowerShell', { command: 'Set-Content -Path run.ps1 -Value x' }));
  assert.ok(B('echo x | tee -a src/util.go'));
});
test('cho qua sổ, tài liệu, cấu hình, lệnh đọc', () => {
  for (const f of ['.ai/STATE.md', 'C:/p/.ai/runs/x.py', 'docs/huong_dan.md', 'CLAUDE.md', 'package.json', 'pyproject.toml'])
    assert.strictEqual(c('Edit', { file_path: f }), '', f);
  for (const cmd of ["sed -i '37a pytest | 9.2' CLAUDE.md", 'git checkout wt -- dedup.py', 'python dedup.py in.csv out.csv 2>&1',
    'grep -n norm src/a.py > .ai/runs/x.md', 'cat dedup.py', 'git diff HEAD -- src/a.ts', "python - <<'EOF'\nprint(open('dedup.py').read()[:100])\nEOF"])
    assert.strictEqual(B(cmd), '', cmd);
});
