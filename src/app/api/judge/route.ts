import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const HEIST_MASTER_INTROS = [
    "Analyzing audacity levels...",
    "Running cringe detection algorithms...",
    "Consulting the chaos index...",
    "Checking if you're actually built different...",
    "Scanning the blockchain for clout..."
];

export async function POST(request: Request) {
    try {
        const { heistId, proofUrl } = await request.json();

        // 1. Simulate AI Processing Delay (for dramatic effect in UI/Sound loop)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 2. Use Gemini to judge the proof
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
        You are the "Heist Master", a chaotic, cynical, but fair AI judge of reputation bets.
        
        A user has submitted a proof URL for a dare.
        Dare Context: "Complete a legendary feat or get cooked."
        Proof URL: "${proofUrl}"

        Your job is to analyze this URL (infer what it might be based on the text, e.g., twitter.com, etherscan.io, or if it looks fake/lazy).
        
        If the URL looks like "vitalik", "fail", or "scam", they LOSE.
        If the URL looks like "cool", "win", "based", or a valid transaction hash/tweet, they WIN.
        If it's ambiguous, flip a coin but lean towards being harsh.

        Respond strictly in this JSON format:
        {
            "score_balls": number (1-10),
            "score_execution": number (1-10),
            "score_chaos": number (1-10),
            "confidence_score": number (0-100, representing how sure you are. < 80 triggers manual review),
            "verdict_text": "A short, punchy, 1-2 sentence verdict. Be funny, slang-heavy (crypto twitter slang), and brutal if they fail, or hype them up if they win.",
            "mood": "brutal" | "impressed" | "neutral" | "disappointed",
            "winner_is_p1": boolean (true if they passed the dare, false if they failed)
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

        return NextResponse.json({
            success: true,
            data: verdictData,
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
                winner_is_p1: true
            },
            intro_line: "System rebooting..."
        });
    }
}
