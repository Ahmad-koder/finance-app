'use strict';

/* =====================================================================
   Утилиты
   ===================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = () => ymd(new Date());
const parseYmd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const curMonth = () => today().slice(0, 7);
const shiftMonth = (mk, n) => { const [y, m] = mk.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`; };
const daysInMonth = (y, m) => new Date(y, m, 0).getDate();
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const fgOn = hex => { const n = parseInt(hex.slice(1), 16); return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 > 165 ? '#1c1c1e' : '#fff'; };

const MONTHS = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];
const MONTHS_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const MONTHS_SHORT = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
const WEEKDAYS = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];

function monthTitle(mk) {
  const [y, m] = mk.split('-').map(Number);
  return MONTHS[m - 1] + (y !== new Date().getFullYear() ? ' ' + y : '');
}
function dayTitle(s) {
  if (s === today()) return 'Сегодня';
  const yd = new Date(); yd.setDate(yd.getDate() - 1);
  if (s === ymd(yd)) return 'Вчера';
  const d = parseYmd(s);
  return `${d.getDate()} ${MONTHS_GEN[d.getMonth()]}${d.getFullYear() !== new Date().getFullYear() ? ' ' + d.getFullYear() : ''}, ${WEEKDAYS[d.getDay()]}`;
}
const shortDate = s => { const d = parseYmd(s); return `${d.getDate()} ${MONTHS_GEN[d.getMonth()]}${d.getFullYear() !== new Date().getFullYear() ? ' ' + d.getFullYear() : ''}`; };
function plural(n, one, few, many) {
  const a = Math.abs(n) % 100, b = a % 10;
  if (a > 10 && a < 20) return many;
  if (b > 1 && b < 5) return few;
  if (b === 1) return one;
  return many;
}

function parseNum(s) {
  if (s == null) return NaN;
  s = String(s).replace(/[\s  ]/g, '').replace(/[−–]/g, '-').replace(/[^\d,.\-+]/g, '');
  if (s.includes(',') && s.includes('.')) {
    s = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  } else s = s.replace(',', '.');
  return parseFloat(s);
}
const round2 = v => Math.round(v * 100) / 100;

/* =====================================================================
   Справочники
   ===================================================================== */
const CURRENCIES = {
  RUB: 'Российский рубль', USD: 'Доллар США', EUR: 'Евро', KZT: 'Казахстанский тенге', BYN: 'Белорусский рубль',
  UZS: 'Узбекский сум', AMD: 'Армянский драм', GEL: 'Грузинский лари', KGS: 'Киргизский сом', TRY: 'Турецкая лира',
  CNY: 'Китайский юань', AED: 'Дирхам ОАЭ', GBP: 'Фунт стерлингов', THB: 'Тайский бат', JPY: 'Японская иена',
};
const ACCOUNT_TYPES = {
  cash: { name: 'Наличные', one: 'Наличные', icon: '💵' },
  card: { name: 'Дебетовые карты', one: 'Дебетовая карта', icon: '💳' },
  credit: { name: 'Кредитные карты', one: 'Кредитная карта', icon: '🏦' },
  savings: { name: 'Накопительные счета', one: 'Накопительный счёт', icon: '🐷' },
  deposit: { name: 'Вклады', one: 'Вклад', icon: '🔒' },
  invest: { name: 'Инвестиции', one: 'Брокерский счёт', icon: '📈' },
  debt: { name: 'Долги', one: 'Долг', icon: '🤝' },
  other: { name: 'Прочее', one: 'Другое', icon: '👛' },
};
const PALETTE = ['#ff3b30', '#ff9500', '#ffcc00', '#34c759', '#00c7be', '#30b0c7', '#007aff', '#2f6bff', '#5856d6', '#af52de', '#ff2d55', '#a2845e', '#8e8e93', '#1c1c1e', '#64d2ff', '#ff6482'];
const EMOJI = ['🛒', '🍽️', '☕', '🍔', '🍕', '🍷', '🚇', '🚕', '⛽', '🚗', '🅿️', '🏠', '💡', '🔧', '🧹', '📱', '💻', '📺', '💊', '🏥', '🦷', '👕', '👟', '🛍️', '🎬', '🎮', '🎵', '📚', '🎓', '✈️', '🏖️', '🏨', '💅', '💇', '🎁', '🎉', '🧸', '👶', '🐾', '🏋️', '⚽', '🧾', '🏛️', '🔁', '💼', '💰', '💵', '💳', '🏦', '🐷', '📈', '🤝', '🎯', '🏡', '🚙', '💍', '❤️', '🌱', '🎨', '📷', '🎄', '🚬', '📦', '➕'];

const BANK_PRESETS = [
  { name: 'Т-Банк', color: '#ffdd2d' }, { name: 'Сбербанк', color: '#21a038' }, { name: 'Альфа-Банк', color: '#ef3124' },
  { name: 'ВТБ', color: '#0a2896' }, { name: 'Газпромбанк', color: '#004b9b' }, { name: 'Райффайзен', color: '#fee600' },
  { name: 'Озон Банк', color: '#005bff' }, { name: 'Яндекс Банк', color: '#fc3f1d' }, { name: 'Совкомбанк', color: '#e3242b' },
  { name: 'Другой банк', color: '#8e8e93' },
];

// Подсказки для автокатегоризации: ключевые слова → название категории по умолчанию
const KEYWORDS = [
  ['Продукты', /супермаркет|продукт|пят[её]рочк|pyaterochk|перекр[её]ст|perekrest|магнит|magnit|лента|lenta|ашан|auchan|вкусвилл|vkusvill|дикси|dixy|metro|окей|okey|глобус|globus|самокат|samokat|азбука вкуса|spar|fix price|фикс прайс|grocer/i],
  ['Кафе и рестораны', /каф[ея]|ресторан|фастфуд|кофе|coffee|cafe|макдон|вкусно и точка|kfc|rostic|бургер|burger|додо|пицц|pizza|шоколадниц|starbucks|delivery club|якитория|суши|sushi|restaurant|столов/i],
  ['Транспорт', /транспорт|метро|metro mos|такси|taxi|uber|yandex.?go|яндекс go|ситимобил|автобус|ржд|rzd|тройка|каршеринг|делимобиль|самокат.*аренд|whoosh|urent|аэроэкспресс/i],
  ['Авто', /топливо|азс|лукойл|lukoil|газпромнефть|роснефть|rosneft|shell|татнефть|автоуслуг|автомойк|парковк|parking|шиномонтаж|осаго|каско|gazprom ?neft/i],
  ['Дом и ЖКХ', /жкх|коммунал|жилищ|электроэнерг|энергосбыт|водоканал|газ.*поставк|леруа|leroy|икеа|ikea|hoff|obi|квартплат|управляющ/i],
  ['Связь и интернет', /связь|мтс|mts|билайн|beeline|мегафон|megafon|теле2|tele2|\bt2\b|интернет|ростелеком|rostelecom|дом\.ру|yota/i],
  ['Здоровье', /аптек|apteka|медицин|клиник|стоматолог|здоровье|здравсити|ригла|горздрав|36,6|врач|анализ|инвитро|invitro|гемотест/i],
  ['Одежда и обувь', /одежд|обувь|zara|h&m|uniqlo|спортмастер|sportmaster|lamoda|gloria|befree|ostin|zolla|love republic|rendez/i],
  ['Покупки', /wildberries|wb\b|ozon|озон|маркетплейс|aliexpress|яндекс маркет|market|dns|м\.видео|mvideo|эльдорадо|ситилинк|citilink|детский мир/i],
  ['Развлечения', /кино|cinema|развлечен|театр|концерт|музей|игр|steam|playstation|xbox|боулинг|квест|афиша|клуб/i],
  ['Подписки', /подписк|netflix|spotify|apple\.com|itunes|яндекс плюс|yandex plus|кинопоиск|kinopoisk|ivi|okko|youtube|premier|wink|chatgpt|openai|google ?one|icloud/i],
  ['Образование', /образован|курс|школ|университет|skillbox|нетология|geekbrains|литрес|litres|книг|book/i],
  ['Путешествия', /авиа|airlines|aeroflot|аэрофлот|победа|s7|отел|hotel|booking|островок|ostrovok|туту|tutu|туризм|путешеств|хостел/i],
  ['Красота', /красот|салон|барбер|barber|косметик|золотое яблоко|летуаль|letu|рив гош|подружк|маникюр/i],
  ['Животные', /зоо|ветеринар|четыре лапы|бетховен|petshop/i],
  ['Налоги и сборы', /налог|госпошлин|штраф|гибдд|фнс|госуслуг|gosuslug/i],
  ['Зарплата', /зарплат|заработн|аванс|salary/i],
  ['Кэшбэк и проценты', /кэшб[еэ]к|cashback|процент|вознагражд|капитализац/i],
];

/* =====================================================================
   Хранилище
   ===================================================================== */
const STORE_KEY = 'finapp.v1';

function defaultState() {
  const c = (name, icon, color, kind = 'expense') => ({ id: uid(), name, icon, color, kind });
  return {
    version: 1,
    settings: { currency: 'RUB', rates: {}, ratesDate: null, pinHash: null, theme: 'auto', lastAccountId: null, onboarded: false },
    accounts: [
      { id: uid(), name: 'Наличные', type: 'cash', currency: 'RUB', initial: 0, color: '#34c759', icon: '💵', includeInTotal: true, archived: false },
      { id: uid(), name: 'Основная карта', type: 'card', currency: 'RUB', initial: 0, color: '#2f6bff', icon: '💳', includeInTotal: true, archived: false },
    ],
    categories: [
      c('Продукты', '🛒', '#34c759'), c('Кафе и рестораны', '🍽️', '#ff9500'), c('Транспорт', '🚇', '#007aff'), c('Авто', '⛽', '#5856d6'),
      c('Дом и ЖКХ', '🏠', '#a2845e'), c('Связь и интернет', '📱', '#30b0c7'), c('Здоровье', '💊', '#ff2d55'), c('Одежда и обувь', '👕', '#af52de'),
      c('Покупки', '🛍️', '#ff6482'), c('Развлечения', '🎬', '#ffcc00'), c('Подписки', '🔁', '#64d2ff'), c('Образование', '📚', '#2f6bff'),
      c('Путешествия', '✈️', '#00c7be'), c('Красота', '💅', '#ff2d55'), c('Подарки', '🎁', '#ff9500'), c('Дети', '🧸', '#ffcc00'),
      c('Животные', '🐾', '#a2845e'), c('Налоги и сборы', '🧾', '#8e8e93'), c('Другое', '📦', '#8e8e93'),
      c('Зарплата', '💼', '#34c759', 'income'), c('Подработка', '💻', '#30b0c7', 'income'), c('Кэшбэк и проценты', '💰', '#ffcc00', 'income'),
      c('Подарки', '🎁', '#ff9500', 'income'), c('Другое', '➕', '#8e8e93', 'income'),
    ],
    transactions: [], goals: [], budgets: [], recurring: [], banks: [], rules: [],
  };
}
function migrate(s) {
  const d = defaultState();
  for (const k of Object.keys(d)) if (s[k] == null) s[k] = d[k];
  s.settings = { ...d.settings, ...s.settings };
  return s;
}
function load() {
  try { const raw = localStorage.getItem(STORE_KEY); if (raw) return migrate(JSON.parse(raw)); } catch (e) { console.error(e); }
  return defaultState();
}
let S = load();
function save() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); }
  catch (e) { toast('Не удалось сохранить данные: ' + e.message); }
}

/* =====================================================================
   Вычисления
   ===================================================================== */
const acc = id => S.accounts.find(a => a.id === id);
const catById = id => S.categories.find(c => c.id === id);
const accCur = id => acc(id)?.currency || S.settings.currency;
const rate = cur => cur === S.settings.currency ? 1 : (+S.settings.rates[cur] || 1);
const toMain = (v, cur) => v * rate(cur);
const convert = (v, from, to) => from === to ? v : v * rate(from) / rate(to);
const sortTx = (a, b) => b.date.localeCompare(a.date) || (b.ts || 0) - (a.ts || 0);
const txMain = t => toMain(t.amount, accCur(t.accountId));

let BAL = {};
function computeBalances() {
  const b = {};
  for (const a of S.accounts) b[a.id] = +a.initial || 0;
  for (const t of S.transactions) {
    if (t.type === 'expense') { if (t.accountId in b) b[t.accountId] -= t.amount; }
    else if (t.type === 'income') { if (t.accountId in b) b[t.accountId] += t.amount; }
    else if (t.type === 'transfer') {
      if (t.accountId in b) b[t.accountId] -= t.amount;
      if (t.toAccountId in b) b[t.toAccountId] += (t.toAmount ?? t.amount);
    }
  }
  for (const k in b) b[k] = round2(b[k]);
  BAL = b;
}
function netWorth() {
  let assets = 0, debt = 0;
  for (const a of S.accounts) {
    if (a.archived || !a.includeInTotal) continue;
    const v = toMain(BAL[a.id] || 0, a.currency);
    if (v >= 0) assets += v; else debt += v;
  }
  return { total: assets + debt, assets, debt };
}
const txInMonth = mk => S.transactions.filter(t => t.date.startsWith(mk));
function sumStats(list) {
  let income = 0, expense = 0;
  for (const t of list) {
    if (t.type === 'income') income += txMain(t);
    else if (t.type === 'expense') expense += txMain(t);
  }
  return { income, expense };
}
function byCategory(list, kind) {
  const m = new Map();
  for (const t of list) if (t.type === kind) m.set(t.categoryId || '', (m.get(t.categoryId || '') || 0) + txMain(t));
  return [...m.entries()].map(([id, value]) => {
    const c = catById(id);
    return { id, value, name: c?.name || 'Без категории', color: c?.color || '#8e8e93', icon: c?.icon || '❔' };
  }).sort((a, b) => b.value - a.value);
}
function budgetSpent(b, mk) {
  return txInMonth(mk).filter(t => t.type === 'expense' && (!b.categoryId || t.categoryId === b.categoryId))
    .reduce((s, t) => s + txMain(t), 0);
}
function goalSaved(g) {
  if (g.accountId && acc(g.accountId)) return convert(BAL[g.accountId] || 0, accCur(g.accountId), g.currency);
  return (g.contributions || []).reduce((s, c) => s + c.amount, 0);
}

/* =====================================================================
   Форматирование денег
   ===================================================================== */
const fmtCache = {};
function money(v, cur = S.settings.currency) {
  v = round2(v);
  const frac = Math.abs(v % 1) > 0.001 ? 2 : 0;   // копейки показываем только если они есть, и всегда двумя знаками
  const key = cur + frac;
  if (!fmtCache[key]) {
    try { fmtCache[key] = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: cur, minimumFractionDigits: frac, maximumFractionDigits: frac }); }
    catch { fmtCache[key] = { format: n => n.toFixed(frac) + ' ' + cur }; }
  }
  return fmtCache[key].format(v).replace('-', '−');
}
function curSym(cur) {
  try { return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: cur }).formatToParts(0).find(p => p.type === 'currency').value; }
  catch { return cur; }
}
const fmtInput = v => (v === '' || v == null || isNaN(v)) ? '' : String(round2(v)).replace('.', ',');

/* =====================================================================
   Иконки
   ===================================================================== */
const svg = (p, w = 2) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const ICON = {
  overview: svg('<path d="M12 3a9 9 0 1 0 9 9h-9z"/><path d="M15.5 2.8A9 9 0 0 1 21.2 8.5H15.5z"/>'),
  ops: svg('<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.6" cy="6" r=".6"/><circle cx="3.6" cy="12" r=".6"/><circle cx="3.6" cy="18" r=".6"/>'),
  accounts: svg('<rect x="2.5" y="6" width="19" height="13.5" rx="3"/><path d="M2.5 10h19M6.5 15h4"/>'),
  plans: svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>'),
  more: svg('<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>', 2.4),
  plus: svg('<path d="M12 5v14M5 12h14"/>', 2.4),
  chart: svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
  search: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
  chev: svg('<path d="m9 6 6 6-6 6"/>', 2.2),
  x: svg('<path d="M6 6l12 12M18 6 6 18"/>', 2.4),
};

/* =====================================================================
   Общие UI-элементы
   ===================================================================== */
