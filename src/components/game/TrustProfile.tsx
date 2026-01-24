'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useEthosReputation } from '@/hooks/useEthosReputation';
import { Skull, Shield, Lock } from 'lucide-react';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';

interface TrustProfileProps {
    address: string;
    isOpponent?: boolean;
    stakedAmount?: number;
}

export function TrustProfile({ address, isOpponent = false, stakedAmount = 0 }: TrustProfileProps) {
    const { score, loading, maxStake, attestations, attestationsLoading } = useEthosReputation(address);
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch by only rendering address on client
    useEffect(() => {
        setMounted(true);
    }, []);

    // Format address safely - returns consistent placeholder during SSR
    const formatAddress = (addr: string) => {
        if (!mounted || !addr) return '0x...';
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: isOpponent ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`relative p-4 rounded-xl border-2 ${isOpponent ? 'border-red-500/20 bg-red-950/20' : 'border-blue-500/20 bg-blue-950/20'
                } backdrop-blur-sm w-full`}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    {isOpponent ? <Skull className="w-5 h-5 text-red-500" /> : <Shield className="w-5 h-5 text-blue-500" />}
                    <span className="font-bold text-sm text-gray-400">
                        {isOpponent ? 'OPPONENT' : 'YOU'}
                    </span>
                </div>
                <div className="text-xs font-mono text-gray-500">
                    {formatAddress(address)}
                </div>
            </div>

            {/* Verified Badge */}
            <div className="mb-2">
                <VerifiedBadge attestations={attestations} loading={attestationsLoading} />
            </div>

            <div className="flex flex-col gap-1">
                <div className="flex items-end gap-2">
                    {loading ? (
                        <div className="h-8 w-24 bg-gray-800 animate-pulse rounded" />
                    ) : (
                        <span className={`text-3xl font-black ${isOpponent ? 'text-red-400' : 'text-blue-400'}`}>
                            {score}
                        </span>
                    )}
                    <span className="text-xs text-gray-500 mb-1">CRED</span>
                </div>

                {/* Staked Amount Badge */}
                {stakedAmount > 0 ? (
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-2 mt-2 bg-black/40 p-2 rounded border border-yellow-500/30"
                    >
                        <Lock className="w-4 h-4 text-yellow-500 animate-pulse" />
                        <span className="text-yellow-400 font-bold text-sm">{stakedAmount} LOCKED</span>
                    </motion.div>
                ) : (
                    <div className="text-xs text-gray-600 mt-2">
                        Max Stake: {maxStake}
                    </div>
                )}
            </div>

            {/* Background Glitch Effect for High Stakes */}
            {stakedAmount > 300 && (
                <div className="absolute inset-0 bg-yellow-500/5 z-[-1] animate-pulse rounded-xl" />
            )}
        </motion.div>
    );
}


