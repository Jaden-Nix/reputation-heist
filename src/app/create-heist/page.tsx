'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Crown, AlertTriangle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useWriteContract, useAccount } from 'wagmi';
import { parseEther } from 'viem';
import { BASE_HEIST_ADDRESS, BASE_HEIST_ABI } from '@/lib/contracts';

export default function CreateHeist() {
    const router = useRouter();
    const [form, setForm] = useState({
        dare: '',
        opponent: '',
        bounty: '0.05',
        category: 'SOCIAL',
        collateral: '0.00'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Contract Hooks
    const { writeContract, isPending } = useWriteContract();
    const { isConnected } = useAccount();

    // Config Constants
    const LISTING_FEE = parseEther('0.001');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isConnected) {
            alert('Please connect your wallet first!');
            return;
        }

        try {
            console.log('Initiating Heist Creation...');
            setIsSubmitting(true);
            
            // 1. Database Sync (Persistent Record)
            const dbRes = await fetch('/api/heists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    creatorAddress: '0x...', // Use actual address if available
                    dare: form.dare,
                    category: form.category,
                    bounty: form.bounty,
                    collateral: form.collateral,
                }),
            });

            if (!dbRes.ok) {
                toast.error('DATABASE_UPLINK_ERROR', { description: 'Failed to record heist in archives.' });
            }

            // 2. Blockchain Transaction
            const bountyAmount = parseEther(form.bounty || '0');
            const totalValue = bountyAmount + LISTING_FEE;
            const collateralAmount = parseEther(form.collateral || '0');

            writeContract({
                address: BASE_HEIST_ADDRESS,
                abi: BASE_HEIST_ABI,
                functionName: 'createHeist',
                args: [(form.opponent || '0x0000000000000000000000000000000000000000') as `0x${string}`, collateralAmount, form.dare],
                value: totalValue
            }, {
                onSuccess: (hash) => {
                    toast.success('HEIST_DEPLOYED', { description: 'Contract live on Base Sepolia.' });
                    setTimeout(() => router.push('/bounty-board'), 2000);
                },
                onError: (err) => {
                    setIsSubmitting(false);
                    const message = (err as any).shortMessage || err.message;
                    toast.error('DEPLOYMENT_FAILED', { description: message });
                }
            });
        } catch (error) {
            setIsSubmitting(false);
            toast.error('CRITICAL_FAILURE', { description: (error as any).message });
        }
    };

    return (
        <main className="min-h-screen p-8 flex items-center justify-center relative bg-heist-bg">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neon-cyan/10 via-heist-bg to-heist-bg -z-10" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full bg-heist-panel border border-zinc-800 p-8 shadow-2xl relative"
            >
                <Link href="/bounty-board" className="text-zinc-500 hover:text-white font-mono text-sm mb-6 block">← CANCEL MISSION</Link>

                <h1 className="text-4xl font-black italic text-white mb-2 flex items-center gap-3">
                    <Crown className="text-neon-cyan" /> DEPLOY HEIST
                </h1>
                <p className="text-zinc-500 font-mono mb-8 border-b border-zinc-800 pb-4">
                    Target an opponent. Stake your reputation. No refunds if they cook you.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-mono text-neon-cyan mb-2 uppercase tracking-widest">
                            Who acts? (Target Address)
                        </label>
                        <input
                            type="text"
                            placeholder="Leave empty for OPEN BOUNTY (Anyone can accept)"
                            className="w-full bg-black border border-zinc-700 p-4 text-white focus:border-neon-cyan outline-none font-mono placeholder:text-zinc-700"
                            value={form.opponent}
                            onChange={(e) => setForm({ ...form, opponent: e.target.value })}
                        />
                        <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                            {form.opponent ? "*Targeting specific wallet." : "*OPEN BOUNTY: First to accept gets the contract."}
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-neon-cyan mb-2 uppercase tracking-widest">The Dare (Be Specific)</label>
                        <textarea
                            required
                            rows={3}
                            placeholder="e.g. Get Elon Musk to reply to your tweet with 'Based' within 24h..."
                            className="w-full bg-black border border-zinc-700 p-4 text-white focus:border-neon-cyan outline-none font-mono placeholder:text-zinc-700 resize-none"
                            value={form.dare}
                            onChange={(e) => setForm({ ...form, dare: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <label className="block text-xs font-mono text-neon-cyan mb-2 uppercase tracking-widest">Bounty (ETH)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                required
                                className="w-full bg-black border border-zinc-700 p-4 text-white focus:border-neon-cyan outline-none font-mono"
                                value={form.bounty}
                                onChange={(e) => setForm({ ...form, bounty: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-neon-cyan mb-2 uppercase tracking-widest">Collateral</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                className="w-full bg-black border border-zinc-700 p-4 text-white focus:border-neon-cyan outline-none font-mono"
                                value={form.collateral}
                                onChange={(e) => setForm({ ...form, collateral: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-neon-cyan mb-2 uppercase tracking-widest">Category</label>
                            <select
                                className="w-full bg-black border border-zinc-700 p-4 text-white focus:border-neon-cyan outline-none font-mono appearance-none"
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                            >
                                <option value="SOCIAL">SOCIAL_ENG</option>
                                <option value="IRL">IRL_TOUCH_GRASS</option>
                                <option value="ON_CHAIN">ON_CHAIN_DEGEN</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-zinc-900/50 p-4 border border-zinc-800 flex items-start gap-3">
                        <AlertTriangle className="text-warning-yellow shrink-0" size={20} />
                        <p className="text-xs text-zinc-400 font-mono">
                            By deploying this heist, you agree to the <span className="text-white hover:underline cursor-pointer">Protocol Rules</span>.
                            The Heist Master AI is the final judge. If you are slashed, 10% of your collateral goes to the Community Pool.
                        </p>
                    </div>

                    <button
                        disabled={isSubmitting}
                        className="w-full bg-neon-cyan text-black font-black uppercase py-4 text-xl hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? "INITIATING..." : <>CONFIRM DEPLOYMENT <ArrowRight size={20} /></>}
                    </button>
                </form>
            </motion.div>
        </main>
    );
}
