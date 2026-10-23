'use strict';
const assert = require('node:assert/strict');
const engine = require('./engine.js');
const pair = require('./pair-engine.js');
const input = {selfBirthday:'1984-02-20',otherBirthday:'1972-12-10'};
const r=pair.compare(input);
assert.equal(r.self.chart.mainPersonality,'448');
assert.equal(r.self.chart.hidden,'887');
assert.equal(r.other.chart.mainPersonality,'415');
assert.equal(r.other.chart.hidden,'821');
assert.equal(r.self.theme,'perfection');
assert.equal(r.other.theme,'planning');
assert.ok(r.conflicts.some(c=>c.title.includes('信任')));
assert.equal(r.directions.length,2);
const reverse=pair.compare({selfBirthday:input.otherBirthday,otherBirthday:input.selfBirthday});
assert.deepEqual(r.self.chart,reverse.other.chart);
assert.deepEqual(r.other.chart,reverse.self.chart);
assert.equal(r.directions[0].approach,reverse.directions[1].approach);
assert.notEqual(r.business.proposal,reverse.business.proposal);
const observed=pair.compare({...input,otherPreference:'expressive'});
assert.equal(observed.other.theme,'expressive');
assert.equal(observed.other.observed,true);
assert.deepEqual(observed.other.chart,r.other.chart,'Preference must not change birthday calculation');
assert.ok(observed.conflicts.some(c=>c.title.includes('節奏')));
assert.notEqual(observed.business.proposal,r.business.proposal);
assert.ok(pair.compare({selfBirthday:input.selfBirthday,otherBirthday:input.selfBirthday}).common.includes('相同'));
assert.throws(()=>pair.compare({...input,selfBirthday:'2023-02-29'}),/自己/);
assert.throws(()=>pair.compare({...input,otherBirthday:''}),/對方/);
assert.throws(()=>pair.compare({...input,otherPreference:'unknown'}),/偏好/);
assert.equal(pair.compare({...input,selfName:'  A  '}).self.name,'A');
// Find a real birthday for each CFG code, then exercise every ordered pair.
const representatives={};
for(let year=1900;year<=1999&&Object.keys(representatives).length<81;year++){
  for(let day=1;day<=9;day++)for(let month=1;month<=9;month++){
    const date=`${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    representatives[engine.calculate(date).mainPersonality]=date;
  }
}
assert.equal(Object.keys(representatives).length,81);
let count=0;
for(const [codeA,dateA] of Object.entries(representatives))for(const [codeB,dateB] of Object.entries(representatives)){
  const report=pair.compare({selfBirthday:dateA,otherBirthday:dateB});
  assert.equal(report.self.chart.mainPersonality,codeA);
  assert.equal(report.other.chart.mainPersonality,codeB);
  assert.ok(report.conflicts.length>=1&&report.conflicts.length<=3);
  report.conflicts.forEach(c=>['title','reason','question','agreement'].forEach(key=>assert.ok(c[key].length>5)));
  report.directions.forEach(d=>['title','opening','approach','selfReminder','agreement'].forEach(key=>assert.ok(d[key].length>5)));
  Object.values(report.business).forEach(value=>assert.ok(value.length>10));
  assert.equal('score' in report,false);
  count++;
}
console.log(`PASS: ${count} ordered pairs, sample birthdays, role reversal, same code, actual-preference override, names and date validation.`);
