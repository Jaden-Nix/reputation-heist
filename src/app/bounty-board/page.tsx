'use client';
import { useState, useEffect } from 'react';
import { LEGENDARY_HEISTS } from '@/lib/seedData';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Shield, Zap, Skull, Filter, Activity, Search } from 'lucide-react';
import HeistTicker from '@/components/ui/HeistTicker';
import { DiscoverAgents } from '@/components/game/ActiveAgents';

import { useAccount } from 'wagmi';

export default function BountyBoard() {
    const { address, isConnected } = useAccount();
    const [heists, setHeists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

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

    const inboundChallenges = heists.filter(h =>
        h.player2?.address?.toLowerCase() === address?.toLowerCase() &&
        h.status === 'CREATED' // Assuming 'CREATED' is the waiting status
    );

    const filteredHeists = heists.filter(h =>
        (h.dare.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.player1.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
        h.player2?.address?.toLowerCase() !== address?.toLowerCase() // Don't duplicate in general list
    );

    return (
        <main className="min-h-screen p-8 pt-28 pb-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-heist-bg -z-10" />

            {/* Ethos Background Detail */}
            <div className="absolute top-0 right-0 w-1/3 h-full opacity-[0.03] pointer-events-none">
                <div className="absolute inset-0 ethos-scan-line" />
                <div className="text-[10rem] font-black rotate-90 origin-top-right translate-x-1/2">ETHOS</div>
            </div>

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-zinc-200 dark:border-zinc-800 pb-8 gap-6">
                <div className="relative">
                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-neon-cyan/50" />
                    <h1 className="text-5xl md:text-7xl font-black italic text-foreground mb-2 glitch-text tracking-tighter flex items-baseline gap-0.5" data-text="THE BOARD">
                        THE BOARD
                        <Skull className="text-foreground fill-foreground translate-y-0 opacity-100" size={12} strokeWidth={0} />
                    </h1>
                    <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
                        <span className="flex items-center gap-1 text-neon-cyan"><Activity size={14} /> LIVE_UPLINK</span>
                        <span>•</span>
                        <span className="text-purple-500 flex items-center gap-1"><Shield size={14} /> ETHOS_ENFORCED</span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <input
                            type="text"
                            placeholder="Search Accounts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-background/50 backdrop-blur-sm border border-zinc-300 dark:border-zinc-700 rounded-full py-3 pl-10 pr-4 text-sm focus:border-neon-cyan outline-none font-mono transition-all hover:bg-background/80"
                        />
                    </div>
                    <Link href="/create-heist" className="w-full md:w-auto">
                        <button className="w-full px-8 py-3 bg-neon-cyan text-black font-black uppercase rounded-full hover:bg-white transition-all shadow-[0_0_20px_rgba(0,243,255,0.3)] flex items-center justify-center gap-2 hover:scale-105 active:scale-95">
                            + DEPLOY DARE
                        </button>
                    </Link>
                </div>
            </header>

            <DiscoverAgents searchQuery={searchQuery} />

            {/* Inbound Notifications */}
            {isConnected && inboundChallenges.length > 0 && (
                <div className="mb-12">
                    <div className="flex items-center gap-4 mb-6">
                        <h2 className="text-2xl font-black italic text-red-500 flex items-center gap-2 uppercase tracking-tighter">
                            <Zap className="animate-pulse" size={20} /> Challenges For You
                        </h2>
                        <div className="flex-1 h-[1px] bg-gradient-to-r from-red-500/50 to-transparent" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {inboundChallenges.map((heist, i) => (
                            <motion.div
                                key={heist.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-red-950/20 border border-red-500/40 p-6 relative group overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-2 text-red-500 opacity-50"><AlertTriangle size={16} /></div>
                                <div className="text-[10px] font-mono text-red-400 mb-2">TARGETED CHALLENGE</div>
                                <h3 className="text-xl font-black text-white mb-4 uppercase">{heist.dare}</h3>
                                <div className="flex justify-between items-center mb-6">
                                    <div className="text-xs font-mono text-zinc-500">BOUNTY: <span className="text-red-400">{heist.bounty} ETH</span></div>
                                    <div className="text-xs font-mono text-zinc-500">STAKE: <span className="text-red-400">{heist.stakedRep} CRED</span></div>
                                </div>
                                <Link href={`/heist/${heist.id}`}>
                                    <button className="w-full bg-red-600 text-white font-black uppercase py-3 text-xs hover:bg-white hover:text-red-600 transition-all">
                                        VIEW MISSION
                                    </button>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex items-center gap-2 mb-8 mt-12">
                <h2 className="text-2xl font-black italic text-foreground flex items-center gap-2 uppercase">
                    <Activity className="text-neon-cyan" size={20} /> Active Missions
                </h2>
                <div className="flex-1 h-px bg-zinc-800 ml-4" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence>
                    {filteredHeists.map((heist, i) => (
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

                            <Link href={heist.id === 'h-1' ? `/heist/${heist.id}?demo=denied` : `/heist/${heist.chainHeistId || heist.id}`}>
                                <button className="w-full bg-foreground text-background font-black uppercase py-4 text-sm hover:bg-neon-cyan hover:text-black transition-all">
                                    {heist.id === 'h-1' ? "ACCEPT MISSION (DEMO: DENIED)" : "ACCEPT MISSION"}
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
