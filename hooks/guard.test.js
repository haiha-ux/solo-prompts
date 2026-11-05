// Chạy: node --test hooks/guard.test.js
const test = require('node:test');
const assert = require('node:assert');
const { isTestCommand } = require('./guard.js');

const MUST_BLOCK = [
  'pytest -q', 'python -m pytest -q', 'python3 -m unittest discover', 'uv run pytest', 'poetry run pytest -k a',
  'cd src && npm test', 'npm t', 'npm run test:unit', 'pnpm test', 'yarn test', 'bun test', 'deno test',
  'make test', 'tox -e py311', 'nox', 'go test ./...', 'cargo test', 'cargo nextest run', 'dotnet test',
  'mvn verify', './gradlew test', 'npx vitest run', 'npx jest', 'npx playwright test', 'FOO=1 pytest',
  'timeout 60 pytest', 'bash -c "pytest -q"', 'pytest.exe -q', 'node --test',
];
const MUST_PASS = [
  'git status', 'echo "run pytest later"', 'git commit -m "fix pytest later"', 'pip install pytest',
  'npm i -D vitest jest', 'ls tests | grep jest', 'rg vitest src', 'echo mocha', 'cat pytest.ini',
  'python demtu.py big.txt -n 5', 'npm run build', 'go build ./...', 'cargo build --release', 'make',
  'git log --oneline -5',
];

// node --test là runner của Node — đưa vào danh sách chặn qua TOOL? kiểm riêng:
test('chặn đúng các lệnh chạy test', () => {
  for (const c of MUST_BLOCK) assert.ok(isTestCommand(c), 'phải chặn: ' + c);
});
test('không chặn nhầm lệnh thường', () => {
  for (const c of MUST_PASS) assert.ok(!isTestCommand(c), 'không được chặn: ' + c);
});
