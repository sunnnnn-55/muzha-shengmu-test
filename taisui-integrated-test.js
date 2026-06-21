const STORAGE_KEY = 'msm_v1_demo_state';
let state;

try {
  state = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
} catch (error) {
  state = {};
}

if (!Array.isArray(state.peace)) {
  state.peace = [
    {
      id: 'PEA-2026-0001',
      name: '測試安太歲信眾',
      phone: '0912001234',
      target: '測試對象',
      zodiac: '馬',
      birth: '',
      birthSolar: '',
      birthInput: '',
      leapMonth: false,
      note: '測試資料',
      status: '待確認',
      pay: '未繳'
    }
  ];
}

state.peaceSeq = state.peaceSeq || 1;

const by = id => document.getElementById(id);
const ZODIAC_BY_BRANCH = {
  子: '鼠', 丑: '牛', 寅: '虎', 卯: '兔', 辰: '龍', 巳: '蛇',
  午: '馬', 未: '羊', 申: '猴', 酉: '雞', 戌: '狗', 亥: '豬'
};
const CN = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
let birthMode = 'western';
let birthdayTimer = null;

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[char]));
}

function chineseMonth(raw) {
  const value = String(raw || '').replace(/\s/g, '').replace(/闰/g, '閏');
  if (/^[閏]?[正冬臘一二三四五六七八九十]+月$/.test(value)) return value;

  const digits = value.replace(/[^0-9]/g, '');
  if (!digits) return value || '—';
  const number = Number(digits);
  const label = number === 1 ? '正' : number === 11 ? '冬' : number === 12 ? '臘' : CN[number] || String(number);
  return `${/閏/.test(value) ? '閏' : ''}${label}月`;
}

function chineseDay(raw) {
  const value = String(raw || '').replace(/\s/g, '');
  if (/^(初[一二三四五六七八九十]|十[一二三四五六七八九]?|二十|廿[一二三四五六七八九]|三十)$/.test(value)) return value;

  const digits = value.replace(/[^0-9]/g, '');
  if (!digits) return value || '—';
  const number = Number(digits);
  if (number <= 10) return `初${CN[number]}`;
  if (number < 20) return `十${CN[number - 10]}`;
  if (number === 20) return '二十';
  if (number < 30) return `廿${CN[number - 20]}`;
  return '三十';
}

function getStemBranch(text) {
  return String(text).match(/[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]/)?.[0] || '';
}

function clearBirthdayResult() {
  by('birth').value = '';
  by('zodiac').value = '';
  by('birthPreview').classList.remove('show');
  by('birthError').classList.remove('show');
}

function setBirthMode(nextMode) {
  birthMode = nextMode;
  by('westernMode').classList.toggle('active', birthMode === 'western');
  by('rocMode').classList.toggle('active', birthMode === 'roc');
  by('birthYear').value = '';
  by('birthMonth').value = '';
  by('birthDay').value = '';
  clearBirthdayResult();

  if (birthMode === 'western') {
    by('birthYear').placeholder = '1986';
    by('birthYearLabel').textContent = '西元年';
  } else {
    by('birthYear').placeholder = '75';
    by('birthYearLabel').textContent = '民國年';
  }
}

function parseBirthday() {
  let inputYear = Number(by('birthYear').value);
  const month = Number(by('birthMonth').value);
  const day = Number(by('birthDay').value);

  if (!Number.isInteger(inputYear) || !Number.isInteger(month) || !Number.isInteger(day)) return null;

  const originalInput = `${birthMode === 'roc' ? '民國' : '西元'}${inputYear}年${month}月${day}日`;
  if (birthMode === 'roc') inputYear += 1911;

  const date = new Date(Date.UTC(inputYear, month - 1, day, 4, 0, 0));
  const valid = inputYear >= 1900 && inputYear <= 2100 &&
    date.getUTCFullYear() === inputYear &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  if (!valid) return null;

  return { year: inputYear, month, day, date, originalInput };
}

