'use client';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function HeistMasterEye() {
    const eyeRef = useRef<HTMLDivElement>(null);
    const [irisPos, setIrisPos] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!eyeRef.current) return;
            const rect = eyeRef.current.getBoundingClientRect();
            const eyeCenterX = rect.left + rect.width / 2;
            const eyeCenterY = rect.top + rect.height / 2;

            const angle = Math.atan2(e.clientY - eyeCenterY, e.clientX - eyeCenterX);
            const distance = Math.min(
                Math.hypot(e.clientX - eyeCenterX, e.clientY - eyeCenterY) / 10,
                15 // Max movement radius
            );

            setIrisPos({
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="relative w-64 h-64 mx-auto mb-8"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}>

            {/* Outer Ring (Orbiting) */}
            <div className="absolute inset-0 rounded-full border border-zinc-800 animate-spin-slow opacity-20" />

            {/* Main Eye Container */}
            <div
                ref={eyeRef}
                className="absolute inset-4 rounded-full bg-heist-panel border-4 border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex items-center justify-center"
            >
                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[url('/grid.png')] opacity-10 pointer-events-none" />

                {/* The Iris */}
                <motion.div
                    animate={{
                        x: irisPos.x,
                        y: irisPos.y,
                        scale: isHovered ? 1.2 : 1
                    }}
                    transition={{ type: "spring", stiffness: 150, damping: 15 }}
                    className="relative w-24 h-24 rounded-full bg-zinc-900 border border-neon-cyan shadow-[0_0_30px_#00f3ff] flex items-center justify-center"
                >
                    {/* Pupil */}
                    <div className={`w-8 h-8 bg-white rounded-full transition-all duration-300 ${isHovered ? 'h-2 w-8' : ''} shadow-[0_0_15px_white]`} />

                    {/* Scanning Line */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-cyan/20 to-transparent h-full animate-scan opacity-50" />
                </motion.div>

                {/* Glitch Overlay Text */}
                <div className="absolute bottom-4 left-0 right-0 text-center text-[10px] text-neon-cyan font-mono opacity-60">
                    WATCHING_V2.0
                </div>
            </div>

            {/* Decor Rings */}
            <div className={`absolute -inset-4 border border-dashed border-zinc-700/50 rounded-full animate-spin-reverse-slow transition-opacity ${isHovered ? 'opacity-100 border-danger-red' : 'opacity-30'}`} />
        </div>
    );
}
