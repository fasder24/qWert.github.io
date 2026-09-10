const DAY_KEYS = ['mon','tue','wed','thu','fri','sat','sun'];
const DAY_SHORT = {mon:'Пн',tue:'Вт',wed:'Ср',thu:'Чт',fri:'Пт',sat:'Сб',sun:'Вс'};
const DAY_FULL = {mon:'Понедельник',tue:'Вторник',wed:'Среда',thu:'Четверг',fri:'Пятница',sat:'Суббота',sun:'Воскресенье'};
const STORAGE_KEY = 'smart-schedule-data-v2';
// ВАЖНО: это защита только "для порядка" на стороне браузера — пароль лежит
// прямо в этом файле, и любой может открыть код и увидеть его. Для настоящей
// защиты нужен сервер с авторизацией. Для школьного проекта этого достаточно,
// чтобы показать идею разграничения ролей "ученик / администратор".
const ADMIN_PASSWORD = 'admin123';

const DEFAULT_BELLS = [
  {period:1,start:'08:30',end:'09:15'},
  {period:2,start:'09:25',end:'10:10'},
  {period:3,start:'10:20',end:'11:05'},
  {period:4,start:'11:25',end:'12:10'},
  {period:5,start:'12:30',end:'13:15'},
  {period:6,start:'13:25',end:'14:10'},
  {period:7,start:'14:20',end:'15:05'},
  {period:8,start:'15:15',end:'16:00'}
];

const ICONS = {
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7M21 3v6h-6"/></svg>',
  profile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
  bellOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.73 21a2 2 0 0 1-3.46 0"/><path d="M18.63 13A17.89 17.89 0 0 1 18 8"/><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"/><path d="M18 8a6 6 0 0 0-9.33-5"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
};

let data = { schedule:{mon:[],tue:[],wed:[],thu:[],fri:[],sat:[],sun:[]}, bells: JSON.parse(JSON.stringify(DEFAULT_BELLS)), substitutions:{}, homework:[], logs:[] };
let editorDay = jsDayToKey(new Date().getDay());
let ready = false;
let sidebarOpen = false;
let theme = localStorage.getItem('app-theme') || 'light';
let isAdmin = sessionStorage.getItem('admin-session') === '1';
let statusMeta = null;

function jsDayToKey(d){ return DAY_KEYS[(d+6)%7]; }
function uid(){ return Math.random().toString(36).slice(2,9); }
function pad(n){ return String(n).padStart(2,'0'); }
function ymd(d){ return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
function fmtDate(dateStr){ if(!dateStr) return ''; const [y,m,d]=dateStr.split('-'); return d+'.'+m; }
function escapeHtml(s){ return String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

/* ---------- хранение ---------- */
function loadData(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      const parsed = JSON.parse(raw);
      data.schedule = Object.assign(data.schedule, parsed.schedule || {});
      data.bells = (parsed.bells && parsed.bells.length) ? parsed.bells : data.bells;
      data.substitutions = parsed.substitutions || {};
      data.homework = parsed.homework || [];
      data.logs = parsed.logs || [];
    }
  }catch(e){ console.error('Не удалось прочитать сохранённые данные', e); }
  ready = true;
  render();
}
function saveData(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
  catch(e){ console.error('Не удалось сохранить расписание', e); }
}
function addLog(text){
  data.logs.unshift({ts:Date.now(), text});
  if(data.logs.length>60) data.logs.length = 60;
  saveData();
}

/* ---------- расписание / замены ---------- */
function lessonsForDate(dateStr, dayKey){
  const base = (data.schedule[dayKey]||[]).slice().sort((a,b)=>a.period-b.period);
  const subs = data.substitutions[dateStr] || {};
  const periods = new Set(base.map(l=>l.period));
  Object.keys(subs).forEach(p=>periods.add(Number(p)));
  return Array.from(periods).sort((a,b)=>a-b).map(period=>{
    const b = base.find(l=>l.period===period);
    const s = subs[period];
    if(s) return {period, subject:s.subject, original: b?b.subject:null, isSub:true, note:s.note||''};
    return {period, subject: b?b.subject:'', original:null, isSub:false};
  });
}

function computeTomorrow(){
  const now = new Date();
  const t = new Date(now); t.setDate(now.getDate()+1);
  return {key: jsDayToKey(t.getDay()), dateStr: ymd(t)};
}

