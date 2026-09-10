const USERS_KEY = 'app-users';
const CURRENT_USER_KEY = 'current-user';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';
const THEME_KEY = 'app-theme';

// Переключение темы
function toggleTheme() {
  const currentTheme = localStorage.getItem(THEME_KEY) || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  localStorage.setItem(THEME_KEY, newTheme);
  document.documentElement.setAttribute('data-theme', newTheme);
  updateThemeIcon(newTheme);
}

// Обновление иконки темы
function updateThemeIcon(theme) {
  const icon = document.getElementById('theme-icon');
  if (theme === 'dark') {
    icon.textContent = '☀️';
  } else {
    icon.textContent = '🌙';
  }
}

// Инициализация темы при загрузке
function initializeTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

// Инициализация админа при первом запуске
function initializeAdminUser() {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
  if (!users[ADMIN_USERNAME]) {
    users[ADMIN_USERNAME] = {
      username: ADMIN_USERNAME,
      password: ADMIN_PASSWORD,
      isAdmin: true,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
}

// Переключение табов
function switchTab(tab) {
  const loginTab = document.getElementById('login-tab');
  const registerTab = document.getElementById('register-tab');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const subtitle = document.getElementById('tab-subtitle');

  if (tab === 'login') {
    loginTab.classList.remove('hidden');
    registerTab.classList.add('hidden');
    tabButtons[0].classList.add('active');
    tabButtons[1].classList.remove('active');
    subtitle.textContent = 'Войди в свой аккаунт';
  } else {
    loginTab.classList.add('hidden');
    registerTab.classList.remove('hidden');
    tabButtons[0].classList.remove('active');
    tabButtons[1].classList.add('active');
    subtitle.textContent = 'Создай новый аккаунт';
  }

  // Очистка сообщений об ошибках
  document.getElementById('login-error').classList.add('hidden');
  document.getElementById('register-error').classList.add('hidden');
  document.getElementById('register-success').classList.add('hidden');
}

// Обработка входа
function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const remember = document.getElementById('login-remember').checked;
  const errorDiv = document.getElementById('login-error');

  errorDiv.classList.add('hidden');

  if (!username || !password) {
    showError(errorDiv, 'Заполни все поля');
    return;
  }

  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
  const user = users[username];

  if (!user || user.password !== password) {
    showError(errorDiv, 'Неверный логин или пароль');
    return;
  }

  // Сохраняем текущего пользователя
  const userSession = {
    username: user.username,
    isAdmin: user.isAdmin || false,
    loginTime: new Date().toISOString()
  };

  if (remember) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userSession));
  } else {
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userSession));
  }

  // Редирект в зависимости от роли
  if (user.isAdmin) {
    window.location.href = 'admin.html';
  } else {
    window.location.href = 'app.html';
  }
}

// Обработка регистрации
function handleRegister(event) {
  event.preventDefault();

  const username = document.getElementById('register-username').value.trim();
  const password = document.getElementById('register-password').value;
  const passwordConfirm = document.getElementById('register-password-confirm').value;
  const errorDiv = document.getElementById('register-error');
  const successDiv = document.getElementById('register-success');

  errorDiv.classList.add('hidden');
  successDiv.classList.add('hidden');

  // Валидация
  if (!username || !password || !passwordConfirm) {
    showError(errorDiv, 'Заполни все поля');
    return;
  }

  if (username.length < 3) {
    showError(errorDiv, 'Логин должен быть минимум 3 символа');
    return;
  }

  if (password !== passwordConfirm) {
    showError(errorDiv, 'Пароли не совпадают');
    return;
  }

  if (password.length < 6) {
    showError(errorDiv, 'Пароль должен быть минимум 6 символов');
    return;
  }

  const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');

  if (users[username]) {
    showError(errorDiv, 'Этот логин уже занят');
    return;
  }

  // Создаем нового пользователя
  users[username] = {
    username: username,
    password: password,
    isAdmin: false,
    createdAt: new Date().toISOString()
  };

  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  // Показываем успех и переходим на вход
  successDiv.textContent = '✅ Регистрация успешна! Переходим на вход...';
  successDiv.classList.remove('hidden');

  setTimeout(() => {
    document.getElementById('register-username').value = '';
    document.getElementById('register-password').value = '';
    document.getElementById('register-password-confirm').value = '';
    switchTab('login');
    document.getElementById('login-username').value = username;
    document.getElementById('login-password').focus();
  }, 1500);
}

// Показать ошибку
function showError(element, message) {
  element.textContent = '❌ ' + message;
  element.classList.remove('hidden');
}

// Проверка авторизации при загрузке страницы
function checkAuth() {
  const user = sessionStorage.getItem(CURRENT_USER_KEY) || localStorage.getItem(CURRENT_USER_KEY);
  
  if (user) {
    const userData = JSON.parse(user);
    if (userData.isAdmin) {
      window.location.href = 'admin.html';
    } else {
      window.location.href = 'index.html';
    }
  }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  initializeTheme();
  initializeAdminUser();
  checkAuth();
});
