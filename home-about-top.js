const KEY='msm_v1_demo_state';
const FALLBACK=[
  {type:'活動公告',title:'【公告樣板】南巡進香活動資訊',body:'活動日期、集合地點、費用與報名方式摘要。',top:true},
  {type:'服務公告',title:'【公告樣板】年度點燈祈福登記',body:'燈別、登記時間、費用與確認方式摘要。',top:false},
  {type:'宮務公告',title:'【公告樣板】本宮服務時間與聯絡方式',body:'服務時間、聯絡窗口與特別提醒摘要。',top:false}
];
function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));}
function getAnnouncementState(){
  try{
    const state=JSON.parse(localStorage.getItem(KEY)||'{}');
    if(Array.isArray(state.announcements)){
      return {managed:true,items:state.announcements.filter(item=>item.active!==false)};
    }
  }catch(error){}
  return {managed:false,items:[]};
}
function renderAnnouncements(){
  const box=document.getElementById('homepagePosts');
  if(!box)return;
  const result=getAnnouncementState();
  let posts=result.managed?result.items:FALLBACK;
  posts=posts.slice().sort((a,b)=>Number(Boolean(b.top))-Number(Boolean(a.top))).slice(0,3);
  if(!posts.length){
    box.innerHTML='<div class="post"><span class="badge">公告狀態</span><h3>目前沒有顯示中的公告</h3><p>請以宮務後台的公告管理設定為準。</p></div>';
    return;
  }
  box.innerHTML=posts.map(post=>{
    const label=(post.top?'置頂公告｜':'')+(post.type||'一般公告');
    return '<a class="post" href="announcements-test.html"><span class="badge '+(post.top?'is-pinned':'')+'">'+escapeHtml(label)+'</span><h3>'+escapeHtml(post.title||'未命名公告')+'</h3><p>'+escapeHtml(post.body||post.content||'')+'</p></a>';
  }).join('');
}
renderAnnouncements();