function computeWeekend(){
  const now = new Date();
  const d = now.getDay();
  if(d===0 || d===6){
    const daysUntilMon = (1 - d + 7) % 7 || 7;
    const target = new Date(now); target.setHours(0,0,0,0); target.setDate(now.getDate()+daysUntilMon);
    const diff = target-now;
    return {weekend:true, days:Math.floor(diff/86400000), hours:Math.floor((diff%86400000)/3600000)};
  }
  const daysUntilSat = (6 - d + 7) % 7;
  const target = new Date(now); target.setHours(0,0,0,0); target.setDate(now.getDate()+daysUntilSat);
  const diff = target-now;
  return {weekend:false, days:Math.floor(diff/86400000), hours:Math.floor((diff%86400000)/3600000)};
}

function getStatus(){
  const now = new Date();
  const dayKey = jsDayToKey(now.getDay());
  const dateStr = ymd(now);
  const lessons = lessonsForDate(dateStr, dayKey).filter(l=>l.subject);
  if(lessons.length===0) return {state:'off'};

  const bells = data.bells.filter(b=>b.start && b.end).slice().sort((a,b)=>a.period-b.period);
  const toEpoch = (hhmm)=>{ const [h,m]=hhmm.split(':').map(Number); const dd=new Date(now); dd.setHours(h,m,0,0); return dd.getTime(); };
  const nowMs = now.getTime();

  for(const b of bells){
    const s = toEpoch(b.start), e = toEpoch(b.end);
    if(nowMs>=s && nowMs<e){
      const l = lessons.find(x=>x.period===b.period);
      return {state:'lesson', period:b.period, subject:l?l.subject:'', isSub:l?l.isSub:false, startEpoch:s, targetEpoch:e};
    }
  }
  const future = bells.filter(b=>toEpoch(b.start)>nowMs).sort((a,b)=>toEpoch(a.start)-toEpoch(b.start));
  if(future.length===0) return {state:'after'};
  const next = future[0];
  const l = lessons.find(x=>x.period===next.period);
  const past = bells.filter(b=>toEpoch(b.end)<=nowMs).sort((a,b)=>toEpoch(b.end)-toEpoch(a.end));
  const startEpoch = past.length ? toEpoch(past[0].end) : nowMs - 15*60000;
  return {state: past.length?'break':'before', period:next.period, subject:l?l.subject:'', isSub:l?l.isSub:false, startEpoch, targetEpoch: toEpoch(next.start)};
}

