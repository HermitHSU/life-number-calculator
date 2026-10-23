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
assert.deepEqual(r.items.map(item=>item.key),['ABC','DEF','CFG','CGI','FGH','HIJ','ACK','BCL','KLM','DFN','EFO','NOP','hidden']);
assert.deepEqual(r.items.map(item=>item.selfCode),['224','134','448','483','483','336','246','246','663','145','347','573','887']);
assert.deepEqual(r.items.map(item=>item.otherCode),['134','191','415','459','156','696','145','347','573','112','911','213','821']);
assert.deepEqual(r.items[2].conflicts,r.conflicts,'CFG should match the overall main-personality comparison');
assert.notDeepEqual(r.items[12].directions,r.items[2].directions,'Hidden number must use its own interpretation');
assert.ok(r.items[12].facets[0].selfText.includes('責任沉重'));
assert.ok(r.items[12].facets[0].otherText.includes('壓力內化'));
const reverse=pair.compare({selfBirthday:input.otherBirthday,otherBirthday:input.selfBirthday});
assert.deepEqual(r.self.chart,reverse.other.chart);
assert.deepEqual(r.other.chart,reverse.self.chart);
assert.equal(r.directions[0].approach,reverse.directions[1].approach);
assert.notEqual(r.business.proposal,reverse.business.proposal);
r.items.forEach((item,i)=>{
  assert.equal(item.selfCode,reverse.items[i].otherCode);
  assert.equal(item.otherCode,reverse.items[i].selfCode);
  assert.equal(item.facets[0].selfText,reverse.items[i].facets[0].otherText);
  assert.equal(item.directions[0].approach,reverse.items[i].directions[1].approach);
});
const observed=pair.compare({...input,otherPreference:'expressive'});
assert.equal(observed.other.theme,'expressive');
assert.equal(observed.other.observed,true);
assert.deepEqual(observed.other.chart,r.other.chart,'Preference must not change birthday calculation');
assert.ok(observed.conflicts.some(c=>c.title.includes('節奏')));
assert.notEqual(observed.business.proposal,r.business.proposal);
assert.deepEqual(observed.items.map(item=>item.facets),r.items.map(item=>item.facets),'Actual preferences change strategy, not numeric facet text');
assert.notEqual(observed.items[12].business.proposal,r.items[12].business.proposal);
const same=pair.compare({selfBirthday:input.selfBirthday,otherBirthday:input.selfBirthday});
assert.ok(same.items.every(item=>item.same&&item.facets.every(facet=>facet.same)));
const zero=pair.compare({selfBirthday:'2000-01-01',otherBirthday:input.otherBirthday});
assert.equal(zero.items[1].selfCode,'202');
assert.equal(zero.items[1].available,false);
assert.ok(zero.items[1].facets.every(facet=>facet.selfText.includes('未收錄')));
assert.ok(zero.items[1].conflicts[0].title.includes('資料不足'));
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
  assert.equal(report.items.length,13);
  report.items.forEach((item,i)=>{
    assert.equal(item.selfCode,i===12?report.self.chart.hidden:report.self.chart.groups[i].value);
    assert.equal(item.otherCode,i===12?report.other.chart.hidden:report.other.chart.groups[i].value);
    assert.equal(item.facets.length,8);
    assert.equal(item.directions.length,2);
    assert.ok(item.conflicts.length>0);
    assert.ok(item.business.proposal.length>10);
  });
  count++;
}
console.log(`PASS: ${count} ordered pairs with 13 per-position comparisons, eight facets, hidden-number independence, role reversal, same codes, missing data and preference overrides.`);
