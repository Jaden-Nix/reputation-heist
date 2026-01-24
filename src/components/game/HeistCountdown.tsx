'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface HeistCountdownProps {
    startTime: number;
    duration: number;
    onExpire?: () => void;
}

export function HeistCountdown({ startTime, duration, onExpire }: HeistCountdownProps) {
    const [timeLeft, setTimeLeft] = useState<number | null>(null);

    useEffect(() => {
        if (!startTime || !duration) return;

        const endTime = startTime + duration;

        const updateTimer = () => {
            const now = Math.floor(Date.now() / 1000);
            const remaining = endTime - now;

            if (remaining <= 0) {
                setTimeLeft(0);
                if (onExpire) onExpire();
            } else {
                setTimeLeft(remaining);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [startTime, duration, onExpire]);

    if (timeLeft === null) return null;

    const h = Math.floor(timeLeft / 3600);
    const m = Math.floor((timeLeft % 3600) / 60);
    const s = timeLeft % 60;

    const isExpiring = timeLeft < 300; // < 5 mins

    return (
        <div className={`flex items-center gap-2 font-mono ${isExpiring ? 'text-red-500 animate-pulse' : 'text-neon-cyan'}`}>
            <Clock size={16} />
            <span className="text-xl font-black">
                {h.toString().padStart(2, '0')}:{m.toString().padStart(2, '0')}:{s.toString().padStart(2, '0')}
            </span>
            <span className="text-[10px] uppercase opacity-50">REMAINING</span>
        </div>
    );
}