let toastTimer;
function toast(msg, action) {
  const el = $('#toast');
  el.innerHTML = esc(msg) + (action ? `<button type="button">${esc(action.label)}</button>` : '');
  el.classList.toggle('act', !!action);
  if (action) $('button', el).onclick = () => { clearTimeout(toastTimer); el.classList.remove('show', 'act'); action.fn(); };
  el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show', 'act'), action ? 5000 : 2400);
}
// Снимок данных до удаления — чтобы можно было отменить одним нажатием
const undoTo = snap => ({ label: 'Отменить', fn: () => { S = migrate(JSON.parse(snap)); commit('Восстановлено'); } });
const daysBetween = (a, b) => Math.round((parseYmd(b) - parseYmd(a)) / 864e5);
function inDays(date) {
  const d = daysBetween(today(), date);
  if (d < 0) return `просрочено на ${-d} ${plural(-d, 'день', 'дня', 'дней')}`;
  if (d === 0) return 'сегодня';
  if (d === 1) return 'завтра';
  return `через ${d} ${plural(d, 'день', 'дня', 'дней')}`;
}
const topbar = (title, right = '') => `<div class="top"><h1>${title}</h1><div class="top-act">${right}</div></div>`;
const monthNav = () => `<div class="mnav"><button data-act="month" data-d="-1" aria-label="Предыдущий месяц">‹</button><button class="mtitle" data-act="monthNow">${monthTitle(ui.month)}</button><button data-act="month" data-d="1" aria-label="Следующий месяц">›</button></div>`;
const icBox = (icon, color) => `<span class="ic" style="background:${color}26">${esc(icon)}</span>`;
const fld = (label, input) => `<label class="fld"><span>${label}</span>${input}</label>`;
const grp = (...rows) => `<div class="group">${rows.join('')}</div>`;
const swt = (id, on) => `<input type="checkbox" class="switch" id="${id}" ${on ? 'checked' : ''}>`;
const selHtml = (id, opts, val) => `<select id="${id}">${opts.map(([v, l]) => `<option value="${esc(v)}" ${String(v) === String(val ?? '') ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
const curOpts = () => Object.entries(CURRENCIES).map(([c, n]) => [c, `${c} — ${n}`]);
const emptyBox = (e, text, btn = '') => `<div class="empty"><div class="e">${e}</div><div>${text}</div>${btn}</div>`;
const progBar = (pct, cls = '') => `<div class="bar ${cls}"><i style="width:${clamp(pct, 0, 100).toFixed(1)}%"></i></div>`;

function emojiPicker(sel) { return `<div class="emoji-grid">${EMOJI.map(e => `<button type="button" data-e="${e}" class="${e === sel ? 'on' : ''}">${e}</button>`).join('')}</div>`; }
function colorPicker(sel) { return `<div class="color-grid">${PALETTE.map(c => `<button type="button" data-c="${c}" class="${c === sel ? 'on' : ''}" style="background:${c}" aria-label="Цвет ${c}"></button>`).join('')}</div>`; }
function wirePick(container, attr, onPick) {
  if (!container) return;
  container.addEventListener('click', e => {
    const b = e.target.closest(`[data-${attr}]`); if (!b) return;
    $$('.on', container).forEach(x => x.classList.remove('on')); b.classList.add('on');
    onPick(b.dataset[attr], b);
  });
}

function donut(items, total, label, sub) {
  const r = 15.9155;
  let off = 0, segs = '';
  if (total > 0) {
    const gap = items.length > 1 ? 0.8 : 0;
    for (const it of items) {
      const p = it.value / total * 100;
      const len = Math.max(p - gap, 0.01);
      segs += `<circle r="${r}" cx="21" cy="21" fill="none" stroke="${it.color}" stroke-width="5.2" stroke-dasharray="${len} ${100 - len}" stroke-dashoffset="${-off}"/>`;
      off += p;
    }
  }
  return `<div class="donut"><svg viewBox="0 0 42 42"><circle r="${r}" cx="21" cy="21" fill="none" stroke="var(--card2)" stroke-width="5.2"/>${segs}</svg><div class="c"><b>${label}</b><span>${sub}</span></div></div>`;
}
function topN(items, n = 6) {
  if (items.length <= n) return items;
  const rest = items.slice(n - 1).reduce((s, x) => s + x.value, 0);
  return [...items.slice(0, n - 1), { id: '__rest', value: rest, name: 'Остальное', color: '#c7c7cc', icon: '…' }];
}

/* --------- Шторки (модальные окна снизу) --------- */
function openSheet({ title, body, cancel = 'Закрыть', done, doneLabel = 'Готово', onMount, short = false }) {
  const w = document.createElement('div');
  w.className = 'sheet-wrap';
  w.innerHTML = `<div class="sheet-bg"></div><div class="sheet ${short ? 'short' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <div class="sheet-head"><button class="link" data-close>${esc(cancel)}</button><div class="sheet-title">${esc(title)}</div>${done ? `<button class="link b" data-done>${esc(doneLabel)}</button>` : '<span></span>'}</div>
    <div class="sheet-body">${body}</div></div>`;
  $('#sheets').appendChild(w);
  document.body.classList.add('noscroll');
  requestAnimationFrame(() => requestAnimationFrame(() => w.classList.add('open')));
  w.close = () => closeSheet(w);
  $('.sheet-bg', w).onclick = w.close;
  $('[data-close]', w).onclick = w.close;
  if (done) $('[data-done]', w).onclick = () => { if (done(w) !== false) w.close(); };
  onMount?.(w);
  return w;
}
function closeSheet(w) {
  if (w.closing) return; w.closing = true;
  w.classList.remove('open');
  setTimeout(() => { w.remove(); if (!$('#sheets').children.length) document.body.classList.remove('noscroll'); }, 280);
}
const topSheetClose = () => { const all = $$('.sheet-wrap'); all[all.length - 1]?.close(); };

/* =====================================================================
   Состояние интерфейса и отрисовка
   ===================================================================== */
const ui = { tab: 'overview', month: curMonth(), ops: { type: 'all', accountId: '', categoryId: '', q: '' }, plans: 'goals', showArchived: false };

function commit(msg, action) {
  save(); render();
  $$('.sheet-wrap').forEach(w => w.refresh?.());
  if (msg) toast(msg, action);
}

const TABS = [['overview', 'Обзор'], ['ops', 'Операции'], ['accounts', 'Счета'], ['plans', 'Планы'], ['more', 'Ещё']];
function render() {
  computeBalances();
  applyTheme();
  const views = { overview: viewOverview, ops: viewOps, accounts: viewAccounts, plans: viewPlans, more: viewMore };
  $('#main').innerHTML = views[ui.tab]();
  $('#tabbar').innerHTML = `<div class="in">${TABS.map(([k, l]) => `<button data-act="tab" data-v="${k}" class="${ui.tab === k ? 'on' : ''}">${ICON[k]}<span>${l}</span></button>`).join('')}</div>`;
  document.body.classList.toggle('hide-fab', ui.tab === 'more');
}
function applyTheme() {
  const t = S.settings.theme;
  if (t === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', t);
}

/* ---------- Строка операции ---------- */
function txRow(t, showDate = false) {
  const a = acc(t.accountId);
  let icon, color, title, sub, amt, cls = '';
  if (t.type === 'transfer') {
    const b = acc(t.toAccountId);
    icon = '⇄'; color = '#8e8e93'; title = 'Перевод';
    sub = `${a?.name || '?'} → ${b?.name || '?'}`;
    amt = money(t.amount, a?.currency);
  } else {
    const c = catById(t.categoryId);
    icon = c?.icon || '❔'; color = c?.color || '#8e8e93'; title = c?.name || 'Без категории';
    sub = [t.note, a?.name].filter(Boolean).join(' · ');
    amt = (t.type === 'expense' ? '−' : '+') + money(t.amount, a?.currency);
    if (t.type === 'income') cls = 'pos';
  }
  if (showDate) sub = shortDate(t.date) + (sub ? ' · ' + sub : '');
  return `<button class="row" data-act="editTx" data-id="${t.id}">${icBox(icon, color)}<span class="rb"><span class="rt">${esc(title)}</span><span class="rs">${esc(sub)}</span></span><span class="ra ${cls}">${amt}</span></button>`;
}

/* =====================================================================
   Экран «Обзор»
   ===================================================================== */
function viewOverview() {
  const list = txInMonth(ui.month);
  const st = sumStats(list);
  const nw = netWorth();
  const exp = byCategory(list, 'expense');
  const due = S.recurring.filter(r => r.nextDate <= today()).sort((a, b) => a.nextDate.localeCompare(b.nextDate));
  const [y, m] = ui.month.split('-').map(Number);
  const days = ui.month === curMonth() ? new Date().getDate() : ui.month < curMonth() ? daysInMonth(y, m) : 0;
  const recent = [...S.transactions].sort(sortTx).slice(0, 5);
  const items = topN(exp);

  let h = topbar('Обзор', `<button class="icon-btn" data-act="reports" aria-label="Отчёты">${ICON.chart}</button>`);
  h += `<button class="card hero hero-btn" data-act="tab" data-v="accounts"><div class="muted">Всего на счетах</div><div class="big">${money(nw.total)}</div>
    ${nw.debt < 0 ? `<div class="hero-sub"><span>Активы ${money(nw.assets)}</span><span>Долги ${money(nw.debt)}</span></div>` : ''}</button>`;

  const lb = S.settings.lastBackup, snooze = S.settings.backupSnooze;
  if (S.transactions.length >= 20 && (!lb || daysBetween(lb, today()) >= 30) && (!snooze || daysBetween(snooze, today()) >= 14)) {
    h += `<div class="card" style="margin-top:12px"><div class="prog-top">${icBox('💾', '#30b0c7')}<span class="rb"><span class="rt">Сделайте резервную копию</span><span class="rs" style="white-space:normal">${lb ? `Последняя — ${shortDate(lb)}` : 'Копии ещё не было'}. Данные хранятся только на этом телефоне.</span></span></div>
      <div class="btns" style="margin-top:12px"><button class="btn small primary" data-act="backup">Сохранить копию</button><button class="btn small" data-act="backupLater">Позже</button></div></div>`;
  }

  if (!S.transactions.length && !S.settings.onboarded) {
    h += `<div class="card" style="margin-top:12px"><b>Добро пожаловать 👋</b><p class="muted" style="margin:6px 0 12px">Для начала укажите текущие остатки на счетах, затем добавляйте операции кнопкой «+». Выписки банков можно загрузить в разделе «Ещё → Банки».</p>
      <div class="btns"><button class="btn small primary" data-act="tab" data-v="accounts">Настроить счета</button><button class="btn small" data-act="dismissOnboard">Скрыть</button></div></div>`;
  }

  if (due.length) {
    h += `<h2 class="sec">Ожидают проведения</h2><div class="list">${due.map(r => {
      const to = r.type === 'transfer' ? ` → ${esc(acc(r.toAccountId)?.name || '?')}` : '';
      return `<div class="prog-row"><div class="prog-top">${recIcon(r)}<span class="rb"><span class="rt">${esc(r.name)}</span><span class="rs">${inDays(r.nextDate)} · ${shortDate(r.nextDate)}${to}</span></span><span class="ra ${r.type === 'income' ? 'pos' : ''}">${recAmount(r)}</span></div>
        <div class="btns due-b"><button class="btn small" data-act="recSkip" data-id="${r.id}">Пропустить</button><button class="btn small primary" data-act="recPost" data-id="${r.id}">Провести</button></div></div>`;
    }).join('')}</div>`;
  }

  const weekAhead = ymd(new Date(Date.now() + 7 * 864e5)), twoWeeks = ymd(new Date(Date.now() + 14 * 864e5));
  const soonRec = S.recurring.filter(r => r.nextDate > today() && r.nextDate <= weekAhead).sort((a, b) => a.nextDate.localeCompare(b.nextDate));
  const soonDebt = S.accounts.filter(a => a.type === 'debt' && !a.archived && a.dueDate && Math.abs(BAL[a.id] || 0) > 0 && a.dueDate <= twoWeeks);
  if (soonRec.length || soonDebt.length) {
    h += `<h2 class="sec">Скоро</h2><div class="list">${soonDebt.map(a => {
      const bal = BAL[a.id] || 0;
      return `<button class="row" data-act="accDetail" data-id="${a.id}">${icBox('🤝', a.dueDate < today() ? '#ff3b30' : '#ff9500')}<span class="rb"><span class="rt">${esc(a.name)}</span><span class="rs ${a.dueDate < today() ? 'neg' : ''}">${bal < 0 ? 'Вернуть долг' : 'Вам должны вернуть'} · ${inDays(a.dueDate)}</span></span><span class="ra ${bal < 0 ? 'neg' : 'pos'}">${money(Math.abs(bal), a.currency)}</span></button>`;
    }).join('')}${soonRec.map(r => `<button class="row" data-act="editRec" data-id="${r.id}">${recIcon(r)}<span class="rb"><span class="rt">${esc(r.name)}</span><span class="rs">${inDays(r.nextDate)} · ${shortDate(r.nextDate)}</span></span><span class="ra ${r.type === 'income' ? 'pos' : ''}">${recAmount(r)}</span></button>`).join('')}</div>`;
  }

  h += monthNav();
  h += `<div class="stats"><button class="card stat" data-act="opsKind" data-v="income"><div class="muted">Доходы</div><div class="b pos">${money(st.income)}</div></button>
    <button class="card stat" data-act="opsKind" data-v="expense"><div class="muted">Расходы</div><div class="b">${money(st.expense)}</div></button></div>
    <div class="stat-foot"><span>Остаток: <b class="${st.income - st.expense < 0 ? 'neg' : ''}">${money(st.income - st.expense)}</b></span>${days ? `<span>≈ ${money(Math.round(st.expense / days))} в день</span>` : ''}</div>`;

  const an = S.transactions.length ? analyze(ui.month) : null;
  if (an && an.tips.length) {
    h += `<button class="card insight-cta" data-act="analytics">${icBox('💡', '#ffcc00')}<span class="rb"><span class="rt" style="white-space:normal">${an.total > 0 ? `Сэкономить ≈ ${money(roundNice(an.total))}/мес` : 'Советы по расходам'}</span><span class="rs">${esc(an.tips[0].title)}${an.tips.length > 1 ? ` и ещё ${an.tips.length - 1}` : ''}</span></span><span class="chev">${ICON.chev.replace('<svg', '<svg width="16" height="16"')}</span></button>`;
  }
  h += `<h2 class="sec">Расходы по категориям ${exp.length ? '<button data-act="catChart">Суммы</button>' : ''}</h2><div class="card">`;
  if (exp.length) {
    h += `<div class="donut-row"><button class="donut-btn" data-act="catChart" aria-label="Суммы по категориям">${donut(items, st.expense, money(st.expense), 'расходы')}</button><div class="legend">${items.map(it =>
      `<button data-act="catChart" data-id="${it.id}"><i style="background:${it.color}"></i><span class="n">${esc(it.name)}</span><span class="p">${Math.round(it.value / st.expense * 100)}%</span></button>`).join('')}</div></div>`;
  } else h += emptyBox('🧾', 'В этом месяце расходов пока нет');
  h += `</div>`;

  if (S.budgets.length) {
    h += `<h2 class="sec">Бюджеты <button data-act="goPlans" data-v="budgets">Все</button></h2><div class="list">${S.budgets.slice(0, 4).map(b => budgetRow(b, ui.month)).join('')}</div>`;
  }
  const goals = S.goals.filter(g => !g.archived);
  if (goals.length) {
    h += `<h2 class="sec">Цели <button data-act="goPlans" data-v="goals">Все</button></h2><div class="hscroll">${goals.map(g => {
      const saved = goalSaved(g), pct = g.target ? saved / g.target * 100 : 0;
      return `<button class="card goal-card" data-act="goalDetail" data-id="${g.id}">${icBox(g.icon, g.color)}<span class="rt">${esc(g.name)}</span>
        <span class="rs">${money(saved, g.currency)} из ${money(g.target, g.currency)}</span>${progBar(pct)}</button>`;
    }).join('')}</div>`;
  }
  h += `<h2 class="sec">Последние операции ${recent.length ? '<button data-act="tab" data-v="ops">Все</button>' : ''}</h2>`;
  h += recent.length ? `<div class="list">${recent.map(t => txRow(t, true)).join('')}</div>`
    : `<div class="card">${emptyBox('✨', 'Операций пока нет', '<button class="btn small primary" data-act="addTx">Добавить первую</button>')}</div>`;
  return h;
}

/* =====================================================================
   Экран «Операции»
   ===================================================================== */
function viewOps() {
  const f = ui.ops;
  const accOpts = [['', 'Все счета'], ...S.accounts.filter(a => !a.archived || a.id === f.accountId).map(a => [a.id, a.name])];
  const cf = f.categoryId ? (catById(f.categoryId)?.name || 'Без категории') : '';
  return `${topbar('Операции')}
    ${f.q ? '' : monthNav()}
    <div class="search">${ICON.search.replace('<svg', '<svg width="18" height="18"')}<input id="ops-q" type="search" placeholder="Поиск: заметка, категория, сумма" value="${esc(f.q)}" autocomplete="off"></div>
    <div class="seg">${[['all', 'Все'], ['expense', 'Расходы'], ['income', 'Доходы'], ['transfer', 'Переводы']].map(([v, l]) => `<button data-act="opsType" data-v="${v}" class="${f.type === v ? 'on' : ''}">${l}</button>`).join('')}</div>
    <div class="filters">${selHtml('ops-acc', accOpts, f.accountId)}${cf ? `<button class="pill" data-act="opsClearCat">${esc(cf)} ${ICON.x.replace('<svg', '<svg width="14" height="14"')}</button>` : ''}</div>
    <div id="ops-list">${opsList()}</div>`;
}
function opsList() {
  const f = ui.ops;
  const q = f.q.trim().toLowerCase();
  let list = q ? S.transactions : txInMonth(ui.month);
  list = list.filter(t => {
    if (f.type !== 'all' && t.type !== f.type) return false;
    if (f.accountId && t.accountId !== f.accountId && t.toAccountId !== f.accountId) return false;
    if (f.categoryId !== '' && f.categoryId != null && (t.categoryId || '__none') !== (f.categoryId || '__none')) return false;
    if (q) {
      const hay = [t.note, catById(t.categoryId)?.name, acc(t.accountId)?.name, String(t.amount)].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }).sort(sortTx);
  if (!list.length) return `<div class="card" style="margin-top:12px">${emptyBox('🔍', q ? 'Ничего не найдено' : 'Нет операций за этот период')}</div>`;
  const st = sumStats(list);
  let h = `<div class="stat-foot" style="margin:12px 4px 0"><span>Доходы: <b class="pos">${money(st.income)}</b></span><span>Расходы: <b>${money(st.expense)}</b></span></div>`;
  const shown = list.slice(0, 400);
  let day = null, buf = [];
  const flush = () => {
    if (!buf.length) return;
    const ds = sumStats(buf), net = ds.income - ds.expense;
    h += `<div class="day-h"><span>${dayTitle(day)}</span><span>${net ? (net > 0 ? '+' : '') + money(net) : ''}</span></div><div class="list">${buf.map(t => txRow(t)).join('')}</div>`;
    buf = [];
  };
  for (const t of shown) { if (t.date !== day) { flush(); day = t.date; } buf.push(t); }
  flush();
  if (list.length > shown.length) h += `<p class="hint" style="text-align:center">Показаны первые ${shown.length} из ${list.length}. Уточните поиск.</p>`;
  return h;
}

/* =====================================================================
   Экран «Счета»
   ===================================================================== */
function accountSub(a) {
  const bank = S.banks.find(b => b.id === a.bankId);
  const due = a.type === 'debt' && a.dueDate && (BAL[a.id] || 0) !== 0 ? `вернуть ${a.dueDate < today() ? 'было ' : ''}до ${shortDate(a.dueDate)}` : '';
  return [bank?.name || ACCOUNT_TYPES[a.type]?.one, a.last4 ? '•• ' + a.last4 : '', due, a.includeInTotal ? '' : 'не в итоге'].filter(Boolean).join(' · ');
}
function accRow(a) {
  const bal = BAL[a.id] || 0;
  let extra = '';
  if (a.type === 'credit' && a.creditLimit) extra = `<small>доступно ${money(a.creditLimit + bal, a.currency)}</small>`;
  else if (a.currency !== S.settings.currency) extra = `<small>≈ ${money(toMain(bal, a.currency))}</small>`;
  return `<button class="row" data-act="accDetail" data-id="${a.id}">${icBox(a.icon, a.color)}<span class="rb"><span class="rt">${esc(a.name)}</span><span class="rs">${esc(accountSub(a))}</span></span><span class="ra ${bal < 0 ? 'neg' : ''}">${money(bal, a.currency)}${extra}</span></button>`;
}
function viewAccounts() {
  const nw = netWorth();
  let h = topbar('Счета', `<button class="icon-btn" data-act="addAcc" aria-label="Добавить счёт">${ICON.plus}</button>`);
  h += `<div class="card hero"><div class="muted">Чистые активы</div><div class="big">${money(nw.total)}</div><div class="hero-sub"><span>Активы ${money(nw.assets)}</span><span>Долги ${money(nw.debt)}</span></div></div>`;
  for (const [type, info] of Object.entries(ACCOUNT_TYPES)) {
    const items = S.accounts.filter(a => a.type === type && !a.archived);
    if (!items.length) continue;
    const sum = items.reduce((s, a) => s + toMain(BAL[a.id] || 0, a.currency), 0);
    h += `<div class="group-h"><span>${info.name}</span><span>${money(sum)}</span></div><div class="list">${items.map(accRow).join('')}</div>`;
  }
  const arch = S.accounts.filter(a => a.archived);
  if (arch.length) {
    h += `<h2 class="sec">Архив <button data-act="toggleArchived">${ui.showArchived ? 'Скрыть' : `Показать (${arch.length})`}</button></h2>`;
    if (ui.showArchived) h += `<div class="list">${arch.map(accRow).join('')}</div>`;
  }
  if (!S.accounts.length) h += `<div class="card" style="margin-top:12px">${emptyBox('💳', 'Добавьте первый счёт', '<button class="btn small primary" data-act="addAcc">Добавить счёт</button>')}</div>`;
  h += `<div style="margin-top:16px"><button class="btn" data-act="transfer">⇄ Перевод между счетами</button></div>`;
  return h;
}

/* =====================================================================
   Экран «Планы»: цели, бюджеты, регулярные платежи
   ===================================================================== */
function budgetRow(b, mk) {
  const c = b.categoryId ? catById(b.categoryId) : null;
  const spent = budgetSpent(b, mk), pct = b.limit ? spent / b.limit * 100 : 0;
  const left = b.limit - spent;
  let foot = left >= 0 ? `осталось ${money(left)}` : `перерасход ${money(-left)}`;
  if (mk === curMonth() && left > 0) {
    const [y, m] = mk.split('-').map(Number);
    const rest = daysInMonth(y, m) - new Date().getDate() + 1;
    foot += ` · ${money(Math.round(left / rest))}/день`;
  }
  return `<button class="prog-row" data-act="editBudget" data-id="${b.id}"><div class="prog-top">${icBox(c?.icon || '📊', c?.color || '#2f6bff')}<span class="rb"><span class="rt">${esc(c?.name || 'Все расходы')}</span><span class="rs">${money(spent)} из ${money(b.limit)}</span></span><span class="ra ${pct > 100 ? 'neg' : ''}">${Math.round(pct)}%</span></div>
    ${progBar(pct, pct > 100 ? 'over' : pct > 85 ? 'warn' : '')}<div class="prog-foot"><span>${foot}</span></div></button>`;
}
function goalRow(g) {
  const saved = goalSaved(g), pct = g.target ? saved / g.target * 100 : 0;
  let foot = pct >= 100 ? '🎉 Цель достигнута' : `осталось ${money(g.target - saved, g.currency)}`;
  if (pct < 100 && g.deadline) foot += ` · до ${shortDate(g.deadline)}`;
  return `<button class="prog-row" data-act="goalDetail" data-id="${g.id}"><div class="prog-top">${icBox(g.icon, g.color)}<span class="rb"><span class="rt">${esc(g.name)}</span><span class="rs">${money(saved, g.currency)} из ${money(g.target, g.currency)}</span></span><span class="ra">${Math.round(pct)}%</span></div>
    ${progBar(pct)}<div class="prog-foot"><span>${foot}</span></div></button>`;
}
const PERIODS = { day: 'Каждый день', week: 'Каждую неделю', month: 'Каждый месяц', quarter: 'Каждый квартал', year: 'Каждый год' };
const recIcon = r => r.type === 'transfer' ? icBox('⇄', '#8e8e93') : icBox(catById(r.categoryId)?.icon || '🔁', catById(r.categoryId)?.color || '#8e8e93');
const recAmount = r => (r.type === 'income' ? '+' : r.type === 'transfer' ? '' : '−') + money(r.amount, accCur(r.accountId));
function recRow(r) {
  const overdue = r.nextDate <= today();
  const to = r.type === 'transfer' ? ` · → ${esc(acc(r.toAccountId)?.name || '?')}` : '';
  return `<button class="row" data-act="editRec" data-id="${r.id}">${recIcon(r)}<span class="rb"><span class="rt">${esc(r.name)}</span><span class="rs">${PERIODS[r.period]}${to} · ${overdue ? '<span class="neg">' : ''}след. ${shortDate(r.nextDate)}${overdue ? '</span>' : ''}</span></span><span class="ra ${r.type === 'income' ? 'pos' : ''}">${recAmount(r)}</span></button>`;
}
// Обязательства: расходы и платежи по кредитам/долгам
const isObligation = r => r.type === 'expense' || (r.type === 'transfer' && ['debt', 'credit'].includes(acc(r.toAccountId)?.type));
function monthlyEquivalent(r) {
  const k = { day: 30.4, week: 4.35, month: 1, quarter: 1 / 3, year: 1 / 12 }[r.period] || 1;
  return toMain(r.amount, accCur(r.accountId)) * k;
}
function viewPlans() {
  const seg = ui.plans;
  const addAct = { goals: 'addGoal', budgets: 'addBudget', recurring: 'addRec' }[seg];
  let h = topbar('Планы', `<button class="icon-btn" data-act="${addAct}" aria-label="Добавить">${ICON.plus}</button>`);
  h += `<div class="seg">${[['goals', 'Цели'], ['budgets', 'Бюджеты'], ['recurring', 'Платежи']].map(([v, l]) => `<button data-act="plansSeg" data-v="${v}" class="${seg === v ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  if (seg === 'goals') {
    const act = S.goals.filter(g => !g.archived), arch = S.goals.filter(g => g.archived);
    if (!act.length) h += `<div class="card">${emptyBox('🎯', 'Копите на отпуск, машину или подушку безопасности. Приложение посчитает, сколько откладывать в месяц.', '<button class="btn small primary" data-act="addGoal">Создать цель</button>')}</div>`;
    else {
      const total = act.reduce((s, g) => s + toMain(goalSaved(g), g.currency), 0), target = act.reduce((s, g) => s + toMain(g.target, g.currency), 0);
      h += `<div class="card" style="margin-bottom:12px"><div class="muted">Накоплено на цели</div><div class="b" style="font-size:22px">${money(total)} <span class="muted">из ${money(target)}</span></div>${progBar(target ? total / target * 100 : 0)}</div>`;
      h += `<div class="list">${act.map(goalRow).join('')}</div>`;
    }
    if (arch.length) h += `<div class="group-h"><span>Завершённые</span></div><div class="list">${arch.map(goalRow).join('')}</div>`;
  } else if (seg === 'budgets') {
    h += monthNav();
    if (!S.budgets.length) h += `<div class="card">${emptyBox('📊', 'Задайте месячный лимит на категорию — и увидите, сколько ещё можно потратить.', '<button class="btn small primary" data-act="addBudget">Создать бюджет</button>')}</div>`;
    else h += `<div class="list">${S.budgets.map(b => budgetRow(b, ui.month)).join('')}</div>`;
  } else {
    const list = [...S.recurring].sort((a, b) => a.nextDate.localeCompare(b.nextDate));
    if (!list.length) h += `<div class="card">${emptyBox('🔁', 'Подписки, аренда, кредиты, зарплата — добавьте их, и приложение напомнит провести платёж в нужный день.', '<button class="btn small primary" data-act="addRec">Добавить платёж</button>')}</div>`;
    else {
      const exp = list.filter(isObligation).reduce((s, r) => s + monthlyEquivalent(r), 0);
      const inc = list.filter(r => r.type === 'income').reduce((s, r) => s + monthlyEquivalent(r), 0);
      h += `<div class="stats" style="margin-bottom:12px"><div class="card stat"><div class="muted">Обязательные в мес.</div><div class="b">${money(exp)}</div></div><div class="card stat"><div class="muted">Поступления в мес.</div><div class="b pos">${money(inc)}</div></div></div>`;
      h += `<div class="list">${list.map(recRow).join('')}</div>`;
    }
  }
  return h;
}

/* =====================================================================
   Экран «Ещё»
   ===================================================================== */
function moreRow(act, icon, color, title, sub = '') {
  return `<button class="row" data-act="${act}">${icBox(icon, color)}<span class="rb"><span class="rt">${title}</span>${sub ? `<span class="rs">${sub}</span>` : ''}</span><span class="chev">${ICON.chev.replace('<svg', '<svg width="16" height="16"')}</span></button>`;
}
function viewMore() {
  const nCat = S.categories.length;
  return `${topbar('Ещё')}
    <div class="list">
      ${moreRow('analytics', '💡', '#ffcc00', 'Где сэкономить', 'Лишние траты, подписки, прогноз, подушка')}
      ${moreRow('reports', '📊', '#2f6bff', 'Отчёты', 'Структура расходов, динамика по месяцам')}
      ${moreRow('categories', '🏷️', '#ff9500', 'Категории', `${nCat} ${plural(nCat, 'категория', 'категории', 'категорий')}`)}
      ${moreRow('banks', '🏦', '#34c759', 'Банки и импорт', S.banks.length ? S.banks.map(b => b.name).join(', ') : 'Выписки CSV, SMS и push-уведомления')}
    </div>
    <div class="group-h"><span>Настройки</span></div>
    <div class="list">
      ${moreRow('currency', '💱', '#5856d6', 'Валюта и курсы', `Основная: ${S.settings.currency}`)}
      ${moreRow('pin', '🔐', '#ff3b30', 'Код-пароль', S.settings.pinHash ? 'Включён' : 'Выключен')}
      ${moreRow('theme', '🌓', '#1c1c1e', 'Оформление', { auto: 'Как в системе', light: 'Светлое', dark: 'Тёмное' }[S.settings.theme])}
    </div>
    <div class="group-h"><span>Данные</span></div>
    <div class="list">
      ${moreRow('backup', '💾', '#30b0c7', 'Резервная копия', 'Сохранить или восстановить данные')}
      ${moreRow('exportCsv', '📤', '#a2845e', 'Экспорт операций в CSV', 'Для Excel / Numbers')}
      ${moreRow('demo', '🧪', '#af52de', 'Заполнить демо-данными', 'Посмотреть, как всё выглядит')}
      ${moreRow('reset', '🗑️', '#8e8e93', 'Удалить все данные')}
    </div>
    <p class="hint" style="text-align:center;margin-top:20px">Все данные хранятся только на этом устройстве.<br>Регулярно делайте резервную копию.</p>`;
}

/* =====================================================================
   Форма операции
   ===================================================================== */
function lastAccountId() {
  const id = S.settings.lastAccountId;
  if (id && acc(id) && !acc(id).archived) return id;
  return S.accounts.find(a => !a.archived)?.id || '';
}
function accChips(selected, exclude) {
  return S.accounts.filter(a => (!a.archived || a.id === selected) && a.id !== exclude).map(a =>
    `<button type="button" class="chip ${a.id === selected ? 'on' : ''}" data-v="${a.id}"><span>${esc(a.icon)}</span><span>${esc(a.name)}<small>${money(BAL[a.id] || 0, a.currency)}</small></span></button>`).join('')
    + `<button type="button" class="chip add" data-new="1">＋ Счёт</button>`;
}
// Частые категории — в начало сетки (по операциям за последние 4 месяца)
function catUsage(kind) {
  const from = ymd(new Date(Date.now() - 120 * 864e5)), n = {};
  for (const t of S.transactions) if (t.type === kind && t.date >= from && t.categoryId) n[t.categoryId] = (n[t.categoryId] || 0) + 1;
  return n;
}
// Подсказки заметок: прошлые места/описания, по нажатию подставляется и категория
function noteSuggestions(type, q) {
  q = q.trim().toLowerCase();
  const m = new Map();
  for (const t of S.transactions) {
    if (t.type !== type || !t.note) continue;
    const k = t.note.trim().toLowerCase();
    if (q && (!k.includes(q) || k === q)) continue;
    const e = m.get(k) || { note: t.note.trim(), n: 0, last: '', categoryId: null };
    e.n++;
    if (t.date >= e.last) { e.last = t.date; e.categoryId = t.categoryId; }
    m.set(k, e);
  }
  return [...m.values()].sort((a, b) => b.n - a.n || b.last.localeCompare(a.last)).slice(0, 8);
}
function catGrid(kind, selected) {
  const n = catUsage(kind);
  return S.categories.filter(c => c.kind === kind).map((c, i) => [c, i]).sort((a, b) => (n[b[0].id] || 0) - (n[a[0].id] || 0) || a[1] - b[1]).map(([c]) =>
    `<button type="button" data-v="${c.id}" class="${c.id === selected ? 'on' : ''}">${icBox(c.icon, c.color)}<span>${esc(c.name)}</span></button>`).join('')
    + `<button type="button" data-new="1"><span class="ic" style="background:var(--accent-soft);color:var(--accent)">＋</span><span>Новая</span></button>`;
}

function txForm(existing, preset = {}) {
  const t = existing ? { ...existing } : {
    type: preset.type || 'expense', amount: preset.amount ?? '', accountId: preset.accountId || lastAccountId(),
    toAccountId: preset.toAccountId || '', categoryId: preset.categoryId || '', date: preset.date || today(), note: preset.note || '', toAmount: null,
  };
  const body = `
    <div class="seg" id="tx-type">${[['expense', 'Расход'], ['income', 'Доход'], ['transfer', 'Перевод']].map(([v, l]) => `<button type="button" data-v="${v}" class="${t.type === v ? 'on' : ''}">${l}</button>`).join('')}</div>
    <div class="amount-box"><input id="tx-amount" inputmode="decimal" placeholder="0" autocomplete="off" value="${fmtInput(t.amount)}"><span id="tx-cur"></span></div>
    <div class="lbl" id="tx-from-l">Счёт</div><div class="chips" id="tx-acc"></div>
    <div id="tx-to-w"><div class="lbl">На счёт</div><div class="chips" id="tx-to"></div>
      <div class="group" id="tx-toamt-w">${fld('Зачислено', `<input id="tx-toamt" inputmode="decimal" placeholder="Сумма в валюте счёта" value="${fmtInput(t.toAmount)}">`)}</div></div>
    ${grp(fld('Заметка', `<input id="tx-note" placeholder="Например, магазин" value="${esc(t.note)}" autocomplete="off">`))}
    <div class="chips" id="tx-sug"></div>
    <div id="tx-cat-w"><div class="lbl">Категория</div><div class="cat-grid" id="tx-cat"></div></div>
    <div class="chips" id="tx-dq">${[[0, 'Сегодня'], [-1, 'Вчера'], [-2, 'Позавчера']].map(([d, l]) => `<button type="button" class="chip" data-d="${d}">${l}</button>`).join('')}</div>
    ${grp(fld('Дата', `<input type="date" id="tx-date" value="${t.date}">`))}
    ${existing ? `<div class="btns"><button type="button" class="btn" id="tx-dup">Повторить</button><button type="button" class="btn danger" id="tx-del">Удалить</button></div>` : ''}`;

  openSheet({
    title: existing ? 'Операция' : 'Новая операция', cancel: 'Отмена', doneLabel: 'Сохранить', body,
    done: w => {
      t.amount = round2(parseNum($('#tx-amount', w).value));
      t.date = $('#tx-date', w).value || today();
      t.note = $('#tx-note', w).value.trim();
      if (!(t.amount > 0)) { toast('Введите сумму'); $('#tx-amount', w).focus(); return false; }
      if (!acc(t.accountId)) { toast('Выберите счёт'); return false; }
      if (t.type === 'transfer') {
        if (!acc(t.toAccountId) || t.toAccountId === t.accountId) { toast('Выберите счёт зачисления'); return false; }
        const diff = accCur(t.accountId) !== accCur(t.toAccountId);
        const ta = round2(parseNum($('#tx-toamt', w).value));
        t.toAmount = diff ? (ta > 0 ? ta : round2(convert(t.amount, accCur(t.accountId), accCur(t.toAccountId)))) : null;
        t.categoryId = null;
      } else {
        if (!t.categoryId) { toast('Выберите категорию'); return false; }
        t.toAccountId = null; t.toAmount = null;
      }
      S.settings.lastAccountId = t.accountId;
      if (existing) {
        const i = S.transactions.findIndex(x => x.id === existing.id);
        S.transactions[i] = t;
        learnRule(existing, t);
      } else {
        t.id = uid(); t.ts = Date.now();
        S.transactions.push(t);
      }
      commit(existing ? 'Сохранено' : 'Операция добавлена');
    },
    onMount: w => {
      const amt = $('#tx-amount', w);
      const fit = () => amt.style.width = Math.max(1, amt.value.length) * 0.62 + 0.3 + 'em';
      fit(); amt.addEventListener('input', fit);
      const paint = () => {
        $$('#tx-type button', w).forEach(b => b.classList.toggle('on', b.dataset.v === t.type));
        $('.amount-box', w).className = 'amount-box ' + t.type;
        $('#tx-cur', w).textContent = curSym(accCur(t.accountId));
        $('#tx-from-l', w).textContent = t.type === 'transfer' ? 'Со счёта' : 'Счёт';
        $('#tx-acc', w).innerHTML = accChips(t.accountId);
        const isTr = t.type === 'transfer';
        $('#tx-to-w', w).hidden = !isTr;
        $('#tx-cat-w', w).hidden = isTr;
        if (isTr) {
          $('#tx-to', w).innerHTML = accChips(t.toAccountId, t.accountId);
          $('#tx-toamt-w', w).hidden = !(acc(t.toAccountId) && accCur(t.toAccountId) !== accCur(t.accountId));
        } else {
          if (t.categoryId && catById(t.categoryId)?.kind !== t.type) t.categoryId = '';
          $('#tx-cat', w).innerHTML = catGrid(t.type, t.categoryId);
        }
        paintSug();
      };
      const paintSug = () => {
        const box = $('#tx-sug', w);
        const list = t.type === 'transfer' ? [] : noteSuggestions(t.type, $('#tx-note', w).value);
        box.hidden = !list.length;
        box.innerHTML = list.map((x, i) => { const c = catById(x.categoryId); return `<button type="button" class="chip sug" data-i="${i}">${c ? esc(c.icon) + ' ' : ''}${esc(x.note)}</button>`; }).join('');
        box.onclick = e => {
          const b = e.target.closest('[data-i]'); if (!b) return;
          const x = list[+b.dataset.i];
          $('#tx-note', w).value = x.note;
          if (x.categoryId && catById(x.categoryId)?.kind === t.type) t.categoryId = x.categoryId;
          paint();
        };
      };
      const paintDate = () => {
        const v = $('#tx-date', w).value;
        $$('#tx-dq [data-d]', w).forEach(b => { const d = new Date(); d.setDate(d.getDate() + +b.dataset.d); b.classList.toggle('on', ymd(d) === v); });
      };
      $('#tx-dq', w).onclick = e => {
        const b = e.target.closest('[data-d]'); if (!b) return;
        const d = new Date(); d.setDate(d.getDate() + +b.dataset.d);
        $('#tx-date', w).value = ymd(d); paintDate();
      };
      $('#tx-date', w).addEventListener('change', paintDate);
      $('#tx-note', w).addEventListener('input', paintSug);
      paint(); paintDate();
      $('#tx-type', w).onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; t.type = b.dataset.v; paint(); };
      $('#tx-acc', w).onclick = e => {
        const b = e.target.closest('button'); if (!b) return;
        if (b.dataset.new) return accForm(null, a => { t.accountId = a.id; paint(); });
        t.accountId = b.dataset.v; if (t.toAccountId === t.accountId) t.toAccountId = ''; paint();
      };
      $('#tx-to', w).onclick = e => {
        const b = e.target.closest('button'); if (!b) return;
        if (b.dataset.new) return accForm(null, a => { t.toAccountId = a.id; paint(); });
        t.toAccountId = b.dataset.v; paint();
      };
      $('#tx-cat', w).onclick = e => {
        const b = e.target.closest('button'); if (!b) return;
        if (b.dataset.new) return catForm(null, t.type, c => { t.categoryId = c.id; paint(); });
        t.categoryId = b.dataset.v; paint();
      };
      $('#tx-del', w)?.addEventListener('click', () => {
        const snap = JSON.stringify(S);
        S.transactions = S.transactions.filter(x => x.id !== existing.id);
        w.close(); commit('Операция удалена', undoTo(snap));
      });
      $('#tx-dup', w)?.addEventListener('click', () => {
        w.close();
        setTimeout(() => txForm(null, { ...existing, date: today() }), 300);
      });
      if (!existing && !preset.amount) setTimeout(() => amt.focus(), 350);
    },
  });
}

// Если пользователь поменял категорию у импортированной операции — запоминаем правило
const normKey = s => String(s || '').toLowerCase().replace(/[\d*#№]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 40);
function learnRule(before, after) {
  if (after.type === 'transfer' || !after.note || before.categoryId === after.categoryId) return;
  const key = normKey(after.note);
  if (key.length < 3) return;
  const r = S.rules.find(x => x.key === key);
  if (r) r.categoryId = after.categoryId; else S.rules.push({ key, categoryId: after.categoryId });
  const similar = S.transactions.filter(x => x.id !== after.id && x.type === after.type && normKey(x.note) === key && x.categoryId !== after.categoryId);
  if (similar.length && confirm(`Найдено ещё ${similar.length} ${plural(similar.length, 'похожая операция', 'похожие операции', 'похожих операций')} «${after.note}». Поменять категорию и у них?`)) {
    similar.forEach(x => x.categoryId = after.categoryId);
  }
}
function guessCategory(text, kind, bankCat = '') {
  const cats = S.categories.filter(c => c.kind === kind);
  const key = normKey(text);
  const rule = S.rules.find(r => key && key.includes(r.key) && catById(r.categoryId)?.kind === kind);
  if (rule) return rule.categoryId;
  if (bankCat) {
    const exact = cats.find(c => c.name.toLowerCase() === bankCat.trim().toLowerCase());
    if (exact) return exact.id;
  }
  const hay = `${text} ${bankCat}`;
  for (const [name, re] of KEYWORDS) {
    if (re.test(hay)) { const c = cats.find(x => x.name.toLowerCase() === name.toLowerCase()); if (c) return c.id; }
  }
  return (cats.find(c => c.name === 'Другое') || cats[cats.length - 1])?.id || '';
}

/* =====================================================================
   Счета: форма и карточка
   ===================================================================== */
function accForm(existing, onSaved, preset = {}) {
  const a = existing ? { ...existing } : { name: '', type: 'card', currency: S.settings.currency, initial: 0, color: '#2f6bff', icon: '💳', includeInTotal: true, archived: false, last4: '', creditLimit: 0, bankId: '', ...preset };
  const curBal = existing ? BAL[existing.id] || 0 : 0;
  let neg = existing ? curBal < 0 : ['debt', 'credit'].includes(a.type) && !(+a.initial > 0), signTouched = !!existing;
  const body = `
    ${grp(fld('Название', `<input id="a-name" placeholder="Например, Т-Банк Black" value="${esc(a.name)}" autocomplete="off">`),
      fld('Тип', selHtml('a-type', Object.entries(ACCOUNT_TYPES).map(([k, v]) => [k, v.one]), a.type)),
      fld('Валюта', selHtml('a-cur', curOpts(), a.currency)),
      fld(`<span id="a-bal-l">${existing ? 'Текущий баланс' : 'Начальный баланс'}</span>`, `<input id="a-bal" inputmode="decimal" placeholder="0" value="${fmtInput(Math.abs(existing ? curBal : a.initial)) || ''}">`))}
    <div class="seg" id="a-sign" style="margin-top:-6px"><button type="button" data-v="pos"></button><button type="button" data-v="neg"></button></div>
    <p class="hint" id="a-bal-hint" style="margin-top:-6px"></p>
    <div class="group" id="a-due-w">${fld('Вернуть до', `<input type="date" id="a-due" value="${a.dueDate || ''}">`)}</div>
    <div class="group" id="a-credit">${fld('Кредитный лимит', `<input id="a-limit" inputmode="decimal" placeholder="0" value="${fmtInput(a.creditLimit) || ''}">`)}</div>
    ${grp(fld('Банк', selHtml('a-bank', [['', 'Не указан'], ...S.banks.map(b => [b.id, b.name])], a.bankId)),
      fld('Последние 4 цифры', `<input id="a-last4" inputmode="numeric" maxlength="4" placeholder="1234" value="${esc(a.last4 || '')}">`))}
    <p class="hint" style="margin-top:-8px">Цифры карты помогают распознавать, к какому счёту относится SMS банка.</p>
    <div class="lbl">Иконка</div><div class="group" id="a-emoji">${emojiPicker(a.icon)}</div>
    <div class="lbl">Цвет</div><div class="group" id="a-color">${colorPicker(a.color)}</div>
    ${grp(fld('Учитывать в общем балансе', swt('a-inc', a.includeInTotal)), existing ? fld('В архиве', swt('a-arch', a.archived)) : '')}
    ${existing ? '<button type="button" class="btn danger" id="a-del">Удалить счёт</button>' : ''}`;
  openSheet({
    title: existing ? 'Счёт' : 'Новый счёт', cancel: 'Отмена', doneLabel: 'Сохранить', body,
    done: w => {
      a.name = $('#a-name', w).value.trim();
      if (!a.name) { toast('Введите название'); return false; }
      a.type = $('#a-type', w).value; a.currency = $('#a-cur', w).value;
      a.bankId = $('#a-bank', w).value; a.last4 = $('#a-last4', w).value.replace(/\D/g, '').slice(0, 4);
      a.creditLimit = a.type === 'credit' ? (parseNum($('#a-limit', w).value) || 0) : 0;
      a.dueDate = a.type === 'debt' ? $('#a-due', w).value : '';
      a.includeInTotal = $('#a-inc', w).checked;
      if (existing) a.archived = $('#a-arch', w).checked;
      const bal = Math.abs(parseNum($('#a-bal', w).value) || 0) * (neg ? -1 : 1);   // знак задаётся переключателем: на клавиатуре iPhone нет минуса
      if (existing) {
        a.initial = round2((+existing.initial || 0) + (bal - curBal));   // корректируем начальный остаток, чтобы получить нужный баланс
        Object.assign(S.accounts.find(x => x.id === existing.id), a);
      } else {
        a.id = uid(); a.initial = round2(bal); S.accounts.push(a);
        if (a.bankId) { const b = S.banks.find(x => x.id === a.bankId); if (b && !b.accountIds.includes(a.id)) b.accountIds.push(a.id); }
      }
      commit(existing ? 'Счёт сохранён' : 'Счёт добавлен');
      onSaved?.(a);
    },
    onMount: w => {
      const SIGN = {
        debt: { label: 'Сумма', pos: 'Мне должны', neg: 'Я должен', hint: { pos: 'Вам вернут эти деньги. Когда вернут — сделайте перевод с этого счёта на карту.', neg: 'Вы должны эту сумму. Когда отдаёте — сделайте перевод с карты на этот счёт, и долг уменьшится.' } },
        credit: { label: 'Сумма', pos: 'Свои деньги', neg: 'Долг по карте', hint: { pos: 'На карте лежат ваши собственные деньги сверх лимита.', neg: 'Сколько вы сейчас должны банку по карте. Доступный остаток посчитается из лимита.' } },
        other: { label: existing ? 'Текущий баланс' : 'Начальный баланс', pos: 'Остаток', neg: 'В минусе', hint: { pos: '', neg: 'Баланс счёта отрицательный (например, овердрафт).' } },
      };
      const paintSign = () => {
        const cfg = SIGN[$('#a-type', w).value] || SIGN.other;
        $('#a-bal-l', w).textContent = cfg.label;
        const [bp, bn] = $$('#a-sign button', w);
        bp.textContent = cfg.pos; bn.textContent = cfg.neg;
        bp.classList.toggle('on', !neg); bn.classList.toggle('on', neg);
        const hint = cfg.hint[neg ? 'neg' : 'pos'];
        $('#a-bal-hint', w).textContent = hint; $('#a-bal-hint', w).hidden = !hint;
      };
      $('#a-sign', w).onclick = e => { const b = e.target.closest('[data-v]'); if (!b) return; neg = b.dataset.v === 'neg'; signTouched = true; paintSign(); };
      $('#a-bal', w).addEventListener('input', e => { if (/^\s*[-−]/.test(e.target.value)) { neg = true; signTouched = true; e.target.value = e.target.value.replace(/[-−]/g, ''); paintSign(); } });
      const paintType = () => {
        const ty = $('#a-type', w).value;
        $('#a-credit', w).hidden = ty !== 'credit';
        $('#a-due-w', w).hidden = ty !== 'debt';
        if (!signTouched) neg = ['debt', 'credit'].includes(ty);
        paintSign();
        if (!existing && !preset.name && !$('#a-name', w).value) {
          const def = ACCOUNT_TYPES[ty].icon; a.icon = def;
          $$('#a-emoji button', w).forEach(b => b.classList.toggle('on', b.dataset.e === def));
        }
      };
      paintType();
      $('#a-type', w).onchange = paintType;
      wirePick($('#a-emoji', w), 'e', v => a.icon = v);
      wirePick($('#a-color', w), 'c', v => a.color = v);
      $('#a-del', w)?.addEventListener('click', () => {
        const n = S.transactions.filter(t => t.accountId === existing.id || t.toAccountId === existing.id).length;
        if (!confirm(n ? `Удалить счёт и ${n} ${plural(n, 'операцию', 'операции', 'операций')} по нему? Можно вместо этого отправить счёт в архив.` : 'Удалить счёт?')) return;
        const snap = JSON.stringify(S);
        S.accounts = S.accounts.filter(x => x.id !== existing.id);
        S.transactions = S.transactions.filter(t => t.accountId !== existing.id && t.toAccountId !== existing.id);
        S.banks.forEach(b => b.accountIds = b.accountIds.filter(id => id !== existing.id));
        S.goals.forEach(g => { if (g.accountId === existing.id) g.accountId = ''; });
        S.recurring = S.recurring.filter(r => r.accountId !== existing.id);
        $$('.sheet-wrap').forEach(x => x.close());
        commit('Счёт удалён', undoTo(snap));
      });
    },
  });
}

function accDetail(id) {
  const body = () => {
    const a = acc(id); if (!a) return '';
    const bal = BAL[a.id] || 0;
    const list = S.transactions.filter(t => t.accountId === id || t.toAccountId === id).sort(sortTx);
    const mk = curMonth(), mList = list.filter(t => t.date.startsWith(mk));
    let inc = 0, out = 0;
    for (const t of mList) {
      if (t.type === 'income' || (t.type === 'transfer' && t.toAccountId === id)) inc += t.type === 'transfer' ? (t.toAmount ?? t.amount) : t.amount;
      else out += t.amount;
    }
    let h = `<div class="card" style="text-align:center">${icBox(a.icon, a.color).replace('class="ic"', 'class="ic" style="margin:0 auto 8px;width:52px;height:52px;font-size:28px;border-radius:16px;background:' + a.color + '26"')}
      <div class="muted">${esc(accountSub(a))}</div><div class="b ${bal < 0 ? 'neg' : ''}" style="font-size:32px">${money(bal, a.currency)}</div>
      ${a.type === 'credit' && a.creditLimit ? `<div class="muted">Лимит ${money(a.creditLimit, a.currency)} · доступно ${money(a.creditLimit + bal, a.currency)}</div>${progBar(-bal / a.creditLimit * 100, -bal / a.creditLimit > .85 ? 'over' : '')}` : ''}
      <div class="stat-foot"><span>За ${MONTHS[new Date().getMonth()]}: <b class="pos">+${money(inc, a.currency)}</b></span><span><b>−${money(out, a.currency)}</b></span></div></div>
      <div class="btns" style="margin:12px 0"><button class="btn" data-act="addTxAcc" data-id="${id}">＋ Операция</button><button class="btn" data-act="transferFrom" data-id="${id}">⇄ Перевод</button></div>
      ${['debt', 'credit'].includes(a.type) ? `<button class="btn" data-act="recToAcc" data-id="${id}">🔁 Ежемесячный платёж по ${a.type === 'credit' ? 'карте' : 'долгу'}</button>` : ''}
      <button class="btn" data-act="editAcc" data-id="${id}">Изменить счёт</button>`;
    h += `<h2 class="sec">Операции</h2>`;
    h += list.length ? `<div class="list">${list.slice(0, 100).map(t => txRow(t, true)).join('')}</div>` : `<div class="card">${emptyBox('🧾', 'По счёту пока нет операций')}</div>`;
    if (list.length > 100) h += `<button class="btn" style="margin-top:12px" data-act="opsByAcc" data-id="${id}">Все операции (${list.length})</button>`;
    return h;
  };
  openSheet({
    title: acc(id).name, body: body(),
    onMount: w => { w.refresh = () => { if (!acc(id)) return w.close(); $('.sheet-title', w).textContent = acc(id).name; $('.sheet-body', w).innerHTML = body(); }; },
  });
}

/* =====================================================================
   Категории
   ===================================================================== */
function catForm(existing, kind, onSaved) {
  const c = existing ? { ...existing } : { name: '', kind, icon: kind === 'income' ? '💰' : '📦', color: '#ff9500' };
  const body = `
    <div style="text-align:center;margin-bottom:14px"><span class="ic" id="c-prev" style="width:64px;height:64px;font-size:34px;border-radius:20px;margin:0 auto;background:${c.color}26">${c.icon}</span></div>
    ${grp(fld('Название', `<input id="c-name" placeholder="Название категории" value="${esc(c.name)}" autocomplete="off">`),
      existing ? '' : fld('Тип', selHtml('c-kind', [['expense', 'Расход'], ['income', 'Доход']], c.kind)),
      fld('Свой эмодзи', `<input id="c-emoji" placeholder="Вставьте любой" maxlength="8" autocomplete="off">`))}
    <div class="group" id="c-ess-w">${fld('Обязательная трата', swt('c-ess', isEssential(c)))}</div>
    <p class="hint" style="margin-top:-8px" id="c-ess-h">Обязательные (жильё, продукты, транспорт) не считаются «лишними» в аналитике и правиле 50/30/20.</p>
    <div class="lbl">Иконка</div><div class="group" id="c-emojis">${emojiPicker(c.icon)}</div>
    <div class="lbl">Цвет</div><div class="group" id="c-colors">${colorPicker(c.color)}</div>
    ${existing ? '<button type="button" class="btn danger" id="c-del">Удалить категорию</button>' : ''}`;
  openSheet({
    title: existing ? 'Категория' : 'Новая категория', cancel: 'Отмена', doneLabel: 'Сохранить', body,
    done: w => {
      c.name = $('#c-name', w).value.trim();
      if (!c.name) { toast('Введите название'); return false; }
      if (!existing) c.kind = $('#c-kind', w).value;
      if (c.kind === 'expense') c.essential = $('#c-ess', w).checked;
      if (existing) Object.assign(S.categories.find(x => x.id === existing.id), c);
      else { c.id = uid(); S.categories.push(c); }
      commit(existing ? 'Категория сохранена' : 'Категория создана');
      onSaved?.(c);
    },
    onMount: w => {
      const prev = () => { const p = $('#c-prev', w); p.textContent = c.icon; p.style.background = c.color + '26'; };
      const essVis = () => { const k = existing ? c.kind : $('#c-kind', w).value; $('#c-ess-w', w).hidden = $('#c-ess-h', w).hidden = k !== 'expense'; };
      essVis(); $('#c-kind', w)?.addEventListener('change', essVis);
      wirePick($('#c-emojis', w), 'e', v => { c.icon = v; prev(); });
      wirePick($('#c-colors', w), 'c', v => { c.color = v; prev(); });
      $('#c-emoji', w).oninput = e => { const v = e.target.value.trim(); if (v) { c.icon = [...v].slice(0, 2).join(''); prev(); } };
      $('#c-del', w)?.addEventListener('click', () => {
        const n = S.transactions.filter(t => t.categoryId === existing.id).length;
        const others = S.categories.filter(x => x.kind === existing.kind && x.id !== existing.id);
        if (!others.length) return toast('Нельзя удалить последнюю категорию');
        const fallback = others.find(x => x.name === 'Другое') || others[0];
        if (!confirm(n ? `Удалить категорию? ${n} ${plural(n, 'операция будет перенесена', 'операции будут перенесены', 'операций будут перенесены')} в «${fallback.name}».` : 'Удалить категорию?')) return;
        const snap = JSON.stringify(S);
        S.transactions.forEach(t => { if (t.categoryId === existing.id) t.categoryId = fallback.id; });
        S.recurring.forEach(r => { if (r.categoryId === existing.id) r.categoryId = fallback.id; });
        S.budgets = S.budgets.filter(b => b.categoryId !== existing.id);
        S.rules = S.rules.filter(r => r.categoryId !== existing.id);
        S.categories = S.categories.filter(x => x.id !== existing.id);
        w.close(); commit('Категория удалена', undoTo(snap));
      });
    },
  });
}
function categoriesSheet() {
  let kind = 'expense';
  const body = () => {
    const mk = curMonth();
    const spent = byCategory(txInMonth(mk), kind);
    const list = S.categories.filter(c => c.kind === kind);
    return `<div class="seg" id="cs-seg">${[['expense', 'Расходы'], ['income', 'Доходы']].map(([v, l]) => `<button data-v="${v}" class="${kind === v ? 'on' : ''}">${l}</button>`).join('')}</div>
      <div class="list">${list.map(c => {
        const s = spent.find(x => x.id === c.id)?.value || 0;
        const n = S.transactions.filter(t => t.categoryId === c.id).length;
        return `<button class="row" data-act="editCat" data-id="${c.id}">${icBox(c.icon, c.color)}<span class="rb"><span class="rt">${esc(c.name)}</span><span class="rs">${n} ${plural(n, 'операция', 'операции', 'операций')}${c.kind === 'expense' && isEssential(c) ? ' · обязательная' : ''}</span></span><span class="ra">${s ? money(s) + '<small>в этом месяце</small>' : ''}</span></button>`;
      }).join('')}</div>
      <button class="btn primary" style="margin-top:14px" id="cs-add">＋ Новая категория</button>`;
  };
  openSheet({
    title: 'Категории', body: body(),
    onMount: w => {
      const wire = () => {
        $('#cs-seg', w).onclick = e => { const b = e.target.closest('[data-v]'); if (b) { kind = b.dataset.v; w.refresh(); } };
        $('#cs-add', w).onclick = () => catForm(null, kind);
      };
      w.refresh = () => { $('.sheet-body', w).innerHTML = body(); wire(); };
      wire();
    },
  });
}

/* =====================================================================
   Цели
   ===================================================================== */
function goalForm(existing) {
  const g = existing ? { ...existing } : { name: '', icon: '🎯', color: '#2f6bff', target: '', currency: S.settings.currency, deadline: '', accountId: '', contributions: [], archived: false };
  const body = `
    ${grp(fld('Название', `<input id="g-name" placeholder="Отпуск, машина, подушка…" value="${esc(g.name)}" autocomplete="off">`),
      fld('Сумма цели', `<input id="g-target" inputmode="decimal" placeholder="0" value="${fmtInput(g.target)}">`),
      fld('Валюта', selHtml('g-cur', curOpts(), g.currency)),
      fld('Срок', `<input type="date" id="g-deadline" value="${g.deadline || ''}">`))}
    ${grp(fld('Копить на счёте', selHtml('g-acc', [['', 'Нет — вести взносы вручную'], ...S.accounts.filter(a => !a.archived || a.id === g.accountId).map(a => [a.id, a.name])], g.accountId)))}
    <p class="hint" style="margin-top:-8px">Если выбрать счёт (например, накопительный), прогресс цели будет равен его балансу.</p>
    <div class="lbl">Иконка</div><div class="group" id="g-emoji">${emojiPicker(g.icon)}</div>
    <div class="lbl">Цвет</div><div class="group" id="g-color">${colorPicker(g.color)}</div>
    ${existing ? `${grp(fld('Цель завершена (в архив)', swt('g-arch', g.archived)))}<button type="button" class="btn danger" id="g-del">Удалить цель</button>` : ''}`;
  openSheet({
    title: existing ? 'Цель' : 'Новая цель', cancel: 'Отмена', doneLabel: 'Сохранить', body,
    done: w => {
      g.name = $('#g-name', w).value.trim();
      g.target = round2(parseNum($('#g-target', w).value));
      if (!g.name) { toast('Введите название'); return false; }
      if (!(g.target > 0)) { toast('Укажите сумму цели'); return false; }
      g.currency = $('#g-cur', w).value; g.deadline = $('#g-deadline', w).value; g.accountId = $('#g-acc', w).value;
      if (existing) { g.archived = $('#g-arch', w).checked; Object.assign(S.goals.find(x => x.id === existing.id), g); }
      else { g.id = uid(); S.goals.push(g); }
      commit(existing ? 'Цель сохранена' : 'Цель создана');
    },
    onMount: w => {
      wirePick($('#g-emoji', w), 'e', v => g.icon = v);
      wirePick($('#g-color', w), 'c', v => g.color = v);
      $('#g-del', w)?.addEventListener('click', () => {
        const snap = JSON.stringify(S);
        S.goals = S.goals.filter(x => x.id !== existing.id);
        $$('.sheet-wrap').forEach(x => x.close()); commit('Цель удалена', undoTo(snap));
      });
    },
  });
}
function goalDetail(id) {
  const body = () => {
    const g = S.goals.find(x => x.id === id); if (!g) return '';
    const saved = goalSaved(g), pct = g.target ? saved / g.target * 100 : 0, left = Math.max(g.target - saved, 0);
    let plan = '';
    if (left > 0 && g.deadline) {
      const now = new Date(), dl = parseYmd(g.deadline);
      const months = Math.max(1, (dl.getFullYear() - now.getFullYear()) * 12 + dl.getMonth() - now.getMonth());
      plan = dl < now ? `<div class="kv"><span>Срок</span><b class="neg">истёк ${shortDate(g.deadline)}</b></div>`
        : `<div class="kv"><span>Откладывать в месяц</span><b>${money(left / months, g.currency)}</b></div><div class="kv"><span>Осталось месяцев</span><b>${months}</b></div>`;
    }
    const ring = donut([{ value: Math.min(saved, g.target), color: g.color }], g.target, `${Math.round(pct)}%`, 'накоплено');
    let h = `<div class="card"><div class="big-ring">${ring}</div>
      <div class="kv"><span>Накоплено</span><b>${money(saved, g.currency)}</b></div>
      <div class="kv"><span>Цель</span><b>${money(g.target, g.currency)}</b></div>
      <div class="kv"><span>Осталось</span><b>${left > 0 ? money(left, g.currency) : '🎉 Достигнута!'}</b></div>
      ${g.deadline ? `<div class="kv"><span>Срок</span><b>${shortDate(g.deadline)}</b></div>` : ''}${plan}</div>`;
    if (g.accountId && acc(g.accountId)) {
      h += `<p class="hint">Прогресс берётся из баланса счёта «${esc(acc(g.accountId).name)}». Пополняйте его переводом.</p>
        <button class="btn primary" data-act="transferTo" data-id="${g.accountId}">⇄ Перевести на «${esc(acc(g.accountId).name)}»</button>`;
    } else {
      h += `<div class="btns" style="margin-top:14px"><button class="btn primary" id="gd-add">＋ Пополнить</button><button class="btn" id="gd-sub">− Снять</button></div>`;
      const cs = [...(g.contributions || [])].sort((a, b) => b.date.localeCompare(a.date));
      if (cs.length) h += `<h2 class="sec">История</h2><div class="list">${cs.map(c => `<button class="row" data-contrib="${c.id}">${icBox(c.amount > 0 ? '⬆️' : '⬇️', c.amount > 0 ? '#34c759' : '#ff9500')}<span class="rb"><span class="rt">${c.amount > 0 ? 'Пополнение' : 'Снятие'}</span><span class="rs">${shortDate(c.date)}${c.note ? ' · ' + esc(c.note) : ''}</span></span><span class="ra ${c.amount > 0 ? 'pos' : ''}">${c.amount > 0 ? '+' : ''}${money(c.amount, g.currency)}</span></button>`).join('')}</div>`;
    }
    h += `<button class="btn" style="margin-top:12px" data-act="editGoal" data-id="${id}">Изменить цель</button>`;
    return h;
  };
  const contribute = (sign) => {
    const g = S.goals.find(x => x.id === id);
    openSheet({
      title: sign > 0 ? 'Пополнить цель' : 'Снять с цели', cancel: 'Отмена', doneLabel: 'Готово', short: true,
      body: `<div class="amount-box"><input id="gc-amt" inputmode="decimal" placeholder="0"><span>${curSym(g.currency)}</span></div>
        ${grp(fld('Дата', `<input type="date" id="gc-date" value="${today()}">`), fld('Комментарий', '<input id="gc-note" placeholder="Необязательно">'))}`,
      done: w => {
        const v = round2(parseNum($('#gc-amt', w).value));
        if (!(v > 0)) { toast('Введите сумму'); return false; }
        g.contributions = g.contributions || [];
        g.contributions.push({ id: uid(), amount: sign * v, date: $('#gc-date', w).value || today(), note: $('#gc-note', w).value.trim() });
        const after = goalSaved(g);
        commit(after >= g.target && sign > 0 ? '🎉 Цель достигнута!' : 'Готово');
      },
      onMount: w => setTimeout(() => $('#gc-amt', w).focus(), 350),
    });
  };
  openSheet({
    title: S.goals.find(x => x.id === id).name, body: body(),
    onMount: w => {
      const wire = () => {
        $('#gd-add', w)?.addEventListener('click', () => contribute(1));
        $('#gd-sub', w)?.addEventListener('click', () => contribute(-1));
        $$('[data-contrib]', w).forEach(b => b.onclick = () => {
          if (!confirm('Удалить эту запись?')) return;
          const g = S.goals.find(x => x.id === id);
          g.contributions = g.contributions.filter(c => c.id !== b.dataset.contrib);
          commit();
        });
      };
      w.refresh = () => { const g = S.goals.find(x => x.id === id); if (!g) return w.close(); $('.sheet-title', w).textContent = g.name; $('.sheet-body', w).innerHTML = body(); wire(); };
      wire();
    },
  });
}

/* =====================================================================
   Бюджеты
   ===================================================================== */
function budgetForm(existing, preset = {}) {
  const b = existing ? { ...existing } : { categoryId: preset.categoryId || '', limit: preset.limit || '' };
  const used = S.budgets.filter(x => x.id !== existing?.id).map(x => x.categoryId || '');
  const opts = [['', 'Все расходы (общий лимит)'], ...S.categories.filter(c => c.kind === 'expense').map(c => [c.id, `${c.icon} ${c.name}`])].filter(([v]) => !used.includes(v) || v === b.categoryId);
  const avg = catId => {
    let s = 0; for (let i = 1; i <= 3; i++) s += budgetSpent({ categoryId: catId }, shiftMonth(curMonth(), -i));
    return s / 3;
  };
  openSheet({
    title: existing ? 'Бюджет' : 'Новый бюджет', cancel: 'Отмена', doneLabel: 'Сохранить', short: !existing,
    body: `${grp(fld('Категория', selHtml('b-cat', opts, b.categoryId)), fld('Лимит в месяц', `<input id="b-limit" inputmode="decimal" placeholder="0" value="${fmtInput(b.limit)}">`))}
      <p class="hint" id="b-avg"></p>
      ${existing ? '<button type="button" class="btn danger" id="b-del">Удалить бюджет</button>' : ''}`,
    done: w => {
      b.categoryId = $('#b-cat', w).value; b.limit = round2(parseNum($('#b-limit', w).value));
      if (!(b.limit > 0)) { toast('Укажите лимит'); return false; }
      if (existing) Object.assign(S.budgets.find(x => x.id === existing.id), b);
      else { b.id = uid(); S.budgets.push(b); }
      commit('Бюджет сохранён');
    },
    onMount: w => {
      const showAvg = () => { const v = avg($('#b-cat', w).value); $('#b-avg', w).textContent = v ? `В среднем за последние 3 месяца: ${money(Math.round(v))} в месяц.` : ''; };
      showAvg(); $('#b-cat', w).onchange = showAvg;
      $('#b-del', w)?.addEventListener('click', () => {
        const snap = JSON.stringify(S);
        S.budgets = S.budgets.filter(x => x.id !== existing.id); w.close(); commit('Бюджет удалён', undoTo(snap));
      });
    },
  });
}

/* =====================================================================
   Регулярные платежи
   ===================================================================== */
function advanceDate(s, period, anchorDay) {
  const d = parseYmd(s);
  if (period === 'day') d.setDate(d.getDate() + 1);
  else if (period === 'week') d.setDate(d.getDate() + 7);
  else {
    const add = { month: 1, quarter: 3, year: 12 }[period];
    const y = d.getFullYear(), m = d.getMonth() + add;
    const ny = y + Math.floor(m / 12), nm = m % 12;
    return ymd(new Date(ny, nm, Math.min(anchorDay || d.getDate(), daysInMonth(ny, nm + 1))));
  }
  return ymd(d);
}
function recForm(existing, preset = {}) {
  const r = existing ? { ...existing } : { name: '', type: 'expense', amount: '', accountId: lastAccountId(), toAccountId: '', categoryId: '', period: 'month', nextDate: today(), note: '', ...preset };
  const accOpts = S.accounts.filter(a => !a.archived || a.id === r.accountId || a.id === r.toAccountId).map(a => [a.id, a.name]);
  const body = `
    <div class="seg" id="r-type">${[['expense', 'Расход'], ['income', 'Доход'], ['transfer', 'Перевод']].map(([v, l]) => `<button type="button" data-v="${v}" class="${r.type === v ? 'on' : ''}">${l}</button>`).join('')}</div>
    ${grp(fld('Название', `<input id="r-name" placeholder="Аренда, кредит, зарплата…" value="${esc(r.name)}" autocomplete="off">`),
      fld('Сумма', `<input id="r-amt" inputmode="decimal" placeholder="0" value="${fmtInput(r.amount)}">`),
      fld('<span id="r-acc-l">Счёт</span>', selHtml('r-acc', accOpts, r.accountId)),
      `<label class="fld" id="r-to-w"><span>На счёт</span>${selHtml('r-to', [['', 'Выберите'], ...accOpts], r.toAccountId)}</label>`,
      fld('Периодичность', selHtml('r-period', Object.entries(PERIODS), r.period)),
      fld('Следующий платёж', `<input type="date" id="r-next" value="${r.nextDate}">`))}
    <p class="hint" id="r-tr-hint" style="margin-top:-8px">Платёж по кредиту или долгу: выберите «На счёт» — счёт кредита. Каждое проведение будет уменьшать долг. Так же можно автоматически откладывать на накопительный счёт.</p>
    <div id="r-cat-w"><div class="lbl">Категория</div><div class="cat-grid" id="r-cat"></div></div>
    ${existing ? '<button type="button" class="btn danger" id="r-del">Удалить платёж</button>' : ''}`;
  openSheet({
    title: existing ? 'Регулярный платёж' : 'Новый платёж', cancel: 'Отмена', doneLabel: 'Сохранить', body,
    done: w => {
      r.name = $('#r-name', w).value.trim(); r.amount = round2(parseNum($('#r-amt', w).value));
      r.accountId = $('#r-acc', w).value; r.period = $('#r-period', w).value; r.nextDate = $('#r-next', w).value || today();
      r.anchorDay = parseYmd(r.nextDate).getDate();
      if (!r.name) { toast('Введите название'); return false; }
      if (!(r.amount > 0)) { toast('Укажите сумму'); return false; }
      if (!r.accountId) { toast('Выберите счёт'); return false; }
      r.toAccountId = r.type === 'transfer' ? $('#r-to', w).value : '';
      if (r.type === 'transfer') {
        if (!r.toAccountId || r.toAccountId === r.accountId) { toast('Выберите счёт зачисления'); return false; }
        r.categoryId = null;
      } else if (!r.categoryId) { toast('Выберите категорию'); return false; }
      if (existing) Object.assign(S.recurring.find(x => x.id === existing.id), r);
      else { r.id = uid(); S.recurring.push(r); }
      commit('Платёж сохранён');
    },
    onMount: w => {
      const paint = () => {
        $$('#r-type button', w).forEach(b => b.classList.toggle('on', b.dataset.v === r.type));
        const isTr = r.type === 'transfer';
        $('#r-to-w', w).hidden = !isTr; $('#r-tr-hint', w).hidden = !isTr; $('#r-cat-w', w).hidden = isTr;
        $('#r-acc-l', w).textContent = isTr ? 'Со счёта' : 'Счёт';
        if (isTr) return;
        if (r.categoryId && catById(r.categoryId)?.kind !== r.type) r.categoryId = '';
        $('#r-cat', w).innerHTML = catGrid(r.type, r.categoryId);
      };
      paint();
      $('#r-type', w).onclick = e => { const b = e.target.closest('[data-v]'); if (b) { r.type = b.dataset.v; paint(); } };
      $('#r-cat', w).onclick = e => {
        const b = e.target.closest('button'); if (!b) return;
        if (b.dataset.new) return catForm(null, r.type, c => { r.categoryId = c.id; paint(); });
        r.categoryId = b.dataset.v; paint();
      };
      $('#r-del', w)?.addEventListener('click', () => {
        const snap = JSON.stringify(S);
        S.recurring = S.recurring.filter(x => x.id !== existing.id); w.close(); commit('Платёж удалён', undoTo(snap));
      });
    },
  });
}
function recPost(id) {
  const r = S.recurring.find(x => x.id === id); if (!r) return;
  if (!acc(r.accountId) || (r.type === 'transfer' && !acc(r.toAccountId))) return toast('Счёт платежа удалён — выберите другой');
  const snap = JSON.stringify(S);
  const tx = { id: uid(), ts: Date.now(), type: r.type, amount: r.amount, accountId: r.accountId, categoryId: r.categoryId, date: r.nextDate, note: r.name };
  if (r.type === 'transfer') {
    tx.categoryId = null; tx.toAccountId = r.toAccountId;
    if (accCur(r.accountId) !== accCur(r.toAccountId)) tx.toAmount = round2(convert(r.amount, accCur(r.accountId), accCur(r.toAccountId)));
  }
  S.transactions.push(tx);
  r.nextDate = advanceDate(r.nextDate, r.period, r.anchorDay);
  commit(`Проведено: ${r.name}`, undoTo(snap));
}
function recSkip(id) {
  const r = S.recurring.find(x => x.id === id); if (!r) return;
  r.nextDate = advanceDate(r.nextDate, r.period, r.anchorDay);
  commit('Пропущено');
}

/* =====================================================================
   Банки: подключение, импорт выписок, разбор SMS/push
   ===================================================================== */
function banksSheet() {
  const body = () => `
    <p class="hint">Российские банки не дают частным приложениям прямой доступ к счетам, поэтому данные подтягиваются двумя способами: <b>выпиской CSV</b> (загрузка за любой период, без дублей) и <b>текстом SMS/push</b> — скопируйте уведомление банка и вставьте сюда.</p>
    ${S.banks.length ? `<div class="list">${S.banks.map(b => {
      const accs = b.accountIds.map(acc).filter(Boolean);
      return `<button class="row" data-bank="${b.id}"><span class="ic" style="background:${b.color};color:${fgOn(b.color)};font-weight:800;font-size:16px">${esc(b.name[0])}</span><span class="rb"><span class="rt">${esc(b.name)}</span><span class="rs">${accs.length ? accs.map(a => esc(a.name)).join(', ') : 'Нет счетов'}${b.lastImport ? ' · импорт ' + shortDate(b.lastImport) : ''}</span></span><span class="chev">${ICON.chev.replace('<svg', '<svg width="16" height="16"')}</span></button>`;
    }).join('')}</div>` : ''}
    <div class="lbl" style="margin-top:18px">Подключить банк</div>
    <div class="chips" style="flex-wrap:wrap;margin:0 0 16px;padding:0">${BANK_PRESETS.map((p, i) => `<button class="chip" data-preset="${i}"><span class="ic" style="width:22px;height:22px;border-radius:6px;background:${p.color};font-size:11px;color:${fgOn(p.color)};font-weight:800">${p.name[0]}</span>${p.name}</button>`).join('')}</div>
    <div class="btns"><button class="btn" id="bk-csv">📄 Импорт CSV</button><button class="btn" id="bk-sms">💬 Из SMS</button></div>`;
  openSheet({
    title: 'Банки и импорт', body: body(),
    onMount: w => {
      const wire = () => {
        $$('[data-bank]', w).forEach(b => b.onclick = () => bankDetail(b.dataset.bank));
        $$('[data-preset]', w).forEach(b => b.onclick = () => {
          const p = BANK_PRESETS[+b.dataset.preset];
          let name = p.name;
          if (p.name === 'Другой банк') { name = prompt('Название банка'); if (!name) return; }
          const bank = { id: uid(), name, color: p.color, accountIds: [], lastImport: null };
          S.banks.push(bank); commit(`${name} добавлен`);
          bankDetail(bank.id);
        });
        $('#bk-csv', w).onclick = () => importSheet(null);
        $('#bk-sms', w).onclick = () => smsSheet(null);
      };
      w.refresh = () => { $('.sheet-body', w).innerHTML = body(); wire(); };
      wire();
    },
  });
}
function bankDetail(id) {
  const body = () => {
    const b = S.banks.find(x => x.id === id); if (!b) return '';
    const accs = b.accountIds.map(acc).filter(Boolean);
    return `<div class="card" style="text-align:center"><span class="ic" style="margin:0 auto 8px;width:56px;height:56px;border-radius:16px;background:${b.color};color:${fgOn(b.color)};font-size:26px;font-weight:800">${esc(b.name[0])}</span>
        <div class="b" style="font-size:20px">${esc(b.name)}</div><div class="muted">${accs.length} ${plural(accs.length, 'счёт', 'счёта', 'счетов')}${b.lastImport ? ' · последний импорт ' + shortDate(b.lastImport) : ''}</div></div>
      <h2 class="sec">Счета в банке</h2>
      ${accs.length ? `<div class="list">${accs.map(accRow).join('')}</div>` : '<p class="hint">Добавьте карты и счета этого банка — по ним будут загружаться операции.</p>'}
      <div class="btns" style="margin-top:12px"><button class="btn" id="bd-new">＋ Новый счёт</button><button class="btn" id="bd-link">Привязать</button></div>
      <h2 class="sec">Загрузить операции</h2>
      <button class="btn primary" id="bd-csv">📄 Импорт выписки (CSV)</button>
      <button class="btn" id="bd-sms">💬 Вставить SMS / push</button>
      <p class="hint" style="margin-top:12px"><b>Как получить выписку:</b> в приложении или интернет-банке откройте карту/счёт → «Выписка» (иногда «Справки и выписки»), выберите период и формат <b>CSV</b>. Если банк отдаёт только Excel — откройте файл в «Numbers» на iPhone и экспортируйте в CSV. Затем выберите файл здесь — повторные операции не задвоятся.</p>
      <button class="btn danger" id="bd-del" style="margin-top:12px">Отключить банк</button>`;
  };
  openSheet({
    title: S.banks.find(x => x.id === id).name, body: body(),
    onMount: w => {
      const wire = () => {
        const b = S.banks.find(x => x.id === id);
        $('#bd-new', w).onclick = () => accForm(null, null, { name: b.name, color: b.color, bankId: id });
        $('#bd-link', w).onclick = () => {
          const free = S.accounts.filter(a => !a.archived && !b.accountIds.includes(a.id));
          if (!free.length) return toast('Нет счетов для привязки');
          openSheet({
            title: 'Привязать счета', cancel: 'Отмена', done: sw => {
              $$('input[data-a]', sw).forEach(i => { if (i.checked) { b.accountIds.push(i.dataset.a); acc(i.dataset.a).bankId = id; } });
              commit();
            },
            body: `<div class="group">${free.map(a => `<label class="fld"><span>${esc(a.icon)} ${esc(a.name)}</span><input type="checkbox" class="switch" data-a="${a.id}"></label>`).join('')}</div>`,
          });
        };
        $('#bd-csv', w).onclick = () => importSheet(id);
        $('#bd-sms', w).onclick = () => smsSheet(id);
        $('#bd-del', w).onclick = () => {
          if (!confirm('Отключить банк? Счета и операции останутся.')) return;
          S.accounts.forEach(a => { if (a.bankId === id) a.bankId = ''; });
          S.banks = S.banks.filter(x => x.id !== id); w.close(); commit('Банк отключён');
        };
      };
      w.refresh = () => { if (!S.banks.find(x => x.id === id)) return w.close(); $('.sheet-body', w).innerHTML = body(); wire(); };
      wire();
    },
  });
}

/* --------- CSV --------- */
function decodeBuffer(buf) {
  try { return new TextDecoder('utf-8', { fatal: true }).decode(buf); }
  catch { try { return new TextDecoder('windows-1251').decode(buf); } catch { return new TextDecoder().decode(buf); } }
}
function parseCSV(text) {
  text = text.replace(/^﻿/, '');
  const firstLines = text.split(/\r?\n/).slice(0, 15).join('\n');
  const delim = [';', ',', '\t'].map(d => [d, firstLines.split(d).length]).sort((a, b) => b[1] - a[1])[0][0];
  const rows = []; let row = [], f = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; }
      else f += c;
    } else if (c === '"') q = true;
    else if (c === delim) { row.push(f); f = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(f); rows.push(row); row = []; f = '';
    } else f += c;
  }
  if (f || row.length) { row.push(f); rows.push(row); }
  return rows.map(r => r.map(x => x.trim())).filter(r => r.some(Boolean));
}
function parseAnyDate(s) {
  s = String(s || '').trim(); let m;
  if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) return `${m[1]}-${pad(m[2])}-${pad(m[3])}`;
  if ((m = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/))) { let y = +m[3]; if (y < 100) y += 2000; return `${y}-${pad(m[2])}-${pad(m[1])}`; }
  return null;
}
const MAP_FIELDS = [
  ['date', 'Дата', [/дата операции/i, /^дата$/i, /дата/i, /date/i]],
  ['amount', 'Сумма (± знак)', [/сумма платежа/i, /сумма операции/i, /сумма в валюте сч/i, /^сумма$/i, /сумма/i, /amount/i]],
  ['inAmt', 'Приход (отдельно)', [/приход|зачислен|поступлен|^credit$/i]],
  ['outAmt', 'Расход (отдельно)', [/^расход|списан|^debit$/i]],
  ['desc', 'Описание', [/описание/i, /назначение/i, /контрагент|получатель|merchant|description/i]],
  ['cat', 'Категория банка', [/категория|category/i]],
  ['status', 'Статус', [/статус|status/i]],
];
function detectMapping(header) {
  const map = {}, taken = new Set();
  for (const [key, , pats] of MAP_FIELDS) {
    map[key] = '';
    for (const re of pats) {
      const i = header.findIndex((h, idx) => !taken.has(idx) && re.test(h));
      if (i >= 0) { map[key] = String(i); taken.add(i); break; }
    }
  }
  if (map.amount && (map.inAmt || map.outAmt)) { map.inAmt = ''; map.outAmt = ''; }
  return map;
}
function buildImport(st) {
  const { rows, map, invert, accountId } = st;
  const existing = new Set(S.transactions.filter(t => t.importHash && t.accountId === accountId).map(t => t.importHash));
  const seen = {};
  const out = [];
  let skipped = 0;
  for (const r of rows) {
    const date = parseAnyDate(r[map.date]);
    if (!date) { skipped++; continue; }
    if (map.status !== '' && /отклон|fail|неусп|отмен|declin|reject/i.test(r[map.status] || '')) { skipped++; continue; }
    let v;
    if (map.amount !== '') { v = parseNum(r[map.amount]); if (invert) v = -v; }
    else { const i = parseNum(r[map.inAmt]) || 0, o = parseNum(r[map.outAmt]) || 0; v = Math.abs(i) - Math.abs(o); }
    if (!v || isNaN(v)) { skipped++; continue; }
    const type = v < 0 ? 'expense' : 'income';
    const amount = round2(Math.abs(v));
    const desc = map.desc !== '' ? (r[map.desc] || '') : '';
    const bankCat = map.cat !== '' ? (r[map.cat] || '') : '';
    const base = `${date}|${type}|${amount.toFixed(2)}|${normKey(desc)}`;
    seen[base] = (seen[base] || 0) + 1;
    const hash = `${base}#${seen[base]}`;
    out.push({ date, type, amount, note: desc.slice(0, 120), categoryId: guessCategory(desc, type, bankCat), importHash: hash, dup: existing.has(hash) });
  }
  return { list: out, skipped };
}
function importSheet(bankId) {
  const bank = S.banks.find(b => b.id === bankId);
  const st = { rows: null, header: null, map: null, invert: false, accountId: bank?.accountIds.find(acc) || lastAccountId() };
  const body = `<p class="hint">Выберите файл выписки в формате CSV (из «Файлов», почты или загрузок). Столбцы определятся автоматически — проверьте их перед импортом.</p>
    <label class="btn primary">📄 Выбрать файл CSV<input type="file" id="imp-file" accept=".csv,.txt,text/csv,text/plain,text/comma-separated-values" hidden></label>
    <div id="imp-step"></div>`;
  openSheet({
    title: bank ? `Импорт: ${bank.name}` : 'Импорт выписки', body,
    onMount: w => {
      const step = $('#imp-step', w);
      const paint = () => {
        if (!st.rows) return;
        const colOpts = [['', '— нет —'], ...st.header.map((h, i) => [String(i), h || `Столбец ${i + 1}`])];
        const res = buildImport(st);
        const fresh = res.list.filter(x => !x.dup);
        const accList = S.accounts.filter(a => !a.archived);
        const inc = fresh.filter(x => x.type === 'income').reduce((s, x) => s + x.amount, 0), exp = fresh.filter(x => x.type === 'expense').reduce((s, x) => s + x.amount, 0);
        step.innerHTML = `
          <div class="lbl" style="margin-top:18px">Счёт для операций</div>
          <div class="chips" id="imp-acc">${accList.map(a => `<button class="chip ${a.id === st.accountId ? 'on' : ''}" data-v="${a.id}">${esc(a.icon)} ${esc(a.name)}</button>`).join('')}</div>
          <div class="lbl">Столбцы файла</div>
          <div class="group">${MAP_FIELDS.map(([k, l]) => fld(l, selHtml('m-' + k, colOpts, st.map[k]))).join('')}
            ${fld('Расходы без минуса', swt('imp-inv', st.invert))}</div>
          <p class="hint" style="margin-top:-8px">Включите «Расходы без минуса», если в выписке списания указаны положительными числами.</p>
          <div class="card"><div class="kv"><span>Новых операций</span><b>${fresh.length}</b></div>
            <div class="kv"><span>Уже были загружены</span><b>${res.list.length - fresh.length}</b></div>
            ${res.skipped ? `<div class="kv"><span>Пропущено строк</span><b>${res.skipped}</b></div>` : ''}
            <div class="kv"><span>Доходы / расходы</span><b><span class="pos">+${money(inc, accCur(st.accountId))}</span> / −${money(exp, accCur(st.accountId))}</b></div></div>
          ${fresh.length ? `<h2 class="sec">Предпросмотр</h2><div class="list">${fresh.slice(0, 8).map(x => { const c = catById(x.categoryId); return `<div class="row">${icBox(c?.icon || '❔', c?.color || '#8e8e93')}<span class="rb"><span class="rt">${esc(x.note || c?.name || '')}</span><span class="rs">${shortDate(x.date)} · ${esc(c?.name || '')}</span></span><span class="ra ${x.type === 'income' ? 'pos' : ''}">${x.type === 'income' ? '+' : '−'}${money(x.amount, accCur(st.accountId))}</span></div>`; }).join('')}</div>
            ${fresh.length > 8 ? `<p class="hint" style="text-align:center">и ещё ${fresh.length - 8}…</p>` : ''}
            <button class="btn primary" id="imp-go" style="margin-top:14px">Импортировать ${fresh.length} ${plural(fresh.length, 'операцию', 'операции', 'операций')}</button>` : `<p class="hint" style="text-align:center;margin-top:14px">${res.list.length ? 'Все операции из файла уже загружены 👍' : 'Нечего импортировать — проверьте столбцы даты и суммы.'}</p>`}`;
        $('#imp-acc', step).onclick = e => { const b = e.target.closest('[data-v]'); if (b) { st.accountId = b.dataset.v; paint(); } };
        MAP_FIELDS.forEach(([k]) => $('#m-' + k, step).onchange = e => { st.map[k] = e.target.value; paint(); });
        $('#imp-inv', step).onchange = e => { st.invert = e.target.checked; paint(); };
        $('#imp-go', step)?.addEventListener('click', () => {
          const now = Date.now();
          fresh.forEach((x, i) => S.transactions.push({ id: uid(), ts: now - i, type: x.type, amount: x.amount, accountId: st.accountId, categoryId: x.categoryId, date: x.date, note: x.note, importHash: x.importHash, imported: true }));
          const b = S.banks.find(bb => bb.id === bankId) || S.banks.find(bb => bb.accountIds.includes(st.accountId));
          if (b) b.lastImport = today();
          w.close(); commit(`Загружено ${fresh.length} ${plural(fresh.length, 'операция', 'операции', 'операций')}`);
        });
      };
      $('#imp-file', w).onchange = async e => {
        const file = e.target.files[0]; if (!file) return;
        try {
          const rows = parseCSV(decodeBuffer(await file.arrayBuffer()));
          let hi = rows.findIndex(r => r.length >= 3 && r.some(c => /дата|date/i.test(c)));
          if (hi < 0) hi = 0;
          st.header = rows[hi]; st.rows = rows.slice(hi + 1); st.map = detectMapping(st.header);
          if (!st.rows.length) return toast('В файле нет строк с операциями');
          paint();
        } catch (err) { console.error(err); toast('Не удалось прочитать файл'); }
      };
    },
  });
}

