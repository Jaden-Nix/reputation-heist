'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

// Simplified SoundManager without external dependencies for now
// In a real build, we would incorporate use-sound here

interface SoundContextType {
    playHover: () => void;
    playClick: () => void;
    playSuccess: () => void;
    playFail: () => void;
    muted: boolean;
    toggleMute: () => void;
}

const SoundContext = createContext<SoundContextType>({
    playHover: () => { },
    playClick: () => { },
    playSuccess: () => { },
    playFail: () => { },
    muted: true,
    toggleMute: () => { },
});

export function SoundManager({ children }: { children: ReactNode }) {
    const [muted, setMuted] = useState(true); // Default to muted for politeness

    // Mock functions (replace with real Audio() calls if we had files)
    const playHover = () => {
        if (!muted) {
            // new Audio('/sounds/hover.mp3').play().catch(() => {});
        }
    };

    const playClick = () => {
        if (!muted) {
            // new Audio('/sounds/click.mp3').play().catch(() => {});
        }
    };

    const playSuccess = () => { };
    const playFail = () => { };

    return (
        <SoundContext.Provider value={{ playHover, playClick, playSuccess, playFail, muted, toggleMute: () => setMuted(!muted) }}>
            {children}
            {/* Visual Mute Toggle could go here globally, or in components */}
        </SoundContext.Provider>
    );
}

export const useSoundManager = () => useContext(SoundContext);
