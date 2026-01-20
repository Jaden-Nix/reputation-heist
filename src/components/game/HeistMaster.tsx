
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Terminal, Users, CheckCircle, XCircle } from 'lucide-react';

export type HeistMasterMood = 'idle' | 'judging' | 'brutal' | 'impressed' | 'disappointed';

interface HeistMasterProps {
    mood: HeistMasterMood;
    message?: string; // The verdict or status message
}

const MOOD_CONFIG = {
    idle: { color: 'text-cyan-400', icon: Terminal, glitch: false },
    judging: { color: 'text-yellow-400', icon: Users, glitch: true },
    brutal: { color: 'text-red-500', icon: XCircle, glitch: true },
    impressed: { color: 'text-green-400', icon: CheckCircle, glitch: true },
    disappointed: { color: 'text-gray-400', icon: Terminal, glitch: false },
};

const GLITCH_ANIMATION = {
    x: [0, -2, 2, -1, 1, 0],
    y: [0, 1, -1, 0],
    filter: [
        'hue-rotate(0deg)',
        'hue-rotate(90deg)',
        'hue-rotate(0deg)',
    ],
};

export function HeistMaster({ mood, message }: HeistMasterProps) {
    const config = MOOD_CONFIG[mood];
    const Icon = config.icon;
    const [displayMessage, setDisplayMessage] = useState(message || "SYSTEM ONLINE. AWAITING DARES.");

    // Typing effect when message changes
    useEffect(() => {
        if (!message) return;
        setDisplayMessage("");
        let i = 0;
        const interval = setInterval(() => {
            setDisplayMessage(message.substring(0, i + 1));
            i++;
            if (i === message.length) clearInterval(interval);
        }, 40); // Fast typing speed
        return () => clearInterval(interval);
    }, [message]);

    return (
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
            {/* Avatar Container */}
            <motion.div
                className={clsx(
                    "w-32 h-32 rounded-full border-4 flex items-center justify-center bg-black shadow-[0_0_30px_rgba(0,0,0,0.5)]",
                    config.color === 'text-cyan-400' ? 'border-cyan-400 shadow-cyan-400/50' :
                        config.color === 'text-red-500' ? 'border-red-500 shadow-red-500/50' :
                            config.color === 'text-green-400' ? 'border-green-400 shadow-green-400/50' :
                                config.color === 'text-yellow-400' ? 'border-yellow-400 shadow-yellow-400/50' :
                                    'border-gray-500'
                )}
                animate={config.glitch ? GLITCH_ANIMATION : {}}
                transition={{
                    duration: 0.5,
                    repeat: config.glitch ? Infinity : 0,
                    repeatDelay: Math.random() * 2,
                }}
            >
                <Icon className={clsx("w-16 h-16", config.color)} />
            </motion.div>

            {/* Message Box */}
            <div className="w-full max-w-md bg-black/80 border border-gray-800 p-4 rounded-lg font-mono min-h-[100px] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 animate-scan" />

                <p className={clsx("text-lg font-bold leading-relaxed", config.color)}>
                    {">"} {displayMessage}<span className="animate-pulse">_</span>
                </p>
            </div>

            {/* Mood Indicator (Hidden or Subtle) */}
            <div className="text-xs text-gray-600 uppercase tracking-widest">
                System Status: <span className={config.color}>{mood}</span>
            </div>
        </div>
    );
}
