export type HeistCategory = 'SOCIAL' | 'IRL' | 'ON_CHAIN' | 'DEGEN';

export interface Player {
    name: string;
    address?: string;
    ethosScore?: number;
}

export type HeistStatus = 'CREATED' | 'ACTIVE' | 'JUDGING' | 'SETTLED' | 'TIMED OUT';

export type HeistMood = 'brutal' | 'impressed' | 'neutral' | 'cooking' | 'disappointed';

export interface Heist {
    id: string | number;
    category: HeistCategory;
    timestamp: string;
    bounty: string;
    winner: string;
    player1: Player;
    player2: Player;
    dare: string;
    heistMasterMood: HeistMood;
    verdict: string;
    status: HeistStatus;
    stakedRep?: number;
    duration?: number;
    startTime?: number;
    isVow?: boolean;
    totalBetsP1?: string;
    totalBetsP2?: string;
    confidence?: bigint;
    collateral?: string;
    daredevilJoined?: boolean;
}

export interface PlayerMarks {
    badge?: 'RELIABLE_BUILDER' | 'MAN_OF_HIS_WORD';
    brand?: 'GHOSTER';
}

// Sybil-Resistance Types
export interface AttestationResult {
    hasTwitter: boolean;
    hasFarcaster: boolean;
    isVerified: boolean;
    socialAccounts: string[];
}

export interface ForensicResult {
    integrityScore: number;
    isTrivialDare: boolean;
    collusionSuspected: boolean;
    interactionCount: number;
    xpReward: number;
    xpSlash: number;
    reason: string;
}

export interface JudgeVerdict {
    score_balls: number;
    score_execution: number;
    score_chaos: number;
    confidence_score: number;
    verdict_text: string;
    mood: 'brutal' | 'impressed' | 'neutral' | 'disappointed';
    winner_is_p1: boolean;
    // Forensic additions
    integrityScore?: number;
    isTrivialDare?: boolean;
    collusionSuspected?: boolean;
    xpReward?: number;
    xpSlash?: number;
}
