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
      item.append(label, title, value, description, analysis); $('groups').append(item);
    });
    $('result-note').textContent = $('note').value.trim();
    $('result').hidden = false;
    $('result').scrollIntoView({behavior: 'smooth', block: 'start'});
  } catch (error) {
    $('result').hidden = true;
    $('error').textContent = error.message;
  }
});
$('print').addEventListener('click', () => window.print());
