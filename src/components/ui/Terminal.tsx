'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TerminalProps {
    logs: string[];
    className?: string;
}

export default function Terminal({ logs, className }: TerminalProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className={`bg-black border border-zinc-800 p-4 font-mono text-sm h-64 overflow-hidden flex flex-col relative ${className}`}>
            {/* Scanline Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none z-10" />

            <div className="text-zinc-500 mb-2 border-b border-zinc-800 pb-2 flex justify-between">
                <span>HEIST_MASTER_V2.0 // TERMINAL_OUTPUT</span>
                <span className="animate-pulse text-green-500">● ONLINE</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 scrollbar-hide" ref={scrollRef}>
                <AnimatePresence>
                    {logs.map((log, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-green-500 break-words"
                        >
                            <span suppressHydrationWarning className="text-zinc-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                            {log.startsWith('>') ? <span className="text-neon-cyan">{log}</span> : log}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
