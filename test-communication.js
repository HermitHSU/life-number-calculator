'use strict';
const assert = require('node:assert/strict');
const {entries} = require('./analysis.js');
const {records, dimensions, lookup} = require('./communication.js');
const {calculate, reduce} = require('./engine.js');
assert.deepEqual(dimensions.map(d => d[1]), ['核心性格','內在需求','溝通風格','決策模式','信任建立','抗拒與防衛','人際互動','行動建議']);
assert.equal(Object.keys(records).length, 81);
for (let a = 1; a <= 9; a++) {
  for (let b = 1; b <= 9; b++) {
    const code = `${a}${b}${reduce(a+b)}`;
    const profile = lookup(code);
    assert.ok(profile, code);
    assert.equal(profile.code, code);
    assert.deepEqual(Object.keys(profile.facets), dimensions.map(d => d[0]));
    assert.equal(profile.facets.core, entries[code], `${code}: original meaning preserved`);
    dimensions.forEach(([key]) => assert.ok(profile.facets[key].length >= 15, `${code}: ${key}`));
    ['opening','proposal','objection','followUp','avoid'].forEach(key => assert.ok(profile.business[key].length > 10, `${code}: ${key}`));
    assert.ok(profile.business.opening.includes(profile.question));
    assert.ok(Object.isFrozen(profile.facets));
  }
}
assert.equal(new Set(Object.values(records).map(p => p.question)).size, 81, 'Each code has its own exploration question');
assert.notDeepEqual(lookup('123'), lookup('213'), 'Order matters');
for (const code of ['000','101','291','bad']) assert.equal(lookup(code), null);
for (const date of ['1984-02-20','1972-12-10','1987-08-19']) {
  const r = calculate(date);
  [...r.groups.map(g => g.value),r.hidden].forEach(code => assert.ok(lookup(code), `${date}: ${code}`));
}
assert.equal(lookup('448').facets.core, entries['448']);
assert.equal(lookup('415').facets.core, entries['415']);
assert.equal(lookup('887').facets.core, entries['887']);
assert.equal(lookup('821').facets.core, entries['821']);
console.log('PASS: 81 complete eight-facet profiles, 81 distinct questions, 405 business fields, source fidelity, order and missing-code handling.');
