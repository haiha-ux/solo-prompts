// node --test hooks/lint_van.test.js
const test = require('node:test');
const assert = require('node:assert');
const { analyze } = require('./lint_van.js');

const SLOP = `# Tổng Quan Về Hệ Thống

Trong bối cảnh dữ liệu ngày càng lớn, **dedup** đóng vai trò quan trọng trong việc nâng cao hiệu suất.

## Lợi ích
- **Nhanh**: rất nhanh
- **Chính xác**: rất chính xác
- **Linh hoạt**: dễ mở rộng
- **Ổn định**: ít lỗi
- **An toàn**: không mất dữ liệu

Không chỉ nhanh mà còn chính xác — điều này cho thấy giá trị vượt trội. Không phải công cụ thường mà là giải pháp toàn diện — một bước ngoặt.

## Tóm lại
Nhìn chung, hệ thống mang lại giá trị vượt trội 🚀 một cách hiệu quả và toàn diện cho mọi người dùng trong kỷ nguyên số.
`.repeat(2);

const GOOD = `dedup.py bỏ những dòng khách trùng nhau trong file CSV và giữ dòng xuất hiện sớm nhất của mỗi nhóm. Hai dòng bị coi là một khách khi trùng số điện thoại sau chuẩn hóa hoặc trùng email không phân biệt hoa thường, và quan hệ này bắc cầu: A trùng B qua số, B trùng C qua email thì cả ba là một khách.

Chạy bằng \`python dedup.py IN.csv OUT.csv\`. File vào phải là UTF-8 và có ba cột ho_ten, sdt, email; thiếu cột thì script thoát mã 2 và in lý do ra stderr. Với 200 nghìn dòng, bản hiện tại chạy khoảng 4 giây vì đọc hết vào bộ nhớ, nên file vài triệu dòng sẽ tốn vài GB RAM.

Rủi ro lớn nhất khi dùng với dữ liệu thật là số nước ngoài. Hàm \`norm_phone\` chỉ đổi tiền tố 84 thành 0 khi số có 11 chữ số, còn số +1 hay +65 giữ nguyên chữ số, nên hai số khác quốc gia có cùng đuôi có thể bị gộp nhầm. Script cũng không gộp thông tin: email của dòng bị bỏ sẽ mất khỏi file kết quả.
`;

test('slop bị gắn nhiều cờ', () => {
  const r = analyze(SLOP, 'docs/x.md');
  assert.ok(r.flags.length >= 6, r.flags.join('\n'));
});
test('văn người viết tốt sạch', () => {
  const r = analyze(GOOD, 'docs/huong_dan.md');
  assert.deepStrictEqual(r.flags, []);
});
test('changelog được dùng gạch đầu dòng', () => {
  const cl = '## [1.2.0] - 2026-11-09\n### Sửa\n' + Array.from({ length: 30 }, (_, i) => `- Sửa lỗi ${i} khi đọc file CSV có BOM ở dòng đầu tiên của tệp`).join('\n');
  assert.ok(!analyze(cl, 'CHANGELOG.md').flags.some((f) => f.startsWith('gạch đầu dòng')));
});
test('code block không tính', () => {
  const r = analyze(GOOD + '\n```\n- a\n- b\n- c\n**x** **y** **z**\n```\n', 'docs/a.md');
  assert.deepStrictEqual(r.flags, []);
});
