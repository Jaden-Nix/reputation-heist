import { NextResponse } from 'next/server';
import { db } from '../../../../server/db';
import { heists as heistsTable } from '../../../../shared/schema';

export async function GET() {
    try {
        const heists = await db.select().from(heistsTable);
        return NextResponse.json({ success: true, heists });
    } catch (error) {
        console.error("Fetch Heists Error:", error);
        return NextResponse.json({ success: false, heists: [] });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const [newHeist] = await db.insert(heistsTable).values({
            creatorAddress: data.creatorAddress || '0x0000000000000000000000000000000000000000',
            opponentAddress: data.opponentAddress || '0x0000000000000000000000000000000000000000',
            dare: data.dare,
            category: data.category || 'SOCIAL',
            bounty: (data.bounty || '0').toString(),
            collateral: (data.collateral || '0').toString(),
            status: 'LIVE',
        }).returning();

        return NextResponse.json({ success: true, heist: newHeist });
    } catch (error) {
        console.error("Create Heist Error:", error);
        return NextResponse.json({ success: false, error: "Database failure" }, { status: 500 });
    }
}
