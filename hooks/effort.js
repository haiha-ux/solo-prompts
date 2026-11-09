// sp plugin — chính sách effort theo từng lần spawn (guard.js gọi ở PreToolUse:Agent, phiên chính).
// Đọc dòng `CHẾ ĐỘ:` / `LƯỢT:` có sẵn trong brief → đặt `effort` (Agent tool param, v2.1.292+) — 0 token Opus.
// Mặc định = frontmatter (scout/grunt low, builder medium, critic high). Chỉ đổi ở chỗ đã biết độ khó/rủi ro khác.
const ORDER = ['low', 'medium', 'high', 'xhigh', 'max'];
const rank = (e) => ORDER.indexOf(String(e || '').toLowerCase());
const RISK_RE = /AN TOÀN|bảo mật|security|auth|thanh toán|payment|migration|mất dữ liệu/i;

// Trả { effort, why } hoặc null (giữ nguyên). explicit = effort Opus tự truyền.
function decide(type, prompt, explicit) {
  const p = String(prompt || '');
  const mode = ((p.match(/CHẾ ĐỘ:\s*`?([a-z_]+)/i) || [])[1] || '').toLowerCase();
  const round = Number((p.match(/LƯỢT:\s*(\d+)/) || [])[1] || 1);
  let want = null, why = '';
  if (type === 'sp:critic') {
    if (mode === 'that_bai') [want, why] = ['xhigh', 'that_bai: bác bỏ sai = mất hướng nghiên cứu'];
    else if (mode === 'loi' && round >= 2) [want, why] = ['xhigh', `loi lượt ${round}: fix trước đã thất bại`];
    else if (mode === 'suc_khoe' || mode === 'kien_truc') [want, why] = ['medium', `${mode}: đối chiếu bảng/sơ đồ`];
    else if (round >= 2 && !RISK_RE.test(p)) [want, why] = ['medium', `lượt ${round}: chỉ xác minh BLOCK cũ`];
    // critic: Opus chỉ được NÂNG, không được hạ (chống hạ effort để dễ PASS)
    if (rank(explicit) > rank(want || 'high')) [want, why] = [explicit, 'điều phối viên nâng'];
    else if (rank(explicit) >= 0 && !want) [want, why] = ['high', 'sàn critic'];
  } else if (type === 'sp:builder') {
    if (rank(explicit) >= 0) return null; // builder: điều phối viên quyết (vd low cho docs/rename)
    if (round >= 2 || /HẾT LƯỢT/.test(p)) [want, why] = ['high', `làm lại lượt ${round}`];
    else if (/thi_nghiem\/|THÍ NGHIỆM/i.test(p)) [want, why] = ['high', 'code thí nghiệm: bug F1 làm hỏng kết luận'];
    else if (RISK_RE.test(p)) [want, why] = ['high', 'vùng nhạy cảm'];
  } else return null; // scout/grunt: giữ low — đa dạng nhờ fan-out, việc cơ học không cần nghĩ sâu
  if (!want || String(want).toLowerCase() === String(explicit || '').toLowerCase()) return null;
  return { effort: want, why };
}

module.exports = { decide };
