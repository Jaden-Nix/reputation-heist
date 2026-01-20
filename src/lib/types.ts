export type HeistCategory = 'SOCIAL' | 'IRL' | 'ON_CHAIN' | 'DEGEN';

export interface Player {
    name: string;
    address?: string;
    ethosScore?: number;
}

export type HeistStatus = 'LIVE' | 'SETTLED' | 'JUDGING';

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
    totalBetsP1?: string;
    totalBetsP2?: string;
    confidence?: bigint;
}
