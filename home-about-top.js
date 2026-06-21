const STABLE_ANNOUNCEMENTS = [
  {
    type: '重要公告',
    title: '本宮最新消息與活動資訊',
    body: '各項活動、法會與服務資訊，請以木柵聖母宮公告為準。',
    top: true
  },
  {
    type: '活動公告',
    title: '南巡進香報名服務',
    body: '活動說明、費用、報名與查詢入口，請由本宮服務專區進入。',
    top: false
  },
  {
    type: '服務公告',
    title: '點燈祈福與安太歲登記',
    body: '祈福服務登記與查詢資訊，將依宮務安排公告。',
    top: false
  }
];

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[char]));
}

function renderStableAnnouncements() {
  const box = document.getElementById('homepagePosts');
  if (!box) return;

  const subtitle = document.querySelector('#notice .sub');
  if (subtitle) {
    subtitle.textContent = '本宮最新消息、活動與服務資訊。';
  }

  box.innerHTML = STABLE_ANNOUNCEMENTS.map(post => {
    const label = `${post.top ? '置頂公告｜' : ''}${post.type}`;
    return `
      <a class="post" href="announcements-test.html">
        <span class="badge ${post.top ? 'is-pinned' : ''}">${escapeHtml(label)}</span>
        <h3>${escapeHtml(post.title)}</h3>
        <p>${escapeHtml(post.body)}</p>
      </a>
    `;
  }).join('');
}

renderStableAnnouncements();