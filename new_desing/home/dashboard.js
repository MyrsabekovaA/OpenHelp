// dashboard.js — Логика для страницы профиля

/* ---------------- DOM shortcuts ---------------- */
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const profileWallet = document.getElementById('profileWallet');
const collectedAmount = document.getElementById('collectedAmount');
const remainingAmount = document.getElementById('remainingAmount');
const progressFill = document.getElementById('progressFill');
const goalAmount = document.getElementById('goalAmount');
const themeToggle = document.getElementById('themeToggle');
const updateProfile = document.getElementById('updateProfile');
const withdrawFunds = document.getElementById('withdrawFunds');
const backButton = document.getElementById('backButton');
const logoutButton = document.getElementById('logoutButton');

let userProfile = JSON.parse(localStorage.getItem('hc_profile') || 'null');
let walletAddress = localStorage.getItem('hc_wallet') || null;

/* ---------------- Theme handling ---------------- */
function applyTheme(theme) {
  document.body.style.background = theme === 'dark' 
    ? 'linear-gradient(135deg, #1a2a44, #0d1b2a, #1a2a44)' 
    : 'linear-gradient(135deg, #e0f7fa, #b2ebf2, #e0f7fa)';
  document.body.classList.toggle('dark', theme === 'dark');
  document.body.classList.toggle('light', theme === 'light');
  themeToggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  localStorage.setItem('hc_theme', theme);
}
(function initTheme() {
  const saved = localStorage.getItem('hc_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (prefersDark ? 'dark' : 'light'));
})();
themeToggle.addEventListener('click', () => {
  const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
  applyTheme(newTheme);
});

/* ---------------- Load profile data ---------------- */
function loadProfile() {
  if (userProfile) {
    profileName.innerHTML = `Имя: <span class="font-medium">${userProfile.name || 'Не указано'}</span>`;
    profileEmail.innerHTML = `Email: <span class="font-medium">${userProfile.email || 'Не указано'}</span>`;
    profileWallet.innerHTML = `Кошелёк: <span class="font-medium">${walletAddress || 'Не подключён'}</span>`;
  } else {
    alert('Профиль не найден. Вернитесь к регистрации.');
    window.location.href = './index.html'; // Относительный путь
  }
}

/* ---------------- Load donation progress ---------------- */
function loadDonationProgress() {
  const goal = userProfile?.goal || 100000; // Цель из профиля
  let collected = 0; // Здесь будет обновляться из блокчейна позже
  // Placeholder: предполагаем, что собрано 20% от цели
  collected = goal * 0.2; // 20,000 сом
  const remaining = goal - collected;

  collectedAmount.innerHTML = `Собрано: <span class="font-bold text-green-400">${collected.toLocaleString()} сом</span>`;
  remainingAmount.innerHTML = `Осталось: <span class="font-bold text-red-400">${remaining.toLocaleString()} сом</span>`;
  goalAmount.textContent = `Цель: ${goal.toLocaleString()} сом`;
  progressFill.style.width = `${(collected / goal) * 100}%`;
}

// Загрузка данных при старте
window.addEventListener('load', () => {
  loadProfile();
  loadDonationProgress();
  console.log('Профиль загружен:', userProfile);
});

/* ---------------- Placeholder actions ---------------- */
updateProfile.addEventListener('click', () => {
  alert('Функция обновления профиля в разработке!');
});

withdrawFunds.addEventListener('click', () => {
  if (!walletAddress) {
    alert('Подключите кошелёк для вывода средств!');
  } else {
    alert('Функция вывода средств в разработке! Кошелёк: ' + walletAddress);
  }
});

/* ---------------- Navigation actions ---------------- */
backButton.addEventListener('click', () => {
  window.location.href = './index.html'; // Относительный путь
});

logoutButton.addEventListener('click', () => {
  localStorage.removeItem('hc_profile'); // Удаляем профиль
  localStorage.removeItem('hc_wallet'); // Удаляем кошелёк
  window.location.href = './index.html'; // Относительный путь
});