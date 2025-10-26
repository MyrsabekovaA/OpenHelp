'use client';
import { useState } from 'react';
import { uploadToIPFS } from '../lib/ipfs';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { DONATION_ABI } from '../lib/abi';
import { CONTRACT_ADDRESS } from '../lib/web3';


export default function CreatePage(){
    const [file, setFile] = useState(null);
    const [cid, setCid] = useState('');
    const { writeContract, data: hash, isPending } = useWriteContract();
    const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });


    async function handleUpload(){
        if(!file) return alert('Attach a description file (PDF/IMG/TXT)');
        const c = await uploadToIPFS(file);
        setCid(c);
    }


    function create(){
        if(!cid) return alert('Upload description to IPFS first');
        writeContract({ address: CONTRACT_ADDRESS, abi: DONATION_ABI, functionName: 'createProject', args: [cid] });
    }

    return (
        <div className="max-w-xl mx-auto glass rounded-2xl p-6 space-y-4">
            <h1 className="text-2xl font-semibold">Create a Project (Role: Fund)</h1>
            <input type="file" className="input" onChange={e=>setFile(e.target.files?.[0]||null)} />
            <button onClick={handleUpload} className="btn btn-muted">Upload to IPFS</button>
            {cid && <p className="text-sm text-green-300">Uploaded: <a className="underline" target="_blank" href={`https://ipfs.io/ipfs/${cid}`}>{cid}</a></p>}
            <button onClick={create} disabled={isPending||isLoading} className="btn btn-brand w-full">{isPending||isLoading? 'Creating...' : 'Create Project'}</button>
            {isSuccess && <p className="text-green-400">✔ Project created</p>}
        </div>
    );
}