// sp plugin — SubagentStop: báo cáo sai khuôn → trả agent về sửa NGAY (thay cho lượt Opus SendMessage "thiếu nhãn").
// Chỉ chặn 1 lần (stop_hook_active → cho qua), chỉ trong dự án sp, mọi lỗi → cho qua.
const fs = require('fs');
const path = require('path');

const BUILDER_LABELS = ['NHÁNH', 'TEST', 'TÁI DÙNG', 'LIÊN KẾT', 'PHẠM VI', 'CHECK', 'MAP', 'GOTCHA', 'CHẶN'];

function isSpProject(start) {
  for (let dir = path.resolve(start || process.cwd()); ; dir = path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, '.ai', 'STATE.md'))) return true;
    if (path.dirname(dir) === dir) return false;
  }
}

// Trả lý do cần sửa, hoặc '' nếu đạt.
function check(agent, msg) {
  const t = String(msg || '').trim();
  if (!t || /CHẶN:\s*HẾT LƯỢT/i.test(t)) return ''; // rỗng (SubagentHandback) / sắp hết maxTurns → không ép thêm lượt
  if (agent === 'sp:builder') {
    if (/CHẶN:\s*(THIẾU|CẦN|HẾT)/i.test(t)) return ''; // dừng sớm có lý do — điều phối viên xử lý
    const miss = BUILDER_LABELS.filter((l) => !new RegExp('(^|[\\n·|])\\s*[*`>-]*\\s*' + l + '(?:/[^:]*)?\\s*[*`]*:', 'i').test(t));
    return miss.length ? `báo cáo thiếu nhãn: ${miss.join(', ')}. Trả lại khối TRẢ VỀ đủ nhãn (≤10 dòng), không làm thêm việc.` : '';
  }
  if (agent === 'sp:critic') {
    return /^\s*[*`]*KẾT:\s*(PASS|BLOCK|WARN)/i.test(t) ? '' : 'dòng ĐẦU TIÊN phải là `KẾT: PASS | BLOCK <n> | WARN <m>`. Trả lại đúng khuôn của CHẾ ĐỘ, không soát thêm.';
  }
  if (agent === 'sp:grunt') {
    const ok = /^\s*[*`]*(OK|FAIL)\b/m.test(t);
    return ok && t.length <= 700 ? '' : 'TRẢ VỀ đúng 1 dòng `OK <tóm tắt> [file RA]` hoặc `FAIL <n>/<tổng> | <test hỏng + lỗi> | RA:<file>`; chi tiết để trong file RA. Không chạy thêm lệnh.';
  }
  return '';
}

function main() {
  let input = {};
  try { input = JSON.parse(fs.readFileSync(0, 'utf8') || '{}'); } catch { return; }
  if (input.stop_hook_active || !isSpProject(input.cwd)) return;
  const reason = check(input.agent_type, input.last_assistant_message);
  if (reason) process.stdout.write(JSON.stringify({ decision: 'block', reason: '[sp gate] ' + reason }));
}

if (require.main === module) {
  try { main(); } catch { /* fail-open */ }
  process.exit(0);
}
module.exports = { check };
