const SUPABASE_URL = ‘https://iqblaloesmlpcklomxxy.supabase.co’;
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_1VWA5w7QeqO5d5QurTvlBA_-IRotyjE';
const ANNOUNCEMENTS_LIMIT = 3;

function escapeHtml(value) {
return String(value ?? ‘’).replace(/[&<>”’]/g, char => ({
‘&’: ‘&’,
‘<’: ‘<’,
‘>’: ‘>’,
‘”’: ‘"’,
“’”: ‘'’
}[char]));
}

function formatDate(value) {
const date = new Date(value);
if (Number.isNaN(date.getTime())) return ‘’;
return date.toLocaleDateString(‘zh-TW’, {
year: ‘numeric’,
month: ‘2-digit’,
day: ‘2-digit’
});
}

function renderAnnouncements(posts) {
const box = document.getElementById(‘homepagePosts’);
if (!box) return;

const subtitle = document.querySelector(’#notice .sub’);
if (subtitle) {
subtitle.textContent = ‘本宮最新消息、活動與服務資訊。’;
}

box.innerHTML = posts.map(post => {
const label = ${post.top ? '置頂公告｜' : ''}${post.type};

return `
  <a class="post" href="announcements-test.html">
    <span class="badge ${post.top ? 'is-pinned' : ''}">${escapeHtml(label)}</span>
    <h3>${escapeHtml(post.title)}</h3>
    <p>${escapeHtml(post.content)}</p>
  </a>
`;

}).join(’’);
}

async function loadPublishedAnnouncements() {
if (SUPABASE_PUBLISHABLE_KEY === ‘PASTE_PUBLISHABLE_KEY_HERE’) {
renderAnnouncements([{
type: ‘公告’,
title: ‘公告同步尚未設定’,
content: ‘請完成公開讀取設定後重新整理。’,
top: false
}]);
return;
}

const query = new URLSearchParams({
select: ‘category,title,content,is_pinned,published_at’,
status: ‘eq.published’,
order: ‘is_pinned.desc,published_at.desc.nullslast’,
limit: String(ANNOUNCEMENTS_LIMIT)
});

try {
const response = await fetch(
${SUPABASE_URL}/rest/v1/announcements?${query.toString()},
{
headers: {
apikey: SUPABASE_PUBLISHABLE_KEY,
Accept: ‘application/json’
},
cache: ‘no-store’
}
);

if (!response.ok) {
  throw new Error(`公告讀取失敗：${response.status}`);
}
const rows = await response.json();
const posts = Array.isArray(rows)
  ? rows.map(row => ({
      type: row.category || '公告',
      title: row.title || '未命名公告',
      content: row.content || (
        row.published_at
          ? `發布日期：${formatDate(row.published_at)}`
          : '請查看完整公告內容。'
      ),
      top: Boolean(row.is_pinned)
    }))
  : [];
if (posts.length === 0) {
  renderAnnouncements([{
    type: '公告',
    title: '目前沒有顯示中的公告',
    content: '最新消息將由本宮公告。',
    top: false
  }]);
  return;
}
renderAnnouncements(posts);

} catch (error) {
console.error(error);

renderAnnouncements([{
  type: '公告',
  title: '公告暫時無法同步',
  content: '請稍後重新整理。',
  top: false
}]);

}
}

loadPublishedAnnouncements();
