'use strict';
const assert = require('node:assert/strict');
const {calculate, reduce} = require('./engine.js');
const a = calculate('1984-02-20');
assert.equal(a.mainPersonality, '448');
assert.equal(a.hidden, '887');
assert.deepEqual(a.missing, [5,6,7,9]);
assert.deepEqual(a.numbers, {A:2,B:2,D:1,E:3,C:4,F:4,G:8,H:3,I:3,J:6,K:6,L:6,M:3,N:5,O:7,P:3});
assert.deepEqual(a.groups.map(g => g.value), ['224','134','448','483','483','336','246','246','663','145','347','573']);
assert.deepEqual(a.starNumbers, [2,3,8]);
assert.equal(a.dream, 4);
const b = calculate('1972-12-10');
assert.equal(b.mainPersonality, '415');
assert.equal(b.hidden, '821');
assert.deepEqual(b.missing, [2,6,7,8]);
assert.equal(b.numbers.B, 3);
assert.equal(b.lifeNumber, 5);
assert.equal(reduce(0), 0);
assert.equal(reduce(99), 9);
for (const value of ['', '1984-2-20', '2023-02-29', '1900-02-29', '0000-01-01', '2024-13-01', '2024-04-31']) {
  assert.throws(() => calculate(value), undefined, value);
}
assert.doesNotThrow(() => calculate('2000-02-29'));
assert.doesNotThrow(() => calculate('2024-02-29'));
assert.doesNotThrow(() => calculate('0001-01-01'));
console.log('PASS: both requested examples, all 12 groups, A–P, stars, dream, month reduction and date validation.');
