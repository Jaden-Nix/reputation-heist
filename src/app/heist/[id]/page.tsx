'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Terminal from '@/components/ui/Terminal';
import { motion } from 'framer-motion';
import { Skull, AlertTriangle, CheckCircle, Clock, TrendingUp, Shield } from 'lucide-react';
import { LEGENDARY_HEISTS } from '@/lib/seedData';
import Link from 'next/link';
import { useReadContract, useWriteContract } from 'wagmi';
import { BASE_HEIST_ADDRESS, BASE_HEIST_ABI } from '@/lib/contracts';
import { formatEther, parseEther } from 'viem';
import LiveChat from '@/components/game/LiveChat';
import HypeButton from '@/components/game/HypeButton';
import { toast } from 'sonner';
import { useEthosReputation } from '@/hooks/useEthosReputation';

export default function HeistRoom() {
    const params = useParams();
    const rawId = params.id as string;
    const isMockId = rawId.startsWith('h-');
    const heistId = isMockId ? BigInt(999999) : BigInt(rawId);

    const { data: heistData, isLoading: isHeistLoading } = useReadContract({
        address: BASE_HEIST_ADDRESS,
        abi: BASE_HEIST_ABI,
        functionName: 'heists',
        args: [heistId],
        query: { enabled: !isMockId }
    });

    const heist = !isMockId && heistData ? {
        id: heistData[0].toString(),
        player1: { name: heistData[1], address: heistData[1] },
        player2: { name: heistData[2], address: heistData[2] },
        bounty: formatEther(heistData[3]),
        collateral: formatEther(heistData[4]),
        dare: heistData[5],
        status: ['CREATED', 'JUDGING', 'SETTLED', 'ESCROW', 'DISPUTED'][heistData[6]] as any,
        verdict: heistData[8],
        confidence: heistData[9],
        totalBetsP1: formatEther(heistData[14]),
        totalBetsP2: formatEther(heistData[15])
    } : LEGENDARY_HEISTS.find(h => h.id === rawId) || null;

    const [status, setStatus] = useState<'ACTIVE' | 'JUDGING' | 'SETTLED' | 'ESCROW'>('ACTIVE');
    const [proof, setProof] = useState('');
    const [logs, setLogs] = useState<string[]>(["> Initializing Heist Protocol...", "Waiting for proof submission..."]);
    const [verdict, setVerdict] = useState<any>(null);
    const { writeContract: placeBetTx } = useWriteContract();

    useEffect(() => {
        if (heist?.status && !isMockId) setStatus(heist.status === 'CREATED' ? 'ACTIVE' : heist.status);
    }, [heist, isMockId]);

    const betPoolP1 = heist?.totalBetsP1 ? parseFloat(heist.totalBetsP1) : 0;
    const betPoolP2 = heist?.totalBetsP2 ? parseFloat(heist.totalBetsP2) : 0;

    const handleBet = (side: 'P1' | 'P2') => {
        try {
            placeBetTx({
                address: BASE_HEIST_ADDRESS,
                abi: BASE_HEIST_ABI,
                functionName: 'placeBet',
                args: [heistId, side === 'P1'],
                value: parseEther('0.05')
            });
            addLog(`> Bet transaction sent for ${side === 'P1' ? 'Challenger' : 'Daredevil'}...`);
            toast.success('TRANSACTION_INITIALIZED', { description: 'Awaiting confirmation...' });
        } catch (err) {
            toast.error('UPLINK_FAILURE');
        }
    };

    const { score: ethosScore, loading: isEthosLoading } = useEthosReputation(heist?.player1.address || '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!proof) { toast.error('INPUT_REQUIRED'); return; }
        setStatus('JUDGING');
        addLog(`> Proof received: ${proof}`);
        try {
            const res = await fetch('/api/judge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ heistId: heist?.id, proofUrl: proof }),
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            addLog(`> AI: ${data.intro_line}`);
            setTimeout(() => {
                setVerdict(data.data);
                setStatus(data.data.confidence_score < 80 ? 'ESCROW' : 'SETTLED');
            }, 3000);
        } catch (err) {
            addLog("> ERROR: CONNECTION_LOST");
        }
    };

    const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

    if (isHeistLoading || !heist) return <div className="p-20 text-center font-mono animate-pulse text-neon-cyan">ACCESSING ENCRYPTED ARCHIVES...</div>;

    return (
        <main className={`min-h-screen p-8 transition-colors duration-1000 ${status === 'ACTIVE' ? 'bg-heist-bg' : 'bg-black'}`}>
            <header className="flex justify-between items-center mb-12">
                <Link href="/bounty-board" className="text-zinc-500 hover:text-white font-mono uppercase">← Abort Mission</Link>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-red-500 font-bold tracking-widest">LIVE SESSION</span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                <div className="space-y-8">
                    <div className="bg-heist-panel border border-zinc-800 p-8 relative overflow-hidden">
                        <h1 className="text-4xl font-black italic text-white mb-4 uppercase">{heist.dare}</h1>
                        <div className="flex justify-between text-sm font-mono text-zinc-400 border-t border-zinc-800 pt-4">
                            <div><div className="text-xs text-zinc-600">CHALLENGER</div><div className="text-white font-bold">{heist.player1.name}</div></div>
                            <div className="text-right"><div className="text-xs text-zinc-600">BOUNTY</div><div className="text-neon-cyan font-bold text-xl">{heist.bounty} ETH</div></div>
                        </div>
                    </div>
                    <Terminal logs={logs} className="shadow-2xl" />
                    <div className="bg-zinc-900/50 p-6 border border-zinc-800 rounded-none relative overflow-hidden group">
                        <div className="text-[10px] text-purple-400 font-mono mb-2 uppercase tracking-widest flex items-center gap-2"><Shield size={12} /> Ethos Scan</div>
                        <div className="text-4xl font-black text-white">{isEthosLoading ? '...' : ethosScore}</div>
                        <div className="text-[9px] text-zinc-500 font-mono mt-1 uppercase">Verified on Base</div>
                    </div>
                    <div className="pt-8 border-t border-zinc-800"><HypeButton /></div>
                </div>

                <div className="flex flex-col gap-6">
                    {status === 'ACTIVE' && (
                        <div className="bg-zinc-900/50 p-8 border border-zinc-700 backdrop-blur-sm">
                            <form onSubmit={handleSubmit}>
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Clock className="text-neon-cyan" /> SUBMIT PROOF</h2>
                                <input type="text" value={proof} onChange={(e) => setProof(e.target.value)} placeholder="Paste URL..." className="w-full bg-black border border-zinc-600 p-4 text-white focus:border-neon-cyan outline-none font-mono mb-4" />
                                <button className="w-full bg-neon-cyan text-black font-black uppercase py-4 text-xl shadow-[0_0_20px_rgba(0,243,255,0.4)]">LOCK IN SUBMISSION</button>
                            </form>
                        </div>
                    )}
                    {status === 'SETTLED' && verdict && (
                        <div className={`p-8 border-l-4 ${verdict.winner_is_p1 ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'}`}>
                            <h2 className="text-4xl font-black italic mb-2 uppercase">{verdict.winner_is_p1 ? 'MISSION ACCOMPLISHED' : 'MISSION FAILED'}</h2>
                            <p className="font-mono text-zinc-300">{verdict.verdict_text}</p>
                        </div>
                    )}
                    <div className="h-[400px]"><LiveChat /></div>
                </div>
            </div>
        </main>
    );
}