/* --------- SMS / push --------- */
const CUR_PATTERNS = [[/^(₽|р\.?|руб\.?|rub|rur)$/i, 'RUB'], [/^(\$|usd)$/i, 'USD'], [/^(€|eur)$/i, 'EUR'], [/^(₸|kzt)$/i, 'KZT'], [/^(byn)$/i, 'BYN'], [/^(cny|¥)$/i, 'CNY']];
function parseBankText(raw) {
  const text = raw.replace(/[  ]/g, ' ').replace(/\s+/g, ' ').trim();
  const re = /([+\-−]?)\s?(\d{1,3}(?:[ ]\d{3})+|\d+)(?:[.,](\d{1,2}))?\s?(₽|руб\.?|RUB|RUR|р\.?(?![а-яё])|USD|\$|EUR|€|KZT|₸|BYN|CNY|¥)/i;
  const m = text.match(re);
  if (!m) return null;
  const amount = parseFloat(m[2].replace(/ /g, '') + (m[3] ? '.' + m[3] : ''));
  const curRaw = m[4];
  const currency = (CUR_PATTERNS.find(([p]) => p.test(curRaw)) || [, 'RUB'])[1];
  const before = text.slice(0, m.index), after = text.slice(m.index + m[0].length);
  const incomeRe = /(зачислен|поступлен|пополнен|перевод от|входящий перевод|возврат|кэшб[еэ]к|зарплат|получен)/i;
  const type = m[1] === '+' || incomeRe.test(before + ' ' + after.slice(0, 20)) ? 'income' : 'expense';
  const last4 = (text.match(/(?:\*|•|·|MIR-?|ECMC|VISA|MC|карт[аеуы]?\s*(?:\*|№)?\s*|сч[её]т[ау]?\s*\*?)(\d{4})\b/i) || [])[1] || '';
  let merchant = after.replace(/^[\s,.:;—-]+/, '').split(/(?:\.\s|,|\s?(?:баланс|доступно|остаток)|\sкарт[аы]?\s)/i)[0].trim();
  merchant = merchant.replace(/^(в|на|от)\s/i, '').replace(/[\s.,;:]+$/, '').slice(0, 60);
  if (!merchant || /^\d/.test(merchant) || /^(сч[её]т|карт)/i.test(merchant)) {
    merchant = before.replace(/(MIR|ECMC|VISA)-?\d{4}|\*\d{4}|\d{1,2}:\d{2}|^(покупка|оплата|списание)\b/gi, ' ').replace(/[.,:;]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);
  }
  return { amount, currency, type, last4, merchant, text };
}
function smsSheet(bankId) {
  const bank = S.banks.find(b => b.id === bankId);
  openSheet({
    title: 'Операция из SMS', cancel: 'Отмена', doneLabel: 'Распознать',
    body: `<p class="hint">Скопируйте SMS или push-уведомление банка и вставьте его сюда. Приложение определит сумму, тип операции, карту и категорию.</p>
      <div class="group"><label class="fld col"><textarea id="sms-text" placeholder="Например: Покупка 1 250,00 ₽ PYATEROCHKA карта *1234. Доступно 15 300 ₽"></textarea></label></div>
      <button class="btn" id="sms-paste">📋 Вставить из буфера</button>`,
    done: w => {
      const p = parseBankText($('#sms-text', w).value);
      if (!p) { toast('Не нашёл сумму в тексте'); return false; }
      let a = p.last4 ? S.accounts.find(x => x.last4 === p.last4) : null;
      if (!a && bank) a = bank.accountIds.map(acc).find(Boolean);
      const amount = a && a.currency !== p.currency ? round2(convert(p.amount, p.currency, a.currency)) : p.amount;
      setTimeout(() => txForm(null, { type: p.type, amount, accountId: a?.id, note: p.merchant, categoryId: guessCategory(`${p.merchant} ${p.text}`, p.type) }), 300);
    },
    onMount: w => {
      const btn = $('#sms-paste', w);
      if (!navigator.clipboard?.readText) btn.hidden = true;
      btn.onclick = async () => { try { $('#sms-text', w).value = await navigator.clipboard.readText(); } catch { toast('Нет доступа к буферу — вставьте вручную'); } };
    },
  });
}

