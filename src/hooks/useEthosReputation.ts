'use client';
import { useState, useEffect } from 'react';

export function useEthosReputation(address: string) {
    const [score, setScore] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!address) return;

        async function fetchEthos() {
            try {
                const response = await fetch(`https://api.ethos.network/api/v2/profiles/${address}`, {
                    headers: {
                        'X-Ethos-Client': 'reputation-heist@1.0.0'
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    // Example mapping - actual field might vary based on API response structure
                    setScore(data.credibilityScore || data.score || 1000); 
                } else {
                    // Fallback to deterministic mock if API fails
                    const mockScore = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 2000;
                    setScore(mockScore);
                }
            } catch (err) {
                const mockScore = address.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 2000;
                setScore(mockScore);
            } finally {
                setLoading(false);
            }
        }

        fetchEthos();
    }, [address]);

    return { score, loading, formatted: score ? `${score} / 2000` : "Scanning..." };
}
