'use client';
import { Web3Storage } from 'web3.storage';


export function getIPFSClient() {
    const token = process.env.NEXT_PUBLIC_WEB3STORAGE_TOKEN;
    if (!token) throw new Error('Missing NEXT_PUBLIC_WEB3STORAGE_TOKEN');
    return new Web3Storage({ token });
}


export async function uploadToIPFS(file) {
    const client = getIPFSClient();
    const cid = await client.put([file], { wrapWithDirectory: false });
    return cid; // ipfs CID
}