/* =====================================================================
   Отчёты
   ===================================================================== */
function barChart(months) {
  const W = 340, H = 170, top = 10, bottom = 22, left = 4;
  const max = Math.max(1, ...months.flatMap(m => [m.income, m.expense]));
  const gw = (W - left) / months.length, bw = Math.min(12, gw / 3);
  let s = '';
  months.forEach((m, i) => {
    const x = left + i * gw + gw / 2;
    const hi = (H - top - bottom) * m.income / max, he = (H - top - bottom) * m.expense / max;
    s += `<rect x="${x - bw - 1}" y="${H - bottom - hi}" width="${bw}" height="${Math.max(hi, 0.5)}" rx="3" fill="var(--green)"/>`;
    s += `<rect x="${x + 1}" y="${H - bottom - he}" width="${bw}" height="${Math.max(he, 0.5)}" rx="3" fill="var(--red)" opacity=".85"/>`;
    s += `<text x="${x}" y="${H - 6}" text-anchor="middle">${m.label}</text>`;
  });
  return `<div class="bars"><svg viewBox="0 0 ${W} ${H}"><line x1="0" x2="${W}" y1="${H - bottom}" y2="${H - bottom}" stroke="var(--sep)"/>${s}</svg></div>`;
}
/* =====================================================================
   Суммы по категориям (открывается по нажатию на диаграмму)
   ===================================================================== */
