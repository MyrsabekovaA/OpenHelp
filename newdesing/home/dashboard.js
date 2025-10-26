let signer, contract, wallet;
  let selectedProjectIdForWithdraw = null;

  (async function init() {
  try {
  const { signer: _signer } = await getProviderAndSigner();
  signer = _signer;
  wallet = await signer.getAddress();
  contract = getContract(signer);

  const profile = HCStorage.getProfile() || { role: 'fund', wallet };
  document.getElementById('accountBox').innerHTML =
  `<div>Адрес: <span class="font-mono">${wallet}</span></div>
       <div>Роль: <b>${profile.role || 'fund'}</b>${profile.mock ? ' (mock)' : ''}</div>`;

  // UI events
  document.getElementById('openCreateProject').onclick = () => document.getElementById('createModal').showModal();
  document.getElementById('closeCreate').onclick = () => document.getElementById('createModal').close();
  document.getElementById('closeWithdraw').onclick = () => document.getElementById('withdrawModal').close();

  document.getElementById('createProjectForm').addEventListener('submit', onCreateProject);
  document.getElementById('withdrawForm').addEventListener('submit', onWithdrawRequest);

  await renderProjects();
} catch (e) {
  console.error(e);
  alert(e.message || 'Ошибка инициализации');
}
})();

  async function onCreateProject(e) {
  e.preventDefault();
  const title = document.getElementById('pTitle').value.trim();
  const category = document.getElementById('pCategory').value.trim();
  const goalStr = document.getElementById('pGoal').value.trim();
  const file = document.getElementById('pDoc').files[0];

  if (!title || !goalStr || !file) { alert('Заполните название, цель и приложите файл'); return; }

  // 1) загрузка описания (mock IPFS) → cid
  const cid = await uploadToIPFSMock(file);

  // 2) ончейн: createProject(cid)
  const tx = await contract.createProject(cid);
  await tx.wait();

  // 3) получаем projectId = nextProjectId - 1
  const nextId = await contract.nextProjectId();
  const projectId = Number(nextId) - 1;

  // 4) сохраняем метаданные в LS для UI
  HCStorage.setProjectMeta(projectId, {
  title,
  category,
  goalEth: parseFloat(goalStr),
  owner: wallet,
  descriptionCid: cid,
  createdAt: Date.now(),
});

  document.getElementById('createModal').close();
  await renderProjects();
  alert(`Проект #${projectId} создан`);
}

  async function renderProjects() {
  const listEl = document.getElementById('projectsList');
  listEl.innerHTML = 'Загрузка...';

  const projects = [];
  const nextId = await contract.nextProjectId();
  const n = Number(nextId);
  for (let id = 1; id < n; id++) {
  const p = await contract.getProject(id);
  if (p.owner.toLowerCase() === wallet.toLowerCase()) {
  const meta = HCStorage.getProjectMeta(id) || {};
  projects.push({ id, chain: p, meta, expenses: HCStorage.getExpenses(id) });
}
}

  if (projects.length === 0) {
  listEl.innerHTML = '<div class="text-white/70">У вас пока нет проектов.</div>';
  return;
}

  listEl.innerHTML = '';
  for (const it of projects) {
  const balanceEth = ethers.utils.formatEther(it.chain.balance);
  const title = it.meta.title || `Project #${it.id}`;
  const goalText = it.meta.goalEth ? ` / цель ${it.meta.goalEth} ETH` : '';
  const proof = it.chain.proofHash
  ? `<div>Proof: <a class="underline" href="https://ipfs.io/ipfs/${it.chain.proofHash}" target="_blank">${it.chain.proofHash}</a></div>`
  : '';

  const card = document.createElement('div');
  card.className = 'rounded-xl bg-white/5 p-4 space-y-2';
  card.innerHTML = `
      <div class="flex justify-between items-center">
        <div class="text-lg font-semibold">${title}</div>
        <div class="text-sm opacity-80">#${it.id}</div>
      </div>
      <div>Описание: <a class="underline" href="https://ipfs.io/ipfs/${it.chain.descriptionHash}" target="_blank">${it.chain.descriptionHash}</a></div>
      ${proof}
      <div>Баланс: <b>${balanceEth} ETH</b>${goalText}</div>
      <div class="flex gap-2 pt-1">
        <button class="px-3 py-2 rounded bg-green-600" data-w="${it.id}">Запросить вывод</button>
        <button class="px-3 py-2 rounded bg-indigo-700" data-p="${it.id}">Обновить proof</button>
      </div>
      <div class="pt-2">
        <div class="text-sm opacity-80 mb-1">История расходов:</div>
        <div id="exp-${it.id}" class="space-y-1"></div>
      </div>
    `;
  listEl.appendChild(card);

  card.querySelector(`[data-w="${it.id}"]`).onclick = () => openWithdrawModal(it.id);
  card.querySelector(`[data-p="${it.id}"]`).onclick = () => updateProofFlow(it.id);

  renderExpenses(it.id);
}
}

  function renderExpenses(projectId) {
  const holder = document.getElementById(`exp-${projectId}`);
  const items = HCStorage.getExpenses(projectId);
  if (!items.length) {
  holder.innerHTML = '<div class="text-white/60 text-sm">Пока нет расходов.</div>';
  return;
}
  holder.innerHTML = '';
  for (const e of items.slice().reverse()) {
  const div = document.createElement('div');
  div.className = 'rounded bg-white/10 px-3 py-2 text-sm';
  div.innerHTML = `
      <div><b>${e.amountEth} ETH</b> — ${e.reason}</div>
      <div class="opacity-70">tx: <a class="underline" href="https://sepolia.etherscan.io/tx/${e.txHash}" target="_blank">${e.txHash.slice(0,10)}...</a> · ${new Date(e.ts).toLocaleString()}</div>
    `;
  holder.appendChild(div);
}
}

  function openWithdrawModal(projectId) {
  selectedProjectIdForWithdraw = projectId;
  document.getElementById('wAmount').value = '';
  document.getElementById('wReason').value = '';
  document.getElementById('withdrawModal').showModal();
}

  async function onWithdrawRequest(e) {
  e.preventDefault();
  const amountEth = parseFloat((document.getElementById('wAmount').value || '').trim());
  const reason = document.getElementById('wReason').value.trim();

  if (!selectedProjectIdForWithdraw || !(amountEth > 0) || !reason) {
  alert('Введите сумму и причину');
  return;
}

  const wei = ethers.utils.parseEther(String(amountEth));
  const tx = await contract.withdraw(selectedProjectIdForWithdraw, wei);
  await tx.wait();

  HCStorage.addExpense(selectedProjectIdForWithdraw, {
  amountEth,
  reason,
  txHash: tx.hash,
  ts: Date.now(),
});

  document.getElementById('withdrawModal').close();
  renderExpenses(selectedProjectIdForWithdraw);
  await renderProjects();
  alert('Вывод выполнен и записан в историю расходов');
}

  async function updateProofFlow(projectId) {
  const cid = prompt("Вставьте новый proof CID (или отмените):");
  if (!cid) return;
  const tx = await contract.updateProof(projectId, cid);
  await tx.wait();
  alert('Proof обновлён');
  await renderProjects();
}