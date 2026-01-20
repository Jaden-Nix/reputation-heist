'use client';
import { LEGENDARY_HEISTS } from '@/lib/seedData';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function HallOfFame() {
    const winners = LEGENDARY_HEISTS.filter((_, i) => i % 2 === 0); // Fake split
    const losers = LEGENDARY_HEISTS.filter((_, i) => i % 2 !== 0);

    return (
        <main className="min-h-screen bg-heist-bg p-8 text-white">
            <header className="mb-12 text-center">
                <Link href="/" className="text-zinc-500 hover:text-white mb-4 block font-mono">← BACK TO LOBBY</Link>
                <h1 className="text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">HALL OF FAME</h1>
                <p className="text-zinc-500">ETERNAL GLORY & PUBLIC SHAME</p>
            </header>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">

                {/* The Gallery (Winners) */}
                <div>
                    <h2 className="text-2xl font-black text-yellow-500 mb-8 flex items-center gap-2 border-b border-yellow-500/20 pb-4">
                        <TrendingUp /> THE LEGENDS (WINNERS)
                    </h2>
                    <div className="space-y-4">
                        {winners.map((h, i) => (
                            <motion.div
                                key={h.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-zinc-900/50 border-l-4 border-yellow-500 p-4 hover:bg-zinc-900 transition-colors"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-lg">{h.player1.name}</span>
                                    <span className="text-yellow-500 font-mono">+{h.bounty}</span>
                                </div>
                                <p className="text-zinc-400 text-sm italic">"{h.dare}"</p>
                                <div className="mt-2 text-xs text-zinc-600 font-mono">VERDICT: {h.verdict}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* The L (Losers) */}
                <div>
                    <h2 className="text-2xl font-black text-danger-red mb-8 flex items-center gap-2 border-b border-danger-red/20 pb-4">
                        <TrendingDown /> THE L (SHAME)
                    </h2>
                    <div className="space-y-4">
                        {losers.map((h, i) => (
                            <motion.div
                                key={h.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-zinc-900/50 border-l-4 border-danger-red p-4 opacity-75 hover:opacity-100 transition-opacity"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-lg text-zinc-400 line-through decoration-danger-red">{h.player1.name}</span>
                                    <span className="text-danger-red font-mono">SLASHED</span>
                                </div>
                                <p className="text-zinc-500 text-sm italic">"{h.dare}"</p>
                                <div className="mt-2 text-xs text-red-900 font-bold font-mono">"{h.verdict}"</div>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </main>
    );
}