function categoryChartSheet(startMk, startKind = 'expense', focusId) {
  let mk = startMk, kind = startKind;
  const body = () => {
    const list = txInMonth(mk);
    const cats = byCategory(list, kind);
    const prev = byCategory(txInMonth(shiftMonth(mk, -1)), kind);
    const total = cats.reduce((s, c) => s + c.value, 0);
    const counts = {};
    for (const t of list) if (t.type === kind) counts[t.categoryId || ''] = (counts[t.categoryId || ''] || 0) + 1;
    const prevTotal = prev.reduce((s, c) => s + c.value, 0);
    const [y, m] = mk.split('-').map(Number);
    const days = mk === curMonth() ? new Date().getDate() : daysInMonth(y, m);
    let h = `<div class="mnav" style="margin-top:0"><button id="cc-prev" aria-label="Предыдущий месяц">‹</button><span class="mtitle">${monthTitle(mk)}</span><button id="cc-next" aria-label="Следующий месяц">›</button></div>
      <div class="seg" id="cc-kind"><button data-v="expense" class="${kind === 'expense' ? 'on' : ''}">Расходы</button><button data-v="income" class="${kind === 'income' ? 'on' : ''}">Доходы</button></div>`;
    if (!cats.length) return h + `<div class="card">${emptyBox('📭', kind === 'expense' ? 'Расходов за этот месяц нет' : 'Доходов за этот месяц нет')}</div>`;
    const word = kind === 'expense' ? 'расходы' : 'доходы';
    h += `<div class="card"><div style="display:grid;place-items:center">${donut(topN(cats, 8), total, money(total), word).replace('class="donut"', 'class="donut lg"')}</div>
      <div class="kv" style="margin-top:12px"><span>Всего</span><b class="${kind === 'income' ? 'pos' : ''}">${money(total)}</b></div>
      ${prevTotal ? `<div class="kv"><span>Прошлый месяц</span><b>${money(prevTotal)}</b></div>` : ''}
      ${kind === 'expense' && days ? `<div class="kv"><span>В среднем в день</span><b>${money(Math.round(total / days))}</b></div>` : ''}</div>`;
    h += `<h2 class="sec">По категориям</h2><div class="list">${cats.map(c => {
      const p = prev.find(x => x.id === c.id)?.value || 0;
      const diff = p ? Math.round((c.value - p) / p * 100) : null;
      const good = kind === 'expense' ? diff < 0 : diff > 0;
      const change = diff == null ? '<small>новое</small>' : diff === 0 ? '<small>как в прошлом</small>' : `<small class="${good ? 'pos' : 'neg'}">${diff > 0 ? '▲' : '▼'} ${Math.abs(diff)}%</small>`;
      const n = counts[c.id] || 0;
      return `<button class="prog-row ${c.id === focusId ? 'focus' : ''}" data-cat="${c.id}" data-kind="${kind}"><div class="prog-top">${icBox(c.icon, c.color)}<span class="rb"><span class="rt">${esc(c.name)}</span><span class="rs">${(c.value / total * 100).toFixed(1).replace('.', ',')}% · ${n} ${plural(n, 'операция', 'операции', 'операций')}</span></span><span class="ra">${money(c.value)}${change}</span></div>
        <div class="bar"><i style="background:${c.color};width:${(c.value / cats[0].value * 100).toFixed(1)}%"></i></div></button>`;
    }).join('')}</div><p class="hint" style="text-align:center">Нажмите на категорию, чтобы увидеть её операции. Изменение — к прошлому месяцу.</p>`;
    return h;
  };
  openSheet({
    title: kind === 'expense' ? 'Расходы по категориям' : 'Доходы по категориям', body: body(),
    onMount: w => {
      const wire = () => {
        $('.sheet-title', w).textContent = kind === 'expense' ? 'Расходы по категориям' : 'Доходы по категориям';
        $('#cc-prev', w).onclick = () => { mk = shiftMonth(mk, -1); focusId = null; w.refresh(); };
        $('#cc-next', w).onclick = () => { mk = shiftMonth(mk, 1); focusId = null; w.refresh(); };
        $('#cc-kind', w).onclick = e => { const b = e.target.closest('[data-v]'); if (b) { kind = b.dataset.v; focusId = null; w.refresh(); } };
        $$('[data-cat]', w).forEach(b => b.onclick = () => { ui.month = mk; ACTIONS.catOps({ dataset: { id: b.dataset.cat, kind: b.dataset.kind } }); });
        const f = $('.prog-row.focus', w);
        if (f) setTimeout(() => f.scrollIntoView({ block: 'center', behavior: 'smooth' }), 350);
      };
      w.refresh = () => { $('.sheet-body', w).innerHTML = body(); wire(); };
      wire();
    },
  });
}

