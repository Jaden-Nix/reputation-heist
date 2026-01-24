'use client';
import { useState, useEffect } from 'react';
import type { AttestationResult } from '@/lib/types';

export function useEthosReputation(address: string | undefined | null) {
    const [score, setScore] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [stakedAmount, setStakedAmount] = useState<number>(0);
    const [isSlashing, setIsSlashing] = useState(false); // Visual effect state
    const [attestations, setAttestations] = useState<AttestationResult | null>(null);
    const [attestationsLoading, setAttestationsLoading] = useState(false);

    useEffect(() => {
        if (!address) {
            setLoading(false);
            setScore(null);
            setAttestations(null);
            return;
        }

        setLoading(true);
        setAttestationsLoading(true);

        async function fetchEthos() {
            try {
                // Real Ethos API Fetch
                const response = await fetch(`https://api.ethos.network/api/v2/profiles/${address}`, {
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    // Fallback to random realistic score if API returns 0/null (for demo purposes if user is new)
                    const realScore = data.credibilityScore || data.score || 0;
                    setScore(realScore > 0 ? realScore : 1250);

                    // Extract attestation data
                    const hasTwitter = !!(data.twitter || data.xHandle || data.attestations?.twitter);
                    const hasFarcaster = !!(data.farcaster || data.farcasterHandle || data.attestations?.farcaster);
                    const socialAccounts: string[] = [];
                    if (hasTwitter) socialAccounts.push('twitter');
                    if (hasFarcaster) socialAccounts.push('farcaster');

                    setAttestations({
                        hasTwitter,
                        hasFarcaster,
                        isVerified: hasTwitter || hasFarcaster,
                        socialAccounts
                    });
                } else {
                    console.warn("Ethos Profile not found, defaulting to demo score.");
                    setScore(1250); // Default 'Good' score for demo
                    setAttestations({ hasTwitter: false, hasFarcaster: false, isVerified: false, socialAccounts: [] });
                }
            } catch (err) {
                console.warn("Ethos API connection failed, defaulting to demo score.");
                setScore(1250);
                setAttestations({ hasTwitter: false, hasFarcaster: false, isVerified: false, socialAccounts: [] });
            } finally {
                setLoading(false);
                setAttestationsLoading(false);
            }
        }

        fetchEthos();
    }, [address]);

    // Calculate max stakeable amount (Max 500 or 30% of total)
    const maxStake = score ? Math.min(500, Math.floor(score * 0.3)) : 0;

    const stakeRep = (amount: number) => {
        if (amount > maxStake) return false;
        setStakedAmount(amount);
        return true;
    };

    const slashRep = (amount: number) => {
        setIsSlashing(true);
        setTimeout(() => {
            if (score) setScore(prev => (prev ? prev - amount : 0));
            setStakedAmount(0);
            setIsSlashing(false);
        }, 2000); // 2s visual delay for "Shatter"
    };

    return {
        score,
        loading,
        stakedAmount,
        maxStake,
        isSlashing,
        stakeRep,
        slashRep,
        formatted: score ? `${score} Cred` : "Scanning...",
        // New attestation data
        attestations,
        attestationsLoading,
        isVerified: attestations?.isVerified ?? false
    };
}