/* ---------- рендер ---------- */
function render(){
  const app = document.getElementById('app');
  if(!ready) return;

  const status = getStatus();
  statusMeta = (status.state==='lesson'||status.state==='break'||status.state==='before') ? status : null;

  const tomorrow = computeTomorrow();
  const tomorrowLessons = lessonsForDate(tomorrow.dateStr, tomorrow.key).filter(l=>l.subject);
  const wknd = computeWeekend();
  const hwDone = data.homework.filter(h=>h.done).length;
  const hwTotal = data.homework.length;
  const notifOn = ('Notification' in window) && Notification.permission==='granted' && localStorage.getItem('notif-enabled')==='1';

  let html = '';

  /* header */
  html += `<header>
    <div class="brand">
      <div class="mark">${ICONS.calendar}</div>
      <div>
        <h1>Умное расписание</h1>
        <p>Твой личный планировщик уроков и домашки</p>
      </div>
    </div>
    <div class="header-actions">
      ${isAdmin
        ? `<div class="admin-chip">${ICONS.lock} Админ <button onclick="logoutAdmin()">выйти</button></div>`
        : ``}
      <button class="profile-btn" onclick="toggleSidebar()" title="Профиль и настройки">${ICONS.profile}</button>
      <button class="reset-btn" onclick="resetAll()">${ICONS.refresh}Очистить всё</button>
    </div>
  </header>`;

  /* статус-бар "сейчас" */
  html += renderStatusBar(status);

  /* hero */
  html += '<div class="hero">';
  html += `<div class="card tomorrow-card">
    <div class="eyebrow">Завтра</div>
    <div class="day-title">${DAY_FULL[tomorrow.key]}</div>`;
  if(tomorrowLessons.length===0){
    html += `<div class="empty-note">Уроков пока нет — заполни расписание для этого дня ниже.</div>`;
  }else{
    tomorrowLessons.forEach((l,i)=>{
      if(l.isSub){
        html += `<div class="lesson-row substituted">
          <div class="n">${l.period}</div>
          <div class="subject">${l.original?`<span class="old">${escapeHtml(l.original)}</span>`:''}${escapeHtml(l.subject)}<span class="sub-badge">ЗАМЕНА</span></div>
        </div>`;
      }else{
        html += `<div class="lesson-row">
          <div class="n">${l.period}</div>
          <div class="subject">${escapeHtml(l.subject)}</div>
        </div>`;
      }
    });
  }
  html += `</div>`;

  html += `<div class="card weekend-card">
    <div class="eyebrow">${wknd.weekend ? 'До понедельника' : 'До выходных'}</div>
    <div class="num">${wknd.days}<span class="unit">дн.</span>${wknd.hours}<span class="unit">ч.</span></div>
    <div class="sub">${wknd.weekend ? 'Сейчас выходные — отдыхай!' : 'Держись, осталось немного'}</div>
  </div>`;
  html += '</div>';

  /* домашка */
  html += `<section><div class="section-head"><h2>Домашка</h2>${hwTotal>0?`<div class="progress-pill">${hwDone} из ${hwTotal} сделано</div>`:''}</div><div class="hw-grid">`;
  const rank = {high:0, medium:1, low:2};
  const activeHw = data.homework.slice().sort((a,b)=>{
    const pr = (rank[a.priority]??1) - (rank[b.priority]??1);
    if(pr!==0) return pr;
    return (a.due||'9999').localeCompare(b.due||'9999');
  });
  const prioLabel = {high:'Высокий', medium:'Средний', low:'Низкий'};
  activeHw.forEach(hw=>{
    const prio = hw.priority || 'medium';
    html += `<div class="hw-card ${hw.done?'done':''} priority-${prio}">
      <div class="top-row">
        <div class="subj">${escapeHtml(hw.subject||'Без предмета')}</div>
        <div class="check-circle ${hw.done?'checked':''}" onclick="toggleHw('${hw.id}')">${ICONS.check}</div>
      </div>
      <span class="prio-tag ${prio}">${prioLabel[prio]}</span>
      <div class="txt">${escapeHtml(hw.text||'')}</div>
      ${hw.due?`<div class="due">к ${fmtDate(hw.due)}</div>`:''}
      <button class="del" onclick="deleteHw('${hw.id}')">${ICONS.trash}</button>
    </div>`;
  });
  html += `<div class="add-hw-card">
    <input id="hw-subject" placeholder="Предмет">
    <input id="hw-text" placeholder="Что задали">
    <input id="hw-due" type="date">
    <select id="hw-priority">
      <option value="low">Низкий приоритет</option>
      <option value="medium" selected>Средний приоритет</option>
      <option value="high">Высокий приоритет</option>
    </select>
    <button onclick="addHw()">Добавить</button>
  </div>`;
  html += '</div></section>';

  /* замены */
  const upcomingSubs = [];
  Object.keys(data.substitutions).sort().forEach(dateStr=>{
    if(dateStr < ymd(new Date())) return;
    Object.keys(data.substitutions[dateStr]).forEach(period=>{
      upcomingSubs.push({dateStr, period:Number(period), ...data.substitutions[dateStr][period]});
    });
  });
  if(isAdmin || upcomingSubs.length>0){
    html += `<section><div class="section-head"><h2>Замены</h2></div>`;
    if(upcomingSubs.length===0){
      html += `<div class="empty-note">Замен пока нет.</div>`;
    }else{
      html += `<div class="sub-list">`;
      upcomingSubs.forEach(s=>{
        html += `<div class="sub-item">
          <div class="txt">${fmtDate(s.dateStr)}, ${s.period} урок — <b>${escapeHtml(s.subject)}</b>${s.note?` (${escapeHtml(s.note)})`:''}</div>
          ${isAdmin?`<button onclick="removeSubstitution('${s.dateStr}',${s.period})">убрать</button>`:''}
        </div>`;
      });
      html += `</div>`;
    }
    if(isAdmin){
      html += `<div class="sub-form">
        <input id="sub-date" type="date">
        <select id="sub-period">${[1,2,3,4,5,6,7,8].map(p=>`<option value="${p}">${p} урок</option>`).join('')}</select>
        <input id="sub-subject" placeholder="Новый предмет">
        <input id="sub-note" placeholder="Причина (необязательно)">
        <button onclick="addSubstitution()">Добавить замену</button>
      </div>`;
    }
    html += `</section>`;
  }

  /* расписание на неделю */
  html += '<section><div class="section-head"><h2>Расписание на неделю</h2></div>';
  html += '<div class="day-tabs">';
  DAY_KEYS.forEach(k=>{
    html += `<button class="day-tab ${k===editorDay?'active':''}" onclick="setEditorDay('${k}')">${DAY_SHORT[k]}</button>`;
  });
  html += '</div>';

  html += `<div class="card">`;
  const lessons = (data.schedule[editorDay]||[]).slice().sort((a,b)=>a.period-b.period);
  if(isAdmin){
    lessons.forEach((l,i)=>{
      const realIdx = data.schedule[editorDay].indexOf(l);
      html += `<div class="edit-row">
        <select class="period" onchange="updateLesson('${editorDay}',${realIdx},'period',parseInt(this.value))">
          ${Array.from({length:10},(_,n)=>n+1).map(p=>`<option value="${p}" ${p===l.period?'selected':''}>${p} урок</option>`).join('')}
        </select>
        <input class="subject" value="${escapeHtml(l.subject||'')}" placeholder="Предмет" onchange="updateLesson('${editorDay}',${realIdx},'subject',this.value)">
        <button class="del" onclick="removeLesson('${editorDay}',${realIdx})">${ICONS.trash}</button>
      </div>`;
    });
    if(lessons.length===0){
      html += `<div class="empty-note">Пока пусто. Добавь первый урок на ${DAY_FULL[editorDay].toLowerCase()}.</div>`;
    }
  }else{
    if(lessons.length===0){
      html += `<div class="empty-note">Расписание на ${DAY_FULL[editorDay].toLowerCase()} пока не заполнено.</div>`;
    }else{
      lessons.forEach(l=>{
        html += `<div class="lesson-row"><div class="n">${l.period}</div><div class="subject">${escapeHtml(l.subject||'—')}</div></div>`;
      });
    }
    html += `<div class="locked-note">${ICONS.lock}Редактировать расписание может только администратор</div>`;
  }
  html += `</div>`;
  if(isAdmin){
    html += `<button class="add-lesson-btn" onclick="addLesson('${editorDay}')">${ICONS.plus}добавить урок</button>`;
  }
  html += '</section>';

  /* звонки — только у админа редактируемые поля */
  html += `<section><div class="section-head"><h2>Расписание звонков</h2></div><div class="card">`;
  data.bells.slice().sort((a,b)=>a.period-b.period).forEach(b=>{
    if(isAdmin){
      html += `<div class="bell-row">
        <div class="bp">${b.period} урок</div>
        <input type="time" value="${b.start||''}" onchange="updateBell(${b.period},'start',this.value)">
        <span>—</span>
        <input type="time" value="${b.end||''}" onchange="updateBell(${b.period},'end',this.value)">
        <button class="del" onclick="removeBell(${b.period})" style="margin-left:auto;background:none;border:none;color:var(--ink-faint);cursor:pointer;">${ICONS.trash}</button>
      </div>`;
    }else{
      html += `<div class="bell-row"><div class="bp">${b.period} урок</div><span>${b.start||'—'} – ${b.end||'—'}</span></div>`;
    }
  });
  html += `</div>`;
  if(isAdmin){
    html += `<button class="add-lesson-btn" onclick="addBell()">${ICONS.plus}добавить звонок</button>`;
  }
  html += `</section>`;

  /* сайдбар и модалка не трогаем здесь */
  app.innerHTML = html;
  renderSidebar();
  document.documentElement.setAttribute('data-theme', theme);
}

