'use client';
import { useState, useEffect } from 'react';
import { LEGENDARY_HEISTS } from '@/lib/seedData';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Shield, Zap, Skull, Filter, Activity, Search } from 'lucide-react';
import HeistTicker from '@/components/ui/HeistTicker';

export default function BountyBoard() {
    const [heists, setHeists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchHeists() {
            try {
                const res = await fetch('/api/heists');
                const data = await res.json();
                // Combine mock and live data
                setHeists([...LEGENDARY_HEISTS, ...(data.heists || [])]);
            } catch (err) {
                setHeists(LEGENDARY_HEISTS);
            } finally {
                setLoading(false);
            }
        }
        fetchHeists();
    }, []);

    return (
        <main className="min-h-screen p-8 pb-24 relative overflow-hidden">
            <div className="crt-scanline absolute inset-0 pointer-events-none fixed" />
            <div className="absolute inset-0 bg-heist-bg -z-10 fixed" />

            {/* Ethos Background Detail */}
            <div className="absolute top-0 right-0 w-1/3 h-full opacity-[0.03] pointer-events-none">
                <div className="absolute inset-0 ethos-scan-line" />
                <div className="text-[10rem] font-black rotate-90 origin-top-right translate-x-1/2">ETHOS</div>
            </div>

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-zinc-200 dark:border-zinc-800 pb-8 gap-6">
                <div className="relative">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-neon-cyan/50" />
                    <h1 className="text-5xl md:text-7xl font-black italic text-foreground mb-2 glitch-text tracking-tighter" data-text="THE BOARD">THE BOARD</h1>
                    <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
                        <span className="flex items-center gap-1 text-neon-cyan"><Activity size={14} /> LIVE_UPLINK</span>
                        <span>•</span>
                        <span className="text-purple-500 flex items-center gap-1"><Shield size={14} /> ETHOS_ENFORCED</span>
                    </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search Dares..." 
                            className="w-full bg-background border border-zinc-300 dark:border-zinc-700 p-2 pl-10 text-sm focus:border-neon-cyan outline-none font-mono"
                        />
                    </div>
                    <Link href="/create-heist" className="w-full md:w-auto">
                        <button className="w-full px-8 py-3 bg-neon-cyan text-black font-black uppercase hover:bg-white transition-all shadow-[0_0_25px_rgba(0,243,255,0.4)] flex items-center justify-center gap-2">
                            + DEPLOY DARE
                        </button>
                    </Link>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence>
                    {heists.map((heist, i) => (
                        <motion.div
                            key={heist.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-heist-panel border border-zinc-200 dark:border-zinc-800 p-8 rounded-none hover:border-neon-cyan transition-all group relative overflow-hidden shadow-sm hover:shadow-[0_0_30px_rgba(0,243,255,0.1)]"
                        >
                            {/* Ethos Verification Badge */}
                            <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                                <Shield size={16} className="text-purple-500" />
                            </div>

                            <div className="flex justify-between items-start mb-8">
                                <span className="text-[10px] font-mono border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 uppercase tracking-widest text-muted-foreground">
                                    {heist.category}
                                </span>
                                <span className="text-neon-cyan font-mono font-black text-xl flex items-center gap-1 italic">
                                    {heist.bounty} <span className="text-xs opacity-50">ETH</span>
                                </span>
                            </div>

                            <h3 className="text-3xl font-black text-foreground mb-4 leading-[0.9] uppercase group-hover:text-neon-cyan transition-colors">
                                {heist.dare}
                            </h3>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-muted-foreground">
                                    <span>Challenger</span>
                                    <span className="text-foreground font-bold">{heist.player1.name}</span>
                                </div>
                                <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-900 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-neon-cyan/20 animate-pulse" />
                                    <div className="absolute top-0 bottom-0 left-0 bg-neon-cyan shadow-[0_0_10px_#00f3ff]" style={{ width: '45%' }} />
                                </div>
                                <div className="flex justify-between text-[9px] font-mono text-muted-foreground">
                                    <span>ETHOS SCANNING...</span>
                                    <span className="text-neon-cyan">VERIFIED_94%</span>
                                </div>
                            </div>

                            <Link href={`/heist/${heist.id}`}>
                                <button className="w-full bg-foreground text-background font-black uppercase py-4 text-sm hover:bg-neon-cyan hover:text-black transition-all">
                                    ACCEPT MISSION
                                </button>
                            </Link>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <HeistTicker />
        </main>
    )
}
