// lib/ethos.ts
// Centralized Ethos API utilities with real score fetching and attestation checks

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

// Cache for interaction tracking (in-memory for demo, would be DB in prod)
const interactionCache: Map<string, { count: number; lastInteraction: number }> = new Map();

/**
 * Fetch real Ethos credibility score from the API
 * Falls back to baseline score if API is unavailable
 */
export async function getRealEthosScore(address: string): Promise<number> {
    try {
        const response = await fetch(`https://api.ethos.network/api/v2/profiles/${address}`, {
            headers: { 'Accept': 'application/json' },
            next: { revalidate: 60 } // Cache for 1 minute
        });

        if (!response.ok) throw new Error('Ethos profile not found');

        const data = await response.json();
        const realScore = data.credibilityScore || data.score || 0;
        return realScore > 0 ? realScore : 1200; // Baseline neutral score for new users
    } catch (error) {
        console.error("Ethos API Down, falling back to neutral score:", error);
        return 1200;
    }
}

/**
 * Check for social attestations (Twitter/Farcaster linked accounts)
 * This is the "Ethos Gate" for identity isolation
 */
export async function checkAttestations(address: string): Promise<AttestationResult> {
    try {
        const response = await fetch(`https://api.ethos.network/api/v2/profiles/${address}`, {
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            return { hasTwitter: false, hasFarcaster: false, isVerified: false, socialAccounts: [] };
        }

        const data = await response.json();
        const socialAccounts: string[] = [];

        // Check for attestations in profile data
        const hasTwitter = !!(data.twitter || data.xHandle || data.attestations?.twitter);
        const hasFarcaster = !!(data.farcaster || data.farcasterHandle || data.attestations?.farcaster);

        if (hasTwitter) socialAccounts.push('twitter');
        if (hasFarcaster) socialAccounts.push('farcaster');

        // User is verified if they have at least one social account linked
        const isVerified = hasTwitter || hasFarcaster;

        return { hasTwitter, hasFarcaster, isVerified, socialAccounts };
    } catch (error) {
        console.error("Attestation check failed:", error);
        return { hasTwitter: false, hasFarcaster: false, isVerified: false, socialAccounts: [] };
    }
}

/**
 * Calculate integrity score for a heist interaction
 * Implements collusion detection and trivial dare checks
 */
export function calculateIntegrityScore(
    p1Address: string,
    p2Address: string,
    dare: string
): ForensicResult {
    const TRIVIAL_DARES = [
        'say hi', 'post a dot', 'gm', 'hello', 'test', '.', 'a', 'anything',
        'post anything', 'just post', 'say anything'
    ];

    const CHAOS_TAX_RATE = 0.05; // 5% burn on all XP gains
    const BASE_WIN_XP = 50;
    const BASE_SLASH_XP = 400; // 8:1 ratio - this makes farming a "suicide mission"

    // Check for trivial dare
    const normalizedDare = dare.toLowerCase().trim();
    const isTrivialDare = TRIVIAL_DARES.some(trivial =>
        normalizedDare === trivial || normalizedDare.length < 5
    );

    // Generate interaction key for collusion tracking
    const addresses = [p1Address.toLowerCase(), p2Address.toLowerCase()].sort();
    const interactionKey = addresses.join('-');

    // Get or initialize interaction tracking
    let interactionData = interactionCache.get(interactionKey);
    const now = Date.now();
    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

    if (!interactionData || now - interactionData.lastInteraction > ONE_WEEK) {
        interactionData = { count: 0, lastInteraction: now };
    }

    interactionData.count++;
    interactionData.lastInteraction = now;
    interactionCache.set(interactionKey, interactionData);

    // Collusion detection: >2 interactions per week = suspicious
    const collusionSuspected = interactionData.count > 2;

    // Calculate integrity score (0-100)
    let integrityScore = 100;
    let reason = 'Clean heist';

    if (isTrivialDare) {
        integrityScore -= 60;
        reason = 'Trivial dare detected - XP reward minimized';
    }

    if (collusionSuspected) {
        integrityScore -= 50;
        reason = `Collusion pattern detected (${interactionData.count} interactions this week)`;
    }

    // Self-interaction check (same address)
    if (p1Address.toLowerCase() === p2Address.toLowerCase() && p1Address !== '0x0000000000000000000000000000000000000000') {
        // This might be "The Vow" - valid self-challenge, but needs different scoring
        integrityScore = Math.max(integrityScore, 80); // Don't penalize vows too hard
        reason = 'The Vow - Self-commitment detected';
    }

    integrityScore = Math.max(0, Math.min(100, integrityScore));

    // Calculate XP with modifiers
    let xpReward = BASE_WIN_XP;
    let xpSlash = BASE_SLASH_XP;

    if (isTrivialDare) {
        xpReward = 0; // Zero XP for trivial dares
        xpSlash = BASE_SLASH_XP * 2; // Double penalty for trivial dare flakes
    }

    if (collusionSuspected) {
        xpReward = Math.floor(xpReward * 0.1); // 90% reduction
        xpSlash = BASE_SLASH_XP * 1.5; // 50% increased penalty
    }

    // Apply chaos tax (burn)
    xpReward = Math.floor(xpReward * (1 - CHAOS_TAX_RATE));

    return {
        integrityScore,
        isTrivialDare,
        collusionSuspected,
        interactionCount: interactionData.count,
        xpReward,
        xpSlash: Math.floor(xpSlash),
        reason
    };
}

/**
 * Check if both players meet the attestation requirements for a heist
 */
export async function validateHeistParticipants(
    p1Address: string,
    p2Address: string
): Promise<{ valid: boolean; reason: string; p1Verified: boolean; p2Verified: boolean }> {
    const [p1Attestations, p2Attestations] = await Promise.all([
        checkAttestations(p1Address),
        checkAttestations(p2Address)
    ]);

    // Zero address is open bounty - skip p2 check
    const isOpenBounty = p2Address === '0x0000000000000000000000000000000000000000';

    if (!p1Attestations.isVerified) {
        return {
            valid: false,
            reason: 'Challenger must have verified social accounts (Twitter or Farcaster)',
            p1Verified: false,
            p2Verified: p2Attestations.isVerified
        };
    }

    if (!isOpenBounty && !p2Attestations.isVerified) {
        return {
            valid: false,
            reason: 'Daredevil must have verified social accounts (Twitter or Farcaster)',
            p1Verified: true,
            p2Verified: false
        };
    }

    return {
        valid: true,
        reason: 'Both participants verified',
        p1Verified: true,
        p2Verified: isOpenBounty || p2Attestations.isVerified
    };
}