function reportsSheet() {
  const st = { mode: 'month', kind: 'expense', month: ui.month, year: +ui.month.slice(0, 4) };
  const body = () => {
    const prefix = st.mode === 'month' ? st.month : String(st.year);
    const list = S.transactions.filter(t => t.date.startsWith(prefix));
    const sums = sumStats(list);
    const cats = byCategory(list, st.kind);
    const total = st.kind === 'expense' ? sums.expense : sums.income;
    const title = st.mode === 'month' ? monthTitle(st.month) : String(st.year);
    const months = [];
    if (st.mode === 'month') for (let i = 5; i >= 0; i--) { const mk = shiftMonth(st.month, -i); const s = sumStats(txInMonth(mk)); months.push({ ...s, label: MONTHS_SHORT[+mk.slice(5) - 1] }); }
    else for (let i = 1; i <= 12; i++) { const mk = `${st.year}-${pad(i)}`; const s = sumStats(txInMonth(mk)); months.push({ ...s, label: MONTHS_SHORT[i - 1] }); }
    const top = list.filter(t => t.type === st.kind).sort((a, b) => txMain(b) - txMain(a)).slice(0, 5);
    const savingRate = sums.income ? (sums.income - sums.expense) / sums.income * 100 : 0;
    return `<div class="seg" id="rp-mode"><button data-v="month" class="${st.mode === 'month' ? 'on' : ''}">Месяц</button><button data-v="year" class="${st.mode === 'year' ? 'on' : ''}">Год</button></div>
      <div class="mnav" style="margin-top:4px"><button id="rp-prev">‹</button><span class="mtitle">${title}</span><button id="rp-next">›</button></div>
      <div class="card"><div class="kv"><span>Доходы</span><b class="pos">${money(sums.income)}</b></div><div class="kv"><span>Расходы</span><b>${money(sums.expense)}</b></div>
        <div class="kv"><span>Разница</span><b class="${sums.income - sums.expense < 0 ? 'neg' : ''}">${money(sums.income - sums.expense)}</b></div>
        ${sums.income ? `<div class="kv"><span>Норма сбережений</span><b>${Math.round(savingRate)}%</b></div>` : ''}</div>
      <h2 class="sec">${st.mode === 'month' ? 'Последние 6 месяцев' : 'По месяцам'}</h2><div class="card">${barChart(months)}
        <div class="stat-foot" style="margin:6px 0 0"><span><i style="display:inline-block;width:9px;height:9px;border-radius:2px;background:var(--green)"></i> доходы</span><span><i style="display:inline-block;width:9px;height:9px;border-radius:2px;background:var(--red)"></i> расходы</span></div></div>
      <h2 class="sec">Структура</h2>
      <div class="seg" id="rp-kind"><button data-v="expense" class="${st.kind === 'expense' ? 'on' : ''}">Расходы</button><button data-v="income" class="${st.kind === 'income' ? 'on' : ''}">Доходы</button></div>
      ${cats.length ? `<div class="card" style="margin-bottom:12px"><div style="display:grid;place-items:center">${donut(topN(cats, 8), total, money(total), st.kind === 'expense' ? 'расходы' : 'доходы')}</div></div>
        <div class="list">${cats.map(c => `<div class="prog-row"><div class="prog-top">${icBox(c.icon, c.color)}<span class="rb"><span class="rt">${esc(c.name)}</span><span class="rs">${(c.value / total * 100).toFixed(1).replace('.', ',')}%</span></span><span class="ra">${money(c.value)}</span></div><div class="bar"><i style="background:${c.color};width:${(c.value / cats[0].value * 100).toFixed(1)}%"></i></div></div>`).join('')}</div>`
        : `<div class="card">${emptyBox('📭', 'Нет данных за период')}</div>`}
      ${top.length ? `<h2 class="sec">Крупнейшие ${st.kind === 'expense' ? 'расходы' : 'поступления'}</h2><div class="list">${top.map(t => txRow(t, true)).join('')}</div>` : ''}`;
  };
  openSheet({
    title: 'Отчёты', body: body(),
    onMount: w => {
      const wire = () => {
        $('#rp-mode', w).onclick = e => { const b = e.target.closest('[data-v]'); if (b) { st.mode = b.dataset.v; w.refresh(); } };
        $('#rp-kind', w).onclick = e => { const b = e.target.closest('[data-v]'); if (b) { st.kind = b.dataset.v; w.refresh(); } };
        $('#rp-prev', w).onclick = () => { if (st.mode === 'month') st.month = shiftMonth(st.month, -1); else st.year--; w.refresh(); };
        $('#rp-next', w).onclick = () => { if (st.mode === 'month') st.month = shiftMonth(st.month, 1); else st.year++; w.refresh(); };
      };
      w.refresh = () => { $('.sheet-body', w).innerHTML = body(); wire(); };
      wire();
    },
  });
}

/* =====================================================================
   Аналитика: где сэкономить
   ===================================================================== */
const ESSENTIAL_NAMES = ['Продукты', 'Транспорт', 'Авто', 'Дом и ЖКХ', 'Связь и интернет', 'Здоровье', 'Образование', 'Дети', 'Налоги и сборы'];
const isEssential = c => !!c && (c.essential ?? ESSENTIAL_NAMES.includes(c.name));
const WD_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const WD_DAT = ['понедельникам', 'вторникам', 'средам', 'четвергам', 'пятницам', 'субботам', 'воскресеньям'];
const median = a => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y), h = s.length >> 1; return s.length % 2 ? s[h] : (s[h - 1] + s[h]) / 2; };
const sum = (list, f = txMain) => list.reduce((s, t) => s + f(t), 0);
const roundNice = v => v >= 1000 ? Math.round(v / 100) * 100 : Math.round(v / 10) * 10;
const isExp = t => t.type === 'expense';

// Повторяющиеся списания: одно и то же место, примерно раз в месяц, сумма почти не меняется
function detectSubscriptions(mk) {
  const months = Array.from({ length: 6 }, (_, i) => shiftMonth(mk, -i));
  const groups = new Map();
  for (const t of S.transactions) {
    if (!isExp(t) || !months.includes(t.date.slice(0, 7))) continue;
    const key = normKey(t.note);
    if (key.length < 3) continue;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(t);
  }
  const out = [];
  for (const list of groups.values()) {
    const ms = new Set(list.map(t => t.date.slice(0, 7)));
    if (ms.size < 2 || list.length / ms.size > 1.5) continue;
    if (![mk, shiftMonth(mk, -1)].some(m => ms.has(m))) continue;           // давно не списывалось — уже неактуально
    const amounts = list.map(txMain), med = median(amounts);
    const tol = ms.size >= 3 ? 0.15 : 0.03;                                  // при короткой истории — только почти одинаковые суммы
    if (amounts.filter(a => Math.abs(a - med) <= med * tol).length / amounts.length < 0.8) continue;
    const last = list.reduce((a, b) => a.date > b.date ? a : b);
    out.push({ name: last.note, monthly: med, months: ms.size, catId: last.categoryId, last: last.date });
  }
  return out.sort((a, b) => b.monthly - a.monthly);
}

function splitNeedsWants(mk) {
  const list = txInMonth(mk);
  const exp = list.filter(isExp);
  const needs = sum(exp.filter(t => isEssential(catById(t.categoryId))));
  const total = sum(exp);
  let income = sum(list.filter(t => t.type === 'income'));
  if (!income) {
    const prev = [1, 2, 3].map(i => sum(txInMonth(shiftMonth(mk, -i)).filter(t => t.type === 'income'))).filter(Boolean);
    income = prev.length ? prev.reduce((a, b) => a + b, 0) / prev.length : 0;
  }
  return { income, needs, wants: total - needs, savings: income - total, total };
}

