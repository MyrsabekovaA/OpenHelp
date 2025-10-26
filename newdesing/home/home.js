/* ---------------- DOM shortcuts ---------------- */
const themeToggle = document.getElementById('themeToggle');
const roleButtons = document.querySelectorAll('.role-btn');
const recipientModal = document.getElementById('recipientModal');
const recipientForm = document.getElementById('recipientForm');
const closeRecipientModal = document.getElementById('closeRecipientModal');
const successModal = document.getElementById('successModal');
const closeSuccessModal = document.getElementById('closeSuccessModal');

let walletAddress = localStorage.getItem('hc_wallet') || null;
let isSubmitting = false;
let isModalOpening = false;

/* ---------------- Theme handling ---------------- */
function applyTheme(theme) {
  document.body.className = theme;
  localStorage.setItem('hc_theme', theme);
}
applyTheme(localStorage.getItem('hc_theme') || 'dark');
themeToggle.addEventListener('click', () => {
  applyTheme(document.body.classList.contains('dark') ? 'light' : 'dark');
});

/* ---------------- Modal utilities ---------------- */
function showModal(el) { el.classList.remove('hidden'); }
function hideModal(el) { el.classList.add('hidden'); }

/* ---------------- Role selection ---------------- */
roleButtons.forEach(button => {
  button.addEventListener('click', (e) => {
    const role = button.dataset.role;
    if (role === 'recipient') showModal(recipientModal);
    if (role === 'donor') window.location.href = 'donor-dashboard.html';
  });
});

/* ---------------- Registration logic ---------------- */
if (recipientForm) {
  recipientForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    isSubmitting = true;

    const email = recipientEmail.value.trim();
    const password = recipientPassword.value.trim();
    const name = recipientName.value.trim();

    if (!window.ethereum) return alert("Установите MetaMask!");

    const provider = new ethers.providers.Web3Provider(window.ethereum, "sepolia");
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    walletAddress = await signer.getAddress();

    localStorage.setItem('hc_wallet', walletAddress);

    // ↓ создаём Мок профиль фонда
    const profile = {
      role: 'fund',
      name,
      email,
      wallet: walletAddress,
      projects: [],
      created: Date.now()
    };
    localStorage.setItem('hc_profile', JSON.stringify(profile));

    hideModal(recipientModal);
    showModal(successModal);

    setTimeout(() => {
      hideModal(successModal);
      window.location.href = 'dashboard-recipient.html'; // ✅ правильный редирект
    }, 1500);

    isSubmitting = false;
  });
}