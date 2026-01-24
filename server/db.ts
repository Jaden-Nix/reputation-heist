import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema";

const { Pool } = pg;

// Mock DB Mode if missing
const isMockMode = !process.env.DATABASE_URL;

if (isMockMode) {
  console.warn("⚠️ DATABASE_URL missing. Running in MOCK MODE.");
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgres://mock:5432/mock" });

// Mock Drizzle implementation to prevent crashes
// Mock Drizzle implementation to prevent crashes
const globalForMock = global as unknown as { mockHeists: any[] };
if (!globalForMock.mockHeists) globalForMock.mockHeists = [];

const mockDb = {
  select: () => ({ from: () => Promise.resolve(globalForMock.mockHeists) }),
  insert: () => ({
    values: (data: any) => {
      const newHeist = {
        id: `h-${Date.now()}`,
        ...data,
        status: 'LIVE', // Force status to LIVE for UI visibility
        createdAt: new Date(),
        player1: { name: 'You (Mock)', address: data.creatorAddress },
        player2: { name: 'Target', address: data.opponentAddress },
        chainHeistId: data.chainHeistId || null
      };
      globalForMock.mockHeists.push(newHeist);
      return { returning: () => Promise.resolve([newHeist]) };
    }
  }),
  delete: () => ({ where: () => Promise.resolve([]) }),
  update: () => ({ set: () => ({ where: () => Promise.resolve([]) }) }),
  query: {
    heists: {
      findMany: () => Promise.resolve(globalForMock.mockHeists),
      findFirst: () => Promise.resolve(null)
    }
  }
} as any;

export const db = isMockMode ? mockDb : drizzle(pool, { schema });