function analyze(mk) {
  const [y, m] = mk.split('-').map(Number);
  const dim = daysInMonth(y, m);
  const isCur = mk === curMonth();
  const day = isCur ? new Date().getDate() : dim;
  const scale = dim / day;                                   // пересчёт «на полный месяц» для текущего месяца
  const monthExp = txInMonth(mk).filter(isExp);
  const spent = sum(monthExp);
  const firstMonth = S.transactions.reduce((mn, t) => t.date < mn ? t.date : mn, '9999').slice(0, 7);
  const prevMs = [1, 2, 3].map(i => shiftMonth(mk, -i)).filter(p => p >= firstMonth);
  const byCat = list => { const r = {}; for (const t of list) { const k = t.categoryId || ''; r[k] = (r[k] || 0) + txMain(t); } return r; };
  const cur = byCat(monthExp);
  const prevSame = prevMs.map(p => byCat(txInMonth(p).filter(t => isExp(t) && +t.date.slice(8) <= day)));
  const prevFullCat = prevMs.map(p => byCat(txInMonth(p).filter(isExp)));
  const prevFull = prevMs.map(p => sum(txInMonth(p).filter(isExp)));
  const avgMonthExp = prevFull.length ? prevFull.reduce((a, b) => a + b, 0) / prevFull.length : spent * scale;
  const avgFullCat = k => prevFullCat.length ? prevFullCat.reduce((s, r) => s + (r[k] || 0), 0) / prevFullCat.length : 0;
  const minAmt = Math.max(avgMonthExp * 0.02, 1);
  const tips = [], potential = {};
  const addPot = (key, v) => { if (v > 0) potential[key] = Math.max(potential[key] || 0, v); };

  // 1. Категории, где траты заметно выросли
  if (prevMs.length) {
    const growth = [];
    for (const [k, v] of Object.entries(cur)) {
      const avg = prevSame.reduce((s, r) => s + (r[k] || 0), 0) / prevMs.length;
      if (avg > 0 && v - avg > minAmt && (v - avg) / avg > 0.2) growth.push({ k, v, avg, diff: v - avg });
    }
    for (const g of growth.sort((a, b) => b.diff - a.diff).slice(0, 3)) {
      const c = catById(g.k), ess = isEssential(c);
      const save = ess ? 0 : g.diff * (isCur ? Math.min(scale, 2) : 1);
      tips.push({
        icon: '📈', color: '#ff9500', title: `${c?.name || 'Без категории'}: +${Math.round(g.diff / g.avg * 100)}%`,
        text: `${money(g.v)} против ${money(g.avg)} в среднем ${isCur ? 'к этому дню месяца' : 'за прошлые месяцы'}.${ess ? ' Это обязательная категория — проверьте, нет ли разовой причины.' : ' Если вернуться к обычному уровню, деньги останутся у вас.'}`,
        save, catId: g.k, limit: roundNice(avgFullCat(g.k)),
      });
      if (!ess) addPot('cat:' + g.k, save);
    }
  }

  // 2. Еда вне дома против продуктов
  const cafeC = S.categories.find(c => c.kind === 'expense' && /кафе|ресторан|доставк/i.test(c.name));
  const groC = S.categories.find(c => c.kind === 'expense' && /продукт/i.test(c.name));
  if (cafeC) {
    const cafe = cur[cafeC.id] || 0, gro = groC ? cur[groC.id] || 0 : 0;
    if (cafe > minAmt && cafe / (cafe + gro) >= 0.3) {
      const save = cafe * scale * 0.3;
      tips.push({
        icon: '🍽️', color: '#ff9500', title: `Еда вне дома — ${Math.round(cafe / (cafe + gro) * 100)}% расходов на еду`,
        text: `Кафе и доставка: ${money(cafe)}, продукты: ${money(gro)}. Готовка дома обходится в 2–3 раза дешевле: заменив половину походов в кафе, сэкономите около ${money(roundNice(save))} в месяц.`,
        save, catId: cafeC.id, limit: roundNice(cafe * scale * 0.7),
      });
      addPot('cat:' + cafeC.id, save);
    }
  }

  // 3. Мелкие необязательные покупки («эффект латте»)
  const smallLim = S.settings.currency === 'RUB' ? 500 : Math.max(1, roundNice(avgMonthExp * 0.01));
  const small = monthExp.filter(t => txMain(t) <= smallLim && !isEssential(catById(t.categoryId)));
  if (small.length >= 5) {
    const s = sum(small), save = s * scale / 2;
    tips.push({
      icon: '☕', color: '#a2845e', title: `Мелкие покупки: ${small.length} ${plural(small.length, 'раз', 'раза', 'раз')}`,
      text: `Каждая до ${money(smallLim)}, а в сумме ${money(s)}. За год набегает ≈ ${money(roundNice(s * scale * 12))}. Сократив их вдвое (кофе с собой, перекусы, мелочи у кассы), сэкономите ≈ ${money(roundNice(save))} в месяц.`,
      save,
    });
    addPot('small', save);
  }

  // 4. Подписки и регулярные списания
  const subs = detectSubscriptions(mk);
  if (subs.length) {
    const tot = subs.reduce((s, x) => s + x.monthly, 0);
    tips.push({
      icon: '🔁', color: '#30b0c7', title: `Регулярные списания: ${subs.length}`,
      text: `${money(tot)} в месяц — это ${money(roundNice(tot * 12))} в год. Пройдитесь по списку ниже: отказ даже от одного ненужного сервиса — чистая экономия.`,
      save: 0,
    });
  }

  // 5. Возможные двойные списания
  const seen = new Map(), dups = [];
  for (const t of [...monthExp].sort((a, b) => a.date.localeCompare(b.date) || (a.ts || 0) - (b.ts || 0))) {
    const nk = normKey(t.note);
    if (!nk || txMain(t) <= smallLim) continue;
    const key = `${t.accountId}|${t.amount}|${nk}|${t.date}`;
    if (seen.has(key)) dups.push(t); else seen.set(key, t);
  }
  if (dups.length) {
    tips.push({
      icon: '⚠️', color: '#ff3b30', title: `Возможно двойное списание: ${dups.length}`,
      text: dups.slice(0, 3).map(t => `«${t.note}» ${money(t.amount, accCur(t.accountId))} дважды ${shortDate(t.date)}`).join('; ') + '. Сверьте с выпиской: если это ошибка, банк вернёт деньги по заявлению.',
      save: 0, txId: dups[0].id,
    });
  }

  // 6. Крупные разовые траты
  const hist = {};
  for (const t of S.transactions) if (isExp(t) && t.date >= shiftMonth(mk, -6) && !t.date.startsWith(mk)) (hist[t.categoryId] = hist[t.categoryId] || []).push(txMain(t));
  const big = monthExp.filter(t => {
    const h = hist[t.categoryId] || [];
    return !isEssential(catById(t.categoryId)) && h.length >= 3 && txMain(t) > 3 * median(h) && txMain(t) > avgMonthExp * 0.05;
  }).sort((a, b) => txMain(b) - txMain(a));
  if (big.length) {
    tips.push({
      icon: '🛍️', color: '#af52de', title: `Крупные покупки: ${money(sum(big))}`,
      text: big.slice(0, 3).map(t => `${t.note || catById(t.categoryId)?.name} — ${money(txMain(t))}`).join(', ') + '. Это в 3+ раза больше ваших обычных трат в этих категориях. Для крупных покупок помогает правило «подождать 48 часов».',
      save: 0, txId: big[0].id,
    });
  }

  // 7. Долг по кредитным картам
  const creditDebt = S.accounts.filter(a => a.type === 'credit' && !a.archived && (BAL[a.id] || 0) < 0).reduce((s, a) => s + toMain(-BAL[a.id], a.currency), 0);
  if (creditDebt > 0) {
    tips.push({
      icon: '💳', color: '#ff3b30', title: `Долг по кредиткам: ${money(creditDebt)}`,
      text: 'Проценты по кредитным картам — самые дорогие деньги. Гасите долг в льготный период, а если не получается — в первую очередь, до новых необязательных покупок.',
      save: 0,
    });
  }

  // 8. День недели, когда тратится больше всего (последние 90 дней, без обязательных)
  const end = isCur ? new Date() : new Date(y, m - 1, dim);
  const start = new Date(end); start.setDate(start.getDate() - 89);
  const wdSum = Array(7).fill(0), wdCnt = Array(7).fill(0);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) wdCnt[(d.getDay() + 6) % 7]++;
  const s0 = ymd(start), s1 = ymd(end);
  for (const t of S.transactions) {
    if (!isExp(t) || t.date < s0 || t.date > s1 || isEssential(catById(t.categoryId))) continue;
    wdSum[(parseYmd(t.date).getDay() + 6) % 7] += txMain(t);
  }
  const wdAvg = wdSum.map((v, i) => wdCnt[i] ? v / wdCnt[i] : 0);
  const maxI = wdAvg.indexOf(Math.max(...wdAvg));
  const others = wdAvg.filter((_, i) => i !== maxI), otherAvg = others.reduce((a, b) => a + b, 0) / others.length;
  const daysWithData = new Set(S.transactions.filter(t => isExp(t) && t.date >= s0 && t.date <= s1).map(t => t.date)).size;
  if (daysWithData >= 21 && otherAvg > 0 && wdAvg[maxI] > otherAvg * 1.6) {
    tips.push({
      icon: '📅', color: '#5856d6', title: `Больше всего тратите по ${WD_DAT[maxI]}`,
      text: `В среднем ${money(roundNice(wdAvg[maxI]))} необязательных трат в этот день — в ${(wdAvg[maxI] / otherAvg).toFixed(1).replace('.', ',')} раза больше, чем в другие дни. Заранее планируйте этот день и бюджет на него.`,
      save: 0,
    });
  }

  // 9. Прогноз до конца месяца
  let forecast = null;
  if (isCur && day >= 5) {
    const pending = S.recurring.filter(r => r.type === 'expense' && r.nextDate > today() && r.nextDate.startsWith(mk)).reduce((s, r) => s + toMain(r.amount, accCur(r.accountId)), 0);
    const recurringNotes = new Set(S.recurring.map(r => normKey(r.name)));
    const variable = sum(monthExp.filter(t => !recurringNotes.has(normKey(t.note))));
    const total = spent + variable / day * (dim - day) + pending;
    const nw = splitNeedsWants(mk);
    const risky = S.budgets.map(b => ({ b, f: budgetSpent(b, mk) * scale })).filter(x => x.f > x.b.limit && budgetSpent(x.b, mk) <= x.b.limit);
    forecast = { total, income: nw.income, risky };
    if (nw.income && total > nw.income) {
      tips.unshift({
        icon: '🚨', color: '#ff3b30', title: 'При таком темпе расходы превысят доходы',
        text: `Прогноз расходов на месяц — ${money(roundNice(total))} при доходе ${money(nw.income)}. Чтобы выйти в ноль, тратьте не больше ${money(Math.max(0, roundNice((nw.income - spent - pending) / (dim - day + 1))))} в день до конца месяца.`,
        save: 0,
      });
    }
  }

  // 10. Правило 50/30/20 (для текущего месяца берём прошлый — он полный)
  const nwMonth = isCur && day < dim ? shiftMonth(mk, -1) : mk;
  const nw = splitNeedsWants(nwMonth);
  if (nw.income > 0 && nw.total > 0 && nw.wants / nw.income > 0.3) {
    const save = nw.wants - 0.3 * nw.income;
    tips.push({
      icon: '⚖️', color: '#2f6bff', title: `Желания — ${Math.round(nw.wants / nw.income * 100)}% дохода`,
      text: `По правилу 50/30/20 на необязательные траты стоит отводить до 30% дохода, а 20% — откладывать. Сейчас это ${money(nw.wants)}; превышение — ${money(roundNice(save))} в месяц.`,
      save,
    });
    addPot('wants', save * 0.5);
  }

  // Финансовая подушка
  const liquid = S.accounts.filter(a => !a.archived && a.includeInTotal && ['cash', 'card', 'savings', 'deposit'].includes(a.type))
    .reduce((s, a) => s + Math.max(0, toMain(BAL[a.id] || 0, a.currency)), 0);
  const cushion = avgMonthExp > 0 ? liquid / avgMonthExp : null;

  // Куда уходят деньги: топ мест
  const places = new Map();
  for (const t of monthExp) {
    const k = normKey(t.note); if (!k) continue;
    const p = places.get(k) || { name: t.note, sum: 0, count: 0, catId: t.categoryId };
    p.sum += txMain(t); p.count++; places.set(k, p);
  }
  const topPlaces = [...places.values()].sort((a, b) => b.sum - a.sum).slice(0, 6);

  const urgent = t => ['🚨', '⚠️'].includes(t.icon) ? 1 : 0;
  tips.sort((a, b) => urgent(b) - urgent(a) || (b.save || 0) - (a.save || 0));
  const total = Object.values(potential).reduce((a, b) => a + b, 0);
  return { mk, isCur, day, dim, spent, prevCount: prevMs.length, tips, total, subs, forecast, nw, nwMonth, cushion, liquid, avgMonthExp, wdAvg, maxI, topPlaces };
}

function wdChart(vals, maxI) {
  const W = 320, H = 120, b = 18, max = Math.max(1, ...vals), gw = W / 7, bw = gw * 0.55;
  return `<div class="bars"><svg viewBox="0 0 ${W} ${H}">${vals.map((v, i) => {
    const h = (H - b - 6) * v / max, x = i * gw + (gw - bw) / 2;
    return `<rect x="${x}" y="${H - b - h}" width="${bw}" height="${Math.max(h, 1)}" rx="4" fill="${i === maxI ? 'var(--accent)' : 'var(--text3)'}" opacity="${i === maxI ? 1 : .5}"/><text x="${x + bw / 2}" y="${H - 4}" text-anchor="middle">${WD_SHORT[i]}</text>`;
  }).join('')}</svg></div>`;
}

function analyticsSheet(startMk) {
  let mk = startMk || curMonth();
  const body = () => {
    const a = analyze(mk);
    const budgeted = new Set(S.budgets.map(b => b.categoryId));
    let h = `<div class="mnav" style="margin-top:0"><button id="an-prev">‹</button><span class="mtitle">${monthTitle(mk)}</span><button id="an-next">›</button></div>`;
    h += a.total > 0
      ? `<div class="card hero"><div class="muted">Можно сэкономить</div><div class="big">≈ ${money(roundNice(a.total))}<span style="font-size:18px;font-weight:600"> в месяц</span></div><div class="hero-sub"><span>≈ ${money(roundNice(a.total * 12))} в год</span></div></div>`
      : `<div class="card hero"><div class="muted">Лишних трат</div><div class="big" style="font-size:28px">не найдено 👍</div><div class="hero-sub"><span>Расходы в пределах вашей нормы</span></div></div>`;
    if (!S.transactions.length) return h + `<div class="card" style="margin-top:12px">${emptyBox('📊', 'Добавьте операции или загрузите выписку — и здесь появятся советы.')}</div>`;
    if (!a.prevCount) h += `<p class="hint">Советы станут точнее, когда накопится история хотя бы за 1–2 месяца. Загрузите выписки за прошлые месяцы в разделе «Ещё → Банки».</p>`;
    else if (a.isCur && a.day < 7) h += `<p class="hint">Месяц только начался, данных пока мало. <a href="#" id="an-lastm" style="color:var(--accent)">Посмотреть прошлый месяц</a></p>`;

    if (a.tips.length) {
      h += `<h2 class="sec">Советы</h2><div class="list">${a.tips.map((t, i) => `<div class="prog-row tip">
        <div class="prog-top">${icBox(t.icon, t.color)}<span class="rb"><span class="rt" style="white-space:normal">${esc(t.title)}</span></span>${t.save > 0 ? `<span class="ra pos">−${money(roundNice(t.save))}<small>в месяц</small></span>` : ''}</div>
        <p class="tip-t">${esc(t.text)}</p>
        ${t.catId != null || t.txId ? `<div class="btns tip-b">${t.catId != null ? `<button class="btn small" data-ana="ops" data-id="${t.catId}">Операции</button>` : ''}${t.catId && !budgeted.has(t.catId) && t.limit > 0 ? `<button class="btn small" data-ana="budget" data-id="${t.catId}" data-limit="${t.limit}">Задать бюджет ${money(t.limit)}</button>` : ''}${t.txId ? `<button class="btn small" data-ana="tx" data-id="${t.txId}">Открыть</button>` : ''}</div>` : ''}
      </div>`).join('')}</div>`;
    }

    if (a.forecast) {
      const f = a.forecast, over = f.income && f.total > f.income;
      h += `<h2 class="sec">Прогноз на месяц</h2><div class="card">
        <div class="kv"><span>Потрачено за ${a.day} ${plural(a.day, 'день', 'дня', 'дней')}</span><b>${money(a.spent)}</b></div>
        <div class="kv"><span>Ожидается к концу месяца</span><b class="${over ? 'neg' : ''}">≈ ${money(roundNice(f.total))}</b></div>
        ${f.income ? `<div class="kv"><span>Доход</span><b class="pos">${money(f.income)}</b></div><div class="kv"><span>Останется</span><b class="${over ? 'neg' : ''}">≈ ${money(roundNice(f.income - f.total))}</b></div>` : ''}
        ${f.risky.length ? `<p class="tip-t">⚠️ Могут быть превышены бюджеты: ${f.risky.map(x => esc(x.b.categoryId ? catById(x.b.categoryId)?.name : 'Все расходы')).join(', ')}.</p>` : ''}</div>`;
    }

    const nw = a.nw;
    if (nw.income > 0) {
      const p = v => Math.max(0, v / nw.income * 100);
      const needsP = p(nw.needs), wantsP = p(nw.wants), savP = p(nw.savings);
      h += `<h2 class="sec">Правило 50 / 30 / 20</h2><div class="card">
        <div class="muted">${monthTitle(a.nwMonth)} · доход ${money(nw.income)}</div>
        <div class="stack"><i style="width:${Math.min(needsP, 100)}%;background:#30b0c7"></i><i style="width:${Math.min(wantsP, 100 - Math.min(needsP, 100))}%;background:#ff9500"></i><i style="width:${Math.min(savP, 100)}%;background:var(--green)"></i></div>
        <div class="kv"><span><i class="dot" style="background:#30b0c7"></i>Обязательное <span class="muted">(норма ≤ 50%)</span></span><b class="${needsP > 55 ? 'neg' : ''}">${Math.round(needsP)}%</b></div>
        <div class="kv"><span><i class="dot" style="background:#ff9500"></i>Желания <span class="muted">(≤ 30%)</span></span><b class="${wantsP > 33 ? 'neg' : ''}">${Math.round(wantsP)}%</b></div>
        <div class="kv"><span><i class="dot" style="background:var(--green)"></i>Сбережения <span class="muted">(≥ 20%)</span></span><b class="${nw.savings < 0 ? 'neg' : savP >= 20 ? 'pos' : ''}">${nw.savings < 0 ? '−' + Math.round(-nw.savings / nw.income * 100) : Math.round(savP)}%</b></div>
        <p class="tip-t">Что считать обязательным, можно настроить в «Ещё → Категории».</p></div>`;
    }

    if (a.subs.length) {
      h += `<h2 class="sec">Подписки и регулярные</h2><div class="list">${a.subs.map(s => { const c = catById(s.catId); return `<div class="row">${icBox(c?.icon || '🔁', c?.color || '#8e8e93')}<span class="rb"><span class="rt">${esc(s.name)}</span><span class="rs">${s.months} ${plural(s.months, 'месяц', 'месяца', 'месяцев')} подряд · последнее ${shortDate(s.last)}</span></span><span class="ra">${money(s.monthly)}<small>${money(roundNice(s.monthly * 12))} в год</small></span></div>`; }).join('')}</div>`;
    }

    if (a.topPlaces.length) {
      h += `<h2 class="sec">Куда уходят деньги</h2><div class="list">${a.topPlaces.map(p => { const c = catById(p.catId); return `<div class="row">${icBox(c?.icon || '❔', c?.color || '#8e8e93')}<span class="rb"><span class="rt">${esc(p.name)}</span><span class="rs">${p.count} ${plural(p.count, 'покупка', 'покупки', 'покупок')} · в среднем ${money(Math.round(p.sum / p.count))}</span></span><span class="ra">${money(p.sum)}</span></div>`; }).join('')}</div>`;
    }

    if (a.wdAvg.some(Boolean)) {
      h += `<h2 class="sec">Необязательные траты по дням недели</h2><div class="card">${wdChart(a.wdAvg, a.maxI)}<p class="tip-t">Среднее за день, последние 90 дней.</p></div>`;
    }

    if (a.cushion != null) {
      const c = a.cushion, cls = c < 1 ? 'neg' : c >= 3 ? 'pos' : '';
      h += `<h2 class="sec">Финансовая подушка</h2><div class="card">
        <div class="kv"><span>Свободные деньги</span><b>${money(a.liquid)}</b></div>
        <div class="kv"><span>Средние расходы в месяц</span><b>${money(roundNice(a.avgMonthExp))}</b></div>
        <div class="kv"><span>Хватит на</span><b class="${cls}">${c.toFixed(1).replace('.', ',')} мес.</b></div>
        ${progBar(c / 6 * 100, c < 1 ? 'over' : c < 3 ? 'warn' : '')}
        <p class="tip-t">${c >= 6 ? 'Отличный запас. Излишек сверх 6 месяцев можно направить на вклад или инвестиции.' : c >= 3 ? 'Хороший запас: рекомендуется 3–6 месяцев расходов.' : `Рекомендуется запас на 3–6 месяцев. До трёх месяцев не хватает ${money(roundNice(a.avgMonthExp * 3 - a.liquid))} — можно создать для этого цель.`}</p></div>`;
    }
    return h;
  };
  openSheet({
    title: 'Где сэкономить', body: body(),
    onMount: w => {
      const wire = () => {
        $('#an-prev', w).onclick = () => { mk = shiftMonth(mk, -1); w.refresh(); };
        $('#an-next', w).onclick = () => { mk = shiftMonth(mk, 1); w.refresh(); };
        $('#an-lastm', w)?.addEventListener('click', e => { e.preventDefault(); mk = shiftMonth(mk, -1); w.refresh(); });
      };
      $('.sheet-body', w).addEventListener('click', e => {
        const b = e.target.closest('[data-ana]'); if (!b) return;
        const id = b.dataset.id;
        if (b.dataset.ana === 'ops') { ui.month = mk; ACTIONS.catOps({ dataset: { id } }); }
        else if (b.dataset.ana === 'budget') budgetForm(null, { categoryId: id, limit: +b.dataset.limit });
        else if (b.dataset.ana === 'tx') { const t = S.transactions.find(x => x.id === id); if (t) txForm(t); }
      });
      w.refresh = () => { $('.sheet-body', w).innerHTML = body(); wire(); };
      wire();
    },
  });
}

