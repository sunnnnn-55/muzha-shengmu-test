const SUPABASE_URL='https://iqblaloesmlpcklomxxy.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_1VWA5w7QeqO5d5QurTvlBA_-IRotyjE';
const FALLBACK=[
  {type:'公告狀態',title:'公告暫時無法載入',body:'請稍後重新整理，或以宮務後台公告管理為準。',top:false}
];
function escapeHtml(value){return String(value??'').replace(/[&<>"\']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));}
function setSubtitle(){
  const sub=document.querySelector('#notice .sub');
  if(sub) sub.textContent='同步讀取雲端資料庫中「已發布」的公告；置頂公告會優先顯示。';
}
async function getCloudAnnouncements(){
  const endpoint=SUPABASE_URL+'/rest/v1/announcements?select=category,title,content,is_pinned,status,created_at&status=eq.published&order=is_pinned.desc,created_at.desc&limit=5&_ts='+Date.now();
  const response=await fetch(endpoint,{
    cache:'no-store',
    headers:{
      apikey:SUPABASE_PUBLISHABLE_KEY,
      Authorization:'Bearer '+SUPABASE_PUBLISHABLE_KEY,
      Accept:'application/json'
    }
  });
  if(!response.ok) throw new Error('HTTP '+response.status);
  const rows=await response.json();
  return rows.map(row=>({
    type:row.category||'一般公告',
    title:row.title||'未命名公告',
    body:row.content||'',
    top:Boolean(row.is_pinned)
  }));
}
function renderPosts(posts){
  const box=document.getElementById('homepagePosts');
  if(!box) return;
  if(!posts.length){
    box.innerHTML='<div class="post"><span class="badge">公告狀態</span><h3>目前沒有已發布公告</h3><p>請以宮務後台公告管理設定為準。</p></div>';
    return;
  }
  box.innerHTML=posts.map(post=>{
    const label=(post.top?'置頂公告｜':'')+(post.type||'一般公告');
    return '<a class="post" href="announcements-test.html"><span class="badge '+(post.top?'is-pinned':'')+'">'+escapeHtml(label)+'</span><h3>'+escapeHtml(post.title)+'</h3><p>'+escapeHtml(post.body)+'</p></a>';
  }).join('');
}
async function renderAnnouncements(){
  setSubtitle();
  const box=document.getElementById('homepagePosts');
  if(box) box.innerHTML='<div class="post"><span class="badge">公告讀取中</span><h3>正在讀取雲端公告</h3><p>請稍候。</p></div>';
  try{
    renderPosts(await getCloudAnnouncements());
  }catch(error){
    renderPosts(FALLBACK);
  }
}
renderAnnouncements();