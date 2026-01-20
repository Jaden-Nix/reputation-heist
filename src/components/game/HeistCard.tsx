'use client';
import { motion } from 'framer-motion';
import { Shield, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';

interface HeistCardProps {
    heist: any;
    onBet: (heist: any, side: 'P1' | 'P2') => void;
}

export default function HeistCard({ heist, onBet }: HeistCardProps) {
    // Mock Sentiment Data
    const sentiment = 65; // 65% believe P1 wins

    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-heist-panel border border-zinc-800 rounded-xl overflow-hidden group relative flex flex-col md:flex-row hover:border-heist-text transition-colors"
        >
            {/* Left: Heist Info (The "Job") */}
            <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-zinc-800 flex flex-col justify-between relative">
                <div className="absolute top-0 right-0 bg-heist-bg border-l border-b border-zinc-800 px-2 py-1 text-[10px] font-mono text-heist-subtext">
                    ID: {heist.id}
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-neon-cyan font-bold leading-none">{heist.bounty}</span>
                        <span className="text-[10px] bg-heist-bg px-1 rounded text-heist-subtext border border-zinc-800">{heist.category}</span>
                    </div>
                    <h3 className="text-heist-text font-bold text-lg mb-1 leading-tight group-hover:text-neon-cyan transition-colors">{heist.dare}</h3>
                    <div className="flex items-center gap-1 text-xs text-heist-subtext font-mono">
                        <Shield size={12} className="text-purple-500" />
                        <span>{heist.player1.name} (Challenger)</span>
                    </div>
                </div>

                <Link href={`/heist/${heist.id}`}>
                    <button className="mt-4 w-full text-xs font-black uppercase bg-heist-bg hover:bg-heist-text hover:text-heist-bg py-2 border border-zinc-700 transition-colors">
                        ENTER MISSION
                    </button>
                </Link>
            </div>

            {/* Right: Betting Market (Spectator) */}
            <div className="w-full md:w-48 bg-black/20 p-4 flex flex-col justify-center space-y-3 relative overflow-hidden">
                {/* Sentiment Meter Background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="h-full bg-green-500" style={{ width: `${sentiment}%` }} />
                </div>

                <div className="flex justify-between text-[10px] uppercase font-bold text-heist-subtext mb-1">
                    <span>WIN ({sentiment}%)</span>
                    <span>FAIL ({100 - sentiment}%)</span>
                </div>

                {/* Split Action Button */}
                <div className="flex gap-1 h-10">
                    <button
                        onClick={() => onBet(heist, 'P1')}
                        className="flex-1 bg-zinc-900/80 border border-green-900/30 hover:bg-green-500/20 hover:border-green-500 text-green-500 font-bold text-xs transition-all flex items-center justify-center gap-1"
                    >
                        <TrendingUp size={14} /> WIN
                    </button>
                    <button
                        onClick={() => onBet(heist, 'P2')}
                        className="flex-1 bg-zinc-900/80 border border-red-900/30 hover:bg-red-500/20 hover:border-red-500 text-red-500 font-bold text-xs transition-all flex items-center justify-center gap-1"
                    >
                        <TrendingDown size={14} /> FAIL
                    </button>
                </div>

                <div className="text-center text-[10px] text-zinc-600 font-mono">
                    VOL: 14.2 ETH // HOT
                </div>
            </div>
        </motion.div>
    );
}