function renderStatusBar(status){
  let dotClass='', label='', main='', showTimer=false;
  if(status.state==='off'){ label='Сегодня'; main='Уроков нет — отдыхай 🎉'; }
  else if(status.state==='after'){ label='Уроки закончились'; main='Хорошего вечера! 🌙'; }
  else if(status.state==='before'){ label='До начала уроков'; main = status.subject?('Первый урок: '+escapeHtml(status.subject)):'Скоро начало уроков'; showTimer=true; }
  else if(status.state==='lesson'){ dotClass='live'; label='Идёт '+status.period+' урок'; main = escapeHtml(status.subject||'Урок') + (status.isSub?' <span class="sub-badge">ЗАМЕНА</span>':''); showTimer=true; }
  else if(status.state==='break'){ dotClass='break'; label='Перемена'; main = status.subject?('Дальше: '+escapeHtml(status.subject)+' ('+status.period+' урок)'):'Скоро следующий урок'; showTimer=true; }

  let inner = `<div class="status-dot ${dotClass}"></div><div class="status-info"><div class="status-label">${label}</div><div class="status-main">${main}</div>`;
  if(showTimer){
    const remain = Math.max(0, status.targetEpoch - Date.now());
    const mm = Math.floor(remain/60000), ss = Math.floor((remain%60000)/1000);
    inner += `<div class="status-progress"><div class="status-progress-fill" id="status-progress-fill" style="width:0%"></div></div>`;
    inner += `</div><div class="status-time" id="status-time">${pad(mm)}:${pad(ss)}</div>`;
  }else{
    inner += `</div>`;
  }
  return `<div class="status-bar">${inner}</div>`;
}

