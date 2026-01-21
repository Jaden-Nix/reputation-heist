'use client';
import { LEGENDARY_HEISTS } from '@/lib/seedData';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield, Zap, Skull, Filter } from 'lucide-react';
import HeistTicker from '@/components/ui/HeistTicker';

export default function BountyBoard() {
    return (
        <main className="min-h-screen p-8 pb-24 relative">
            <div className="crt-scanline absolute inset-0 pointer-events-none fixed" />
            <div className="absolute inset-0 bg-heist-bg -z-10 fixed" />

            <header className="flex justify-between items-center mb-12 border-b border-zinc-200 dark:border-zinc-800 pb-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black italic text-foreground mb-2 glitch-text" data-text="BOUNTY BOARD">BOUNTY BOARD</h1>
                    <p className="text-muted-foreground font-mono text-sm tracking-tighter">/// ACTIVE_CONTRACTS /// ETHOS_VERIFIED</p>
                </div>
                <div className="flex gap-4">
                    <Link href="/create-heist">
                        <button className="px-6 py-2 bg-primary text-primary-foreground font-black uppercase hover:scale-105 transition-transform shadow-[0_0_15px_rgba(0,243,255,0.3)]">
                            + NEW DARE
                        </button>
                    </Link>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Create New Card */}
                <Link href="/create-heist">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="h-full border-2 border-dashed border-zinc-700 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-neon-cyan hover:bg-neon-cyan/5 group transition-colors"
                    >
                        <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center mb-4 group-hover:bg-neon-cyan group-hover:text-black transition-colors">
                            <span className="text-4xl font-light">+</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">POST A DARE</h3>
                        <p className="text-zinc-500 text-sm">Challenge the network. Stake ETH.</p>
                    </motion.div>
                </Link>

                {LEGENDARY_HEISTS.map((heist, i) => (
                    <motion.div
                        key={heist.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-heist-panel border border-zinc-800 p-6 rounded-xl hover:border-zinc-600 transition-all group relative overflow-hidden"
                    >
                        {/* Hover Glow */}
                        <div className="absolute inset-0 bg-neon-cyan/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                        <div className="flex justify-between items-start mb-6">
                            <span className="bg-zinc-900 text-zinc-400 text-xs px-2 py-1 rounded font-mono border border-zinc-800">
                                {heist.category}
                            </span>
                            <span className="text-neon-cyan font-mono font-bold flex items-center gap-1">
                                <Zap size={14} className="animate-pulse" /> {heist.bounty}
                            </span>
                        </div>

                        <h3 className="text-2xl font-bold text-white mb-2 leading-tight group-hover:text-neon-cyan transition-colors">
                            {heist.dare}
                        </h3>

                        <div className="flex items-center gap-2 mb-6">
                            <span className="text-zinc-500 text-xs font-mono">CHALLENGER:</span>
                            <div className="flex items-center gap-1">
                                <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full" />
                                <span className="text-sm text-zinc-300">{heist.player1.name}</span>
                            </div>
                        </div>

                        {/* Stats / Actions */}
                        <div className="grid grid-cols-2 gap-2 mt-auto">
                            <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800/50">
                                <div className="text-[10px] text-zinc-500 font-mono mb-1">ETHOS REQ</div>
                                <div className="text-white font-bold flex items-center gap-1">
                                    <Shield size={12} className="text-purple-500" />
                                    1200+
                                </div>
                            </div>
                            <div className="bg-zinc-900/50 p-2 rounded border border-zinc-800/50">
                                <div className="text-[10px] text-zinc-500 font-mono mb-1">WIN PROB</div>
                                <div className="text-green-500 font-bold">42%</div>
                            </div>
                        </div>

                        <Link href={`/heist/${heist.id}`}>
                            <button className="w-full mt-4 bg-zinc-100 text-black font-black uppercase py-3 hover:bg-neon-cyan hover:scale-[1.02] transition-all">
                                ACCEPT DARE
                            </button>
                        </Link>
                    </motion.div>
                ))}
            </div>

            <HeistTicker />
        </main>
    )
}
