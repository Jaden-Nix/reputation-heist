'use client';
import { motion } from 'framer-motion';
import { BadgeCheck, Twitter, AtSign } from 'lucide-react';
import type { AttestationResult } from '@/lib/types';

interface VerifiedBadgeProps {
    attestations: AttestationResult | null;
    loading?: boolean;
    compact?: boolean;
}

export function VerifiedBadge({ attestations, loading = false, compact = false }: VerifiedBadgeProps) {
    if (loading) {
        return (
            <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-gray-700 animate-pulse rounded-full" />
                {!compact && <div className="w-16 h-3 bg-gray-700 animate-pulse rounded" />}
            </div>
        );
    }

    if (!attestations || !attestations.isVerified) {
        return (
            <div className="flex items-center gap-1 text-red-500/70">
                <BadgeCheck className="w-4 h-4 opacity-40" />
                {!compact && <span className="text-[10px] font-mono uppercase">Unverified</span>}
            </div>
        );
    }

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1.5"
        >
            {/* Main Badge */}
            <div className="relative">
                <BadgeCheck className="w-5 h-5 text-neon-cyan drop-shadow-[0_0_8px_var(--neon-cyan)]" />
                <motion.div
                    className="absolute inset-0 bg-neon-cyan/20 rounded-full blur-sm"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                />
            </div>

            {/* Social Icons */}
            {!compact && (
                <div className="flex items-center gap-1">
                    {attestations.hasTwitter && (
                        <div className="flex items-center gap-0.5 bg-black/50 px-1.5 py-0.5 rounded border border-blue-500/30">
                            <Twitter className="w-3 h-3 text-blue-400" />
                            <span className="text-[9px] font-mono text-blue-400">X</span>
                        </div>
                    )}
                    {attestations.hasFarcaster && (
                        <div className="flex items-center gap-0.5 bg-black/50 px-1.5 py-0.5 rounded border border-purple-500/30">
                            <AtSign className="w-3 h-3 text-purple-400" />
                            <span className="text-[9px] font-mono text-purple-400">FC</span>
                        </div>
                    )}
                </div>
            )}

            {/* Verified Text */}
            {!compact && (
                <span className="text-[10px] font-mono text-neon-cyan uppercase tracking-wide">
                    Verified
                </span>
            )}
        </motion.div>
    );
}
