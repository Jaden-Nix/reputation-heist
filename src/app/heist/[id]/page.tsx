'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Terminal from '@/components/ui/Terminal';
import { motion } from 'framer-motion';
import { Skull, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { LEGENDARY_HEISTS } from '@/lib/seedData';
import Link from 'next/link';
import { useReadContract, useWriteContract } from 'wagmi';
import { BASE_HEIST_ADDRESS, BASE_HEIST_ABI } from '@/lib/contracts';
import { formatEther, parseEther } from 'viem';
import LiveChat from '@/components/game/LiveChat';
import HypeButton from '@/components/game/HypeButton';

import { toast } from 'sonner';

export default function HeistRoom() {
    const params = useParams();
    const rawId = params.id as string;

    // Check if handling Legacy Mock ID or Real Contract ID
    const isMockId = rawId.startsWith('h-');
    const heistId = isMockId ? BigInt(999999) : BigInt(rawId); // Fallback for hook safety

    // Fetch Heist Data (Hook always runs)
    const { data: heistData, isLoading: isHeistLoading } = useReadContract({
        address: BASE_HEIST_ADDRESS,
        abi: BASE_HEIST_ABI,
        functionName: 'heists',
        args: [heistId],
        query: {
            enabled: !isMockId
        }
    });

    // Resolve Heist Object (Real or Mock)
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

    // Sync Contract Status to UI Status
    useEffect(() => {
        if (heist?.status && !isMockId) setStatus(heist.status === 'CREATED' ? 'ACTIVE' : heist.status);
    }, [heist, isMockId]);

    const [proof, setProof] = useState('');
    const [logs, setLogs] = useState<string[]>([
        "> Initializing Heist Protocol...",
        "Waiting for proof submission...",
    ]);
    const [verdict, setVerdict] = useState<any>(null);

    // Betting State
    const { writeContract: placeBetTx } = useWriteContract();

    const betPoolP1 = heist?.totalBetsP1 ? parseFloat(heist.totalBetsP1) : 0;
    const betPoolP2 = heist?.totalBetsP2 ? parseFloat(heist.totalBetsP2) : 0;
    const [userBet, setUserBet] = useState(0); // TODO: Fetch user specific bet if needed

    const handleBet = (side: 'P1' | 'P2') => {
        try {
            placeBetTx({
                address: BASE_HEIST_ADDRESS,
                abi: BASE_HEIST_ABI,
                functionName: 'placeBet',
                args: [heistId, side === 'P1'], // true = P1, false = P2
                value: parseEther('0.05') // Hardcoded demo wager
            });
            addLog(`> Bet transaction sent for ${side === 'P1' ? 'Challenger' : 'Daredevil'}...`);
            toast.success('TRANSACTION_INITIALIZED', {
                description: 'Awaiting blockchain confirmation...',
                className: 'font-mono uppercase'
            });
        } catch (err) {
            toast.error('UPLINK_FAILURE', {
                description: 'Transaction was rejected or failed.',
                className: 'font-mono uppercase'
            });
        }
    };

    if (isHeistLoading || !heist) return <div className="p-20 text-center font-mono animate-pulse text-neon-cyan">ACCESSING ENCRYPTED ARCHIVES...</div>;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!proof) {
            toast.error('INPUT_REQUIRED', {
                description: 'You must provide a proof URL to continue.',
                className: 'font-mono uppercase'
            });
            return;
        }
        setStatus('JUDGING');
        addLog(`> Proof received: ${proof}`);
        addLog("Encrypting submission...");
        addLog("Transmitting to Heist Master Oracle...");

        // Call API
        try {
            const res = await fetch('/api/judge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ heistId: heist.id, proofUrl: proof }),
            });
            
            if (!res.ok) throw new Error('API_ERROR');
            
            const data = await res.json();

            // Simulate stream of "thoughts"
            addLog(`> AI: ${data.intro_line}`);
            setTimeout(() => addLog("Scanning for fraud..."), 1000);
            setTimeout(() => addLog("Checking Ethos graph overlap..."), 2000);

            setTimeout(() => {
                setVerdict(data.data);
                if (data.data.confidence_score < 80) {
                    setStatus('ESCROW');
                    addLog("> WARNING: LOW CONFIDENCE SCORE DETECTED.");
                    addLog(`> Confidence: ${data.data.confidence_score}% (Threshold: 80%)`);
                    addLog("> Heist flagged for JURY REVIEW.");
                } else {
                    setStatus('SETTLED');
                    addLog(`> VERDICT FINALIZED: ${data.data.winner_is_p1 ? "WINNER" : "SLASHED"}`);
                }
            }, 3000);

        } catch (err) {
            addLog("> ERROR: CONNECTION_LOST");
        }
    };

    const addLog = (msg: string) => {
        setLogs(prev => [...prev, msg]);
    };

    return (
        <main className={`min-h-screen p-8 transition-colors duration-1000 ${status === 'ACTIVE' ? 'bg-heist-bg' : status === 'JUDGING' ? 'bg-zinc-900' : 'bg-black'}`}>
            {/* Combat Mode Borders */}
            <div className="fixed inset-0 border-[10px] border-zinc-900 pointer-events-none z-50 animate-pulse-slow" style={{ borderColor: status === 'ESCROW' ? '#fcee0a' : status === 'SETTLED' && verdict?.winner_is_p1 ? '#0aff0a' : status === 'SETTLED' ? '#ff003c' : '#3f3f46' }} />

            <header className="flex justify-between items-center mb-12">
                <Link href="/bounty-board" className="text-zinc-500 hover:text-white font-mono uppercase">← Abort Mission</Link>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-red-500 font-bold tracking-widest">LIVE SESSION</span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">

                {/* Left: Intel & Betting */}
                <div className="space-y-8">
                    <div className="bg-heist-panel border border-zinc-800 p-8 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 bg-zinc-800 px-3 py-1 text-xs font-mono text-white">ID: {heist.id}</div>
                        <h1 className="text-4xl font-black italic text-white mb-4 uppercase">{heist.dare}</h1>

                        <div className="flex justify-between text-sm font-mono text-zinc-400 border-t border-zinc-800 pt-4">
                            <div>
                                <div className="text-xs text-zinc-600">CHALLENGER (P1)</div>
                                <div className="text-white font-bold">{heist.player1.name}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-zinc-600">BOUNTY</div>
                                <div className="text-neon-cyan font-bold text-xl">{heist.bounty}</div>
                            </div>
                        </div>

                        {/* Betting Interface */}
                        {status === 'ACTIVE' && (
                            <div className="mt-8 bg-black/40 p-4 rounded border border-zinc-800">
                                <div className="text-xs text-zinc-500 font-mono mb-2 flex items-center gap-2"><TrendingUp size={12} /> LIVE ODDS (SIDE BETS)</div>
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => handleBet('P1')} className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 p-2 text-left group/bet">
                                        <div className="text-xs text-zinc-500">VOTE WIN (P1)</div>
                                        <div className="text-neon-cyan font-bold">{betPoolP1.toFixed(2)} ETH</div>
                                        <div className="text-[10px] text-zinc-600 group-hover/bet:text-white transition-colors">+ BET 0.1 ETH</div>
                                    </button>
                                    <button onClick={() => handleBet('P2')} className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 p-2 text-right group/bet">
                                        <div className="text-xs text-zinc-500">VOTE FAIL (P2)</div>
                                        <div className="text-danger-red font-bold">{betPoolP2.toFixed(2)} ETH</div>
                                        <div className="text-[10px] text-zinc-600 group-hover/bet:text-white transition-colors">+ BET 0.1 ETH</div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Terminal */}
                    <Terminal logs={logs} className="shadow-2xl" />

                    {/* Hype Interaction */}
                    <div className="pt-8 border-t border-zinc-800">
                        <h4 className="text-zinc-500 text-xs font-mono uppercase mb-4">Spectator Actions</h4>
                        <HypeButton />
                    </div>
                </div>

                {/* Right: Action & Comms */}
                <div className="flex flex-col gap-6">
                    {/* Action Panel */}
                    <div className="flex flex-col justify-center">
                        {status === 'ACTIVE' && (
                            <div className="bg-zinc-900/50 p-8 border border-zinc-700 backdrop-blur-sm">
                                {/* Open Bounty Join Logic */}
                                {heist.player2.address === '0x0000000000000000000000000000000000000000' ? (
                                    <div className="text-center space-y-4">
                                        <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                                            <AlertTriangle className="text-neon-cyan" /> OPEN CONTRACT
                                        </h2>
                                        <p className="text-zinc-400 text-sm">
                                            This heist has no assigned operative. First to claim it takes the risk.
                                        </p>

                                        {Number(heist.collateral) > 0 && (
                                            <div className="bg-red-900/20 border border-red-500/50 p-2 text-red-400 text-xs font-mono inline-block">
                                                ⚠️ REQUIRES {heist.collateral} ETH COLLATERAL
                                            </div>
                                        )}

                                        <button
                                            onClick={() => placeBetTx({ // Using placeBetTx alias but calling joinHeist
                                                address: BASE_HEIST_ADDRESS,
                                                abi: BASE_HEIST_ABI,
                                                functionName: 'joinHeist',
                                                args: [BigInt(heist.id)],
                                                value: parseEther(heist.collateral || '0')
                                            })}
                                            className="w-full bg-neon-cyan text-black font-black uppercase py-4 text-xl hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(0,243,255,0.4)]"
                                        >
                                            ACCEPT MISSION
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit}>
                                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                            <Clock className="text-neon-cyan" /> SUBMIT PROOF
                                        </h2>
                                        <div className="space-y-4 mb-6">
                                            <input
                                                type="text"
                                                value={proof}
                                                onChange={(e) => setProof(e.target.value)}
                                                placeholder="Paste Tweet / Etherscan / Image URL..."
                                                className="w-full bg-black border border-zinc-600 p-4 text-white focus:border-neon-cyan outline-none font-mono"
                                            />
                                            <p className="text-xs text-zinc-500">
                                                *Must provide verifiable on-chain or social proof.
                                                AI will cross-reference with provided metadata.
                                            </p>
                                        </div>
                                        <button className="w-full bg-neon-cyan text-black font-black uppercase py-4 text-xl hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(0,243,255,0.4)]">
                                            LOCK IN SUBMISSION
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}

                        {status === 'JUDGING' && (
                            <div className="text-center space-y-4">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="w-24 h-24 border-t-4 border-neon-cyan rounded-full mx-auto"
                                />
                                <h2 className="text-2xl font-black text-white animate-pulse">JUDGING IN PROGRESS</h2>
                                <p className="text-zinc-500 font-mono">Heist Master is analyzing vectors...</p>
                            </div>
                        )}

                        {status === 'SETTLED' && verdict && (
                            <div className={`p-8 border-l-4 ${verdict.winner_is_p1 ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'}`}>
                                <h2 className={`text-4xl font-black italic mb-2 ${verdict.winner_is_p1 ? 'text-green-500' : 'text-red-500'}`}>
                                    {verdict.winner_is_p1 ? 'MISSION ACCOMPLISHED' : 'MISSION FAILED'}
                                </h2>
                                <p className="font-mono text-zinc-300">{verdict.explanation}</p>
                            </div>
                        )}

                        {status === 'ESCROW' && verdict && (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="p-8 border-4 border-warning-yellow bg-warning-yellow/10 text-center"
                            >
                                <h2 className="text-3xl font-black italic text-warning-yellow mb-4">
                                    <div className="flex items-center justify-center gap-2"><AlertTriangle size={32} /> DISPUTE OPEN</div>
                                </h2>
                                <div className="text-white text-lg font-mono mb-6">
                                    "Confidence Score: {verdict.confidence_score}% (Too Low). <br />
                                    Funds locked for 24h."
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Live Chat Integration */}
                    <div className="h-[400px]">
                        <LiveChat />
                    </div>
                </div>
            </div>
        </main>
    );
}
