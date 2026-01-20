'use client';
import { useState, useEffect } from 'react';

// In a real app, this would use wagmi's useContractRead
// For the Vibeathon, we simulate a call to the Ethos contract on Base

export function useEthosReputation(address: string) {
    const [score, setScore] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!address) return;

        // Simulate network delay
        const timer = setTimeout(() => {
            // Deterministic mock score based on address hash (so it persists)
            const mockScore = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 2000;
            setScore(mockScore);
            setLoading(false);
        }, 1200);

        return () => clearTimeout(timer);
    }, [address]);

    return { score, loading, formatted: score ? `${score} / 2000` : "Scanning..." };
}
