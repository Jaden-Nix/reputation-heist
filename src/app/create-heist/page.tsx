'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Crown, AlertTriangle, ArrowRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWriteContract, useAccount, usePublicClient } from 'wagmi';
import { parseEther } from 'viem';
import { BASE_HEIST_ADDRESS, BASE_HEIST_ABI } from '@/lib/contracts';
import { toast } from 'sonner';

import { TrustProfile } from '@/components/game/TrustProfile';
import { validateHeistParticipants } from '@/lib/ethos';

export default function CreateHeist() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [form, setForm] = useState({
        dare: searchParams.get('dare') || '',
        opponent: searchParams.get('opponent') || '',
        bounty: searchParams.get('bounty') || '0.05',
        category: 'SOCIAL',
        stakedRep: '300', // Default suggestion
        duration: '3600' // Default 1 hour
    });
    const [isVow, setIsVow] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Contract Hooks
    const { writeContractAsync } = useWriteContract();
    const publicClient = usePublicClient();
    const { isConnected, address: accountAddress } = useAccount();

    // Config Constants
    const LISTING_FEE = parseEther('0.001');

    const DARE_TEMPLATES = [
        { label: "Elon Reply", text: "Get @elonmusk to reply to your tweet within 24 hours.", opponent: "", rep: 500 },
        { label: "Vitalik Like", text: "Get @VitalikButerin to like your tweet about Ethos.", opponent: "", rep: 400 },
        { label: "Base God Vouch", text: "Get @JessePollak to bridge to a chain you built.", opponent: "", rep: 300 },
        { label: "Touch Grass", text: "Post a video touching grass in a storm.", category: "IRL", rep: 100 }
    ];

    const applyTemplate = (t: any) => {
        setForm(prev => ({
            ...prev,
            dare: t.text,
            stakedRep: t.rep.toString(),
            category: t.category || "SOCIAL"
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isConnected) {
            alert('Please connect your wallet first!');
            return;
        }

        try {
            console.log('Initiating Heist Creation...');
            setIsSubmitting(true);

            // 0. Sybil Resistance (Ethos Verification)
            const validation = await validateHeistParticipants(
                accountAddress || '',
                form.opponent || '0x0000000000000000000000000000000000000000'
            );

            if (!validation.valid) {
                toast.error('ACCESS_DENIED', { description: validation.reason });
                setIsSubmitting(false);
                return;
            }

            // 1. Blockchain Transaction (FIRST)
            // We must deploy first to get the Chain ID
            const bountyAmount = parseEther(form.bounty || '0');
            const totalValue = bountyAmount + LISTING_FEE;

            // Using writeContractAsync to await the hash
            const hash = await writeContractAsync({
                address: BASE_HEIST_ADDRESS,
                abi: BASE_HEIST_ABI,
                functionName: 'createHeist',
                args: [
                    (form.opponent || '0x0000000000000000000000000000000000000000') as `0x${string}`,
                    form.dare,
                    BigInt(form.stakedRep || '0'),
                    BigInt(form.duration || '3600')
                ],
                value: totalValue
            });

            const receipt = await publicClient.waitForTransactionReceipt({ hash });

            // Find HeistCreated event log to get ID
            // Topic0 for HeistCreated(uint256,address,address,uint256,uint256,uint256,string,bool)
            // Ideally use parseLog from viem, but for now we look for the first log from our contract
            const heistLog = receipt.logs.find(l => l.address.toLowerCase() === BASE_HEIST_ADDRESS.toLowerCase());
            const chainHeistId = heistLog ? parseInt(heistLog.topics[1] as string, 16) : null;

            if (!chainHeistId) {
                toast.error('EVENT_MISSING', { description: 'Heist deployed but ID not found in logs.' });
                // Fallback to board, but DB record will be missing chain ID
            }

            // 2. Database Sync (Persistent Record)
            // Now we save to DB with the confirmed Chain ID
            const dbRes = await fetch('/api/heists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    creatorAddress: accountAddress,
                    opponentAddress: form.opponent || null,
                    dare: form.dare,
                    category: form.category,
                    bounty: form.bounty,
                    stakedRep: form.stakedRep,
                    chainHeistId: chainHeistId // <--- CRITICAL SYNC
                }),
            });

            if (dbRes.ok) {
                toast.success('HEIST_DEPLOYED', { description: `Heist #${chainHeistId} Live on Base.` });
                setTimeout(() => router.push(`/heist/${chainHeistId}`), 1000);
            } else {
                toast.error('DATABASE_SYNC_FAILED', { description: 'Heist live on chain but DB sync failed.' });
            }

        } catch (error) {
            console.error(error);
            setIsSubmitting(false);
            toast.error('FALIED', { description: (error as any).message || 'Transaction failed' });
        }
    };

    return (
        <main className="min-h-screen p-8 flex items-center justify-center relative bg-heist-bg">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neon-cyan/10 via-heist-bg to-heist-bg -z-10" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full bg-black border border-zinc-800 p-8 shadow-2xl relative"
            >
                <Link href="/bounty-board" className="text-muted-foreground hover:text-foreground font-mono text-sm mb-6 block transition-colors">← CANCEL MISSION</Link>

                <h1 className="text-4xl font-black italic text-foreground mb-2 flex items-center gap-3">
                    <Crown className="text-neon-cyan" /> DEPLOY HEIST
                </h1>
                <p className="text-muted-foreground font-mono mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-4">
                    Target an opponent. Stake your reputation. No refunds if they cook you.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <TrustProfile address={accountAddress || ""} />
                    {!isVow && form.opponent && <TrustProfile address={form.opponent} isOpponent />}
                    {isVow && (
                        <div className="bg-red-950/20 border border-red-500/30 p-4 flex flex-col justify-center items-center text-center">
                            <AlertTriangle className="text-red-500 mb-2" size={24} />
                            <span className="text-xs font-mono text-red-400 uppercase tracking-tighter">Self-Challenge Active</span>
                            <span className="text-lg font-black italic text-white">THE VOW</span>
                        </div>
                    )}
                </div>

                {/* The Vow Toggle */}
                <div
                    onClick={() => {
                        const newVowState = !isVow;
                        setIsVow(newVowState);
                        if (newVowState) {
                            setForm(prev => ({ ...prev, opponent: accountAddress || '' }));
                        } else {
                            setForm(prev => ({ ...prev, opponent: '' }));
                        }
                    }}
                    className={`mb-8 p-4 border cursor-pointer transition-all flex items-center justify-between ${isVow
                        ? 'bg-red-600 border-white text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]'
                        : 'bg-zinc-900 border-zinc-700 text-zinc-400 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${isVow ? 'bg-white text-red-600' : 'bg-zinc-800 text-zinc-500'}`}>
                            <Crown size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase">Start "The Vow"</h3>
                            <p className="text-[10px] font-mono opacity-80 uppercase tracking-tight">Bet on your own word. Lock your rep. No excuses.</p>
                        </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative transition-colors ${isVow ? 'bg-white/20' : 'bg-black'}`}>
                        <motion.div
                            animate={{ x: isVow ? 26 : 2 }}
                            className={`absolute top-1 w-4 h-4 rounded-full ${isVow ? 'bg-white' : 'bg-zinc-600'}`}
                        />
                    </div>
                </div>

                <div className="mb-8">
                    <label className="block text-xs font-mono text-neon-cyan mb-2 uppercase tracking-widest">
                        CELEBRITY DARE TEMPLATES
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {DARE_TEMPLATES.map((t, i) => (
                            <button
                                key={i}
                                onClick={() => applyTemplate(t)}
                                className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded hover:border-neon-cyan hover:text-neon-cyan text-xs font-mono transition-all"
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className={isVow ? 'pointer-events-none opacity-50' : ''}>
                        <label className="block text-xs font-mono text-neon-cyan mb-2 uppercase tracking-widest">
                            Who acts? (Target Address)
                        </label>
                        <input
                            type="text"
                            placeholder={isVow ? accountAddress : "Leave empty for OPEN BOUNTY (Anyone can accept)"}
                            className={`w-full bg-black border border-zinc-800 rounded-lg p-4 text-white focus:border-neon-cyan outline-none font-mono placeholder:text-zinc-600 transition-colors ${isVow ? 'border-red-500/50' : ''}`}
                            value={isVow ? accountAddress : form.opponent}
                            onChange={(e) => !isVow && setForm({ ...form, opponent: e.target.value })}
                        />
                        <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                            {isVow ? "*VOW: Challenging YOURSELF." : form.opponent ? "*Targeting specific wallet." : "*OPEN BOUNTY: First to accept gets the contract."}
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-neon-cyan mb-2 uppercase tracking-widest">The Dare (Be Specific)</label>
                        <textarea
                            required
                            rows={3}
                            placeholder="e.g. Get Elon Musk to reply to your tweet with 'Based' within 24h..."
                            className="w-full bg-black border border-zinc-800 rounded-lg p-4 text-white focus:border-neon-cyan outline-none font-mono placeholder:text-zinc-600 resize-none transition-colors"
                            value={form.dare}
                            onChange={(e) => setForm({ ...form, dare: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-1">
                            <label className="block text-xs font-mono text-neon-cyan mb-2 uppercase tracking-widest">Bounty</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                required
                                className="w-full bg-black border border-zinc-800 rounded-lg p-4 text-white focus:border-neon-cyan outline-none font-mono transition-colors text-sm"
                                value={form.bounty}
                                onChange={(e) => setForm({ ...form, bounty: e.target.value })}
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-mono text-neon-cyan mb-2 uppercase tracking-widest">Stake</label>
                            <input
                                type="number"
                                step="1"
                                min="0"
                                required
                                className="w-full bg-black border border-zinc-800 rounded-lg p-4 text-white focus:border-neon-cyan outline-none font-mono transition-colors text-sm"
                                value={form.stakedRep}
                                onChange={(e) => setForm({ ...form, stakedRep: e.target.value })}
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-mono text-neon-cyan mb-2 uppercase tracking-widest">Time</label>
                            <select
                                className="w-full bg-black border border-zinc-800 rounded-lg p-4 text-white focus:border-neon-cyan outline-none font-mono appearance-none transition-colors text-xs"
                                value={form.duration}
                                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                            >
                                <option value="3600">1H</option>
                                <option value="86400">24H</option>
                                <option value="172800">48H</option>
                            </select>
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-mono text-neon-cyan mb-2 uppercase tracking-widest">Type</label>
                            <select
                                className="w-full bg-black border border-zinc-800 rounded-lg p-4 text-white focus:border-neon-cyan outline-none font-mono appearance-none transition-colors text-xs"
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                            >
                                <option value="SOCIAL">SOCIAL</option>
                                <option value="IRL">IRL</option>
                                <option value="ON_CHAIN">CHAIN</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-zinc-900/50 p-4 border border-zinc-800 flex items-start gap-3">
                        <AlertTriangle className="text-warning-yellow shrink-0" size={20} />
                        <p className="text-xs text-zinc-400 font-mono">
                            By deploying this heist, you agree to the <span className="text-white hover:underline cursor-pointer">Protocol Rules</span>.
                            If you fail or flake, your Staked Reputation will be SLASHED by the Heist Master.
                        </p>
                    </div>

                    <button
                        disabled={isSubmitting}
                        className={`w-full font-black uppercase py-4 text-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${isVow
                            ? 'bg-red-600 text-white hover:bg-red-500 shadow-[0_0_30px_rgba(220,38,38,0.4)]'
                            : 'bg-neon-cyan text-black hover:bg-white'
                            }`}
                    >
                        {isSubmitting ? "INITIATING..." : <>{isVow ? "SEAL THE VOW" : "CONFIRM DEPLOYMENT"} <ArrowRight size={20} /></>}
                    </button>
                </form>
            </motion.div>
        </main>
    );
}
