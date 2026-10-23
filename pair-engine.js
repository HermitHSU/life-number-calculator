/* 雙人分析：以主性格解說作為探索起點，可由實際偏好覆蓋溝通策略；不計算配對分數。 */
(function(root,factory){
  if(typeof module==='object'&&module.exports) module.exports=factory(require('./engine.js'),require('./communication.js'));
  else root.NumerologyPair=factory(root.NumerologyEngine,root.NumerologyCommunication);
})(typeof globalThis!=='undefined'?globalThis:this,function(engine,communication){
  'use strict';
  const styles = {
    autonomy: {name:'自主選擇',pace:'自主掌握',information:'選項與取捨',trust:'尊重決定權',stress:'立場拉扯',axes:['self','options','choice'],talk:'先問看法，再給兩到三個選項；讓對方決定。',proposal:'列清選項、取捨與可自行決定的範圍。',follow:'先約定回覆時間，保留暫不決定的選擇。'},
    expressive: {name:'直接表達',pace:'快速交流',information:'重點與例子',trust:'承諾說清楚',stress:'表達變急',axes:['fast','brief','exchange'],talk:'先用一句話說重點，再讓對方回應；不要搶話。',proposal:'先講一個主要效益及一個實例，再補必要細節。',follow:'用簡短文字確認範圍、交期及對方真正同意的內容。'},
    planning: {name:'逐步規劃',pace:'逐步確認',information:'步驟與備案',trust:'流程可預期',stress:'反覆規劃',axes:['slow','detail','process'],talk:'先說目的、步驟與備案，一次討論一個問題。',proposal:'用里程碑、分工及小規模試行呈現方案。',follow:'按約定回顧尚缺資訊，確認下一個小步驟。'},
    opportunity: {name:'探索機會',pace:'先試再調整',information:'目標與試行',trust:'看到可驗證成果',stress:'方向切換',axes:['fast','options','results'],talk:'先談希望改善的目標，再一起確認條件和限制。',proposal:'提出低負擔試行，列明投入上限、檢查點及退出方式。',follow:'先回顧試行結果，再決定是否繼續或調整。'},
    generous: {name:'重視付出',pace:'先照顧彼此',information:'投入與負擔',trust:'互惠及可拒絕',stress:'承諾過多',axes:['gentle','relation','care'],talk:'肯定具體付出，也先問對方自己的需要和負擔。',proposal:'明列雙方投入、回饋及額外負擔，提供拒絕空間。',follow:'先問負擔是否合適，允許減量、延後或不繼續。'},
    leadership: {name:'目標與分工',pace:'目標帶動',information:'成果與權責',trust:'責任透明',stress:'承擔或主導過多',axes:['fast','brief','choice'],talk:'先談目標與分工，再詢問限制及需要的支援。',proposal:'列出成果指標、資源、權限及雙方責任。',follow:'依約回報進度及待協助事項，也允許調整目標。'},
    perfection: {name:'品質與驗證',pace:'驗證後推進',information:'規格與標準',trust:'證據及品質可查',stress:'細節與工作量累積',axes:['slow','detail','proof'],talk:'先問驗收標準，尊重專業，清楚交代限制。',proposal:'用規格比較、樣品或小測試核對必要品質。',follow:'按驗收結果先處理關鍵差異，再確認後續安排。'},
    harmony: {name:'友善協調',pace:'先建立連結',information:'感受與需求',trust:'資訊受尊重',stress:'客氣配合但未說實話',axes:['gentle','relation','care'],talk:'先建立舒服的交流，再用三個重點核對需求。',proposal:'先重述需求，確認客氣回應是否代表真正同意。',follow:'私下詢問尚未說出的顧慮，接受更改想法。'},
    cautious: {name:'證據與比較',pace:'資料足夠再定',information:'依據與風險',trust:'條件透明可驗證',stress:'重複詢問或遲疑',axes:['slow','detail','proof'],talk:'提供比較依據，讓問題問完整，不把質疑視為否定。',proposal:'用同一基準比較總成本、限制及可驗證方式。',follow:'按約補足關鍵資料，不用促銷期限取代說明。'},
    connector: {name:'互惠與連結',pace:'先確認合作意圖',information:'共同價值與界線',trust:'動機透明及履約',stress:'人情與利益混在一起',axes:['gentle','relation','exchange'],talk:'先了解合作期待，主動說明用意，熟悉後仍核對條件。',proposal:'列出共同目標、互惠方式、分工及資料分享界線。',follow:'約定雙方舒服的聯繫頻率，不用人情要求回應。'},
    pressure: {name:'先減壓再討論',pace:'放慢、逐件處理',information:'當下負擔與支持',trust:'回應穩定、可暫停',stress:'沉默、激動或過度顧慮',axes:['gentle','relation','care'],talk:'先聽負擔與感受，一次處理一件事，給暫停空間。',proposal:'用簡單選項與可暫停步驟呈現，不利用焦慮促成決定。',follow:'先問現在是否方便及負擔是否改變，再談下一步。'},
    craft: {name:'實作與專業',pace:'做出階段成果',information:'示範與技術細節',trust:'實際方法和結果',stress:'鑽研過深或頻繁換題',axes:['slow','detail','proof'],talk:'用實際情境和具體問題交流，尊重對方的專業經驗。',proposal:'提供操作示範、試用任務及可觀察的階段成果。',follow:'詢問實作困難，用具體結果調整，不只問滿不滿意。'}
  };
  Object.values(styles).forEach(style=>{Object.freeze(style.axes);Object.freeze(style);});
  Object.freeze(styles);
  const preferences = [
    ['','依生日先探索'],['expressive','先說重點'],['autonomy','先問我的想法'],
    ['cautious','先給資料比較'],['planning','先說步驟與安排'],['connector','先建立信任與關係'],['pressure','先聽感受、放慢討論']
  ];
  const allowed = new Set(preferences.map(item=>item[0]));
  function person(birthday,name,preference,label){
    let chart;
    try { chart=engine.calculate(birthday); } catch(error) { throw new Error(`${label}：${error.message}`); }
    if(!allowed.has(preference)) throw new Error(`${label}：請選擇有效的溝通偏好`);
    const profile=communication.lookup(chart.mainPersonality);
    const theme=preference || (profile && profile.tags[0]) || null;
    return {name:String(name||'').trim().slice(0,60)||label,chart,profile,theme,style:styles[theme]||null,observed:!!preference};
  }
  function conflicts(a,b){
    if(!a.style||!b.style) return [{title:'先確認實際偏好',reason:'其中一方的數字組合未收錄在81組資料中，不能據此比較風格。',question:'你希望先聽重點、看資料，還是先說自己的想法？',agreement:'可在上方選擇雙方實際溝通偏好，再重新比較。'}];
    const x=a.style.axes,y=b.style.axes,out=[];
    if(x[0]!==y[0]) out.push({title:'討論節奏不同',reason:`${a.name}這側的起點是「${a.style.pace}」；${b.name}這側是「${b.style.pace}」。若未先對齊，一方可能覺得被催，另一方覺得進度太慢。`,question:'這件事需要先快速掌握方向，還是留時間逐步確認？',agreement:'先用一句話說目標，再共同約定資料補充與回覆時間；保留暫停的選擇。'});
    if(x[1]!==y[1]) out.push({title:'需要的資訊不同',reason:`${a.name}先關注「${a.style.information}」，${b.name}先關注「${b.style.information}」。只照自己的方式說，對方可能覺得沒抓到重點。`,question:'你最想先知道哪一項：結果、細節、風險，還是彼此的期待？',agreement:'先問需求，再用「重點摘要＋可選細節」說明；請對方用自己的話確認理解。'});
    if(x[2]!==y[2]) out.push({title:'建立信任的方式不同',reason:`${a.name}這側重視「${a.style.trust}」，${b.name}這側重視「${b.style.trust}」。關係熟悉、資料充分或尊重選擇，未必能互相替代。`,question:'什麼安排或資訊能讓你對這次合作更放心？',agreement:'將承諾、證據、分工與選擇權一起說清楚，不把拒絕或追問當成不信任。'});
    if(a.theme===b.theme) out.push({title:'相似風格也可能一起卡住',reason:`雙方都以「${a.style.name}」作起點，可能容易理解彼此，但也需留意「${a.style.stress}」是否同時出現。`,question:'我們是否一直用同一種方法，卻沒有推進或說出真正顧慮？',agreement:'輪流提出一項不同看法，再約定一個可完成的小步驟及回顧點。'});
    if(!out.length) out.push({title:'相近偏好，仍需確認界線',reason:`兩側的討論需求相近，但「${a.style.stress}」與「${b.style.stress}」可能有不同表現。`,question:'我們各自不方便或不願意承擔的是什麼？',agreement:'先講清責任、可拒絕的範圍及確認方式，不因談得來就跳過約定。'});
    return out;
  }
  function direction(from,to){
    const question=to.profile?to.profile.question:'你希望怎麼討論，會覺得比較自在而且有幫助？';
    return {title:`${from.name} → ${to.name}`,opening:`「我想先了解：${question}」`,
      approach:to.style?to.style.talk:'先詢問對方實際偏好，再選擇說明方式。',
      selfReminder:from.style?`留意自己是否出現「${from.style.stress}」，先停下來確認，不替對方推斷動機。`:'先說明自己的期待與限制，不用數字替自己下結論。',
      agreement:'一次只確認一個下一步，讓對方能選擇、修改或拒絕；互動後再回顧是否有效。'};
  }
  function itemPerson(base,code){
    const profile=communication.lookup(code);
    const theme=base.observed?base.theme:(profile&&profile.tags[0])||null;
    return {...base,code,profile,theme,style:styles[theme]||null};
  }
  function itemComparison(self,other,key,label,codeA,codeB,index){
    const a=itemPerson(self,codeA),b=itemPerson(other,codeB);
    const available=!!(a.profile&&b.profile);
    const same=codeA===codeB;
    return {key,label,number:index+1,selfCode:codeA,otherCode:codeB,same,available,
      status:!available?'含未收錄組合':same?'數字相同':'數字不同',
      note:!available?'此項含未收錄組合，缺少的解說不作推測；可用實際提問確認需求。':same?'此項數字相同，原始解說相同；實際偏好與經驗仍需分別確認。':`此項分別對照 ${codeA} 與 ${codeB} 的解說，並從差異探索互動方式。`,
      strategyBasis:a.observed||b.observed?'下方八大面向保留各數字原有分析；互動及業務策略優先採用選填的實際偏好。':'互動策略依本項雙方數字的溝通主題整理，請先用提問確認。',
      facets:communication.dimensions.map(([facet,title])=>({key:facet,title,
        selfText:a.profile?a.profile.facets[facet]:'此組合未收錄，尚無對應分析。',
        otherText:b.profile?b.profile.facets[facet]:'此組合未收錄，尚無對應分析。',
        same:!!(a.profile&&b.profile&&a.profile.facets[facet]===b.profile.facets[facet])})),
      conflicts:available?conflicts(a,b):[{title:'此項資料不足，先了解實際偏好',reason:'不能用其他位置的解說代替本項缺少的資料。',question:'針對這個面向，你最在意什麼？希望怎麼討論？',agreement:'先各自說一項需求與界線，再找出雙方同意的下一步。'}],
      directions:[direction(a,b),direction(b,a)],
      business:{opening:direction(a,b).opening,
        proposal:b.style?b.style.proposal:'先問需求及評估條件，不根據未收錄組合推測。',
        objection:'「針對這一項，目前最讓你猶豫的是什麼？我們可以先釐清，也可以暫時不決定。」',
        followUp:b.style?b.style.follow:'取得同意後，再約定回顧時間與下一步。'}
    };
  }
  function compare(input){
    const self=person(input.selfBirthday,input.selfName,input.selfPreference||'','自己');
    const other=person(input.otherBirthday,input.otherName,input.otherPreference||'','對方');
    const sameCode=self.chart.mainPersonality===other.chart.mainPersonality;
    return {self,other,
      basis:'整體摘要以主性格 CFG 為探索起點；下方12組與隱藏號逐項使用各自數字的解說。選填的實際偏好優先用於互動策略。',
      items:[...self.chart.groups.map((group,index)=>itemComparison(self,other,group.key,
        ['父基因（事業）','母基因（婚姻）','主性格','人生過程1','人生過程2','子女下屬','事業過程1','事業過程2','當下朋友','婚姻過程1','婚姻過程2','未來財富健康（晚年）'][index],
        group.value,other.chart.groups[index].value,index)),
        itemComparison(self,other,'hidden','隱藏號碼',self.chart.hidden,other.chart.hidden,12)],
      common:sameCode?'主性格相同，原始解說相同；實際經驗、需求與溝通偏好仍可能不同。':self.style&&other.style?self.theme===other.theme?`兩側都以「${self.style.name}」為溝通起點，可能有共通語言；仍需各自確認需求、界線與分工。`:`可探索的互補：${self.name}帶來「${self.style.information}」的視角，${other.name}帶來「${other.style.information}」的視角；先確認雙方是否認同，再協調分工。`:'目前資料不足以推測互補，先詢問彼此的需求與偏好。',
      conflicts:conflicts(self,other),directions:[direction(self,other),direction(other,self)],
      business:{opening:direction(self,other).opening,proposal:other.style?other.style.proposal:'先詢問需求與評估條件，不根據生日猜測購買動機。',
        objection:'「目前最讓你猶豫的是什麼？我們可以先補資料、調整方案，也可以暫時不決定。」先回應對方實際說出的顧慮。',
        followUp:other.style?other.style.follow:'先取得同意，再約定聯繫頻率與下一步。',
        boundary:'不使用配對分數、吉凶或人格標籤促成交易；需求、預算與意願由當事人自行確認。'}
    };
  }
  return Object.freeze({preferences:Object.freeze(preferences.map(Object.freeze)),compare});
});
