// donor-dashboard.js — Логика для страницы доноров

/* ---------------- DOM shortcuts ---------------- */
const recipientsList = document.getElementById('recipientsList');
const donateModal = document.getElementById('donateModal');
const donateForm = document.getElementById('donateForm');
const closeDonateModal = document.getElementById('closeDonateModal');
const modalTitle = document.getElementById('modalTitle');
const donateAmount = document.getElementById('donateAmount');
const themeToggle = document.getElementById('themeToggle');
const backButton = document.getElementById('backButton');

let selectedRecipient = null;

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

/* ---------------- Modal utilities ---------------- */
function showModal(el) { 
  if (el) { 
    el.classList.remove('hidden'); 
    el.classList.add('fade-in'); 
    el.setAttribute('aria-hidden', 'false'); 
    console.log('Модал открыт:', el.id);
  } 
}
function hideModal(el) { 
  if (el) { 
    el.classList.remove('fade-in'); 
    el.classList.add('hidden'); 
    el.setAttribute('aria-hidden', 'true'); 
    console.log('Модал закрыт:', el.id);
  } 
}

/* ---------------- Load recipients ---------------- */
function loadRecipients() {
  // Placeholder: данные из localStorage (в реальности из блокчейна)
  const profiles = JSON.parse(localStorage.getItem('hc_profiles') || '[]');
  if (profiles.length === 0) {
    recipientsList.innerHTML = '<p class="text-center text-teal-200">Нет зарегистрированных нуждающихся.</p>';
    return;
  }

  recipientsList.innerHTML = '';
  profiles.forEach((profile, index) => {
    const card = document.createElement('div');
    card.className = 'card bg-gray-900/50 p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300';
    card.innerHTML = `
      <h3 class="text-xl font-semibold text-teal-200">${profile.name || `Пользователь ${index + 1}`}</h3>
      <p class="text-sm text-teal-300">Собрано: ${profile.collected || 0} сом из ${profile.goal || 100000} сом</p>
      <button class="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg w-full">Подробнее</button>
    `;
    card.querySelector('button').addEventListener('click', () => showRecipientDetails(profile));
    recipientsList.appendChild(card);
  });
}

function showRecipientDetails(profile) {
  selectedRecipient = profile;
  modalTitle.textContent = `Поддержать ${profile.name || 'пользователя'}`;
  showModal(donateModal);
}

/* ---------------- Donate logic ---------------- */
if (donateForm) {
  donateForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!selectedRecipient || !window.ethereum) {
      alert('Подключите MetaMask или выберите получателя!');
      return;
    }

    const amount = parseFloat(donateAmount.value);
    if (isNaN(amount) || amount <= 0) {
      alert('Введите корректную сумму!');
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const donorAddress = await signer.getAddress();
      console.log('Донор подключён:', donorAddress);

      const contractAddress = '0xYourDeployedContractAddress'; // Замените на реальный адрес
      const contractABI = [
        {"inputs":[{"internalType":"address","name":"_recipient","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"donate","outputs":[],"stateMutability":"payable","type":"function"}
        // Добавьте полный ABI вашего контракта
      ];
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      console.log('Контракт инициализирован:', contractAddress);

      const tx = await contract.donate(selectedRecipient.wallet, ethers.utils.parseEther(amount.toString()), { value: ethers.utils.parseEther(amount.toString()) });
      console.log('Транзакция отправлена:', tx.hash);
      await tx.wait();
      console.log('Транзакция подтверждена:', tx.hash);

      alert(`Успешно отправлено ${amount} сом!`);
      hideModal(donateModal);
      loadRecipients(); // Обновляем список
    } catch (err) {
      console.error('Ошибка при донате:', err);
      alert('Ошибка: ' + (err.message || 'Проверь консоль для деталей.'));
    }
  });
}

closeDonateModal.addEventListener('click', () => hideModal(donateModal));
window.addEventListener('click', (e) => {
  if (!donateModal.contains(e.target) && e.target !== donateModal) hideModal(donateModal);
});

/* ---------------- Navigation ---------------- */
backButton.addEventListener('click', () => {
  window.location.href = './index.html'; // Относительный путь
});

/* ---------------- Initialization ---------------- */
window.addEventListener('load', () => {
  loadRecipients();
  console.log('Страница доноров загружена');
});