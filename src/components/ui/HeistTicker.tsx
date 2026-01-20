'use client';
import { useState, useEffect } from 'react';
import { LEGENDARY_HEISTS, generateLiveHeist } from '@/lib/seedData';
import { Heist } from '@/lib/types';

export default function HeistTicker() {
    const [heists, setHeists] = useState<Heist[]>(LEGENDARY_HEISTS);

    // Live Simulator: Add a new heist every 8 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            const newHeist = generateLiveHeist();
            setHeists(prev => [newHeist, ...prev.slice(0, 19)]); // Keep last 20
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    // Double the list for seamless marquee
    const displayHeists = [...heists, ...heists];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-heist-panel border-t border-zinc-800 h-10 flex items-center z-50">
            <div className="absolute left-0 bg-heist-panel px-3 py-2 z-10 border-r border-zinc-800 text-neon-cyan font-black text-xs uppercase tracking-widest">
                LIVE FEED
            </div>
            <div className="flex animate-marquee whitespace-nowrap gap-12 items-center px-4">
                {displayHeists.map((h, i) => (
                    <div key={`${h.id}-${i}`} className="flex items-center gap-3 text-xs font-mono">
                        <span className="text-zinc-600">[{h.timestamp}]</span>
                        <span className={h.status === 'LIVE' ? "text-neon-cyan animate-pulse" : "text-zinc-500"}>
                            {h.status === 'LIVE' ? "● ACTIVE" : "✓ SETTLED"}
                        </span>
                        <span className="text-white font-bold uppercase">{h.player1.name}</span>
                        <span className="text-danger-red font-black">VS</span>
                        <span className="text-white font-bold uppercase">{h.player2.name}</span>
                        <span className="bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-400">{h.category}</span>
                        <span className="text-warning-yellow font-bold">{h.bounty}</span>

                        {h.verdict && (
                            <span className="text-danger-red font-bold"> :: {h.verdict.slice(0, 30)}...</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
