/* 生命靈數計算引擎：無 DOM、無外部依賴。瀏覽器與 Node.js 共用。 */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.NumerologyEngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function reduce(value) {
    if (!Number.isSafeInteger(value) || value < 0) throw new TypeError('數字必須為非負安全整數');
    while (value > 9) value = String(value).split('').reduce((sum, digit) => sum + Number(digit), 0);
    return value;
  }
  function parseBirthday(input) {
    if (typeof input !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(input)) throw new Error('請填寫完整生日（西元 YYYY-MM-DD）');
    const [year, month, day] = input.split('-').map(Number);
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (year < 1 || month < 1 || month > 12 || day < 1 || day > days[month - 1]) throw new Error('生日日期不存在，請重新確認');
    return { year, month, day };
  }
  const groupKeys = ['ABC', 'DEF', 'CFG', 'CGI', 'FGH', 'HIJ', 'ACK', 'BCL', 'KLM', 'DFN', 'EFO', 'NOP'];
  function calculate(birthday) {
    const {year, month, day} = parseBirthday(birthday);
    const n = {};
    n.A = reduce(day); n.B = reduce(month);
    n.D = reduce(Math.floor(year / 100)); n.E = reduce(year % 100);
    const sum = (a, b) => reduce(n[a] + n[b]);
    n.C = sum('A', 'B'); n.F = sum('D', 'E'); n.G = sum('C', 'F');
    n.H = sum('F', 'G'); n.I = sum('C', 'G'); n.J = sum('H', 'I');
    n.K = sum('A', 'C'); n.L = sum('B', 'C'); n.M = sum('K', 'L');
    n.N = sum('D', 'F'); n.O = sum('E', 'F'); n.P = sum('N', 'O');
    const groups = groupKeys.map((key, i) => ({number: i + 1, key, value: [...key].map(k => n[k]).join('')}));
    const hidden = ['C', 'F', 'G'].map(k => reduce(n[k] * 2)).join('');
    const present = new Set('ABCDEFG'.split('').map(k => n[k]));
    const missing = [1,2,3,4,5,6,7,8,9].filter(v => !present.has(v));
    return {birthday, numbers: n, groups, mainPersonality: groups[2].value, hidden,
      missing, lifeNumber: n.G, starNumbers: [n.A, n.E, n.G], dream: reduce(n.A + n.E + n.G)};
  }
  return Object.freeze({reduce, parseBirthday, calculate});
});
