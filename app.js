'use strict';
const $ = id => document.getElementById(id);
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
      const value = document.createElement('strong'); value.textContent = group.value;
      item.append(label, value); $('groups').append(item);
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
