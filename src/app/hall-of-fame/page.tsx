'use client';
import { LEGENDARY_HEISTS } from '@/lib/seedData';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Skull } from 'lucide-react';

export default function HallOfFame() {
    const winners = LEGENDARY_HEISTS.filter((_, i) => i % 2 === 0);
    const losers = LEGENDARY_HEISTS.filter((_, i) => i % 2 !== 0);

    return (
        <main className="min-h-screen bg-heist-bg p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-yellow-500/10 via-heist-bg to-heist-bg pointer-events-none" />

            <div className="max-w-7xl mx-auto z-10 relative">
                <header className="mb-20 text-center">
                    <Link href="/" className="inline-block text-zinc-500 hover:text-white mb-8 font-mono tracking-widest text-xs uppercase hover:tracking-[0.2em] transition-all">
                        ← Return to Base
                    </Link>
                    <h1 className="text-6xl md:text-8xl font-black italic text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 via-yellow-500 to-orange-600 mb-4 drop-shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                        HALL OF GLORY
                    </h1>
                    <p className="text-zinc-500 font-mono tracking-widest text-sm uppercase">
                        Protocol v1.0 // <span className="text-red-500">Wall of Shame Included</span>
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">

                    {/* The Gallery (Winners) */}
                    <div>
                        <div className="flex items-center gap-4 mb-12 border-b border-yellow-500/30 pb-6">
                            <div className="p-3 bg-yellow-500/10 rounded-full border border-yellow-500/50">
                                <TrendingUp className="text-yellow-400 w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-white italic">LEGENDS</h2>
                                <p className="text-yellow-500/80 font-mono text-xs uppercase tracking-wider">Absolute Cinema</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {winners.map((h, i) => (
                                <motion.div
                                    key={h.id}
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.15 }}
                                    className="group relative"
                                >
                                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl opacity-20 group-hover:opacity-40 blur transition duration-500" />
                                    <div className="relative bg-zinc-900 border border-zinc-800 p-6 rounded-xl hover:-translate-y-1 transition-transform duration-300">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center font-black text-black text-lg">
                                                    #{i + 1}
                                                </div>
                                                <span className="font-bold text-xl text-white">{h.player1.name}</span>
                                            </div>
                                            <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded font-mono text-sm border border-yellow-500/30">
                                                +{h.bounty}
                                            </span>
                                        </div>
                                        <div className="pl-13 ml-3 border-l-2 border-zinc-800 pl-4">
                                            <p className="text-zinc-400 italic mb-3">"{h.dare}"</p>
                                            <div className="text-[10px] text-zinc-500 font-mono uppercase bg-black/40 p-2 rounded inline-block border border-zinc-800">
                                                VERDICT: <span className="text-yellow-500">{h.verdict.slice(0, 50)}...</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* The L (Losers) */}
                    <div>
                        <div className="flex items-center gap-4 mb-12 border-b border-red-500/30 pb-6">
                            <div className="p-3 bg-red-500/10 rounded-full border border-red-500/50">
                                <TrendingDown className="text-red-400 w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-white italic">THE GRAVEYARD</h2>
                                <p className="text-red-500/80 font-mono text-xs uppercase tracking-wider">Press F to Pay Respects</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {losers.map((h, i) => (
                                <motion.div
                                    key={h.id}
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.15 }}
                                    className="group relative"
                                >
                                    <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl opacity-10 group-hover:opacity-30 blur transition duration-500" />
                                    <div className="relative bg-black border border-zinc-800 p-6 rounded-xl grayscale group-hover:grayscale-0 transition-all duration-500">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <Skull size={24} className="text-zinc-600 group-hover:text-red-500 transition-colors" />
                                                <span className="font-bold text-xl text-zinc-500 line-through decoration-red-500/50 group-hover:text-white transition-colors">
                                                    {h.player1.name}
                                                </span>
                                            </div>
                                            <span className="text-red-900 font-black tracking-widest uppercase text-xs border border-red-900/30 px-2 py-1 bg-red-900/10">
                                                Slashed
                                            </span>
                                        </div>
                                        <p className="text-zinc-600 italic text-sm mb-3 group-hover:text-zinc-400 transition-colors">"{h.dare}"</p>
                                        <div className="text-xs text-red-500/50 font-mono">
                                            LOST: {h.bounty}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
