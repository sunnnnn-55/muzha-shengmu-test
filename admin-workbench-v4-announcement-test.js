const KEY='msm_v1_demo_state';
const TABS=[
  {id:'overview',label:'宮務總覽'},
  {id:'south',label:'南巡進香',key:'registrations'},
  {id:'lamp',label:'點燈祈福',key:'lamps'},
  {id:'peace',label:'安太歲',key:'peace'},
  {id:'notice',label:'公告管理',key:'announcements'}
];
const SEED_NOTICES=[
  {id:'ANN-TEST-001',type:'活動公告',title:'【測試公告】南巡進香活動資訊',body:'此為假資料公告，用於測試後台新增、編輯與置頂功能。',top:true,active:true,created:'2026-06-21'},
  {id:'ANN-TEST-002',type:'服務公告',title:'【測試公告】年度點燈祈福登記',body:'此為假資料公告，不代表正式活動或開放時間。',top:false,active:true,created:'2026-06-21'}
];
let activeTab='overview';
let editingId=null;
const $=id=>document.getElementById(id);
function copy(v){return JSON.parse(JSON.stringify(v));}
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}');}catch(e){return {};}}
function write(s){localStorage.setItem(KEY,JSON.stringify(s));}
function getList(s,key){
  if(!Array.isArray(s[key])){
    s[key]=key==='announcements'?copy(SEED_NOTICES):[];
    write(s);
  }
  return s[key];
}
function safe(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function toast(text){const el=$('toast');el.textContent=text;el.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>el.classList.remove('show'),1800);}
function count(list){
  return {
    total:list.length,
    pending:list.filter(x=>(x.status||'待確認')==='待確認').length,
    unpaid:list.filter(x=>(x.pay||'未繳')!=='已繳').length,
    paid:list.filter(x=>(x.pay||'未繳')==='已繳').length
  };
}
function statCard(n,label){return '<div class="stat"><b>'+n+'</b><span>'+label+'</span></div>';}
function badge(text,kind){return '<span class="pill '+kind+'">'+safe(text)+'</span>';}
function renderTabs(){
  $('tabs').innerHTML=TABS.map(t=>'<button class="'+(t.id===activeTab?'active':'')+'" data-tab="'+t.id+'">'+t.label+'</button>').join('');
  $('tabs').querySelectorAll('button').forEach(btn=>btn.onclick=()=>{activeTab=btn.dataset.tab;editingId=null;render();});
}
function serviceDetails(r,tab){
  if(tab==='south') return '人數：成人 '+(r.adult||0)+' 位／孩童 '+(r.child||0)+' 位<br>應繳：'+Number(r.total||0).toLocaleString('zh-TW')+' 元<br>車次：'+(r.bus?'第 '+r.bus+' 車':'安排中');
  if(tab==='lamp') return '燈別：'+safe(r.type||'未填寫')+'<br>祈福對象：'+safe(r.target||'未填寫')+'<br>農曆生日：'+safe(r.birth||'未填寫');
  return '祈福對象：'+safe(r.target||'未填寫')+'<br>生肖：'+safe(r.zodiac||'未填寫')+'<br>農曆生日：'+safe(r.birth||'未填寫');
}
function updateRecord(id,action){
  const s=read();
  const tab=TABS.find(x=>x.id===activeTab);
  const list=getList(s,tab.key);
  const r=list.find(x=>x.id===id);
  if(!r)return;
  if(action==='confirm')r.status='已確認';
  if(action==='cash')r.pay='已繳';
  if(action==='docs')r.status='需補件';
  write(s);toast(action==='cash'?'已登錄現金已繳':'資料已更新');render();
}
function renderService(s){
  const tab=TABS.find(x=>x.id===activeTab);
  const list=getList(s,tab.key);
  const c=count(list);
  let html='<h2 class="title">'+tab.label+'</h2><div class="stats">'+statCard(c.total,'資料筆數')+statCard(c.pending,'待確認')+statCard(c.unpaid,'未繳')+statCard(c.paid,'已繳')+'</div>';
  if(!list.length){$('view').innerHTML=html+'<div class="empty" style="margin-top:12px">目前沒有此服務的測試資料。</div>';return;}
  $('view').innerHTML=html;
  list.forEach(r=>{
    const card=document.createElement('article');
    card.className='record';
    const st=r.status||'待確認';
    const pay=r.pay||'未繳';
    card.innerHTML='<h3>'+safe(r.name||'未填姓名')+'｜'+safe(r.id||'未編號')+'</h3>'+badge(st,st==='已確認'?'ok':'')+badge(pay,pay==='已繳'?'ok':'no')+'<p>'+serviceDetails(r,activeTab)+'<br>備註：'+safe(r.note||'無')+'</p><div class="actions"><button class="btn" data-a="confirm">確認</button><button class="btn cash" data-a="cash">登錄現金已繳</button><button class="btn alt" data-a="docs">需補件</button></div>';
    card.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>updateRecord(r.id,b.dataset.a));
    $('view').appendChild(card);
  });
}
function renderOverview(s){
  const south=count(getList(s,'registrations'));
  const lamp=count(getList(s,'lamps'));
  const peace=count(getList(s,'peace'));
  const notices=getList(s,'announcements');
  const total=south.total+lamp.total+peace.total;
  const pending=south.pending+lamp.pending+peace.pending;
  const unpaid=south.unpaid+lamp.unpaid+peace.unpaid;
  const paid=south.paid+lamp.paid+peace.paid;
  $('view').innerHTML='<h2 class="title">整體狀況</h2><div class="stats">'+statCard(total,'全部資料')+statCard(pending,'待確認')+statCard(unpaid,'未繳')+statCard(paid,'已繳')+'</div><h2 class="title">公告狀況</h2><div class="stats">'+statCard(notices.length,'公告總數')+statCard(notices.filter(x=>x.active!==false).length,'顯示中')+statCard(notices.filter(x=>x.top===true).length,'置頂')+statCard(notices.filter(x=>x.active===false).length,'已隱藏')+'</div>';
}
function saveNoticeFromForm(e){
  e.preventDefault();
  const s=read();
  const list=getList(s,'announcements');
  const data={
    type:$('noticeType').value,
    title:$('noticeTitle').value.trim(),
    body:$('noticeBody').value.trim(),
    top:$('noticeTop').checked,
    active:$('noticeActive').checked,
    updated:new Date().toISOString().slice(0,10)
  };
  if(editingId){
    const old=list.find(x=>x.id===editingId);
    if(old)Object.assign(old,data);
  }else{
    list.unshift({id:'ANN-'+Date.now(),created:new Date().toISOString().slice(0,10),...data});
  }
  write(s);editingId=null;toast('公告已儲存');render();
}
function changeNotice(id,action){
  const s=read();
  const list=getList(s,'announcements');
  const item=list.find(x=>x.id===id);
  if(!item)return;
  if(action==='edit'){editingId=id;render();return;}
  if(action==='top')item.top=!Boolean(item.top);
  if(action==='active')item.active=item.active===false;
  if(action==='delete'){
    if(!confirm('確定刪除這則測試公告？'))return;
    s.announcements=list.filter(x=>x.id!==id);
  }
  write(s);toast('公告已更新');render();
}
function renderNotice(s){
  const list=getList(s,'announcements').slice().sort((a,b)=>Number(b.top)-Number(a.top));
  const editing=list.find(x=>x.id===editingId);
  $('view').innerHTML='<h2 class="title">公告管理</h2><form class="form" id="noticeForm"><div class="field"><label>公告類別</label><select id="noticeType"><option>一般公告</option><option>活動公告</option><option>服務公告</option><option>宮務公告</option></select></div><div class="field"><label>公告標題</label><input id="noticeTitle" required placeholder="請輸入測試公告標題"></div><div class="field"><label>公告內容</label><textarea id="noticeBody" required placeholder="請輸入測試公告內容"></textarea></div><div class="check"><label><input id="noticeTop" type="checkbox"> 置頂公告</label><label><input id="noticeActive" type="checkbox" checked> 顯示於前台</label></div><div class="actions"><button class="btn" type="submit">'+(editing?'儲存修改':'新增測試公告')+'</button>'+(editing?'<button class="btn alt" id="cancelEdit" type="button">取消編輯</button>':'')+'</div></form><h2 class="title">公告清單</h2><div id="noticeList"></div>';
  if(editing){
    $('noticeType').value=editing.type||'一般公告';
    $('noticeTitle').value=editing.title||'';
    $('noticeBody').value=editing.body||'';
    $('noticeTop').checked=Boolean(editing.top);
    $('noticeActive').checked=editing.active!==false;
  }
  $('noticeForm').onsubmit=saveNoticeFromForm;
  const cancel=$('cancelEdit');if(cancel)cancel.onclick=()=>{editingId=null;render();};
  const box=$('noticeList');
  if(!list.length){box.innerHTML='<div class="empty">目前沒有公告。</div>';return;}
  list.forEach(n=>{
    const card=document.createElement('article');card.className='record';
    card.innerHTML='<h3>'+safe(n.title)+'</h3>'+badge(n.top?'置頂':'一般',n.top?'ok':'')+badge(n.active!==false?'顯示中':'已隱藏',n.active!==false?'ok':'no')+'<p>類別：'+safe(n.type||'一般公告')+'<br>'+safe(n.body||'')+'<br>建立日期：'+safe(n.created||'')+'</p><div class="actions"><button class="btn alt" data-a="edit">編輯</button><button class="btn alt" data-a="top">'+(n.top?'取消置頂':'設為置頂')+'</button><button class="btn alt" data-a="active">'+(n.active!==false?'隱藏公告':'顯示公告')+'</button><button class="btn delete" data-a="delete">刪除測試公告</button></div>';
    card.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>changeNotice(n.id,b.dataset.a));
    box.appendChild(card);
  });
}
function render(){
  renderTabs();
  const s=read();
  if(activeTab==='overview')renderOverview(s);
  else if(activeTab==='notice')renderNotice(s);
  else renderService(s);
}
render();