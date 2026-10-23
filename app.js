'use strict';
const $ = id => document.getElementById(id);
// 中文名稱依「製作命理程式」原對話的 13 項命理排列；說明僅整理項目涵蓋範圍。
const groupLabels = {
  ABC: ['父基因（事業）', '父基因所對應的事業面向。'],
  DEF: ['母基因（婚姻）', '母基因所對應的婚姻面向。'],
  CFG: ['主性格', '此命盤的主要性格組合。'],
  CGI: ['人生過程1', '人生過程的第一組數字。'],
  FGH: ['人生過程2', '人生過程的第二組數字。'],
  HIJ: ['子女下屬', '子女與下屬的對應組合。'],
  ACK: ['事業過程1', '事業過程的第一組數字。'],
  BCL: ['事業過程2', '事業過程的第二組數字。'],
  KLM: ['當下朋友', '當下朋友的對應組合。'],
  DFN: ['婚姻過程1', '婚姻過程的第一組數字。'],
  EFO: ['婚姻過程2', '婚姻過程的第二組數字。'],
  NOP: ['未來財富健康（晚年）', '未來及晚年的財富、健康面向。']
};
function createCommunicationPanel(code, context, expanded = false) {
  const profile = NumerologyCommunication.lookup(code);
  const details = document.createElement('details');
  details.className = 'communication-panel';
  details.dataset.code = code;
  details.open = expanded;
  const summary = document.createElement('summary');
  summary.textContent = '八大面向與溝通建議';
  summary.setAttribute('aria-label', `${context} ${code}：八大面向與溝通建議`);
  details.append(summary);
  if (!profile) {
    const empty = document.createElement('p');
    empty.textContent = '此組合尚無八大面向資料，請先依實際對話了解需求。';
    details.append(empty);
    return details;
  }
  const facets = document.createElement('div');
  facets.className = 'facets';
  NumerologyCommunication.dimensions.forEach(([key, title], index) => {
    const section = document.createElement('section');
    const heading = document.createElement('h4'); heading.textContent = `${index + 1}. ${title}`;
    const text = document.createElement('p'); text.textContent = profile.facets[key];
    section.append(heading, text); facets.append(section);
  });
  const business = document.createElement('section');
  business.className = 'business-guide';
  const heading = document.createElement('h4'); heading.textContent = '業務溝通實用範例';
  const list = document.createElement('dl');
  [['opening','開場提問'],['proposal','提案方式'],['objection','遇到疑慮'],['followUp','後續追蹤'],['avoid','避免的方式']].forEach(([key, title]) => {
    const term = document.createElement('dt'); term.textContent = title;
    const description = document.createElement('dd'); description.textContent = profile.business[key];
    list.append(term, description);
  });
  business.append(heading, list);
  details.append(facets, business);
  return details;
}
function syncExpandButton() {
  const panels = [...document.querySelectorAll('.communication-panel')];
  const allOpen = panels.length > 0 && panels.every(panel => panel.open);
  $('expand-analysis').textContent = allOpen ? '收合全部分析' : '展開全部分析';
}
$('expand-analysis').addEventListener('click', () => {
  const panels = [...document.querySelectorAll('.communication-panel')];
  const next = !panels.every(panel => panel.open);
  panels.forEach(panel => { panel.open = next; });
  syncExpandButton();
});
$('chart-form').addEventListener('submit', event => {
  event.preventDefault();
  $('error').textContent = '';
  try {
    const r = NumerologyEngine.calculate($('birthday').value);
    $('identity').textContent = [$('name').value.trim(), r.birthday, $('gender').value, $('birth-time').value].filter(Boolean).join(' · ');
    $('life').textContent = r.lifeNumber;
    $('main').textContent = r.mainPersonality;
    $('stars').textContent = r.starNumbers.join(' / ');
    $('dream').textContent = r.dream;
    $('missing').textContent = r.missing.length ? r.missing.join(' / ') : '無';
    $('hidden').textContent = r.hidden;
    $('hidden-analysis').textContent = NumerologyAnalysis.lookup(r.hidden);
    $('hidden-communication').replaceChildren(createCommunicationPanel(r.hidden, '隱藏號碼'));
    $('number-grid').replaceChildren();
    Object.keys(r.numbers).sort().forEach(key => {
      const cell = document.createElement('div');
      if (['A','E','G'].includes(key)) cell.className = 'star';
      const label = document.createElement('span'); label.textContent = key + (cell.className ? ' ★' : '');
      const value = document.createElement('strong'); value.textContent = r.numbers[key];
      cell.append(label, value); $('number-grid').append(cell);
    });
    $('groups').replaceChildren();
    r.groups.forEach(group => {
      const item = document.createElement('div');
      const label = document.createElement('span'); label.textContent = `${String(group.number).padStart(2,'0')} · ${group.key}`;
      const [name, meaning] = groupLabels[group.key];
      const title = document.createElement('h3'); title.textContent = name;
      const value = document.createElement('strong'); value.textContent = group.value;
      const description = document.createElement('p'); description.textContent = meaning;
      const analysis = document.createElement('p');
      analysis.className = 'combination-analysis';
      analysis.textContent = NumerologyAnalysis.lookup(group.value);
      item.append(label, title, value, description, analysis, createCommunicationPanel(group.value, name, group.key === 'CFG')); $('groups').append(item);
    });
    document.querySelectorAll('.communication-panel').forEach(panel => panel.addEventListener('toggle', syncExpandButton));
    syncExpandButton();
    $('result-note').textContent = $('note').value.trim();
    $('result').hidden = false;
    $('result').scrollIntoView({behavior: 'smooth', block: 'start'});
  } catch (error) {
    $('result').hidden = true;
    $('error').textContent = error.message;
  }
});
$('print').addEventListener('click', () => window.print());
let printPanels = [];
window.addEventListener('beforeprint', () => {
  printPanels = [...document.querySelectorAll('.communication-panel')].map(panel => [panel, panel.open]);
  printPanels.forEach(([panel]) => { panel.open = true; });
});
window.addEventListener('afterprint', () => {
  printPanels.forEach(([panel, open]) => { panel.open = open; });
  printPanels = [];
  syncExpandButton();
});
