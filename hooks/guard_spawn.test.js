// node --test hooks/guard_spawn.test.js — hành vi guard khi phiên chính spawn agent (chạy guard.js thật qua stdin)
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const proj = fs.mkdtempSync(path.join(os.tmpdir(), 'sp-spawn-'));
fs.mkdirSync(path.join(proj, '.ai'));
fs.writeFileSync(path.join(proj, '.ai', 'STATE.md'), 'Chế độ: XÂY DỰNG\n');
let n = 0;
function run(tool_input, extra = {}) {
  const out = execFileSync(process.execPath, [path.join(__dirname, 'guard.js')], {
    input: JSON.stringify({ tool_name: 'Agent', tool_input, cwd: proj, session_id: `spawn-${process.pid}-${Date.now()}-${n++}`, ...extra }), encoding: 'utf8' });
  return out ? JSON.parse(out).hookSpecificOutput : null;
}

test('việc mới chưa phân kỳ → chặn, kể cả khi brief tự ghi bỏ qua', () => {
  assert.strictEqual(run({ subagent_type: 'sp:builder', description: 'add flag', prompt: 'VIỆC: thêm cờ --dry-run' }).permissionDecision, 'deny');
  assert.strictEqual(run({ subagent_type: 'sp:builder', description: 'rename', prompt: 'VIỆC: đổi tên\nPHÂN KỲ: bỏ qua — chỉ đổi tên biến' }).permissionDecision, 'deny');
});
test('sửa lỗi có quy trình riêng → không chặn phân kỳ', () => {
  const o = run({ subagent_type: 'sp:builder', description: 'TDD fix email case', prompt: 'VIỆC: sửa lỗi email hoa thường, test tái hiện đỏ trước' });
  assert.ok(!o || o.permissionDecision !== 'deny');
});
test('brief tự đặt TRẢ VỀ → nối câu giữ khuôn nhãn', () => {
  const o = run({ subagent_type: 'sp:builder', description: 'fix bug', prompt: 'VIỆC: sửa lỗi X\nTRẢ VỀ: git diff, output đỏ' });
  assert.match(o.updatedInput.prompt, /\[sp khuôn\]/);
  assert.strictEqual(o.updatedInput.subagent_type, 'sp:builder');
  const c = run({ subagent_type: 'sp:critic', description: 'review', prompt: 'CHẾ ĐỘ: code\nTRẢ VỀ: danh sách lỗi' });
  assert.match(c.updatedInput.prompt, /\[sp khuôn\]/);
  assert.strictEqual(run({ subagent_type: 'sp:scout', description: 'tra', prompt: 'MỤC TIÊU: x\nTRẢ VỀ: 3 nguồn' }), null); // scout tự do khuôn
});
test('spawn chỉ để chờ → chặn; agent dựng sẵn chạy Opus → chặn', () => {
  assert.strictEqual(run({ subagent_type: 'sp:grunt', description: 'Wait placeholder check', prompt: 'reply OK' }).permissionDecision, 'deny');
  assert.strictEqual(run({ subagent_type: 'Explore', description: 'find', prompt: 'find x' }).permissionDecision, 'deny');
  assert.strictEqual(run({ subagent_type: 'Explore', model: 'haiku', description: 'find', prompt: 'find x' }), null);
});
test('agent con spawn → không đụng', () => {
  assert.strictEqual(run({ subagent_type: 'sp:builder', description: 'x', prompt: 'VIỆC: thêm' }, { agent_id: 'a1' }), null);
});
test('phiên chính tự viết file phân kỳ → chặn; scout viết → qua', () => {
  const g = (tool_name, tool_input, extra = {}) => {
    const out = execFileSync(process.execPath, [path.join(__dirname, 'guard.js')], {
      input: JSON.stringify({ tool_name, tool_input, cwd: proj, session_id: `pk-${Date.now()}-${n++}`, ...extra }), encoding: 'utf8' });
    return out ? JSON.parse(out).hookSpecificOutput.permissionDecision : null;
  };
  assert.strictEqual(g('Bash', { command: "mkdir -p .ai/phan_ky && cat > .ai/phan_ky/viec2.md <<'EOF'\nR1 ...\nEOF" }), 'deny');
  assert.strictEqual(g('Write', { file_path: proj + '/.ai/phan_ky/m1.md', content: 'x' }), 'deny');
  assert.strictEqual(g('Write', { file_path: proj + '/.ai/phan_ky/m1.md', content: 'x' }, { agent_id: 'scout1' }), null);
  assert.strictEqual(g('Bash', { command: 'cat .ai/phan_ky/m1.md' }), null);
});