function tick(){
  if(!statusMeta) return;
  const remain = statusMeta.targetEpoch - Date.now();
  if(remain<=0){ render(); return; }
  const mm = Math.floor(remain/60000), ss = Math.floor((remain%60000)/1000);
  const t = document.getElementById('status-time');
  if(t) t.textContent = pad(mm)+':'+pad(ss);
  const f = document.getElementById('status-progress-fill');
  if(f && statusMeta.startEpoch){
    const total = statusMeta.targetEpoch - statusMeta.startEpoch;
    const elapsed = Date.now() - statusMeta.startEpoch;
    const pct = Math.min(100, Math.max(0, (elapsed/total)*100));
    f.style.width = pct+'%';
  }
}

function renderSidebar(){
  const wrap = document.getElementById('app');
  const hwCount = data.homework.length;
  const lessonCount = DAY_KEYS.reduce((sum,k)=>sum+(data.schedule[k]||[]).length,0);
  const doneCount = data.homework.filter(h=>h.done).length;
  const notifOn = ('Notification' in window) && Notification.permission==='granted' && localStorage.getItem('notif-enabled')==='1';

  let html = `<div class="sidebar ${sidebarOpen?'open':''}">
    <div class="sidebar-header"><h3>Профиль и настройки</h3><button class="close-btn" onclick="toggleSidebar()">${ICONS.close}</button></div>

    <div class="sidebar-section">
      <label class="setting-label">Тема</label>
      <div class="theme-toggle">
        <button class="theme-btn ${theme==='light'?'active':''}" onclick="setTheme('light')">${ICONS.sun}</button>
        <button class="theme-btn ${theme==='dark'?'active':''}" onclick="setTheme('dark')">${ICONS.moon}</button>
      </div>
    </div>

    <div class="sidebar-section">
      <label class="setting-label">Уведомления</label>
      <button class="notif-btn ${notifOn?'on':''}" onclick="toggleNotifications()">${notifOn?ICONS.bell:ICONS.bellOff}${notifOn?'Включены':'Включить напоминания'}</button>
      <div class="locked-note" style="margin-top:8px;">Работают, пока сайт открыт в браузере — это локальные напоминания, не серверный push.</div>
    </div>

    <div class="sidebar-section">
      <label class="setting-label">Статистика</label>
      <div class="stats-grid">
        <div class="stat"><div class="stat-num">${hwCount}</div><div class="stat-label">Заданий</div></div>
        <div class="stat"><div class="stat-num">${lessonCount}</div><div class="stat-label">Уроков</div></div>
        <div class="stat"><div class="stat-num">${doneCount}</div><div class="stat-label">Готово</div></div>
      </div>
    </div>

    <div class="sidebar-section">
      <label class="setting-label">Данные</label>
      <button class="sidebar-action-btn" onclick="downloadBackup()">💾 Скачать резервную копию</button>
      ${isAdmin?`<button class="sidebar-action-btn" onclick="uploadBackup()">📂 Загрузить из файла</button>
      <button class="sidebar-action-btn" onclick="openMesModal()">📥 Импорт из МЭШ (вручную)</button>`:''}
    </div>`;

  if(isAdmin){
    html += `<div class="sidebar-section">
      <label class="setting-label">Логи действий</label>
      <div class="logs-list">
        ${data.logs.length===0?'<div class="empty-note">Пока пусто</div>':data.logs.slice(0,20).map(l=>`<div class="log-item">${escapeHtml(l.text)}<span class="t">${new Date(l.ts).toLocaleString('ru-RU')}</span></div>`).join('')}
      </div>
    </div>`;
  }

  html += `<div class="sidebar-footer">
    <div style="display: grid; gap: 10px;">
      <a href="admin.html" class="admin-btn" style="text-decoration: none;">${ICONS.lock} Админ-панель</a>
      <button class="sidebar-action-btn" onclick="logoutUser()" style="background: #FDEAE8; color: #E23D48; border-color: #F4BFBA;">🚪 Выход</button>
    </div>
  </div>
  </div>
  <div class="sidebar-overlay ${sidebarOpen?'active':''}" onclick="toggleSidebar()"></div>`;

  wrap.insertAdjacentHTML('beforeend', html);
}

