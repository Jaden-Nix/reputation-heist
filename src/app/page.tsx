'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import HeistTicker from '@/components/ui/HeistTicker';
import HeistMasterEye from '@/components/ui/HeistMasterEye';
import HeistCard from '@/components/game/HeistCard';
import BettingSlip from '@/components/game/BettingSlip';
import { Trophy, ShieldAlert, VenetianMask, Flame } from 'lucide-react';
import { LEGENDARY_HEISTS } from '@/lib/seedData';

export default function Home() {
    // Filter reasonable "Active" heists for display
    const activeHeists = LEGENDARY_HEISTS.slice(0, 3);

    // Betting State
    const [isSlipOpen, setIsSlipOpen] = useState(false);
    const [selectedHeist, setSelectedHeist] = useState<any>(null);
    const [betSide, setBetSide] = useState<'P1' | 'P2' | null>(null);
    const [feedMode, setFeedMode] = useState<'ARENA' | 'MARKET'>('ARENA');

    const openBettingSlip = (heist: any, side: 'P1' | 'P2') => {
        setSelectedHeist(heist);
        setBetSide(side);
        setIsSlipOpen(true);
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">

            {/* Global UI Elements */}
            <div className="crt-scanline absolute inset-0 pointer-events-none" />
            <HeistTicker />

            {/* Ambient Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/50 via-heist-bg to-heist-bg -z-10" />

            {/* Hero Content */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="z-10 flex flex-col items-center max-w-4xl w-full"
            >
                <HeistMasterEye />

                <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-heist-text to-heist-subtext mb-2 glitch-text" data-text="REPUTATION HEIST">
                    REPUTATION HEIST
                </h1>

                <p className="text-neon-cyan/80 font-mono text-lg mb-12 tracking-widest uppercase text-center max-w-xl">
                    <span className="text-heist-text">v2.0_BUNKER</span> // Bet your Reputation. Survive the 2026 wasteland.
                </p>

                {/* Main Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-lg mb-12">
                    <Link href="/create-heist" className="group">
                        <div className="bg-neon-cyan text-black p-6 rounded-none hover:bg-white transition-all hover:translate-x-1 hover:-translate-y-1 relative shadow-[0_0_20px_rgba(0,243,255,0.3)]">
                            <h3 className="text-2xl font-black uppercase mb-1">DEPLOY HEIST</h3>
                            <p className="font-mono text-xs font-bold opacity-70">Seek Target. Stake ETH.</p>
                        </div>
                    </Link>

                    <Link href="/bounty-board" className="group">
                        <div className="bg-heist-panel border border-zinc-800 p-6 rounded-none hover:border-heist-text transition-all hover:translate-x-1 hover:-translate-y-1 relative">
                            <h3 className="text-2xl font-black uppercase text-heist-text mb-1 group-hover:text-neon-cyan">Find Missions</h3>
                            <p className="text-heist-subtext font-mono text-xs">Hunt Bounties. Join Ops.</p>
                        </div>
                    </Link>
                </div>

                {/* Active Operations Feed */}
                <div className="w-full max-w-4xl">
                    <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-2">
                        <div className="flex items-center gap-2">
                            <Flame className="text-danger-red animate-pulse" />
                            <span className="text-sm font-bold text-heist-subtext">HOSTILE_OPERATIONS_NEARBY</span>
                        </div>

                        {/* Arena Mode Toggle */}
                        <div className="flex bg-heist-panel p-1 rounded border border-zinc-800">
                            <button
                                onClick={() => setFeedMode('ARENA')}
                                className={`px-3 py-1 text-[10px] font-bold uppercase rounded transition-colors ${feedMode === 'ARENA' ? 'bg-zinc-700 text-white' : 'text-heist-subtext hover:text-heist-text'}`}
                            >
                                ARENA VIEW
                            </button>
                            <button
                                onClick={() => setFeedMode('MARKET')}
                                className={`px-3 py-1 text-[10px] font-bold uppercase rounded transition-colors ${feedMode === 'MARKET' ? 'bg-neon-cyan text-black' : 'text-heist-subtext hover:text-heist-text'}`}
                            >
                                MARKET VIEW
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {feedMode === 'ARENA' ? (
                            activeHeists.map(h => (
                                <HeistCard key={h.id} heist={h} onBet={openBettingSlip} />
                            ))
                        ) : (
                            <div className="bg-heist-panel border border-zinc-800 p-4">
                                <div className="grid grid-cols-5 text-xs font-mono text-zinc-500 border-b border-zinc-800 pb-2 mb-2 uppercase tracking-wider">
                                    <div className="col-span-2">Contract</div>
                                    <div className="text-right">Bounty</div>
                                    <div className="text-right">Vol (24h)</div>
                                    <div className="text-right">Action</div>
                                </div>
                                {activeHeists.map((h, i) => (
                                    <div key={h.id} className="grid grid-cols-5 items-center py-3 border-b border-zinc-800/50 hover:bg-white/5 transition-colors group">
                                        <div className="col-span-2 flex flex-col">
                                            <span className="text-white font-bold text-sm group-hover:text-neon-cyan transition-colors">{h.player1.name} VS {h.player2.name}</span>
                                            <span className="text-[10px] text-zinc-500 font-mono">{h.category} // {h.timestamp}</span>
                                        </div>
                                        <div className="text-right font-mono text-neon-cyan">{h.bounty}</div>
                                        <div className="text-right font-mono text-zinc-400">{(Math.random() * 10).toFixed(2)} ETH</div>
                                        <div className="text-right">
                                            <button
                                                onClick={() => openBettingSlip(h, 'P1')}
                                                className="bg-zinc-800 hover:bg-neon-cyan hover:text-black text-white text-[10px] uppercase font-bold px-3 py-1 rounded transition-all"
                                            >
                                                TRADE
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </motion.div>

            <BettingSlip
                isOpen={isSlipOpen}
                onClose={() => setIsSlipOpen(false)}
                heist={selectedHeist}
                side={betSide}
            />
        </main>
    );
}
