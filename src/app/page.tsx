'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import HeistTicker from '@/components/ui/HeistTicker';
import HeistMasterEye from '@/components/ui/HeistMasterEye';
import { Shield, Zap, TrendingUp, ArrowRight, UserCircle2 } from 'lucide-react';

export default function Home() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-6 pt-32 relative overflow-hidden bg-heist-bg">
            {/* Global UI Elements */}
            <div className="crt-scanline absolute inset-0 pointer-events-none opacity-20" />
            <HeistTicker />

            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neon-cyan/5 via-transparent to-transparent -z-10" />

            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10">

                {/* Hero Section (Left) */}
                <div className="lg:col-span-7 flex flex-col items-start space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neon-cyan/30 bg-neon-cyan/5 text-[10px] font-mono text-neon-cyan uppercase tracking-[0.2em]">
                        <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
                        Network Live // v2.0
                    </div>

                    <div className="relative">
                        <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter leading-[0.8] mb-4">
                            REPUTATION<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-purple-500">HEIST</span>
                        </h1>
                        <div className="absolute -right-12 top-0 opacity-20 select-none hidden md:block">
                            <div className="text-[12rem] font-black leading-none rotate-12">01</div>
                        </div>
                    </div>

                    <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-xl leading-relaxed">
                        The world's first AI-judged reputation market.
                        <span className="text-foreground"> Stake ETH on dares.</span>
                        Survive the Heist Master's gaze or get cooked.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4 w-full">
                        <Link href="/bounty-board" className="flex-1 md:flex-none">
                            <button className="w-full md:px-10 py-5 bg-foreground text-background font-black uppercase text-lg hover:bg-neon-cyan transition-all shadow-[0_0_30px_rgba(0,0,0,0.2)] flex items-center justify-center gap-2 group">
                                Enter The Board <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </Link>
                        <Link href="/create-heist" className="flex-1 md:flex-none">
                            <button className="w-full md:px-10 py-5 border-2 border-foreground font-black uppercase text-lg hover:bg-foreground hover:text-background transition-all flex items-center justify-center gap-2">
                                Deploy Dare
                            </button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-3 gap-8 pt-12 border-t border-zinc-200 dark:border-zinc-800 w-full">
                        <div>
                            <div className="text-2xl font-black text-foreground italic">14.2K</div>
                            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Active Ops</div>
                        </div>
                        <div>
                            <div className="text-2xl font-black text-neon-cyan italic">842 ETH</div>
                            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Total Stakes</div>
                        </div>
                        <div>
                            <div className="text-2xl font-black text-purple-500 italic">98%</div>
                            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">AI Confidence</div>
                        </div>
                    </div>
                </div>

                {/* Visual Section (Right) */}
                <div className="lg:col-span-5 relative flex justify-center items-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="relative w-full aspect-square max-w-md flex justify-center items-center"
                    >
                        {/* Orbiting Ring */}
                        <div className="absolute inset-0 border border-dashed border-neon-cyan/20 rounded-full animate-spin-slow" />
                        <div className="absolute inset-8 border border-zinc-800 rounded-full" />

                        <div className="relative z-10 scale-150">
                            <HeistMasterEye />
                        </div>

                        {/* Floating Badges */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute top-0 right-0 bg-background border border-zinc-800 p-3 shadow-xl"
                        >
                            <UserCircle2 className="text-purple-500 mb-1" size={20} />
                            <div className="text-[10px] font-mono font-bold">ETHOS_GATED</div>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 5, repeat: Infinity }}
                            className="absolute bottom-12 left-0 bg-background border border-zinc-800 p-3 shadow-xl"
                        >
                            <TrendingUp className="text-green-500 mb-1" size={20} />
                            <div className="text-[10px] font-mono font-bold">LIVE_MARKET</div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
