import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { calculateIntegrityScore } from '@/lib/ethos';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const HEIST_MASTER_INTROS = [
    "Analyzing audacity levels...",
    "Running cringe detection algorithms...",
    "Consulting the chaos index...",
    "Checking if you're actually built different...",
    "Scanning the blockchain for clout...",
    "Running Sybil detection protocols...",
    "Cross-referencing social graphs..."
];

export async function POST(request: Request) {
    try {
        const { heistId, proofUrl, isVow, dare, p1Address, p2Address } = await request.json();

        // 1. FORENSIC MODULE: Run Sybil-resistance checks
        const forensicResult = calculateIntegrityScore(
            p1Address || '0x0000000000000000000000000000000000000000',
            p2Address || '0x0000000000000000000000000000000000000000',
            dare || ''
        );

        // 2. Simulate AI Processing Delay (for dramatic effect in UI/Sound loop)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 3. Use Gemini to judge the proof (with forensic context)
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
        You are the "Heist Master", a chaotic, cynical, but fair AI judge of reputation bets on the Reputation Heist protocol.
        
        A user has submitted proof for a ${isVow ? 'SELF-COMMITMENT (The Vow)' : 'DARE (Heist)'}.
        ${isVow ? 'Context: This is a Vow. The user is betting their own reputation that they can complete this.' : 'Context: This is a challenge between two players.'}
        
        Dare: "${dare || 'Complete a legendary feat or get cooked.'}"
        Proof URL/Text: "${proofUrl}"

        === FORENSIC INTELLIGENCE (SYBIL RESISTANCE) ===
        Integrity Score: ${forensicResult.integrityScore}/100
        Is Trivial Dare: ${forensicResult.isTrivialDare ? 'YES - This is a lazy/farmable dare' : 'NO'}
        Collusion Suspected: ${forensicResult.collusionSuspected ? `YES - ${forensicResult.interactionCount} interactions detected between these addresses` : 'NO'}
        XP Reward if Win: ${forensicResult.xpReward} (after chaos tax)
        XP Slash if Fail: ${forensicResult.xpSlash} (8:1 ratio applied)
        Forensic Note: ${forensicResult.reason}
        === END FORENSIC DATA ===

        FORENSIC INSTRUCTIONS:
        1. If "Collusion Suspected" is YES, be EXTREMELY skeptical. Require extraordinary proof.
        2. If "Is Trivial Dare" is YES, the dare is too easy and should be dismissed regardless of proof.
        3. If Integrity Score is < 20, return low confidence and suggest a "Social Audit" flag.

        Your job is to analyze this proof and decide if the dare was successfully completed.
        
        Logic for Success (winner_is_p1 = true):
        - If the proof looks like a valid tweet, transaction, or clear evidence of the dare.
        - If the URL contains "success", "based", "win", or valid platform domains (twitter.com, x.com).
        - BUT: Success is DENIED if Trivial Dare is YES.
        
        Logic for Failure (winner_is_p1 = false):
        - If the proof URL is "vitalik", "fail", "scam", or clearly empty/lazy.
        - If it's a rickroll or a link to a unrelated cat video.
        - If Collusion is suspected AND proof isn't extraordinary.

        Terminology for Verdict:
        ${isVow ? '- Success: "Man of His Word", "Reliable Builder", "Standing on Business"' : '- Success: "Hacker", "Heist King", "Collector"'}
        ${isVow ? '- Failure: "Ghoster", "Flaker", "Reputation Ruined"' : '- Failure: "Cooked", "No Alpha", "Slashed"'}
        - Collusion Detected: "Circle-Jerker", "Farm Detected", "Sybil Alert"

        Respond strictly in this JSON format:
        {
            "score_balls": number (1-10),
            "score_execution": number (1-10),
            "score_chaos": number (1-10),
            "confidence_score": number (0-100),
            "verdict_text": "A short, punchy verdict. Be funny, use crypto slang (CT style), and reflect the ${isVow ? 'Vow' : 'Heist'} theme. If collusion detected, roast them.",
            "mood": "brutal" | "impressed" | "neutral" | "disappointed",
            "winner_is_p1": boolean
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown blocks if Gemini adds them
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Invalid response format from AI");
        }
        const verdictData = JSON.parse(jsonMatch[0]);

        // Merge forensic data with AI verdict
        const enhancedVerdict = {
            ...verdictData,
            integrityScore: forensicResult.integrityScore,
            isTrivialDare: forensicResult.isTrivialDare,
            collusionSuspected: forensicResult.collusionSuspected,
            xpReward: forensicResult.xpReward,
            xpSlash: forensicResult.xpSlash,
            forensicReason: forensicResult.reason
        };

        return NextResponse.json({
            success: true,
            data: enhancedVerdict,
            intro_line: HEIST_MASTER_INTROS[Math.floor(Math.random() * HEIST_MASTER_INTROS.length)]
        });

    } catch (error) {
        console.error("Gemini Judge Error:", error);
        // Fallback if AI fails
        return NextResponse.json({
            success: true,
            data: {
                score_balls: 5,
                score_execution: 5,
                score_chaos: 5,
                confidence_score: 50,
                verdict_text: "AI Overload. You got lucky this time, mortal (or maybe not).",
                mood: 'neutral',
                winner_is_p1: true,
                integrityScore: 100,
                isTrivialDare: false,
                collusionSuspected: false,
                xpReward: 50,
                xpSlash: 400
            },
            intro_line: "System rebooting..."
        });
    }
}

