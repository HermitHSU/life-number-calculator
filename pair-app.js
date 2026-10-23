'use strict';
(function(){
  const get=id=>document.getElementById(id);
  const el=(tag,text,className)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;};
  function setMode(mode){
    ['single','pair'].forEach(key=>{
      const selected=key===mode;
      get(`${key}-tab`).setAttribute('aria-selected',String(selected));
      get(`${key}-tab`).tabIndex=selected?0:-1;
      get(`${key}-mode`).hidden=!selected;
    });
  }
  ['single','pair'].forEach(key=>{
    get(`${key}-tab`).addEventListener('click',()=>setMode(key));
    get(`${key}-tab`).addEventListener('keydown',event=>{
      if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){
        event.preventDefault();
        const next=event.key==='Home'?'single':event.key==='End'?'pair':key==='single'?'pair':'single';
        setMode(next);get(`${next}-tab`).focus();
      }
    });
  });
  ['self','other'].forEach(side=>NumerologyPair.preferences.forEach(([value,text])=>{
    const option=el('option',text);option.value=value;get(`${side}-preference`).append(option);
  }));
  const clear=()=>{get('pair-result').hidden=true;get('pair-error').textContent='';};
  get('pair-form').addEventListener('input',clear);
  get('pair-form').addEventListener('change',clear);
  get('swap-pair').addEventListener('click',()=>{
    ['birthday','name','preference'].forEach(field=>{
      const value=get(`self-${field}`).value;
      get(`self-${field}`).value=get(`other-${field}`).value;
      get(`other-${field}`).value=value;
    });
    clear();
  });
  function personCard(person,label){
    const card=el('article',undefined,'panel pair-person');
    card.append(el('p',label,'eyebrow'),el('h3',person.name),el('p',person.chart.birthday,'hint'));
    const numbers=el('p',undefined,'pair-numbers');
    numbers.append(el('span',`主性格 ${person.chart.mainPersonality}`),el('span',`生命靈數 ${person.chart.lifeNumber}`),el('span',`隱藏號 ${person.chart.hidden}`));
    card.append(numbers,el('p',NumerologyAnalysis.lookup(person.chart.mainPersonality)));
    const badge=el('p',person.style?`溝通起點：${person.style.name}`:'溝通起點：尚待確認','style-badge');
    card.append(badge,el('p',person.observed?'策略依據：選填的實際偏好。':'策略依據：主性格解說，請先用問題確認。','hint'));
    const details=el('details',undefined,'pair-hidden-detail');
    details.append(el('summary','隱藏號的個人參考'),el('p',NumerologyAnalysis.lookup(person.chart.hidden)));
    card.append(details);return card;
  }
  function definitionList(items){
    const list=el('dl');
    items.forEach(([title,text])=>list.append(el('dt',title),el('dd',text)));
    return list;
  }
  function syncItemButton(){
    const items=[...get('pair-items').querySelectorAll('.pair-item')];
    get('expand-pair-items').textContent=items.length&&items.every(item=>item.open)?'收合全部項目':'展開全部項目';
  }
  get('expand-pair-items').addEventListener('click',()=>{
    const items=[...get('pair-items').querySelectorAll('.pair-item')];
    const next=!items.every(item=>item.open);
    items.forEach(item=>{item.open=next;});syncItemButton();
  });
  function itemCard(item,report){
    const card=el('details',undefined,'pair-item');card.dataset.key=item.key;card.open=item.key==='CFG';
    const summary=el('summary');
    const title=el('span',`${String(item.number).padStart(2,'0')} · ${item.label}`,'pair-item-title');
    const codes=el('span',`${report.self.name} ${item.selfCode} ／ ${report.other.name} ${item.otherCode}`,'pair-item-codes');
    summary.append(title,codes,el('span',item.status,'pair-item-status'));
    summary.setAttribute('aria-label',`${item.label} ${item.selfCode} 與 ${item.otherCode}：逐項比較`);
    card.append(summary);
    const content=el('div',undefined,'pair-item-content');
    content.append(el('p',item.note,'pair-common'),el('p',item.strategyBasis,'hint'));
    content.append(el('h3','八大面向差異'));
    const facets=el('div',undefined,'pair-item-facets');
    item.facets.forEach(facet=>{
      const section=el('section',undefined,'pair-facet');section.dataset.facet=facet.key;
      const heading=el('h4',facet.title);heading.append(el('span',facet.same?'內容相同':'分別查看','facet-state'));
      const sides=el('div',undefined,'pair-facet-sides');
      [[report.self.name,item.selfCode,facet.selfText],[report.other.name,item.otherCode,facet.otherText]].forEach(([name,code,text])=>{
        const side=el('div');side.append(el('p',`${name} · ${code}`,'pair-side-label'),el('p',text));sides.append(side);
      });
      section.append(heading,sides);facets.append(section);
    });
    content.append(facets,el('h3','本項可能摩擦與協調'));
    const conflicts=el('div',undefined,'pair-item-conflicts');
    item.conflicts.forEach(conflict=>{
      const section=el('section',undefined,'pair-advice');section.append(el('h4',conflict.title),el('p',conflict.reason),definitionList([['先問彼此',conflict.question],['共同約定',conflict.agreement]]));conflicts.append(section);
    });
    content.append(conflicts,el('h3','本項雙向溝通建議'));
    const directions=el('div',undefined,'pair-directions');
    item.directions.forEach(direction=>{
      const section=el('section',undefined,'pair-advice');section.append(el('h4',direction.title),definitionList([['開場提問',direction.opening],['交流方式',direction.approach],['給自己的提醒',direction.selfReminder],['共同下一步',direction.agreement]]));directions.append(section);
    });
    content.append(directions);
    const business=el('details',undefined,'pair-item-business');business.append(el('summary','本項業務溝通範例（自己 → 對方）'),definitionList([['開場提問',item.business.opening],['提案方式',item.business.proposal],['遇到疑慮',item.business.objection],['後續追蹤',item.business.followUp]]));
    content.append(business);card.append(content);card.addEventListener('toggle',syncItemButton);return card;
  }
  function render(report){
    get('pair-basis').textContent=report.basis;
    get('pair-people').replaceChildren(personCard(report.self,'自己'),personCard(report.other,'對方'));
    const table=get('pair-comparison');table.replaceChildren();
    const caption=el('caption','節奏、資訊、信任與壓力反應的比較');
    const head=el('thead'),headRow=el('tr');
    ['比較項目',report.self.name,report.other.name].forEach(text=>{const cell=el('th',text);cell.scope='col';headRow.append(cell);});
    head.append(headRow);const body=el('tbody');
    [['pace','討論節奏'],['information','資訊需求'],['trust','信任建立'],['stress','需留意的壓力反應']].forEach(([key,title])=>{
      const row=el('tr'),label=el('th',title);label.scope='row';row.append(label);
      [report.self,report.other].forEach(person=>row.append(el('td',person.style?person.style[key]:'尚待實際對話確認')));
      body.append(row);
    });
    table.append(caption,head,body);get('pair-common').textContent=report.common;
    get('pair-items').replaceChildren(...report.items.map(item=>itemCard(item,report)));syncItemButton();
    get('pair-conflicts').replaceChildren(...report.conflicts.map(conflict=>{
      const card=el('article',undefined,'pair-advice');card.append(el('h3',conflict.title),el('p',conflict.reason),definitionList([['先問彼此',conflict.question],['可以一起約定',conflict.agreement]]));return card;
    }));
    get('pair-directions').replaceChildren(...report.directions.map(direction=>{
      const card=el('article',undefined,'pair-advice');card.append(el('h3',direction.title),definitionList([['試著這樣開場',direction.opening],['適合的交流方式',direction.approach],['給自己的提醒',direction.selfReminder],['共同下一步',direction.agreement]]));return card;
    }));
    const business=get('pair-business');business.replaceChildren();
    [['opening','開場提問'],['proposal','提案方式'],['objection','遇到疑慮'],['followUp','後續追蹤'],['boundary','互動界線']].forEach(([key,title])=>business.append(el('dt',title),el('dd',report.business[key])));
    get('pair-result').hidden=false;get('pair-result').scrollIntoView({behavior:'smooth',block:'start'});
  }
  get('pair-form').addEventListener('submit',event=>{
    event.preventDefault();clear();
    try{
      render(NumerologyPair.compare({selfBirthday:get('self-birthday').value,otherBirthday:get('other-birthday').value,selfName:get('self-name').value,otherName:get('other-name').value,selfPreference:get('self-preference').value,otherPreference:get('other-preference').value}));
    }catch(error){get('pair-error').textContent=error.message;}
  });
  get('pair-print').addEventListener('click',()=>window.print());
  let printStates=[];
  window.addEventListener('beforeprint',()=>{
    printStates=[...get('pair-result').querySelectorAll('details')].map(node=>[node,node.open]);
    printStates.forEach(([node])=>{node.open=true;});
  });
  window.addEventListener('afterprint',()=>{
    printStates.forEach(([node,open])=>{node.open=open;});printStates=[];syncItemButton();
  });
})();
