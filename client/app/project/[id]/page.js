'use client';
import { useParams } from 'next/navigation';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { DONATION_ABI } from '../../lib/abi';
import { CONTRACT_ADDRESS } from '../../lib/web3';
import { formatEther, parseEther } from 'viem';
import { useState } from 'react';
import { uploadToIPFS } from '../../lib/ipfs';

export default function ProjectPage(){
    const [proofFile, setProofFile] = useState(null);
    const [proofCid, setProofCid] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('0.01');


    if(!data) return <div className="glass rounded-2xl p-6">Loading...</div>;
    const [owner, descriptionHash, proofHash, balance] = data;
    const isOwner = owner?.toLowerCase() === address?.toLowerCase();


    async function uploadProof(){
        if(!proofFile) return alert('Attach a proof file');
        const cid = await uploadToIPFS(proofFile);
        setProofCid(cid);
    }


    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="glass rounded-2xl p-6 space-y-2">
                <h1 className="text-2xl font-semibold">Project #{id}</h1>
                <p className="text-white/60">Owner: {owner}</p>
                <p>Description: <a className="underline" href={`https://ipfs.io/ipfs/${descriptionHash}`} target="_blank">{descriptionHash}</a></p>
                {proofHash && <p>Proof: <a className="underline" href={`https://ipfs.io/ipfs/${proofHash}`} target="_blank">{proofHash}</a></p>}
                <p className="text-white/80">Balance: {formatEther(balance)} ETH</p>
            </div>


            <div className="glass rounded-2xl p-6 space-y-3">
                <h2 className="text-xl font-semibold">Donate</h2>
                <div className="flex gap-2">
                    <input className="input" value={donateAmount} onChange={e=>setDonateAmount(e.target.value)} />
                    <button
                        className="btn btn-brand"
                        disabled={isPending}
                        onClick={()=>{
                            writeContract({ address: CONTRACT_ADDRESS, abi: DONATION_ABI, functionName: 'donate', args: [BigInt(id)], value: parseEther(donateAmount || '0') });
                        }}>Send</button>
                </div>
                {isSuccess && <p className="text-green-400">✔ Donation sent</p>}
            </div>


            {isOwner && (
                <div className="glass rounded-2xl p-6 space-y-4">
                    <h2 className="text-xl font-semibold">Owner Actions</h2>


                    <div className="space-y-2">
                        <label className="text-sm text-white/70">Upload proof to IPFS</label>
                        <input type="file" className="input" onChange={e=>setProofFile(e.target.files?.[0]||null)} />
                        <div className="flex gap-2">
                            <button className="btn btn-muted" onClick={uploadProof}>Upload</button>
                            {proofCid && <button className="btn btn-brand" onClick={()=>{
                                writeContract({ address: CONTRACT_ADDRESS, abi: DONATION_ABI, functionName: 'updateProof', args: [BigInt(id), proofCid] });
                            }}>Save CID</button>}
                        </div>
                        {proofCid && <p className="text-green-300">Uploaded: <a className="underline" href={`https://ipfs.io/ipfs/${proofCid}`} target="_blank">{proofCid}</a></p>}
                    </div>


                    <div className="space-y-2">
                        <label className="text-sm text-white/70">Withdraw amount (ETH)</label>
                        <div className="flex gap-2">
                            <input className="input" value={withdrawAmount} onChange={e=>setWithdrawAmount(e.target.value)} />
                            <button className="btn btn-brand" onClick={()=>{
                                writeContract({ address: CONTRACT_ADDRESS, abi: DONATION_ABI, functionName: 'withdraw', args: [BigInt(id), parseEther(withdrawAmount || '0')] });
                            }}>Withdraw</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}