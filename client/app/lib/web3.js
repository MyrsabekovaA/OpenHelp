'use client';
import { createConfig, http } from 'wagmi';
import { sepolia } from 'viem/chains';
import { injected } from '@wagmi/core';


export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
const RPC = process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.drpc.org';


export const config = createConfig({
    chains: [sepolia],
    transports: { [sepolia.id]: http(RPC) },
    connectors: [injected()] // простой MetaMask коннектор без сторонних ключей
});