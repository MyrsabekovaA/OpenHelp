 const LS = {
    profile: 'hc_profile',             // объект текущего пользователя (фонд)
    profiles: 'hc_profiles',           // список фондов (для каталога/поиска)
    projectsMeta: 'hc_projects_meta',  // { [projectId]: {title, goalEth, category, owner, descriptionCid, createdAt} }
    expenses: 'hc_expenses',           // { [projectId]: [ {amountEth, reason, txHash, ts} ] }
    donations: 'hc_donations',         // { [projectId]: [ {amountEth, donor, txHash, ts} ] }
};

    function load(key, fallback) {
    try {return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));}
    catch {return fallback;}
}
    function save(key, val) {localStorage.setItem(key, JSON.stringify(val));}

    /** Профиль фонда */
    function getProfile() {return load(LS.profile, null);}
    function setProfile(p) {save(LS.profile, p);}

    /** Создаёт/обновляет мок-профиль фонда и добавляет его в список фондов */
    function upsertFundProfileMock(wallet, name, email) {
    const profile = {role: 'fund', wallet, name, email, created: Date.now(), mock: true};
    setProfile(profile);
    const list = load(LS.profiles, []);
    if (!list.find(x => x.wallet?.toLowerCase() === wallet.toLowerCase())) {
    list.push({wallet, name, email});
    save(LS.profiles, list);
}
    return profile;
}

    /** Метаданные проектов (для UI, не ончейн) */
    function getProjectsMeta() {return load(LS.projectsMeta, {});}
    function setProjectMeta(projectId, meta) {
    const all = getProjectsMeta();
    all[projectId] = {...(all[projectId] || {}), ...meta};
    save(LS.projectsMeta, all);
}
    function getProjectMeta(projectId) {return getProjectsMeta()[projectId] || null;}

    /** Расходы (история «на что ушли деньги») */
    function addExpense(projectId, expense) {
    const all = load(LS.expenses, {});
    all[projectId] = all[projectId] || [];
    all[projectId].push(expense);
    save(LS.expenses, all);
}
    function getExpenses(projectId) {
    const all = load(LS.expenses, {});
    return all[projectId] || [];
}

    /** Донаты (для быстрой отрисовки истории на клиенте) */
    function addDonation(projectId, donation) {
    const all = load(LS.donations, {});
    all[projectId] = all[projectId] || [];
    all[projectId].push(donation);
    save(LS.donations, all);
}
    function getDonations(projectId) {
    const all = load(LS.donations, {});
    return all[projectId] || [];
}

    window.HCStorage = {
    LS,
    getProfile, setProfile, upsertFundProfileMock,
    getProjectsMeta, setProjectMeta, getProjectMeta,
    addExpense, getExpenses,
    addDonation, getDonations,
};