/* =====================================================================
   Настройки: валюта, PIN, тема, резервные копии
   ===================================================================== */
function currencySheet() {
  const used = () => [...new Set([...S.accounts.map(a => a.currency), ...S.goals.map(g => g.currency)])].filter(c => c !== S.settings.currency);
  const body = () => `${grp(fld('Основная валюта', selHtml('cs-main', curOpts(), S.settings.currency)))}
    <p class="hint" style="margin-top:-8px">В основной валюте считаются итоги, отчёты и бюджеты. Счета могут быть в любой валюте.</p>
    ${used().length ? `<div class="lbl">Курсы (сколько ${S.settings.currency} за 1 единицу)</div>
      <div class="group">${used().map(c => fld(`1 ${c}`, `<input inputmode="decimal" data-rate="${c}" placeholder="не задан" value="${fmtInput(S.settings.rates[c])}">`)).join('')}</div>
      <button class="btn" id="cs-cbr">🔄 Загрузить курсы ЦБ РФ</button>
      ${S.settings.ratesDate ? `<p class="hint" style="text-align:center">Курсы обновлены ${shortDate(S.settings.ratesDate)}</p>` : ''}`
      : '<p class="hint">Когда вы добавите счёт в другой валюте, здесь появится поле для курса.</p>'}`;
  openSheet({
    title: 'Валюта и курсы', cancel: 'Отмена', doneLabel: 'Сохранить', body: body(),
    done: w => {
      $$('[data-rate]', w).forEach(i => { const v = parseNum(i.value); if (v > 0) S.settings.rates[i.dataset.rate] = v; else delete S.settings.rates[i.dataset.rate]; });
      commit('Сохранено');
    },
    onMount: w => {
      const wire = () => {
        $('#cs-main', w).onchange = e => {
          const old = S.settings.currency, nu = e.target.value;
          // пересчитываем курсы относительно новой основной валюты
          const oldRates = { ...S.settings.rates, [old]: 1 };
          const base = oldRates[nu] || 1;
          const rates = {};
          for (const [c, v] of Object.entries(oldRates)) if (c !== nu) rates[c] = round2(v / base * 10000) / 10000;
          S.settings.currency = nu; S.settings.rates = rates;
          save(); $('.sheet-body', w).innerHTML = body(); wire(); render();
        };
        $('#cs-cbr', w)?.addEventListener('click', async () => {
          try {
            const r = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
            const j = await r.json();
            const rub = c => c === 'RUB' ? 1 : j.Valute[c] ? j.Valute[c].Value / j.Valute[c].Nominal : null;
            const main = rub(S.settings.currency);
            let n = 0;
            for (const c of used()) { const v = rub(c); if (v && main) { S.settings.rates[c] = round2(v / main * 10000) / 10000; n++; } }
            S.settings.ratesDate = today();
            save(); $('.sheet-body', w).innerHTML = body(); wire(); render();
            toast(n ? `Обновлено курсов: ${n}` : 'ЦБ не публикует курс этих валют');
          } catch { toast('Не удалось загрузить курсы. Нет интернета?'); }
        });
      };
      wire();
    },
  });
}

function hashPin(p) {
  let h = 0x811c9dc5;
  for (const ch of 'fin-salt:' + p) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return h.toString(16);
}
function pinPad(root, title, onComplete, extra = '') {
  let code = '';
  root.innerHTML = `<div class="lock-inner"><div class="lock-logo">₽</div><div class="lock-t">${title}</div><div class="dots">${'<i></i>'.repeat(4)}</div>
    <div class="keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 'x', 0, '⌫'].map(k => `<button type="button" data-k="${k}" ${k === 'x' ? (extra ? 'class="txt"' : 'disabled') : ''}>${k === 'x' ? extra : k}</button>`).join('')}</div></div>`;
  const dots = $$('.dots i', root);
  const paint = () => dots.forEach((d, i) => d.classList.toggle('f', i < code.length));
  const api = {
    setTitle: t => $('.lock-t', root).textContent = t,
    fail: () => { const d = $('.dots', root); d.classList.remove('shake'); void d.offsetWidth; d.classList.add('shake'); code = ''; paint(); },
    reset: () => { code = ''; paint(); },
    onExtra: null,
  };
  $('.keypad', root).onclick = e => {
    const b = e.target.closest('[data-k]'); if (!b) return;
    const k = b.dataset.k;
    if (k === 'x') return api.onExtra?.();
    if (k === '⌫') code = code.slice(0, -1);
    else if (code.length < 4) code += k;
    paint();
    if (code.length === 4) { const c = code; setTimeout(() => onComplete(c, api), 120); }
  };
  return api;
}
function showLock() {
  if (!S.settings.pinHash) return;
  const el = $('#lock'); el.hidden = false;
  pinPad(el, 'Введите код-пароль', (code, api) => {
    if (hashPin(code) === S.settings.pinHash) { el.hidden = true; el.innerHTML = ''; }
    else api.fail();
  });
}
function pinSheet() {
  if (S.settings.pinHash) {
    openSheet({
      title: 'Код-пароль', short: true,
      body: `<p class="hint">Код запрашивается при запуске и при возвращении в приложение через минуту.</p><button class="btn" id="p-change">Сменить код</button><button class="btn danger" id="p-off">Выключить код</button>`,
      onMount: w => {
        $('#p-change', w).onclick = () => { w.close(); setTimeout(setPin, 300); };
        $('#p-off', w).onclick = () => { S.settings.pinHash = null; w.close(); commit('Код выключен'); };
      },
    });
  } else setPin();
}
function setPin() {
  openSheet({
    title: 'Новый код-пароль', cancel: 'Отмена', body: '<div id="pin-root" style="padding-top:20px"></div>',
    onMount: w => {
      let first = null;
      pinPad($('#pin-root', w), 'Придумайте код из 4 цифр', (code, api) => {
        if (!first) { first = code; api.setTitle('Повторите код'); api.reset(); return; }
        if (code !== first) { first = null; api.setTitle('Коды не совпали. Ещё раз'); api.fail(); return; }
        S.settings.pinHash = hashPin(code); w.close(); commit('Код-пароль установлен');
      });
    },
  });
}
function themeSheet() {
  openSheet({
    title: 'Оформление', short: true,
    body: `<div class="list">${[['auto', 'Как в системе'], ['light', 'Светлое'], ['dark', 'Тёмное']].map(([v, l]) => `<button class="row" data-theme-v="${v}"><span class="rb"><span class="rt">${l}</span></span>${S.settings.theme === v ? '<b style="color:var(--accent)">✓</b>' : ''}</button>`).join('')}</div>`,
    onMount: w => $$('[data-theme-v]', w).forEach(b => b.onclick = () => { S.settings.theme = b.dataset.themeV; w.close(); commit(); }),
  });
}

async function shareOrDownload(name, content, type) {
  const blob = new Blob([content], { type });
  try {
    const file = new File([blob], name, { type });
    if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: name }); return; }
  } catch (e) { if (e.name === 'AbortError') return; }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
function backupSheet() {
  openSheet({
    title: 'Резервная копия', short: true,
    body: `<p class="hint">Данные хранятся только на этом устройстве. Сохраните копию в «Файлы» или iCloud Drive — из неё можно восстановить всё на новом телефоне.</p>
      <button class="btn primary" id="bk-exp">💾 Сохранить копию</button>
      <label class="btn">📂 Восстановить из файла<input type="file" id="bk-imp" accept=".json,application/json" hidden></label>
      <p class="hint">${S.transactions.length} ${plural(S.transactions.length, 'операция', 'операции', 'операций')}, ${S.accounts.length} ${plural(S.accounts.length, 'счёт', 'счёта', 'счетов')}${S.settings.lastBackup ? ` · последняя копия ${shortDate(S.settings.lastBackup)}` : ''}</p>`,
    onMount: w => {
      $('#bk-exp', w).onclick = async () => {
        await shareOrDownload(`finance-backup-${today()}.json`, JSON.stringify(S), 'application/json');
        S.settings.lastBackup = today(); save();
      };
      $('#bk-imp', w).onchange = async e => {
        const f = e.target.files[0]; if (!f) return;
        try {
          const data = JSON.parse(await f.text());
          if (!Array.isArray(data.accounts) || !Array.isArray(data.transactions)) throw new Error('bad');
          if (!confirm(`Заменить текущие данные копией? В ней ${data.transactions.length} операций и ${data.accounts.length} счетов.`)) return;
          S = migrate(data); w.close(); commit('Данные восстановлены');
        } catch { toast('Это не похоже на файл резервной копии'); }
      };
    },
  });
}
function exportCsv() {
  const rows = [['Дата', 'Тип', 'Сумма', 'Валюта', 'Счёт', 'Категория / на счёт', 'Заметка']];
  const tn = { expense: 'Расход', income: 'Доход', transfer: 'Перевод' };
  for (const t of [...S.transactions].sort(sortTx)) {
    const a = acc(t.accountId);
    rows.push([t.date, tn[t.type], (t.type === 'expense' ? -t.amount : t.amount).toString().replace('.', ','), a?.currency || '', a?.name || '',
      t.type === 'transfer' ? acc(t.toAccountId)?.name || '' : catById(t.categoryId)?.name || '', t.note || '']);
  }
  const csv = '﻿' + rows.map(r => r.map(c => /[;"\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c).join(';')).join('\n');
  shareOrDownload(`operations-${today()}.csv`, csv, 'text/csv');
}

function fillDemo() {
  if (S.transactions.length && !confirm('Добавить демо-операции к существующим данным?')) return;
  const findCat = (n, k = 'expense') => S.categories.find(c => c.name === n && c.kind === k)?.id;
  let card = S.accounts.find(a => a.type === 'card') || S.accounts[0];
  const cash = S.accounts.find(a => a.type === 'cash') || card;
  if (!S.accounts.some(a => a.type === 'savings')) S.accounts.push({ id: uid(), name: 'Накопительный', type: 'savings', currency: 'RUB', initial: 120000, color: '#ff9500', icon: '🐷', includeInTotal: true, archived: false });
  if (!S.accounts.some(a => a.type === 'credit')) S.accounts.push({ id: uid(), name: 'Кредитка', type: 'credit', currency: 'RUB', initial: -18500, color: '#ff3b30', icon: '🏦', includeInTotal: true, archived: false, creditLimit: 100000 });
  if (!+card.initial) card.initial = 45000;
  if (cash !== card && !+cash.initial) cash.initial = 30000;
  const sample = [['Продукты', ['Пятёрочка', 'ВкусВилл', 'Перекрёсток'], 400, 3200, 9], ['Кафе и рестораны', ['Кофейня', 'Шоколадница', 'Додо Пицца'], 250, 2400, 5],
    ['Транспорт', ['Метро', 'Яндекс Go'], 60, 900, 6], ['Развлечения', ['Кино', 'Steam'], 400, 1800, 1], ['Здоровье', ['Аптека'], 300, 2500, 1],
    ['Связь и интернет', ['МТС'], 650, 650, 1], ['Подписки', ['Яндекс Плюс'], 399, 399, 1], ['Подписки', ['Кинопоиск'], 299, 299, 1], ['Одежда и обувь', ['Zara', 'Спортмастер'], 1500, 7000, 1],
    ['Кафе и рестораны', ['Кофе с собой'], 180, 350, 10]];
  const now = new Date();
  for (let mi = 2; mi >= 0; mi--) {
    const y = now.getFullYear(), m = now.getMonth() - mi;
    const d0 = new Date(y, m, 1), maxD = mi === 0 ? now.getDate() : daysInMonth(d0.getFullYear(), d0.getMonth() + 1);
    const day = d => ymd(new Date(d0.getFullYear(), d0.getMonth(), Math.min(d, maxD)));
    S.transactions.push({ id: uid(), ts: Date.now(), type: 'income', amount: 120000, accountId: card.id, categoryId: findCat('Зарплата', 'income'), date: day(5), note: 'Зарплата' });
    for (const [cn, notes, min, max, n0] of sample) for (let i = 0, n = mi ? n0 : Math.max(1, Math.round(n0 * maxD / 30 * (cn === 'Кафе и рестораны' ? 2 : 1))); i < n; i++) {
      S.transactions.push({ id: uid(), ts: Date.now() + i, type: 'expense', amount: Math.round(min + Math.random() * (max - min)), accountId: Math.random() < .12 ? cash.id : card.id, categoryId: findCat(cn), date: day(1 + Math.floor(Math.random() * maxD)), note: notes[i % notes.length] });
    }
  }
  if (!S.goals.length) S.goals.push({ id: uid(), name: 'Отпуск', icon: '🏖️', color: '#00c7be', target: 150000, currency: 'RUB', deadline: ymd(new Date(now.getFullYear(), now.getMonth() + 6, 1)), accountId: '', contributions: [{ id: uid(), amount: 42000, date: today(), note: '' }], archived: false });
  if (!S.budgets.length) S.budgets.push({ id: uid(), categoryId: findCat('Кафе и рестораны'), limit: 10000 }, { id: uid(), categoryId: findCat('Продукты'), limit: 25000 });
  if (!S.recurring.length) S.recurring.push({ id: uid(), name: 'Аренда квартиры', type: 'expense', amount: 45000, accountId: card.id, categoryId: findCat('Дом и ЖКХ'), period: 'month', nextDate: ymd(new Date(now.getFullYear(), now.getMonth() + 1, 1)), anchorDay: 1 });
  S.settings.onboarded = true;
  commit('Демо-данные добавлены');
}

/* =====================================================================
   Обработка действий
   ===================================================================== */
const ACTIONS = {
  tab: el => { ui.tab = el.dataset.v; $$('.sheet-wrap').forEach(w => w.close()); render(); window.scrollTo(0, 0); },
  month: el => { ui.month = shiftMonth(ui.month, +el.dataset.d); render(); },
  monthNow: () => { ui.month = curMonth(); render(); },
  addTx: () => {
    // На вкладке «Операции» подставляем текущий фильтр: счёт, тип, категорию
    const f = ui.ops, onOps = ui.tab === 'ops';
    txForm(null, onOps ? { accountId: f.accountId || undefined, type: ['expense', 'income'].includes(f.type) ? f.type : undefined, categoryId: f.categoryId && f.categoryId !== '__none' ? f.categoryId : undefined } : {});
  },
  opsKind: el => { ui.ops = { type: el.dataset.v, accountId: '', categoryId: '', q: '' }; ACTIONS.tab({ dataset: { v: 'ops' } }); },
  recToAcc: el => { const a = acc(el.dataset.id); const from = lastAccountId(); recForm(null, { type: 'transfer', toAccountId: a.id, accountId: from !== a.id ? from : '', name: 'Платёж: ' + a.name }); },
  backupLater: () => { S.settings.backupSnooze = today(); commit(); },
  addTxAcc: el => txForm(null, { accountId: el.dataset.id }),
  transfer: () => txForm(null, { type: 'transfer' }),
  transferFrom: el => txForm(null, { type: 'transfer', accountId: el.dataset.id }),
  transferTo: el => txForm(null, { type: 'transfer', toAccountId: el.dataset.id, accountId: S.accounts.find(a => a.id !== el.dataset.id && !a.archived)?.id }),
  editTx: el => { const t = S.transactions.find(x => x.id === el.dataset.id); if (t) txForm(t); },
  accDetail: el => accDetail(el.dataset.id),
  addAcc: () => accForm(null),
  editAcc: el => accForm(acc(el.dataset.id)),
  toggleArchived: () => { ui.showArchived = !ui.showArchived; render(); },
  opsByAcc: el => { ui.ops = { type: 'all', accountId: el.dataset.id, categoryId: '', q: '' }; ACTIONS.tab({ dataset: { v: 'ops' } }); },
  opsType: el => { ui.ops.type = el.dataset.v; render(); },
  opsClearCat: () => { ui.ops.categoryId = ''; render(); },
  catOps: el => { if (el.dataset.id === '__rest') return; ui.ops = { type: el.dataset.kind || 'expense', accountId: '', categoryId: el.dataset.id || '__none', q: '' }; ACTIONS.tab({ dataset: { v: 'ops' } }); },
  catChart: el => categoryChartSheet(ui.month, 'expense', el.dataset.id),
  plansSeg: el => { ui.plans = el.dataset.v; render(); },
  goPlans: el => { ui.plans = el.dataset.v; ACTIONS.tab({ dataset: { v: 'plans' } }); },
  addGoal: () => goalForm(null),
  goalDetail: el => goalDetail(el.dataset.id),
  editGoal: el => goalForm(S.goals.find(g => g.id === el.dataset.id)),
  addBudget: () => budgetForm(null),
  editBudget: el => budgetForm(S.budgets.find(b => b.id === el.dataset.id)),
  addRec: () => recForm(null),
  editRec: el => recForm(S.recurring.find(r => r.id === el.dataset.id)),
  recPost: el => recPost(el.dataset.id),
  recSkip: el => recSkip(el.dataset.id),
  editCat: el => catForm(catById(el.dataset.id)),
  reports: reportsSheet,
  analytics: () => analyticsSheet(ui.month),
  categories: categoriesSheet,
  banks: banksSheet,
  currency: currencySheet,
  pin: pinSheet,
  theme: themeSheet,
  backup: backupSheet,
  exportCsv,
  demo: fillDemo,
  dismissOnboard: () => { S.settings.onboarded = true; commit(); },
  reset: () => {
    if (!confirm('Удалить ВСЕ данные без возможности восстановления? Сначала лучше сделать резервную копию.')) return;
    if (!confirm('Точно удалить?')) return;
    S = defaultState(); commit('Данные удалены');
  },
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const fn = ACTIONS[el.dataset.act];
  if (fn) { e.preventDefault(); fn(el); }
});
document.addEventListener('input', e => {
  if (e.target.id === 'ops-q') {
    const hadQ = !!ui.ops.q;
    ui.ops.q = e.target.value;
    if (hadQ !== !!ui.ops.q) { render(); const i = $('#ops-q'); i.focus(); i.setSelectionRange(i.value.length, i.value.length); }
    else $('#ops-list').innerHTML = opsList();
  }
});
document.addEventListener('change', e => {
  if (e.target.id === 'ops-acc') { ui.ops.accountId = e.target.value; render(); }
});

/* =====================================================================
   Запуск
   ===================================================================== */
let hiddenAt = 0;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) hiddenAt = Date.now();
  else {
    if (S.settings.pinHash && hiddenAt && Date.now() - hiddenAt > 60000 && $('#lock').hidden) showLock();
    if (ui.month !== curMonth() && hiddenAt && Date.now() - hiddenAt > 3600000) ui.month = curMonth();
    render();
  }
});
window.addEventListener('storage', e => { if (e.key === STORE_KEY) { S = load(); render(); } });

render();
showLock();
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(err => console.warn('SW', err));
  navigator.storage?.persist?.().catch(() => {});
}
