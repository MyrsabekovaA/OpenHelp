
    async function ensureSepoliaNetwork() {
    if (!window.ethereum) throw new Error("MetaMask не установлен");
    const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
    const chainId = parseInt(chainIdHex, 16);
    if (chainId !== window.CHAIN.ID) {
    try {
    await window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: '0xaa36a7' }], // 11155111
});
} catch (e) {
    if (e.code === 4902) {
    await window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [{
    chainId: '0xaa36a7',
    chainName: 'Sepolia',
    nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: [window.CHAIN.RPC],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
}],
});
} else { throw e; }
}
}
}

    async function getProviderAndSigner() {
    await ensureSepoliaNetwork();
    const provider = new ethers.providers.Web3Provider(window.ethereum, "sepolia");
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    return { provider, signer };
}

    function getContract(signerOrProvider) {
    return new ethers.Contract(window.CONTRACT_ADDRESS, window.DONATION_ABI, signerOrProvider);
}

    // простейшая «загрузка» в IPFS-заглушку (для хака). Вернёт «псевдо-CID».
    async function uploadToIPFSMock(file) {
    return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
    // эмулируем CID как хеш от base64 длины
    const base64 = reader.result.split(',')[1] || '';
    resolve(`mockcid-${file.name}-${base64.length}`);
};
    reader.readAsDataURL(file);
});
}
