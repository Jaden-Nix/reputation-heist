'use client';
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Terminal from '@/components/ui/Terminal';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, TrendingUp, AlertTriangle, Share2, Shield, Flame } from 'lucide-react';
import { LEGENDARY_HEISTS } from '@/lib/seedData';
import Link from 'next/link';
import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { BASE_HEIST_ADDRESS, BASE_HEIST_ABI } from '@/lib/contracts';
import { formatEther, parseEther } from 'viem';
import LiveChat from '@/components/game/LiveChat';
import HypeButton from '@/components/game/HypeButton';
import { toast } from 'sonner';
import { useEthosReputation } from '@/hooks/useEthosReputation';
import { TrustProfile } from '@/components/game/TrustProfile';
import { HallOfShame } from '@/components/game/HallOfShame';
import { HeistCountdown } from '@/components/game/HeistCountdown';

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
        query: { enabled: !isMockId, refetchInterval: 5000 }
    });

    // Map Contract Data to UI Object
    const heist = !isMockId && heistData ? {
        id: (heistData as any)[0].toString(),
        player1: { name: (heistData as any)[1] as string, address: (heistData as any)[1] as string },
        player2: { name: (heistData as any)[2] as string, address: (heistData as any)[2] as string },
        bounty: formatEther((heistData as any)[3] as bigint),
        stakedRep: Number((heistData as any)[4]),
        duration: Number((heistData as any)[5]),
        startTime: Number((heistData as any)[6]),
        dare: (heistData as any)[7] as string,
        status: (['CREATED', 'ACTIVE', 'JUDGING', 'SETTLED'][Number((heistData as any)[8])] || 'CREATED') as any,
        winner: (heistData as any)[9] as string,
        verdict: (heistData as any)[10] as string,
        isVow: Boolean((heistData as any)[11]),
        createdAt: Number((heistData as any)[12]),
        totalBetsP1: formatEther((heistData as any)[13] as bigint),
        totalBetsP2: formatEther((heistData as any)[14] as bigint),
        // Field fallbacks for Heist interface compatibility
        category: 'SOCIAL' as const,
        timestamp: 'Just now',
        heistMasterMood: 'neutral' as const,
        collateral: "0.00"
    } : (LEGENDARY_HEISTS.find(h => h.id === rawId) || null);

    const [status, setStatus] = useState<'WAITING' | 'ACTIVE' | 'JUDGING' | 'SETTLED'>('ACTIVE');
    const [proof, setProof] = useState('');
    const [logs, setLogs] = useState<string[]>(["> Initializing Heist Protocol...", "Waiting for proof submission..."]);
    const [verdict, setVerdict] = useState<any>(null);
    const [isExpired, setIsExpired] = useState(false);

    // Hooks
    const { writeContract: submitProofTx } = useWriteContract();
    const { writeContract: placeBetTx } = useWriteContract();
    const { writeContract: joinHeistTx } = useWriteContract();
    const { score: ethosScore, loading: isEthosLoading, slashRep, isSlashing } = useEthosReputation(address || '');

    const betPoolP1 = heist?.totalBetsP1 ? parseFloat(heist.totalBetsP1) : 0;
    const betPoolP2 = heist?.totalBetsP2 ? parseFloat(heist.totalBetsP2) : 0;

    const calculateOdds = (poolA: number, poolB: number) => {
        if (poolA === 0) return "2.0x";
        return ((poolA + poolB) / poolA).toFixed(2) + "x";
    }

    const oddsP1 = calculateOdds(betPoolP1, betPoolP2);
    const oddsP2 = calculateOdds(betPoolP2, betPoolP1);

    const handleJoin = () => {
        if (!heist) return;
        try {
            joinHeistTx({
                address: BASE_HEIST_ADDRESS,
                abi: BASE_HEIST_ABI,
                functionName: 'joinHeist',
                args: [heistId]
            });
            toast.success('CHALLENGE_ACCEPTED', { description: 'Reputation Staked. Game On.' });
        } catch (err) {
            toast.error('TX_FAILED');
        }
    };

    const handleBet = (side: 'P1' | 'P2') => {
        try {
            placeBetTx({
                address: BASE_HEIST_ADDRESS,
                abi: BASE_HEIST_ABI,
                functionName: 'placeBet',
                args: [heistId, side === 'P1'],
                value: parseEther('0.01'), // Default bet size for fast UI
            });
            toast.success('BET_PLACED', { description: `Staked 0.01 ETH on ${side}` });
        } catch (err) {
            toast.error('BET_FAILED');
        }
    }

    useEffect(() => {
        if (heist?.status && !isMockId) {
            setStatus(heist.status as any);
            if (heist.status === 'SETTLED' && heist.verdict) {
                setVerdict({
                    winner_is_p1: heist.winner === (heist.player1.address || ''),
                    verdict_text: heist.verdict,
                    confidence_score: 95
                });
            }
        }
    }, [heist, isMockId]);

    // Handle Settlement / Slash Effects
    useEffect(() => {
        if (status === 'SETTLED' && verdict && heist) {
            const iAmPlayer1 = address === heist.player1.address;
            const iAmPlayer2 = address === heist.player2.address;
            const iLost = (iAmPlayer1 && !verdict.winner_is_p1) || (iAmPlayer2 && verdict.winner_is_p1);

            if (iLost && heist.stakedRep) {
                slashRep(heist.stakedRep);
                addLog(`> ALERT: REPUTATION SLASHED: -${heist.stakedRep} CRED`);
            }
        }
    }, [status, verdict, address, heist, slashRep]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!proof) { toast.error('INPUT_REQUIRED'); return; }

        try {
            submitProofTx({
                address: BASE_HEIST_ADDRESS,
                abi: BASE_HEIST_ABI,
                functionName: 'submitProofAndJudge',
                args: [heistId, proof]
            });
            setStatus('JUDGING');
            addLog(`> Proof submitted on-chain: ${proof.slice(0, 20)}...`);

            // Trigger AI Judge (Cloud Function)
            const res = await fetch('/api/judge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    heistId: heist?.id,
                    proofUrl: proof,
                    isVow: heist?.isVow,
                    dare: heist?.dare
                }),
            });
            if (res.ok) {
                const data = await res.json();
                addLog(`> AI Oracle: ${data.intro_line}`);
            }
        } catch (err) {
            toast.error('TX_FAILED');
        }
    };

    const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

    const isTargeted = heist?.player2.address !== '0x0000000000000000000000000000000000000000' && !!heist?.player2.address;
    const isSpecificTarget = isTargeted && address === heist?.player2.address;
    const canJoin = status === 'WAITING' && isConnected && address !== heist?.player1.address && (!isTargeted || isSpecificTarget);

    const searchParams = useSearchParams();
    const isDemoDenied = searchParams.get('demo') === 'denied';

    if (isDemoDenied) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0510] text-purple-400 font-mono relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0a0510] to-[#0a0510]" />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="z-10 bg-[#130b1f] border border-purple-500/30 p-12 max-w-lg text-center shadow-[0_0_50px_rgba(168,85,247,0.2)]"
                >
                    <Shield size={64} className="mx-auto mb-6 text-purple-500 animate-pulse" />
                    <h1 className="text-4xl font-black italic text-white mb-2 uppercase tracking-tighter">ACCESS DENIED</h1>
                    <div className="bg-purple-950/50 border border-purple-500/50 p-2 inline-block mb-6 px-4 rounded-full">
                        <span className="text-xs font-mono text-purple-300">ETHOS_SCORE_TOO_LOW</span>
                    </div>

                    <p className="text-purple-200/60 mb-8 font-mono text-sm leading-relaxed">
                        This mission requires a minimum Ethos Credibility Score of <span className="text-white font-bold">2200</span>.
                        Your current score <span className="text-red-400 font-bold">(1250)</span> is insufficient for high-stakes deployment.
                    </p>

                    <Link href="/bounty-board" className="block w-full bg-purple-600 hover:bg-purple-500 text-white font-black uppercase py-4 transition-all">
                        RETURN TO SAFETY
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (isHeistLoading) return <div className="min-h-screen flex items-center justify-center font-mono text-neon-cyan animate-pulse">ACCESSING HEIST DATA...</div>;

    if (!heist) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-red-500 font-mono">
            <AlertTriangle size={48} className="mb-4" />
            <h1 className="text-2xl font-black uppercase mb-2">HEIST NOT FOUND</h1>
            <p className="text-zinc-500 mb-8">The requested mission data could not be retrieved.</p>
            <Link href="/bounty-board" className="px-6 py-3 bg-zinc-900 border border-zinc-800 text-white hover:border-red-500 transition-all uppercase text-xs tracking-widest">
                Return to Board
            </Link>
        </div>
    );

    const isHighStakes = parseFloat(heist.bounty) >= 0.5;

    return (
        <main className={`min-h-screen p-8 transition-colors duration-1000 ${status === 'ACTIVE' ? 'bg-heist-bg' : 'bg-black'} relative overflow-hidden`}>
            {/* Global Slashed Overlay */}
            <AnimatePresence>
                {isSlashing && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-red-900/40 backdrop-blur-sm pointer-events-none flex items-center justify-center"
                    >
                        <h1 className="text-9xl font-black italic text-red-500 animate-pulse tracking-tighter">SLASHED</h1>
                    </motion.div>
                )}
            </AnimatePresence>

            <HallOfShame />

            <header className="flex justify-between items-center mb-12 mt-4">
                <Link href="/bounty-board" className="text-muted-foreground hover:text-foreground font-mono uppercase transition-colors">← Back to Board</Link>

                <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full animate-pulse ${status === 'SETTLED' ? 'bg-gray-500' : isExpired ? 'bg-red-950' : 'bg-red-500'}`} />
                        <span className="text-red-500 font-bold tracking-widest uppercase">
                            {heist.isVow ? 'THE VOW' : 'HEIST'} {isExpired ? 'TIMED OUT' : status}
                        </span>
                    </div>
                    {status === 'ACTIVE' && heist.startTime && heist.startTime > 0 && (
                        <HeistCountdown
                            startTime={heist.startTime}
                            duration={heist.duration || 3600}
                            onExpire={() => setIsExpired(true)}
                        />
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                <div className="space-y-8">
                    <div className="bg-heist-panel border border-zinc-800 p-8 relative overflow-hidden">
                        {/* Trust Profiles */}
                        <div className={`grid ${heist.isVow ? 'grid-cols-1' : 'grid-cols-2'} gap-4 mb-6`}>
                            <TrustProfile address={heist.player1.address || ''} stakedAmount={heist.stakedRep} />
                            {!heist.isVow && <TrustProfile address={heist.player2.address || ''} isOpponent />}
                            {heist.isVow && (
                                <div className="bg-red-500/10 border border-red-500/20 p-4 font-mono text-[10px] text-center uppercase tracking-widest text-red-500/60 self-center">
                                    Commitment to Self
                                </div>
                            )}
                        </div>

                        <h1 className="text-3xl font-black italic text-foreground mb-4 uppercase leading-none">{heist.dare}</h1>
                        <div className="flex justify-between text-sm font-mono text-muted-foreground border-t border-zinc-800 pt-4">
                            <div>
                                <div className="text-xs text-muted-foreground">BOUNTY POOL</div>
                                <div className="text-neon-cyan font-bold text-2xl">{heist.bounty} ETH</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-muted-foreground">BETTING POOL</div>
                                <div className="text-purple-400 font-bold text-xl flex items-center justify-end gap-1">
                                    <TrendingUp size={16} /> {(betPoolP1 + betPoolP2).toFixed(2)} ETH
                                </div>
                                <div className="text-[10px] text-zinc-500">P1: {oddsP1} | P2: {oddsP2}</div>
                            </div>
                        </div>

                        {/* JOIN CTA */}
                        {status === 'WAITING' && (
                            <div className="mt-8 pt-8 border-t border-zinc-800">
                                {canJoin ? (
                                    <div className="text-center">
                                        <div className="text-xs font-mono text-neon-cyan mb-2 uppercase animate-pulse">Waiting for Challenger...</div>
                                        <button onClick={handleJoin} className="w-full bg-neon-cyan text-black font-black uppercase py-4 text-xl shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:bg-white transition-all">
                                            ACCEPT CHALLENGE
                                        </button>
                                        <div className="text-[10px] text-zinc-500 font-mono mt-2">REQUIRES {heist.stakedRep || 0} CRED STAKE</div>
                                    </div>
                                ) : (
                                    <div className="bg-zinc-900/50 p-4 border border-zinc-800 text-center text-zinc-500 font-mono text-xs">
                                        WAITING FOR OPPONENT TO ACCEPT...
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Spectator Betting Panel */}
                    {(status === 'ACTIVE' && address !== heist.player1.address && address !== heist.player2.address) && (
                        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
                            <div className="flex items-center gap-2 mb-4 text-xs font-mono text-zinc-400 uppercase tracking-widest">
                                <TrendingUp className="text-green-500" size={14} /> Place Your Bet
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => handleBet('P1')} className={`group flex flex-col items-center p-4 bg-black border border-zinc-800 transition-all rounded-lg ${heist.isVow ? 'hover:border-green-500' : 'hover:border-neon-cyan'}`}>
                                    <span className={`${heist.isVow ? 'text-green-500' : 'text-neon-cyan'} font-bold text-sm mb-1 uppercase italic`}>
                                        {heist.isVow ? 'MAN OF HIS WORD' : 'P1 WINS'}
                                    </span>
                                    <span className="text-[10px] text-zinc-500 font-mono">PAYOUT: {oddsP1}</span>
                                </button>
                                <button onClick={() => handleBet('P2')} className="group flex flex-col items-center p-4 bg-black border border-zinc-800 hover:border-red-500 transition-all rounded-lg">
                                    <span className="text-red-500 font-bold text-sm mb-1 uppercase italic">
                                        {heist.isVow ? 'GHOSTER' : 'P1 FAILS'}
                                    </span>
                                    <span className="text-[10px] text-zinc-500 font-mono">PAYOUT: {oddsP2}</span>
                                </button>
                            </div>
                        </div>
                    )}

                    <Terminal logs={logs} className="shadow-2xl h-64" />
                </div>

                <div className="flex flex-col gap-6">
                    {/* Action Area */}
                    {(status === 'ACTIVE' || status === 'JUDGING') && (
                        <div className="bg-heist-panel border border-zinc-800 p-8">
                            <form onSubmit={handleSubmit}>
                                <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2"><Clock className="text-neon-cyan" /> SUBMIT PROOF</h2>
                                <input type="text" value={proof} onChange={(e) => setProof(e.target.value)} placeholder="Paste Tweet/Image URL..." className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-4 text-white focus:border-neon-cyan outline-none font-mono mb-4 placeholder:text-zinc-600 transition-colors" />
                                <button className="w-full bg-neon-cyan text-black font-black uppercase py-4 text-xl shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:bg-white transition-all rounded-lg">
                                    {status === 'JUDGING' ? 'JUDGING IN PROGRESS...' : 'VERIFY COMPLETION'}
                                </button>
                            </form>
                        </div>
                    )}

                    {status === 'SETTLED' && verdict && (
                        <div className={`p-8 border-l-4 ${verdict.winner_is_p1 ? 'border-green-500 bg-green-950/30' : 'border-red-500 bg-red-950/30'}`}>
                            <h2 className="text-4xl font-black italic mb-2 uppercase">{verdict.winner_is_p1 ? 'MISSION ACCOMPLISHED' : 'MISSION FAILED'}</h2>
                            <p className="font-mono text-zinc-300 text-lg mb-4">"{verdict.verdict_text}"</p>

                            {/* Slash Banner */}
                            {!verdict.winner_is_p1 && (heist.stakedRep || 0) > 0 && (
                                <div className="bg-red-500/20 border border-red-500 p-4 flex items-center gap-3 animate-pulse">
                                    <Flame className="text-red-500 w-8 h-8" />
                                    <div>
                                        <div className="font-black text-red-500 uppercase">REPUTATION SLASHED</div>
                                        <div className="text-red-300 font-mono text-sm">{heist.player1.name} lost {heist.stakedRep || 0} Cred.</div>
                                    </div>
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