/* ---------- уроки (только админ) ---------- */
function addLesson(day){
  if(!isAdmin) return;
  const used = new Set((data.schedule[day]||[]).map(l=>l.period));
  let period = 1; while(used.has(period) && period<20) period++;
  data.schedule[day].push({id:uid(), period, subject:''});
  addLog(`Добавлен урок на ${DAY_FULL[day]} (${period} урок)`);
  render();
}
function updateLesson(day, idx, field, value){
  if(!isAdmin) return;
  data.schedule[day][idx][field] = value;
  saveData();
}
function removeLesson(day, idx){
  if(!isAdmin) return;
  const l = data.schedule[day][idx];
  data.schedule[day].splice(idx,1);
  addLog(`Удалён урок «${l.subject||'без названия'}» (${DAY_FULL[day]}, ${l.period} урок)`);
  render();
}
function setEditorDay(day){ editorDay = day; render(); }

/* ---------- звонки (только админ) ---------- */
function updateBell(period, field, value){
  if(!isAdmin) return;
  const b = data.bells.find(x=>x.period===period);
  if(b){ b[field]=value; addLog(`Изменено время звонков (${period} урок)`); saveData(); }
}
function addBell(){
  if(!isAdmin) return;
  const used = new Set(data.bells.map(b=>b.period));
  let period = 1; while(used.has(period) && period<20) period++;
  data.bells.push({period, start:'', end:''});
  addLog(`Добавлен ${period} урок в расписание звонков`);
  render();
}
function removeBell(period){
  if(!isAdmin) return;
  data.bells = data.bells.filter(b=>b.period!==period);
  addLog(`Удалён ${period} урок из расписания звонков`);
  render();
}

/* ---------- замены (только админ добавляет/удаляет) ---------- */
function addSubstitution(){
  if(!isAdmin) return;
  const dateStr = document.getElementById('sub-date').value;
  const period = parseInt(document.getElementById('sub-period').value);
  const subject = document.getElementById('sub-subject').value.trim();
  const note = document.getElementById('sub-note').value.trim();
  if(!dateStr || !subject) return;
  data.substitutions[dateStr] = data.substitutions[dateStr] || {};
  data.substitutions[dateStr][period] = {subject, note};
  addLog(`Добавлена замена на ${fmtDate(dateStr)}: ${subject} (${period} урок)`);
  render();
}
function removeSubstitution(dateStr, period){
  if(!isAdmin) return;
  if(data.substitutions[dateStr]){
    delete data.substitutions[dateStr][period];
    if(Object.keys(data.substitutions[dateStr]).length===0) delete data.substitutions[dateStr];
  }
  addLog(`Убрана замена на ${fmtDate(dateStr)} (${period} урок)`);
  render();
}

/* ---------- домашка (доступно всем) ---------- */
function addHw(){
  const subject = document.getElementById('hw-subject').value.trim();
  const text = document.getElementById('hw-text').value.trim();
  const due = document.getElementById('hw-due').value;
  const priority = document.getElementById('hw-priority').value;
  if(!text) return;
  data.homework.push({id:uid(), subject, text, due, done:false, priority});
  addLog(`Добавлена домашка: ${text}`);
  render();
}
function toggleHw(id){
  const hw = data.homework.find(h=>h.id===id);
  if(hw){ hw.done = !hw.done; addLog(`Домашка «${hw.text}» отмечена как ${hw.done?'выполненная':'невыполненная'}`); render(); }
}
function deleteHw(id){
  const hw = data.homework.find(h=>h.id===id);
  data.homework = data.homework.filter(h=>h.id!==id);
  if(hw) addLog(`Удалена домашка: ${hw.text}`);
  render();
}

function resetAll(){
  if(!confirm('Удалить всё расписание и домашку?')) return;
  data = { schedule:{mon:[],tue:[],wed:[],thu:[],fri:[],sat:[],sun:[]}, bells: JSON.parse(JSON.stringify(DEFAULT_BELLS)), substitutions:{}, homework:[], logs:[] };
  saveData(); render();
}

/* ---------- админ ---------- */
function enterAdmin(){
  const pass = prompt('Введите пароль администратора:');
  if(pass===null) return;
  if(pass===ADMIN_PASSWORD){
    isAdmin = true;
    sessionStorage.setItem('admin-session','1');
    addLog('Вход в админ-режим');
    render();
  }else{
    alert('Неверный пароль');
  }
}
function logoutAdmin(){
  isAdmin = false;
  sessionStorage.removeItem('admin-session');
  addLog('Выход из админ-режима');
  render();
}

/* ---------- сайдбар / тема ---------- */
function toggleSidebar(){ sidebarOpen = !sidebarOpen; render(); }
function setTheme(t){ theme = t; localStorage.setItem('app-theme', t); render(); }

