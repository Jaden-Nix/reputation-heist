import { pgTable, serial, text, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const heists = pgTable("heists", {
  id: serial("id").primaryKey(),
  creatorAddress: text("creator_address").notNull(),
  opponentAddress: text("opponent_address"),
  dare: text("dare").notNull(),
  category: text("category").notNull(),
  bounty: numeric("bounty", { precision: 20, scale: 10 }).notNull(),
  collateral: numeric("collateral", { precision: 20, scale: 10 }).notNull(),
  status: text("status").notNull().default("LIVE"), // LIVE, JUDGING, SETTLED, ESCROW
  verdict: text("verdict"),
  confidenceScore: integer("confidence_score"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertHeistSchema = createInsertSchema(heists);
export type InsertHeist = z.infer<typeof insertHeistSchema>;
export type Heist = typeof heists.$inferSelect;
