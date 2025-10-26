'use client';
import { useEffect, useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { DONATION_ABI } from './lib/abi';
import { CONTRACT_ADDRESS } from './lib/web3';
import Link from 'next/link';
import { formatEther, parseEther } from 'viem';

export default function HomePage(){
    const [ids, setIds] = useState([]);
    const { address } = useAccount();
    const { data: nextId } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: DONATION_ABI,
        functionName: 'nextProjectId'
    });


    useEffect(()=>{
        if(!nextId) return;
        const n = Number(nextId);
        const arr = Array.from({length: n-1}, (_,i)=> i+1); // ids 1..n-1
        setIds(arr.reverse());
    },[nextId]);


    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Open Projects</h1>
                <Link className="btn btn-brand" href="/create">Create Project</Link>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                {ids.length===0 && (
                    <div className="text-white/60">No projects yet. Be the first to create one.</div>
                )}
                {ids.map(id=> <ProjectCard key={id} id={id} />)}
            </div>
        </div>
    );
}

function ProjectCard({id}){
    const { data } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: DONATION_ABI,
        functionName: 'getProject',
        args: [BigInt(id)]
    });
    const { writeContract, data: txHash, isPending } = useWriteContract();
    const { isSuccess } = useWaitForTransactionReceipt({ hash: txHash });


    if(!data) return <div className="glass rounded-2xl p-6">Loading...</div>
    const [owner, descriptionHash, proofHash, balance] = data;


    return (
        <div className="glass rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">Project #{id}</span>
                <span className="text-xs px-2 py-1 rounded bg-white/10">Owner: {owner.slice(0,6)}...{owner.slice(-4)}</span>
            </div>
            <p className="text-white/90 break-all">Description IPFS CID: <a className="underline" href={`https://ipfs.io/ipfs/${descriptionHash}`} target="_blank" rel="noreferrer">{descriptionHash}</a></p>
            {proofHash && (
                <p className="text-green-300">Proof: <a className="underline" href={`https://ipfs.io/ipfs/${proofHash}`} target="_blank" rel="noreferrer">{proofHash}</a></p>
            )}
            <div className="flex items-center justify-between text-white/80">
                <span>Balance: {formatEther(balance)} ETH</span>
                <Link href={`/project/${id}`} className="btn btn-muted">Open</Link>
            </div>
            <DonateInline id={id} writeContract={writeContract} isPending={isPending} isSuccess={isSuccess} />
        </div>
    );
}

function DonateInline({id, writeContract, isPending, isSuccess}){
    const [amount, setAmount] = useState('0.01');
    return (
        <div className="flex gap-2">
            <input className="input" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Amount in ETH" />
            <button
                onClick={()=>{
                    writeContract({
                        address: CONTRACT_ADDRESS,
                        abi: DONATION_ABI,
                        functionName: 'donate',
                        args: [BigInt(id)],
                        value: parseEther(amount || '0')
                    })
                }}
                disabled={isPending}
                className="btn btn-brand">
                {isPending? 'Sending...' : 'Donate'}
            </button>
            {isSuccess && <span className="text-green-400 self-center">✔️ Success</span>}
        </div>
    );
}