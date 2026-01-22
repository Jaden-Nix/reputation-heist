'use client';
import { useState, useEffect } from 'react';

export function useEthosReputation(address: string) {
    const [score, setScore] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!address) {
            setLoading(false);
            setScore(null);
            return;
        }

        setLoading(true);

        async function fetchEthos() {
            try {
                // Simulate network delay for "Scanning" feel
                await new Promise(resolve => setTimeout(resolve, 1500));

                const response = await fetch(`https://api.ethos.network/api/v2/profiles/${address}`, {
                    headers: {
                        'X-Ethos-Client': 'reputation-heist@1.0.0'
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setScore(data.credibilityScore || data.score || 0);
                } else {
                    console.warn("Ethos Profile not found, defaulting to 0 score.");
                    setScore(0);
                }
            } catch (err) {
                console.warn("Ethos API connection failed, defaulting to 0 score.");
                setScore(0);
            } finally {
                setLoading(false);
            }
        }

        fetchEthos();
    }, [address]);

    return { score, loading, formatted: score ? `${score} / 2000` : "Scanning..." };
}
