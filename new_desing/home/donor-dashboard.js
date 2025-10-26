let signer, contract, selectedProjectId = null, donorAddress = null;

  (async function init() {
  try {
  const { signer: _signer } = await getProviderAndSigner();
  signer = _signer;
  donorAddress = await signer.getAddress();
  contract = getContract(signer);

  document.getElementById('closeDonate').onclick = () => document.getElementById('donateModal').close();
  document.getElementById('donateForm').addEventListener('submit', onDonate);

  await renderCatalog();
} catch (e) {
  console.error(e);
  alert(e.message || 'Ошибка инициализации');
}
})();

  async function renderCatalog() {
  const wrap = document.getElementById('projects');
  wrap.innerHTML = 'Загрузка...';

  const nextId = await contract.nextProjectId();
  const n = Number(nextId);
  if (n <= 1) { wrap.innerHTML = '<div class="opacity-70">Пока нет проектов</div>'; return; }

  wrap.innerHTML = '';
  for (let id = n - 1; id >= 1; id--) {
  const p = await contract.getProject(id);
  const meta = HCStorage.getProjectMeta(id) || {};
  const balanceEth = ethers.utils.formatEther(p.balance);
  const donations = HCStorage.getDonations(id);

  const card = document.createElement('div');
  card.className = 'rounded-xl bg-white/5 p-4 space-y-2';
  card.innerHTML = `
      <div class="flex justify-between items-center">
        <div class="text-lg font-semibold">${meta.title || `Project #${id}`}</div>
        <div class="text-sm opacity-80">#${id}</div>
      </div>
      <div>Владелец: <span class="font-mono">${p.owner.slice(0,6)}...${p.owner.slice(-4)}</span></div>
      <div>Описание: <a class="underline" href="https://ipfs.io/ipfs/${p.descriptionHash}" target="_blank">${p.descriptionHash}</a></div>
      ${p.proofHash ? `<div>Proof: <a class="underline" href="https://ipfs.io/ipfs/${p.proofHash}" target="_blank">${p.proofHash}</a></div>` : ''}
      <div>Баланс: <b>${balanceEth} ETH</b>${meta.goalEth ? ` / цель ${meta.goalEth} ETH` : ''}</div>

      <button class="px-4 py-2 rounded bg-indigo-600 w-full" data-d="${id}">Пожертвовать</button>

      <div class="pt-2">
        <div class="text-sm opacity-80 mb-1">Недавние донаты:</div>
        <div id="don-${id}" class="space-y-1">${renderDonationsHtml(donations)}</div>
      </div>
    `;
  wrap.appendChild(card);
  card.querySelector(`[data-d="${id}"]`).onclick = () => openDonate(id, meta.title);
}
}

  function renderDonationsHtml(list) {
  if (!list || !list.length) return '<div class="text-white/60 text-sm">Пока нет донатов.</div>';
  return list.slice(-3).reverse().map(d =>
  `<div class="rounded bg-white/10 px-3 py-2 text-sm">
       <div><b>${d.amountEth} ETH</b> — от ${d.donor.slice(0,6)}...${d.donor.slice(-4)}</div>
       <div class="opacity-70">tx: <a class="underline" href="https://sepolia.etherscan.io/tx/${d.txHash}" target="_blank">${d.txHash.slice(0,10)}...</a> · ${new Date(d.ts).toLocaleString()}</div>
     </div>`
  ).join('');
}

  function openDonate(id, title) {
  selectedProjectId = id;
  document.getElementById('donateTitle').textContent = `Поддержать ${title || `Project #${id}`}`;
  document.getElementById('donateAmount').value = '0.01';
  document.getElementById('donateModal').showModal();
}

  async function onDonate(e) {
  e.preventDefault();
  const amountEth = parseFloat((document.getElementById('donateAmount').value || '').trim());
  if (!selectedProjectId || !(amountEth > 0)) { alert('Введите сумму'); return; }

  const wei = ethers.utils.parseEther(String(amountEth));
  const tx = await contract.donate(selectedProjectId, { value: wei });
  await tx.wait();

  // локально пишем историю донатов (для быстрого UI)
  HCStorage.addDonation(selectedProjectId, {
  amountEth,
  donor: donorAddress,
  txHash: tx.hash,
  ts: Date.now(),
});

  document.getElementById('donateModal').close();
  alert('Спасибо за поддержку ❤️');

  // обновим карточку (баланс и список донатов)
  await renderCatalog();
}