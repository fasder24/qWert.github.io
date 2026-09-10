const STORAGE_KEY = 'smart-schedule-data-v2';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_SESSION_KEY = 'admin-session';

const ICONS = {
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>'
};

let isAuthenticated = sessionStorage.getItem(ADMIN_SESSION_KEY) === '1';
let data = null;
let theme = localStorage.getItem('app-theme') || 'light';

async function loadData() {
  try {
    const res = await window.storage.get(STORAGE_KEY, false);
    if (res && res.value) {
      data = JSON.parse(res.value);
    } else {
      data = { schedule: {}, bells: [], substitutions: {}, homework: [], logs: [] };
    }
  } catch (e) {
    console.error('Ошибка загрузки', e);
    data = { schedule: {}, bells: [], substitutions: {}, homework: [], logs: [] };
  }
}

async function saveData() {
  try {
    await window.storage.set(STORAGE_KEY, JSON.stringify(data), false);
    addLog('📝 Данные сохранены');
  } catch (e) {
    console.error('Ошибка сохранения', e);
    addLog('❌ Ошибка сохранения');
  }
}

function addLog(msg) {
  const timestamp = new Date().toLocaleTimeString('ru-RU');
  if (!data.logs) data.logs = [];
  data.logs.push(`[${timestamp}] ${msg}`);
  if (data.logs.length > 100) data.logs.shift();
  render();
}

function authenticate(password) {
  if (password === ADMIN_PASSWORD) {
    isAuthenticated = true;
    sessionStorage.setItem(ADMIN_SESSION_KEY, '1');
    addLog('🔓 Вход в систему');
    render();
    return true;
  }
  return false;
}

function logout() {
  if (!confirm('Ты уверен, что хочешь выйти?')) return;
  isAuthenticated = false;
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  sessionStorage.removeItem('current-user');
  localStorage.removeItem('current-user');
  addLog('🔒 Выход из системы');
  window.location.href = 'login.html';
}

function downloadBackup() {
  const backup = JSON.stringify(data, null, 2);
  const blob = new Blob([backup], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `admin-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  addLog('💾 Резервная копия скачана');
}

function uploadBackup() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        data = imported;
        saveData();
        alert('✅ Данные загружены успешно!');
      } catch (err) {
        alert('❌ Ошибка при загрузке файла');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function clearAllData() {
  if (!confirm('⚠️ Удалить все данные? Это невозможно отменить!')) return;
  data = { schedule: {}, bells: [], substitutions: {}, homework: [], logs: [] };
  saveData();
  alert('✅ Все данные очищены');
  addLog('🗑️ Все данные удалены');
}

function render() {
  const app = document.getElementById('admin-app');
  document.documentElement.setAttribute('data-theme', theme);

  if (!isAuthenticated) {
    app.innerHTML = `
      <div class="login-screen">
        <div class="login-card">
          <h1>🔐 Админ-панель</h1>
          <p>Введи пароль для входа</p>
          <div class="login-form">
            <input type="password" id="admin-password" placeholder="Пароль" />
            <button onclick="handleLogin()">Войти</button>
            <a href="index.html" class="admin-back-btn" style="text-align: center;">← Вернуться на главную</a>
          </div>
        </div>
      </div>
    `;
    return;
  }

  // Админка
  const hwCount = data.homework ? data.homework.length : 0;
  const hwDone = data.homework ? data.homework.filter(h => h.done).length : 0;
  const bellsCount = data.bells ? data.bells.length : 0;
  const logsCount = data.logs ? data.logs.length : 0;
  const scheduleCount = data.schedule ? Object.keys(data.schedule).reduce((s, k) => s + (data.schedule[k] || []).length, 0) : 0;

  app.innerHTML = `
    <div class="admin-header">
      <div>
        <h1>🔐 Админ-панель</h1>
      </div>
      <div style="display: flex; gap: 10px;">
        <a href="index.html" class="admin-back-btn">← Главная</a>
        <button class="admin-back-btn" onclick="logout()" style="cursor: pointer; background: var(--accent-light); color: var(--accent); border-color: var(--accent);">Выход</button>
      </div>
    </div>

    <div class="admin-grid">
      <div class="admin-card">
        <h3>📊 Статистика</h3>
        <div class="stat-item">
          <span class="stat-label">Всего заданий</span>
          <span class="stat-value">${hwCount}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Выполнено</span>
          <span class="stat-value">${hwDone}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">В расписании</span>
          <span class="stat-value">${scheduleCount}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Звонков</span>
          <span class="stat-value">${bellsCount}</span>
        </div>
      </div>

      <div class="admin-card">
        <h3>⚙️ Действия</h3>
        <div class="admin-actions">
          <button class="admin-action-btn" onclick="downloadBackup()">💾 Скачать данные</button>
          <button class="admin-action-btn" onclick="uploadBackup()">📂 Загрузить данные</button>
          <button class="admin-action-btn danger" onclick="clearAllData()">🗑️ Очистить всё</button>
        </div>
      </div>
    </div>

    <div class="logs-container">
      <h3>📜 Логи активности (${logsCount})</h3>
      <div class="logs-list">
        ${(data.logs || []).slice().reverse().map(log => 
          `<div class="log-item">${log}</div>`
        ).join('')}
      </div>
    </div>
  `;
}

function handleLogin() {
  const pwd = document.getElementById('admin-password').value;
  if (authenticate(pwd)) {
    render();
  } else {
    alert('❌ Неверный пароль');
  }
}

// Инициализация
document.documentElement.setAttribute('data-theme', theme);
loadData().then(() => render());
