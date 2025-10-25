/* main.js — Theme, UI, Projects, Wallet, Registration (single script for index & register pages) */

/* ---------------- Sample projects (demo) ---------------- */
const sampleProjects = [
  {
    id: 1,
    name: "Срочная операция на сердце — Лиза",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1200&auto=format&fit=crop",
    raised: 12.5,
    goal: 20,
    status: "Operation successfully conducted",
    proof: true,
    toAddress: null,
  },
  {
    id: 2,
    name: "Лечение — Сергей",
    img: "https://images.unsplash.com/photo-1603570419989-b6c78c3a5b09?q=80&w=1200&auto=format&fit=crop",
    raised: 5,
    goal: 30,
    status: "Proof provided",
    proof: true,
    toAddress: null,
  },
  {
    id: 3,
    name: "Baby Leo — Cleft Palate Repair",
    img: "https://images.unsplash.com/photo-1584467735871-6b6e7e4a0e3d?q=80&w=1200&auto=format&fit=crop",
    raised: 8,
    goal: 10,
    status: "Proof pending",
    proof: false,
    toAddress: null,
  },
  {
    id: 4,
    name: "Мария — протезирование",
    img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3b?q=80&w=1200&auto=format&fit=crop",
    raised: 2.7,
    goal: 8,
    status: "Proof pending",
    proof: false,
    toAddress: null,
  },
];

/* ---------------- DOM shortcuts ---------------- */
const projectGrid = document.getElementById("projectGrid");
const searchInput = document.getElementById("search");
const filterSelect = document.getElementById("filter");

const modalRegister = document.getElementById("registerModal");
const openRegister = document.getElementById("openRegister");
const closeRegister = document.getElementById("closeRegister");
const registerForm = document.getElementById("registerForm");
const bindWalletBtn = document.getElementById("bindWallet");

const loginForm = document.getElementById("loginForm");
const loginWalletBtn = document.getElementById("loginWalletBtn");

const connectWalletBtn = document.getElementById("connectWallet");
const themeToggle = document.querySelectorAll("#themeToggle");

const donateModal = document.getElementById("donateModal");
const donateProjectName = document.getElementById("donateProjectName");
const donateAmountInput = document.getElementById("donateAmount");
const donateConfirm = document.getElementById("donateConfirm");
const donateCancel = document.getElementById("donateCancel");

/* registration avatar elements (modal & full page) */
const avatarInput = document.getElementById("avatarInput");
const avatarPreview = document.getElementById("avatarPreview");
const avatarInputFull = document.getElementById("avatarInputFull");
const avatarPreviewFull = document.getElementById("avatarPreviewFull");

const fullRegisterForm = document.getElementById("fullRegisterForm");
const bindWalletFull = document.getElementById("bindWalletFull");

/* tabs */
const tabRegister = document.getElementById("tabRegister");
const tabLogin = document.getElementById("tabLogin");

/* data */
let userProfile = JSON.parse(localStorage.getItem("hc_profile") || "null");
let walletAddress = localStorage.getItem("hc_wallet") || null;
let currentDonateProject = null;

/* ---------------- Theme handling ---------------- */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.querySelectorAll("#themeToggle").forEach((btn) => {
    if (btn)
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  });
  localStorage.setItem("hc_theme", theme);
}
(function initTheme() {
  const saved = localStorage.getItem("hc_theme");
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(saved || (prefersDark ? "dark" : "light"));
})();
document.querySelectorAll("#themeToggle").forEach((btn) =>
  btn?.addEventListener("click", () => {
    const now =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "light"
        : "dark";
    applyTheme(now);
  })
);