/* ---------- уведомления ---------- */
function toggleNotifications(){
  if(!('Notification' in window)){ alert('Этот браузер не поддерживает уведомления'); return; }
  if(Notification.permission==='granted'){
    const on = localStorage.getItem('notif-enabled')==='1';
    localStorage.setItem('notif-enabled', on?'0':'1');
    addLog(on?'Уведомления выключены':'Уведомления включены');
    render();
    return;
  }
  Notification.requestPermission().then(perm=>{
    if(perm==='granted'){ localStorage.setItem('notif-enabled','1'); addLog('Уведомления включены'); }
    render();
  });
}
function fireNotification(title, body, tag){
  if(!('Notification' in window) || Notification.permission!=='granted') return;
  if(navigator.serviceWorker && navigator.serviceWorker.controller){
    navigator.serviceWorker.controller.postMessage({type:'SHOW_NOTIFICATION', title, body, tag});
  }else{
    try{ new Notification(title, {body, icon:'icon-192.png'}); }catch(e){}
  }
}
function checkNotifications(){
  if(localStorage.getItem('notif-enabled')!=='1') return;
  if(!('Notification' in window) || Notification.permission!=='granted') return;
  const now = new Date();
  const dateStr = ymd(now);
  const dayKey = jsDayToKey(now.getDay());
  const lessons = lessonsForDate(dateStr, dayKey);
  data.bells.filter(b=>b.start && b.end).forEach(b=>{
    const l = lessons.find(x=>x.period===b.period && x.subject);
    if(!l) return;
    const [h,m] = b.start.split(':').map(Number);
    const startD = new Date(now); startD.setHours(h,m,0,0);
    const diff = startD.getTime()-now.getTime();
    if(diff>0 && diff<=5*60000){
      const key = 'notified-lesson-'+dateStr+'-'+b.period;
      if(!localStorage.getItem(key)){
        fireNotification('Скоро урок', (l.isSub?'Замена: ':'')+l.subject+' — через 5 минут ('+b.period+' урок)', key);
        localStorage.setItem(key,'1');
      }
    }
  });
  data.homework.filter(h=>!h.done && h.due===dateStr).forEach(hw=>{
    const key = 'notified-hw-'+hw.id+'-'+dateStr;
    if(!localStorage.getItem(key)){
      fireNotification('Дедлайн сегодня', (hw.subject?hw.subject+': ':'')+hw.text, key);
      localStorage.setItem(key,'1');
    }
  });
}

/* ---------- резервные копии ---------- */
function downloadBackup(){
  const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `schedule-backup-${ymd(new Date())}.json`; a.click();
  URL.revokeObjectURL(url);
}
function uploadBackup(){
  if(!isAdmin) return;
  const input = document.createElement('input');
  input.type = 'file'; input.accept = '.json';
  input.onchange = (e)=>{
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev)=>{
      try{
        const imported = JSON.parse(ev.target.result);
        if(imported.schedule && imported.homework!==undefined){
          data = Object.assign({bells:DEFAULT_BELLS, substitutions:{}, logs:[]}, imported);
          saveData(); addLog('Загружена резервная копия из файла'); render();
          alert('Данные загружены успешно');
        }else{ alert('Неверный формат файла'); }
      }catch(err){ alert('Ошибка при загрузке файла'); }
    };
    reader.readAsText(file);
  };
  input.click();
}

/* ---------- импорт из МЭШ (ручной, т.к. открытого API нет) ----------
   У МЭШ нет официального API для сторонних сайтов, и вводить школьный
   логин/пароль на самодельном сайте небезопасно, поэтому вместо
   автосинхронизации — быстрый разбор текста, скопированного прямо со
   страницы расписания в МЭШ (с номерами уроков, временем и т.п.). */
const DAY_NAME_MAP = {
  'понедельник':'mon','пн':'mon','вторник':'tue','вт':'tue','среда':'wed','ср':'wed',
  'четверг':'thu','чт':'thu','пятница':'fri','пт':'fri','суббота':'sat','сб':'sat',
  'воскресенье':'sun','вс':'sun'
};

