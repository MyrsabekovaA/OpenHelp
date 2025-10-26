// script.js — Логика для HealChain с редиректом на профиль и донорскую страницу

/* ---------------- DOM shortcuts ---------------- */
const themeToggle = document.getElementById('themeToggle');
const roleButtons = document.querySelectorAll('.role-btn');
const recipientModal = document.getElementById('recipientModal');
const recipientForm = document.getElementById('recipientForm');
const closeRecipientModal = document.getElementById('closeRecipientModal');
const successModal = document.getElementById('successModal');
const closeSuccessModal = document.getElementById('closeSuccessModal');

let userProfile = JSON.parse(localStorage.getItem('hc_profile') || 'null');
let walletAddress = localStorage.getItem('hc_wallet') || null;
let isSubmitting = false;
let isModalOpening = false;

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
    console.log('Модал открыт:', el.id, 'Стили:', window.getComputedStyle(el).display, 'Классы:', el.className);
    isModalOpening = true;
    setTimeout(() => { isModalOpening = false; }, 100);
  } 
}
function hideModal(el) { 
  if (el) { 
    el.classList.remove('fade-in'); 
    el.classList.add('hidden'); 
    el.setAttribute('aria-hidden', 'true'); 
    console.log('Модал закрыт:', el.id, 'Элемент клика:', event ? event.target : 'Нет события');
  } 
}

/* ---------------- Role selection ---------------- */
roleButtons.forEach(button => {
  button.addEventListener('click', (e) => {
    const role = button.getAttribute('data-role');
    if (role === 'recipient' && !isSubmitting) {
      e.stopPropagation();
      showModal(recipientModal);
    } else if (role === 'donor') {
      window.location.href = 'donor-dashboard.html'; // Редирект на страницу доноров
    }
  });
});

closeRecipientModal.addEventListener('click', (e) => {
  e.stopPropagation();
  hideModal(recipientModal);
});
closeSuccessModal.addEventListener('click', (e) => {
  e.stopPropagation();
  hideModal(successModal);
});
window.addEventListener('click', (e) => {
  if (isModalOpening) return;
  if (!recipientModal.contains(e.target) && e.target !== recipientModal && !successModal.contains(e.target) && e.target !== successModal) {
    console.log('Клик вне модала, закрываю:', e.target);
    hideModal(recipientModal);
    hideModal(successModal);
  }
});

/* ---------------- Registration logic for recipient ---------------- */
if (recipientForm) {
  recipientForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmitting) {
      console.log('Отправка уже в процессе, игнорирую повторный клик.');
      return;
    }
    isSubmitting = true;
    console.log('Форма отправлена, начинаю обработку...');

    const email = document.getElementById('recipientEmail').value.trim();
    const password = document.getElementById('recipientPassword').value.trim();
    const name = document.getElementById('recipientName').value.trim();
    const proofFile = document.getElementById('proofDoc').files[0];

    if (!name || !email || !password || !proofFile) {
      alert('Все поля обязательны!');
      isSubmitting = false;
      console.log('Ошибка валидации формы.');
      return;
    }

    if (typeof ethers === 'undefined') {
      alert('Ethers.js не загружен. Проверьте подключение к интернету или используйте локальную копию.');
      isSubmitting = false;
      return;
    }

    if (!window.ethereum) {
      alert('Пожалуйста, установите MetaMask для продолжения!');
      isSubmitting = false;
      return;
    }

    try {
      console.log('Подключаюсь к MetaMask...');
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      walletAddress = await signer.getAddress();
      localStorage.setItem('hc_wallet', walletAddress);
      console.log('Кошелёк подключён:', walletAddress);

      const contractAddress = '0xYourDeployedContractAddress'; // Замените на реальный адрес
      const contractABI = [
        {"inputs":[{"internalType":"string","name":"_descriptionHash","type":"string"}],"name":"createProject","outputs":[],"stateMutability":"nonpayable","type":"function"}
        // Добавьте полный ABI вашего контракта
      ];
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      console.log('Контракт инициализирован:', contractAddress);

      console.log('Загружаю proof в IPFS...');
      const proofHash = await uploadToIPFS(proofFile);
      console.log('Proof загружен, хеш:', proofHash);

      console.log('Отправляю транзакцию createProject...');
      const tx = await contract.createProject(proofHash);
      console.log('Транзакция отправлена, ожидание подтверждения:', tx.hash);
      await tx.wait();
      console.log('Транзакция подтверждена:', tx.hash);

      userProfile = { role: 'recipient', name, email, password, proofHash, wallet: walletAddress, created: Date.now(), goal: 100000 }; // Добавим цель
      localStorage.setItem('hc_profile', JSON.stringify(userProfile));
      console.log('Профиль сохранён:', userProfile);

      hideModal(recipientModal);
      showModal(successModal);
      setTimeout(() => {
        hideModal(successModal);
        window.location.href = 'dashboard-recipient.html'; // Редирект на профиль
      }, 3000);
    } catch (err) {
      console.error('Ошибка в процессе:', err);
      alert('Произошла ошибка: ' + (err.message || 'Неизвестная ошибка. Проверь консоль для деталей.'));
    } finally {
      isSubmitting = false;
      console.log('Обработка завершена, форма разблокирована.');
    }
  });
}

// Простая функция для IPFS (замените на реальный API, например Pinata)
async function uploadToIPFS(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(file);
  });
}

/* ---------------- Initialization ---------------- */
(function init() {
  userProfile = JSON.parse(localStorage.getItem('hc_profile') || 'null');
  walletAddress = localStorage.getItem('hc_wallet') || null;
  console.log('Инициализация завершена, профиль:', userProfile, 'кошелёк:', walletAddress);
})();