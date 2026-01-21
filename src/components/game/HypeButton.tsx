'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ThumbsDown } from 'lucide-react';

export default function HypeButton() {
    const [hypeCount, setHypeCount] = useState(0);
    const [particles, setParticles] = useState<{ id: number, x: number, y: number }[]>([]);

    const triggerHype = (e: React.MouseEvent) => {
        setHypeCount(prev => prev + 1);

        // Add particle
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();

        setParticles(prev => [...prev, { id, x, y }]);
        setTimeout(() => {
            setParticles(prev => prev.filter(p => p.id !== id));
        }, 1000);
    };

    return (
        <div className="flex gap-4">
            <button
                onClick={triggerHype}
                className="relative flex-1 bg-zinc-900 border border-zinc-700 hover:border-yellow-400 p-4 group overflow-hidden"
            >
                <div className="relative z-10 flex flex-col items-center gap-1">
                    <Zap className="text-yellow-500 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-mono text-zinc-400 group-hover:text-white">HYPE</span>
                    <span className="text-xl font-black text-white">{hypeCount}</span>
                </div>

                {/* Click Flash */}
                <span className="absolute inset-0 bg-yellow-500/10 opacity-0 group-active:opacity-100 transition-opacity" />

                {/* Particles */}
                <AnimatePresence>
                    {particles.map(p => (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 1, y: 0, scale: 1 }}
                            animate={{ opacity: 0, y: -50, scale: 1.5 }}
                            exit={{ opacity: 0 }}
                            className="absolute text-yellow-400 font-bold text-lg pointer-events-none"
                            style={{ left: p.x, top: p.y }}
                        >
                            +1
                        </motion.div>
                    ))}
                </AnimatePresence>
            </button>

            <button className="flex-1 bg-zinc-900 border border-zinc-700 hover:border-red-500 p-4 group">
                <div className="flex flex-col items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                    <ThumbsDown className="text-red-500" />
                    <span className="text-xs font-mono text-zinc-400">BOO</span>
                </div>
            </button>
        </div>
    );
}