/* ---------------- Utilities ---------------- */
function escapeHtml(t) {
  return String(t).replace(
    /[&<>"']/g,
    (s) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        s
      ])
  );
}
function shorten(addr) {
  if (!addr) return "";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

/* ---------------- Rendering ---------------- */
function renderProjects(list = sampleProjects) {
  if (!projectGrid) return;
  projectGrid.innerHTML = "";
  projectGrid.setAttribute("aria-busy", "true");
  const query = (searchInput?.value || "").toLowerCase();
  const filter = filterSelect?.value || "all";

  const filtered = list.filter((p) => {
    if (filter === "verified" && !p.proof) return false;
    if (filter === "pending" && p.proof) return false;
    if (query && !`${p.name}`.toLowerCase().includes(query)) return false;
    return true;
  });

  if (filtered.length === 0) {
    projectGrid.innerHTML = `<div style="grid-column:1/-1;padding:24px;text-align:center;color:var(--muted)">Проекты не найдены</div>`;
    projectGrid.setAttribute("aria-busy", "false");
    return;
  }

  filtered.forEach((p) => {
    const percent = Math.min(100, Math.round((p.raised / p.goal) * 100));
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img alt="${escapeHtml(p.name)}" src="${p.img}" />
      <div class="card-body">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div style="display:flex;gap:10px;align-items:center">
            <span class="badge ${p.proof ? "green" : "yellow"}">${
      p.proof ? "Proof Verified" : "Proof Pending"
    }</span>
          </div>
        </div>
        <h3>${escapeHtml(p.name)}</h3>
        <div class="meta">
          <div>${p.raised} ETH</div>
          <div class="muted">Цель: ${p.goal} ETH</div>
        </div>
        <div class="progress"><i style="width:${percent}%"></i></div>
        <div class="actions" style="margin-top:12px">
          <button class="btn outline" data-id="${
            p.id
          }" data-action="details">Подробнее</button>
          <button class="btn primary" data-id="${
            p.id
          }" data-action="donate">Помочь</button>
        </div>
      </div>
    `;
    projectGrid.appendChild(card);
  });

  // attach listeners
  projectGrid.querySelectorAll("button[data-action]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = Number(btn.getAttribute("data-id"));
      const action = btn.getAttribute("data-action");
      if (action === "details") openDetails(id);
      if (action === "donate") donatePrompt(id);
    });
  });

  projectGrid.setAttribute("aria-busy", "false");
}

/* ---------------- Modals & Tabs ---------------- */
function showModal(el) {
  if (!el) return;
  el.classList.add("show");
  el.setAttribute("aria-hidden", "false");
  const focusable = el.querySelector("input,button,select,textarea");
  if (focusable) focusable.focus();
}
function hideModal(el) {
  if (!el) return;
  el.classList.remove("show");
  el.setAttribute("aria-hidden", "true");
}

openRegister?.addEventListener("click", () => showModal(modalRegister));
closeRegister?.addEventListener("click", () => hideModal(modalRegister));
window.addEventListener("click", (e) => {
  if (e.target === modalRegister) hideModal(modalRegister);
  if (e.target === donateModal) hideModal(donateModal);
});
document.querySelectorAll("[data-close]").forEach((btn) =>
  btn.addEventListener("click", (e) => {
    const m = btn.closest(".modal");
    if (m) hideModal(m);
  })
);

/* tabs */
tabRegister?.addEventListener("click", () => {
  tabRegister.classList.add("active");
  tabLogin.classList.remove("active");
  if (registerForm) registerForm.classList.remove("hidden");
  if (loginForm) loginForm.classList.add("hidden");
});
tabLogin?.addEventListener("click", () => {
  tabLogin.classList.add("active");
  tabRegister.classList.remove("active");
  if (registerForm) registerForm.classList.add("hidden");
  if (loginForm) loginForm.classList.remove("hidden");
});

/* ---------------- Registration logic (modal) ---------------- */
if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const bio = document.getElementById("regBio").value.trim();
    const avatarData = localStorage.getItem("hc_avatar_temp") || null;

    if (!name) return alert("Введите имя");

    userProfile = {
      name,
      email,
      bio,
      avatar: avatarData,
      created: Date.now(),
      wallet: walletAddress || null,
    };
    localStorage.setItem("hc_profile", JSON.stringify(userProfile));
    alert(`Добро пожаловать, ${name}!`);
    hideModal(modalRegister);
    renderProfileState();
  });
}

/* LOGIN (modal) */
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("loginId").value.trim();
    if (!id) return alert("Введите имя или email");
    const stored = JSON.parse(localStorage.getItem("hc_profile") || "null");
    if (stored && (stored.name === id || stored.email === id)) {
      userProfile = stored;
      alert(`Вход выполнен как ${userProfile.name}`);
      hideModal(modalRegister);
      renderProfileState();
    } else {
      alert("Профиль не найден в демо. Зарегистрируйтесь.");
    }
  });

  loginWalletBtn?.addEventListener("click", async () => {
    await connectWallet();
    // If wallet matches profile stored wallet, log in automatically
    const stored = JSON.parse(localStorage.getItem("hc_profile") || "null");
    if (
      stored &&
      stored.wallet &&
      walletAddress &&
      stored.wallet.toLowerCase() === walletAddress.toLowerCase()
    ) {
      userProfile = stored;
      alert(`Вход по кошельку: ${userProfile.name}`);
      hideModal(modalRegister);
      renderProfileState();
    } else {
      alert("Профиль с этим кошельком не найден в демо.");
    }
  });
}

/* ---------------- Avatar preview handling ---------------- */
function readImageFile(input, previewEl, storageKey = "hc_avatar_temp") {
  if (!input || !previewEl) return;
  const file = input.files && input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    previewEl.src = e.target.result;
    localStorage.setItem(storageKey, e.target.result);
  };
  reader.readAsDataURL(file);
}
avatarInput?.addEventListener("change", () =>
  readImageFile(avatarInput, avatarPreview, "hc_avatar_temp")
);
avatarInputFull?.addEventListener("change", () =>
  readImageFile(avatarInputFull, avatarPreviewFull, "hc_avatar_temp_full")
);

/* hydrate preview from storage */
(function hydrateAvatarPreviews() {
  const t = localStorage.getItem("hc_avatar_temp");
  if (t && avatarPreview) avatarPreview.src = t;
  const f = localStorage.getItem("hc_avatar_temp_full");
  if (f && avatarPreviewFull) avatarPreviewFull.src = f;
})();

/* ---------------- Full page registration (register.html) ---------------- */
if (fullRegisterForm) {
  fullRegisterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("fullName").value.trim();
    const email = document.getElementById("fullEmail").value.trim();
    const bio = document.getElementById("fullBio").value.trim();
    const links = document.getElementById("links").value.trim();
    const avatarData =
      localStorage.getItem("hc_avatar_temp_full") ||
      localStorage.getItem("hc_avatar_temp") ||
      null;

    if (!name) return alert("Введите имя");

    userProfile = {
      name,
      email,
      bio,
      links,
      avatar: avatarData,
      created: Date.now(),
      wallet: walletAddress || null,
    };
    localStorage.setItem("hc_profile", JSON.stringify(userProfile));
    alert(`Профиль создан: ${name}`);
    // redirect to index
    window.location.href = "index.html";
  });

  bindWalletFull?.addEventListener("click", async () => {
    await bindWallet();
  });
}

/* ---------------- Wallet (MetaMask) UX ---------------- */
async function connectWallet() {
  if (!window.ethereum)
    return alert("Установите MetaMask или другой Web3 кошелёк!");
  try {
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    walletAddress = accounts[0];
    localStorage.setItem("hc_wallet", walletAddress);
    alert("Кошелёк подключён: " + shorten(walletAddress));
    renderProfileState();
  } catch (err) {
    console.error(err);
    alert("Отмена подключения");
  }
}

async function bindWallet() {
  if (!window.ethereum) return alert("Установите MetaMask!");
  try {
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    walletAddress = accounts[0];
    localStorage.setItem("hc_wallet", walletAddress);

    const message = `Bind HealChain profile at ${new Date().toISOString()}`;
    try {
      const sig = await ethereum.request({
        method: "personal_sign",
        params: [message, walletAddress],
      });
      console.log("Signature:", sig);
      alert("Кошелёк привязан и подписан.");
      // save wallet in profile if exists
      const stored = JSON.parse(localStorage.getItem("hc_profile") || "null");
      if (stored) {
        stored.wallet = walletAddress;
        localStorage.setItem("hc_profile", JSON.stringify(stored));
      }
    } catch (err) {
      console.warn("User declined signature", err);
      alert("Вы отменили подпись.");
    }
    renderProfileState();
  } catch (err) {
    console.error(err);
    alert("Не удалось привязать кошелёк");
  }
}

bindWalletBtn?.addEventListener("click", async () => {
  await bindWallet();
});
connectWalletBtn?.addEventListener("click", connectWallet);

/* ---------------- Donate flow (prepared) ---------------- */
async function donatePrompt(projectId) {
  const project = sampleProjects.find((p) => p.id === projectId);
  if (!project) return alert("Проект не найден");
  currentDonateProject = project;
  if (donateProjectName) donateProjectName.textContent = project.name;
  if (donateAmountInput) donateAmountInput.value = "0.1";
  showModal(donateModal);
}

donateConfirm?.addEventListener("click", async () => {
  const amt = parseFloat(donateAmountInput.value);
  if (!amt || amt <= 0) return alert("Введите корректную сумму");

  if (!walletAddress) {
    const ok = confirm("Кошелёк не подключён. Подключиться сейчас?");
    if (ok) {
      await connectWallet();
      if (!walletAddress) return;
    } else {
      return;
    }
  }

  try {
    const to = currentDonateProject?.toAddress || walletAddress;
    const valueHex = "0x" + BigInt(Math.round(amt * 1e18)).toString(16);
    const tx = { from: walletAddress, to, value: valueHex };

    const proceed = confirm(
      `Будет отправлено ${amt} ETH на "${currentDonateProject.name}".\nПодтвердить в кошельке?`
    );
    if (!proceed) return;

    if (window.ethereum && ethereum.request) {
      const txHash = await ethereum.request({
        method: "eth_sendTransaction",
        params: [tx],
      });
      alert(`Транзакция отправлена: ${txHash}\nСпасибо!`);
      currentDonateProject.raised = parseFloat(
        (currentDonateProject.raised + amt).toFixed(6)
      );
      renderProjects();
    } else {
      alert(
        `(DEMO) Вы отправили ${amt} ETH проекту "${currentDonateProject.name}".`
      );
      currentDonateProject.raised = parseFloat(
        (currentDonateProject.raised + amt).toFixed(6)
      );
      renderProjects();
    }
  } catch (err) {
    console.error(err);
    alert("Ошибка при отправке транзакции или операция отменена.");
  } finally {
    hideModal(donateModal);
  }
});

donateCancel?.addEventListener("click", () => hideModal(donateModal));

/* details */
window.openDetails = function (id) {
  const p = sampleProjects.find((x) => x.id === id);
  if (!p) return;
  const msg = `${p.name}\n\nСобрано: ${p.raised} / ${p.goal} ETH\n\n${p.status}`;
  alert(msg);
};

/* search / filter */
searchInput?.addEventListener("input", () => renderProjects());
filterSelect?.addEventListener("change", () => renderProjects());

/* ---------------- Render profile state in header ---------------- */
function renderProfileState() {
  const headerBtn = document.getElementById("connectWallet");
  if (walletAddress) {
    if (headerBtn) {
      headerBtn.textContent = `Кошелёк: ${shorten(walletAddress)}`;
      headerBtn.classList.remove("primary");
      headerBtn.classList.add("outline");
    }
  } else {
    if (headerBtn) {
      headerBtn.textContent = "Подключить кошелёк";
      headerBtn.classList.remove("outline");
      headerBtn.classList.add("primary");
    }
  }

  // optionally show avatar or name in header (can be extended)
  const stored = JSON.parse(localStorage.getItem("hc_profile") || "null");
  if (stored && stored.name) {
    // simple visual: change brand tag to user name (non-invasive)
    const tag = document.querySelector(".brand-text .tag");
    if (tag) tag.textContent = stored.name;
  }
}

/* ---------------- Hydrate profile on load ---------------- */
(function init() {
  userProfile = JSON.parse(localStorage.getItem("hc_profile") || "null");
  walletAddress = localStorage.getItem("hc_wallet") || null;
  renderProjects();
  renderProfileState();
})();
