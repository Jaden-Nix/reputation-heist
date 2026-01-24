import { motion } from 'framer-motion';
import { Skull, AlertOctagon } from 'lucide-react';

const SHAME_DATA = [
    { name: "SatoshiDreamer", amount: 450, reason: "GHOSTED" },
    { name: "BasedGod", amount: 800, reason: "WEAK PROOF" },
    { name: "VitalikFanboi", amount: 200, reason: "FLAKED" },
    { name: "DegenDave", amount: 1200, reason: "COOKED" },
    { name: "NFT_Whale", amount: 500, reason: "NO SHOW" },
];

export function HallOfShame() {
    return (
        <div className="w-full bg-red-950/20 border-y border-red-900/40 py-2 overflow-hidden flex items-center relative">
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-heist-bg to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-heist-bg to-transparent z-10" />

            <div className="flex items-center gap-4 px-4 text-xs font-black text-red-600 uppercase tracking-widest shrink-0">
                <Skull size={14} className="animate-pulse" /> HALL OF SHAME
            </div>

            <motion.div
                className="flex items-center gap-8 whitespace-nowrap"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 20, ease: "linear", repeat: Infinity }}
            >
                {[...SHAME_DATA, ...SHAME_DATA].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-red-400 font-mono text-xs">
                        <span className="font-bold text-red-300">{item.name}</span>
                        <span className="text-red-600">SLASHED -{item.amount} CRED</span>
                        <span className="text-[10px] opacity-50">({item.reason})</span>
                    </div>
                ))}
            </motion.div>
        </div>
    );
}
