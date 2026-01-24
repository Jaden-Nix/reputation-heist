import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield, Zap } from 'lucide-react';
import { TrustProfile } from '@/components/game/TrustProfile';

const MOCK_AGENTS = [
    { address: "0x1234567890123456789012345678901234567890", score: 2200, bio: "Alpha caller since '21. High conviction, low mercy.", name: "SatoshiDreamer" },
    { address: "0x8888888888888888888888888888888888888888", score: 1850, bio: "DeFi Degen / Base God. Bridging logic is my religion.", name: "BasedGod" },
    { address: "0xCAFEBABECAFEBABECAFEBABECAFEBABECAFEBABE", score: 1400, bio: "NFT Trader. Flip or be flipped. Ethos is everything.", name: "PixelPusher" },
    { address: "0xDEADBEEFDEADBEEFDEADBEEFDEADBEEFDEADBEEF", score: 900, bio: "New Recruit. Seeking high-stakes reputation growth.", name: "Rookie101" },
    { address: "0x5555555555555555555555555555555555555555", score: 2800, bio: "Protocol Architect. I see the code, I own the board.", name: "Archon" },
    { address: "0x7777777777777777777777777777777777777777", score: 1600, bio: "Social Engineer. I'll ratio you before you can blink.", name: "GhostWriter" },
    { address: "0x3333333333333333333333333333333333333333", score: 3200, bio: "The Oracle. My verdicts are final. My Cred is peak.", name: "JudgmentDay" },
    { address: "0x9999999999999999999999999999999999999999", score: 1100, bio: "Chaos Agent. Here for the burns and the bounties.", name: "Burner" },
];

export function DiscoverAgents({ searchQuery = '' }: { searchQuery?: string }) {
    const filteredAgents = MOCK_AGENTS.filter(agent =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full mb-12 relative">
            <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-black italic text-foreground flex items-center gap-2 uppercase tracking-tighter">
                    <Zap className="text-neon-cyan animate-pulse" size={20} /> Prime Targets
                </h2>
                <div className="flex-1 h-[1px] bg-gradient-to-r from-neon-cyan/50 to-transparent" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredAgents.map((agent, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-zinc-950 border border-zinc-800 p-5 rounded-none relative group hover:border-neon-cyan transition-all overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-12 h-12 bg-neon-cyan/5 -rotate-45 translate-x-6 -translate-y-6 group-hover:bg-neon-cyan/20 transition-colors" />

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 flex items-center justify-center relative">
                                    <Shield size={20} className="text-purple-500 group-hover:animate-spin-slow" />
                                    <div className="absolute inset-0 border border-neon-cyan/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div>
                                    <div className="font-black text-white text-sm uppercase italic tracking-tighter">{agent.name}</div>
                                    <div className="text-[10px] text-neon-cyan font-mono">{agent.score} CRED_SCORE</div>
                                </div>
                            </div>

                            <p className="text-[10px] text-zinc-500 font-mono line-clamp-2 h-8">
                                {agent.bio}
                            </p>

                            <Link href={`/create-heist?opponent=${agent.address}`} className="mt-2 text-center">
                                <button className="w-full bg-transparent border border-zinc-700 hover:border-neon-cyan hover:text-neon-cyan text-white text-[10px] font-black uppercase py-2 transition-all group-hover:bg-neon-cyan/5">
                                    INITIATE_DARE //
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