function parseMesPaste(text, defaultDayKey){
  const lines = text.split('\n').map(l=>l.trim()).filter(Boolean);
  let currentDay = defaultDayKey;
  let autoPeriod = 1;
  const result = {};
  lines.forEach(line=>{
    const bareLower = line.toLowerCase().replace(/[.,:]+$/,'');
    if(DAY_NAME_MAP[bareLower]){ currentDay = DAY_NAME_MAP[bareLower]; autoPeriod = 1; return; }

    // старый формат "Пн;1;Математика" — тоже поддержан
    if(line.includes(';')){
      const parts = line.split(';').map(p=>p.trim());
      const dKey = DAY_NAME_MAP[parts[0].toLowerCase()];
      if(parts.length>=3 && dKey){
        const period = parseInt(parts[1]) || autoPeriod;
        result[dKey] = result[dKey] || [];
        result[dKey].push({period, subject:parts[2]});
        autoPeriod = period+1;
        return;
      }
    }

    let rest = line;
    let period = null;
    const numMatch = rest.match(/^(\d{1,2})[.)]\s*/);
    if(numMatch){ period = parseInt(numMatch[1]); rest = rest.slice(numMatch[0].length); }
    // убираем время в начале строки, если МЭШ его добавляет: "08:30 Математика" / "8:30-9:15 Математика"
    rest = rest.replace(/^\d{1,2}[:.]\d{2}(\s*[-–—]\s*\d{1,2}[:.]\d{2})?\s*/, '').trim();
    if(!rest) return;
    if(period===null) period = autoPeriod;
    autoPeriod = period + 1;
    result[currentDay] = result[currentDay] || [];
    result[currentDay].push({period, subject:rest});
  });
  return result;
}

function openMesModal(){
  if(!isAdmin) return;
  document.getElementById('modal-root').innerHTML = `
    <div class="modal-overlay" onclick="if(event.target===this) closeModal()">
      <div class="modal">
        <h3>Импорт из МЭШ</h3>
        <p>У МЭШ нет открытого API для сторонних сайтов, а вводить школьный логин на чужом сайте небезопасно — поэтому только так: открой день в МЭШ, выдели список уроков и скопируй как есть (с номерами или временем — не важно).</p>
        <p>Выбери день (если в тексте нет названий дней — применится он) и вставь список ниже, например:<br>1. Математика<br>2. Русский язык<br>3. Физика</p>
        <select id="mes-day">${DAY_KEYS.map(k=>`<option value="${k}" ${k===editorDay?'selected':''}>${DAY_FULL[k]}</option>`).join('')}</select>
        <textarea id="mes-text" placeholder="1. Математика&#10;2. Русский язык&#10;3. Физика" oninput="previewMes()"></textarea>
        <div id="mes-preview"></div>
        <div class="modal-actions">
          <button class="ghost" onclick="closeModal()">Отмена</button>
          <button class="primary" onclick="importMesText()">Импортировать</button>
        </div>
      </div>
    </div>`;
}
function closeModal(){ document.getElementById('modal-root').innerHTML = ''; }

function previewMes(){
  const raw = document.getElementById('mes-text').value;
  const day = document.getElementById('mes-day').value;
  const box = document.getElementById('mes-preview');
  if(!raw.trim()){ box.innerHTML=''; return; }
  const parsed = parseMesPaste(raw, day);
  const totalLessons = Object.values(parsed).reduce((s,arr)=>s+arr.length,0);
  if(totalLessons===0){ box.innerHTML = '<p style="color:var(--danger)">Не удалось распознать ни одной строки.</p>'; return; }
  let html = '<p><b>Будет добавлено:</b></p><div class="sub-list">';
  Object.keys(parsed).forEach(dKey=>{
    parsed[dKey].sort((a,b)=>a.period-b.period).forEach(l=>{
      html += `<div class="sub-item"><div class="txt">${DAY_FULL[dKey]}, ${l.period} урок — ${escapeHtml(l.subject)}</div></div>`;
    });
  });
  html += '</div>';
  box.innerHTML = html;
}

function importMesText(){
  const raw = document.getElementById('mes-text').value;
  const day = document.getElementById('mes-day').value;
  const parsed = parseMesPaste(raw, day);
  let count = 0;
  Object.keys(parsed).forEach(dKey=>{
    data.schedule[dKey] = data.schedule[dKey] || [];
    parsed[dKey].forEach(({period, subject})=>{
      const existing = data.schedule[dKey].find(l=>l.period===period);
      if(existing){ existing.subject = subject; } else { data.schedule[dKey].push({id:uid(), period, subject}); }
      count++;
    });
  });
  if(count===0){ alert('Не удалось распознать ни одной строки — проверь, что скопировалось.'); return; }
  addLog(`Импортировано ${count} уроков вручную из МЭШ`);
  closeModal(); render();
}

/* ---------- PWA ---------- */
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('sw.js').catch(e=>console.error('SW error', e));
  });
}

function logoutUser(){
  if(confirm('Ты уверен, что хочешь выйти?')){
    sessionStorage.removeItem('current-user');
    localStorage.removeItem('current-user');
    window.location.href = 'login.html';
  }
}

loadData();
document.documentElement.setAttribute('data-theme', theme);
setInterval(render, 60000);
setInterval(tick, 1000);
setInterval(checkNotifications, 30000);