function applyBirthdayConversion(showError = false) {
  by('birthError').classList.remove('show');
  const data = parseBirthday();

  if (!data) {
    clearBirthdayResult();
    if (showError) {
      by('birthError').textContent = birthMode === 'roc'
        ? '請完整填入民國年、月、日，例如：75、9、6。'
        : '請完整填入西元年、月、日，例如：1986、9、6。';
      by('birthError').classList.add('show');
    }
    return null;
  }

  try {
    const formatter = new Intl.DateTimeFormat('zh-TW-u-ca-chinese', {
      year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Taipei'
    });
    const full = formatter.format(data.date);
    const parts = formatter.formatToParts(data.date);
    const rawMonth = parts.find(part => part.type === 'month')?.value || '';
    const rawDay = parts.find(part => part.type === 'day')?.value || '';
    const stemBranch = getStemBranch(full);
    const animal = stemBranch ? ZODIAC_BY_BRANCH[stemBranch[1]] || '' : '';
    const lunarMonth = chineseMonth(rawMonth);
    const lunarDay = chineseDay(rawDay);
    const leapMonth = /閏|闰/.test(full + rawMonth);
    const lunarText = `${stemBranch ? `${stemBranch}年` : ''}${lunarMonth}${lunarDay}${animal ? `（${animal}年）` : ''}`;

    by('birth').value = lunarText;
    by('zodiac').value = animal ? `${animal}年（${stemBranch}）` : '請人工確認生肖';
    by('lunarDisplay').textContent = `農曆：${lunarText}`;
    by('birthDetail').textContent = `國曆 ${data.year} 年 ${data.month} 月 ${data.day} 日｜${leapMonth ? '閏月，請宮務確認辦理月份' : '非閏月'}`;
    by('birthPreview').classList.add('show');

    return {
      lunarText,
      zodiac: animal || '',
      leapMonth,
      solarText: `${data.year}/${String(data.month).padStart(2, '0')}/${String(data.day).padStart(2, '0')}`,
      inputText: data.originalInput
    };
  } catch (error) {
    clearBirthdayResult();
    by('birthError').textContent = '此手機瀏覽器暫時無法換算農曆，請改用國曆日期選單後重試。';
    by('birthError').classList.add('show');
    return null;
  }
}

function scheduleBirthdayConversion() {
  clearTimeout(birthdayTimer);
  birthdayTimer = setTimeout(() => {
    if (parseBirthday()) applyBirthdayConversion(false);
  }, 280);
}

by('westernMode').addEventListener('click', () => setBirthMode('western'));
by('rocMode').addEventListener('click', () => setBirthMode('roc'));
[by('birthYear'), by('birthMonth'), by('birthDay')].forEach(input => input.addEventListener('input', scheduleBirthdayConversion));

by('birthPicker').addEventListener('change', () => {
  if (!by('birthPicker').value) return;
  const [year, month, day] = by('birthPicker').value.split('-').map(Number);
  birthMode = 'western';
  by('westernMode').classList.add('active');
  by('rocMode').classList.remove('active');
  by('birthYear').placeholder = '1986';
  by('birthYearLabel').textContent = '西元年';
  by('birthYear').value = year;
  by('birthMonth').value = month;
  by('birthDay').value = day;
  applyBirthdayConversion(true);
});

by('register').addEventListener('submit', event => {
  event.preventDefault();
  const birthday = applyBirthdayConversion(true);

  if (!birthday) {
    by('birthYear').focus();
    return;
  }

  state.peaceSeq += 1;
  const record = {
    id: `PEA-2026-${String(state.peaceSeq).padStart(4, '0')}`,
    name: by('name').value.trim(),
    phone: by('phone').value.trim(),
    target: by('target').value.trim(),
    zodiac: birthday.zodiac || by('zodiac').value.trim(),
    birth: birthday.lunarText,
    birthSolar: birthday.solarText,
    birthInput: birthday.inputText,
    leapMonth: birthday.leapMonth,
    note: by('note').value.trim() || '無',
    status: '待確認',
    pay: '未繳'
  };

  state.peace.unshift(record);
  save();

  by('created').innerHTML = `
    <div class="r">
      <b>安太歲測試登記已建立</b><br>
      安太歲碼：<b>${escapeHtml(record.id)}</b><br>
      農曆生日：${escapeHtml(record.birth)}<br>
      目前狀態：待確認／未繳
    </div>`;

  event.target.reset();
  setBirthMode('western');
});

by('query').addEventListener('click', () => {
  const id = by('code').value.trim().toUpperCase();
  const last = by('last').value.trim();
  const record = state.peace.find(item => item.id === id && String(item.phone).slice(-4) === last);

  if (!record) {
    by('out').innerHTML = '<div class="r">查無測試資料。</div>';
    return;
  }

  const birthdayDetail = record.birth
    ? `${escapeHtml(record.birth)}${record.birthSolar ? `（國曆 ${escapeHtml(record.birthSolar)}）` : ''}${record.leapMonth ? '｜閏月' : ''}`
    : '未填寫';

  by('out').innerHTML = `
    <div class="r">
      <b>${escapeHtml(record.name)}｜${escapeHtml(record.id)}</b><br>
      <span class="pill">${escapeHtml(record.status)}</span><span class="pill">${escapeHtml(record.pay)}</span><br>
      祈福對象：${escapeHtml(record.target)}<br>
      生肖：${escapeHtml(record.zodiac)}<br>
      農曆生日：${birthdayDetail}<br>
      備註：${escapeHtml(record.note)}
    </div>`;
});

save();