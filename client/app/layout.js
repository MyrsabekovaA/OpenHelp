import './globals.css';
import { WagmiProvider } from 'wagmi';
import { config } from './lib/web3';


export const metadata = { title: 'ChainCharity', description: 'Transparent on-chain charity' };


export default function RootLayout({ children }) {
    return (
        <html lang="en">
        <body>
        <WagmiProvider config={config}>
            <main className="min-h-screen">
                <header className="sticky top-0 z-10 backdrop-blur-md bg-bg/60 border-b border-white/10">
                    <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
                        <div className="text-xl font-semibold">ChainCharity</div>
                        <WalletConnect />
                    </div>
                </header>
                <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>
            </main>
        </WagmiProvider>
        </body>
        </html>
    );
}


function WalletConnect() {
    return (
        <button onClick={async ()=>{
            if (typeof window !== 'undefined' && window.ethereum) {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
            } else {
                alert('Install MetaMask');
            }
        }} className="btn btn-muted">Connect Wallet</button>
    );
}