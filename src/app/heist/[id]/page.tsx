'use client';
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Terminal from '@/components/ui/Terminal';
import { motion } from 'framer-motion';
import { Skull, AlertTriangle, CheckCircle, Clock, TrendingUp, Shield, BadgeCheck, Share2 } from 'lucide-react';
import { LEGENDARY_HEISTS } from '@/lib/seedData';
import Link from 'next/link';
import { useReadContract, useWriteContract, useAccount } from 'wagmi';
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
    const { isConnected, address } = useAccount();

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
        collateral: formatEther(heistData[13]),
        dare: heistData[4],
        status: ['CREATED', 'JUDGING', 'SETTLED', 'ESCROW', 'DISPUTED'][Number(heistData[5])] as any,
        verdict: heistData[7],
        confidence: heistData[8],
        totalBetsP1: formatEther(heistData[14]),
        totalBetsP2: formatEther(heistData[15]),
        daredevilJoined: heistData[16]
    } : LEGENDARY_HEISTS.find(h => h.id === rawId) || null;

    const [status, setStatus] = useState<'WAITING' | 'ACTIVE' | 'JUDGING' | 'SETTLED' | 'ESCROW'>('ACTIVE');
    const [proof, setProof] = useState('');
    const [logs, setLogs] = useState<string[]>(["> Initializing Heist Protocol...", "Waiting for proof submission..."]);
    const [verdict, setVerdict] = useState<any>(null);
    const { writeContract: placeBetTx } = useWriteContract();
    const { writeContract: joinHeistTx } = useWriteContract();

    useEffect(() => {
        if (heist?.status && !isMockId) {
            // "CREATED" on chain splits into "WAITING" (not paid) and "ACTIVE" (paid) in UI
            if (heist.status === 'CREATED') {
                setStatus(heist.daredevilJoined ? 'ACTIVE' : 'WAITING');
            } else {
                setStatus(heist.status);
            }
        }
    }, [heist, isMockId]);

    const betPoolP1 = heist?.totalBetsP1 ? parseFloat(heist.totalBetsP1) : 0;
    const betPoolP2 = heist?.totalBetsP2 ? parseFloat(heist.totalBetsP2) : 0;

    const handleJoin = () => {
        if (!heist) return;
        try {
            joinHeistTx({
                address: BASE_HEIST_ADDRESS,
                abi: BASE_HEIST_ABI,
                functionName: 'joinHeist',
                args: [heistId],
                value: parseEther(heist.collateral || '0')
            });
            toast.success('UPLINK_ESTABLISHED', { description: 'Securing collateral...' });
        } catch (err) {
            toast.error('CONNECTION_REFUSED');
        }
    }

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

    const searchParams = useSearchParams();
    const isDemoDenied = searchParams.get('demo') === 'denied';
    const { score: ethosScore, loading: isEthosLoading } = useEthosReputation(address || '');
    const [roast, setRoast] = useState('');

    const HIGH_STAKES_THRESHOLD = 0.5;
    const MIN_ETHOS_SCORE = 1000;
    const ROASTS = [
        "ERROR: CLOUT_NOT_FOUND",
        "ACCESS DENIED: GHOST_PROTOCOL_ACTIVE",
        "REPUTATION CRITICAL: LEVEL UP TO JOIN",
        "SECURITY LEVEL: OMEGA // YOU: ALPHA",
        "NICE TRY, ROOKIE. GET MORE REPUTATION."
    ];

    useEffect(() => {
        setRoast(ROASTS[Math.floor(Math.random() * ROASTS.length)]);
    }, []);

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

    // Check if user is the specific target
    const isTargeted = heist?.player2.address !== '0x0000000000000000000000000000000000000000';
    const isSpecificTarget = isTargeted && address === heist?.player2.address;
    const canJoin = status === 'WAITING' && isConnected && address !== heist?.player1.address && (!isTargeted || isSpecificTarget);

    if (isHeistLoading || !heist) return <div className="p-20 text-center font-mono animate-pulse text-neon-cyan">ACCESSING ENCRYPTED ARCHIVES...</div>;

    const isHighStakes = heist ? parseFloat(heist.bounty) >= HIGH_STAKES_THRESHOLD : false;
    const hasReputation = ethosScore !== null && ethosScore >= MIN_ETHOS_SCORE;

    const renderActionPanel = () => {
        // DEMO OVERRIDE OR GATING LOGIC
        if ((status === 'WAITING' && isHighStakes && !hasReputation) || isDemoDenied) {
            return (
                <div className="mt-8 bg-zinc-900/50 p-6 rounded border border-purple-500/30 text-center relative overflow-hidden group">
                    {/* Scanline effect */}
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent" />

                    <div className="relative z-10">
                        <div className="flex justify-center mb-4 text-purple-500 animate-pulse">
                            <Shield size={48} />
                        </div>
                        <h3 className="text-2xl font-black italic text-purple-400 mb-2 glitch-text" data-text="ACCESS DENIED">ACCESS DENIED</h3>
                        <p className="font-mono text-purple-300 mb-6 text-sm">{roast}</p>

                        <div className="inline-flex items-center gap-4 bg-black/40 p-4 rounded border border-purple-500/30">
                            <div className="text-right">
                                <div className="text-[10px] text-muted-foreground uppercase">REQUIRED SCORE</div>
                                <div className="text-xl font-bold text-purple-500">{MIN_ETHOS_SCORE}</div>
                            </div>
                            <div className="h-8 w-px bg-purple-500/30" />
                            <div className="text-left">
                                <div className="text-[10px] text-muted-foreground uppercase">YOUR SCORE</div>
                                <div className={`text-xl font-bold ${hasReputation ? 'text-green-500' : 'text-red-500'}`}>
                                    {isEthosLoading ? '...' : (isDemoDenied ? 680 : ethosScore || 0)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        if (status === 'WAITING') {
            return (
                <div className="mt-8 bg-zinc-50 dark:bg-black p-6 rounded border border-zinc-200 dark:border-zinc-800 text-center">
                    <h3 className="text-xl font-black italic text-foreground mb-2">MISSION STATUS: <span className="text-neon-cyan animate-pulse">PENDING AGENT</span></h3>

                    {isTargeted && !isSpecificTarget ? (
                        <div className="text-red-500 font-mono text-sm border border-red-500/50 p-4 bg-red-900/10">
                            🔒 RESTRICTED: TARGETED CONTRACT ASSIGNED TO {heist?.player2.name.slice(0, 6)}...
                        </div>
                    ) : (
                        <div>
                            <p className="text-muted-foreground font-mono text-xs mb-6">
                                COLLATERAL REQUIRED: <span className="text-foreground font-bold">{heist?.collateral} ETH</span>
                            </p>
                            {canJoin ? (
                                <button onClick={handleJoin} className="w-full bg-neon-cyan text-black font-black uppercase py-4 text-xl shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:bg-white transition-all">
                                    ACCEPT CHALLENGE
                                </button>
                            ) : (
                                <button disabled className="w-full bg-zinc-800 text-zinc-500 font-black uppercase py-4 text-xl cursor-not-allowed">
                                    CONNECT WALLET TO ACCEPT
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )
        }

        // Active Betting Interface
        if (status === 'ACTIVE') {
            return (
                <div className="mt-8 bg-black p-4 rounded border border-zinc-800 transition-colors">
                    <div className="text-xs text-muted-foreground font-mono mb-2 flex items-center gap-2"><TrendingUp size={12} /> LIVE ODDS (SIDE BETS)</div>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => handleBet('P1')} className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl p-3 text-left group/bet transition-colors shadow-sm">
                            <div className="text-xs text-zinc-400">VOTE WIN (P1)</div>
                            <div className="text-neon-cyan font-bold">{betPoolP1.toFixed(2)} ETH</div>
                            <div className="text-[10px] text-zinc-500 group-hover/bet:text-white transition-colors">+ BET 0.05 ETH</div>
                        </button>
                        <button onClick={() => handleBet('P2')} className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl p-3 text-right group/bet transition-colors shadow-sm">
                            <div className="text-xs text-zinc-400">VOTE FAIL (P2)</div>
                            <div className="text-danger-red font-bold">{betPoolP2.toFixed(2)} ETH</div>
                            <div className="text-[10px] text-zinc-500 group-hover/bet:text-white transition-colors">+ BET 0.05 ETH</div>
                        </button>
                    </div>
                </div>
            );
        }
        return null;
    }

    return (
        <main className={`min-h-screen p-8 transition-colors duration-1000 ${status === 'ACTIVE' ? 'bg-heist-bg' : 'bg-black'}`}>
            <header className="flex justify-between items-center mb-12">
                <Link href="/bounty-board" className="text-muted-foreground hover:text-foreground font-mono uppercase transition-colors">← Abort Mission</Link>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-red-500 font-bold tracking-widest">LIVE SESSION</span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                <div className="space-y-8">
                    <div className="bg-heist-panel border border-zinc-200 dark:border-zinc-800 p-8 relative overflow-hidden">
                        <h1 className="text-4xl font-black italic text-foreground mb-4 uppercase">{heist.dare}</h1>
                        <div className="flex justify-between text-sm font-mono text-muted-foreground border-t border-zinc-200 dark:border-zinc-800 pt-4">
                            <div>
                                <div className="text-xs text-muted-foreground">CHALLENGER</div>
                                <div className="text-foreground font-bold flex items-center gap-1">
                                    {heist.player1.name}
                                    {/* Mock verified badge for P1 if it's the current user and score > 1500, or random for demo */}
                                    {(address === heist.player1.address && (ethosScore || 0) > 1500) && <BadgeCheck size={16} className="text-neon-cyan" />}
                                </div>
                            </div>
                            <div className="text-right"><div className="text-xs text-muted-foreground">BOUNTY</div><div className="text-neon-cyan font-bold text-xl">{heist.bounty} ETH</div></div>
                        </div>

                        {renderActionPanel()}
                    </div>
                    <Terminal logs={logs} className="shadow-2xl" />
                    <div className="bg-heist-panel p-6 border border-zinc-200 dark:border-zinc-800 rounded-none relative overflow-hidden group">
                        <div className="text-[10px] text-purple-400 font-mono mb-2 uppercase tracking-widest flex items-center gap-2"><Shield size={12} /> Ethos Scan</div>
                        <div className="text-4xl font-black text-foreground">{isEthosLoading ? '...' : ethosScore}</div>
                        <div className="text-[9px] text-muted-foreground font-mono mt-1 uppercase">Verified on Base</div>
                    </div>
                    <div className="pt-8 border-t border-zinc-800"><HypeButton /></div>
                </div>

                <div className="flex flex-col gap-6">
                    {status === 'ACTIVE' && !isDemoDenied && (
                        <div className="bg-heist-panel border border-zinc-200 dark:border-zinc-700 backdrop-blur-sm p-8">
                            <form onSubmit={handleSubmit}>
                                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2"><Clock className="text-neon-cyan" /> SUBMIT PROOF</h2>
                                <input type="text" value={proof} onChange={(e) => setProof(e.target.value)} placeholder="Paste URL..." className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-4 text-white focus:border-neon-cyan outline-none font-mono mb-4 placeholder:text-zinc-600 transition-colors" />
                                <button className="w-full bg-neon-cyan text-black font-black uppercase py-4 text-xl shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:bg-white transition-all rounded-lg">LOCK IN SUBMISSION</button>
                            </form>
                        </div>
                    )}
                    {status === 'SETTLED' && verdict && (
                        <div className={`p-8 border-l-4 ${verdict.winner_is_p1 ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'}`}>
                            <h2 className="text-4xl font-black italic mb-2 uppercase">{verdict.winner_is_p1 ? 'MISSION ACCOMPLISHED' : 'MISSION FAILED'}</h2>
                            <p className="font-mono text-zinc-300">{verdict.verdict_text}</p>

                            {/* REDEMPTION ARC: Only for the loser */}
                            {((!verdict.winner_is_p1 && address === heist.player1.address) || (verdict.winner_is_p1 && address === heist.player2.address)) && (
                                <div className="mt-8 border-t border-red-500/30 pt-4 animate-in fade-in slide-in-from-bottom-4">
                                    <div className="flex items-center gap-2 text-danger-red font-black uppercase text-sm mb-2">
                                        <AlertTriangle size={16} /> REDEMPTION ARC AVAILABLE
                                    </div>
                                    <Link href={`/create-heist?opponent=${heist.player2.address === address ? heist.player1.address : heist.player2.address}&bounty=${(parseFloat(heist.bounty) * 2).toFixed(2)}&dare=${heist.dare}`} className="block mb-4">
                                        <button className="w-full bg-danger-red text-white font-black uppercase py-3 hover:bg-red-600 transition-colors shadow-[0_0_15px_rgba(255,0,60,0.5)] flex items-center justify-center gap-2">
                                            DOUBLE OR NOTHING ({(parseFloat(heist.bounty) * 2).toFixed(2)} ETH)
                                        </button>
                                    </Link>

                                    {/* Share Replay Button */}
                                    <button
                                        onClick={() => toast.success('REPLAY_LINK_COPIED', { description: 'Share this moment of infamy.' })}
                                        className="w-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-xs py-3 hover:text-white transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Share2 size={12} /> SHARE REPLAY LINK
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="h-[400px]"><LiveChat /></div>
                </div>
            </div>
        </main>
    );
}
