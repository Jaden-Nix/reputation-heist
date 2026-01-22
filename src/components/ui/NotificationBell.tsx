'use client';

import { useState, useEffect } from 'react';
import { Bell, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface HeistInvite {
    id: string; // The mock DB ID (e.g. h-123456)
    dare: string;
    bounty: string;
    player1: { name: string; address: string };
    creatorAddress: string;
}

export default function NotificationBell() {
    const { address, isConnected } = useAccount();
    const router = useRouter();
    const [invites, setInvites] = useState<HeistInvite[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [lastSeenCount, setLastSeenCount] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Poll for invites
    useEffect(() => {
        if (!isConnected || !address) return;

        const fetchInvites = async () => {
            try {
                const res = await fetch(`/api/heists?target=${address.toLowerCase()}`);
                const data = await res.json();
                if (data.success) {
                    // Filter out already settled/accepted ones if possible? 
                    // For now, assuming API returns all targeting me.
                    // Ideally we should check status, but mock DB sets "LIVE".
                    // We can rely on the user to check.
                    setInvites(data.heists);
                }
            } catch (err) {
                console.error("Failed to fetch invites", err);
            }
        };

        fetchInvites();
        const interval = setInterval(fetchInvites, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, [address, isConnected]);

    const unseenCount = invites.length - lastSeenCount;
    const hasUnseen = unseenCount > 0;

    const handleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setLastSeenCount(invites.length);
        }
    };

    const handleAccept = (heistId: string) => {
        setIsOpen(false);
        router.push(`/heist/${heistId}`);
        toast.info("REDIRECTING", { description: "Loading Heist Room..." });
    };

    if (!mounted || !isConnected) return null;

    return (
        <div className="relative">
            <button
                onClick={handleOpen}
                className="relative p-2 rounded-full border border-zinc-800 bg-black/50 hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
            >
                <Bell size={20} />
                {invites.length > 0 && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-danger-red rounded-full border-2 border-black animate-pulse" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 top-12 w-80 bg-black/90 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl p-4 z-50 overflow-hidden"
                    >
                        <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-2">
                            <h3 className="text-xs font-mono font-bold text-neon-cyan">INCOMING TRANSMISSIONS</h3>
                            <span className="text-[10px] bg-zinc-900 px-2 py-0.5 rounded text-zinc-400">{invites.length} PENDING</span>
                        </div>

                        {invites.length === 0 ? (
                            <div className="text-center py-6 text-zinc-500 text-xs italic">
                                NO ACTIVE THREATS DETECTED
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
                                {invites.map((invite) => (
                                    <div key={invite.id} className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-lg hover:border-zinc-700 transition-colors group">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-mono text-zinc-400">CHALLENGER: {invite.player1?.name || (invite.creatorAddress ? `${invite.creatorAddress.slice(0, 6)}...` : 'Unknown')}</span>
                                            <span className="text-neon-cyan font-bold text-xs">{invite.bounty} ETH</span>
                                        </div>
                                        <p className="text-sm text-white font-medium mb-3 line-clamp-2">
                                            "{invite.dare}"
                                        </p>
                                        <button
                                            onClick={() => handleAccept(invite.id)}
                                            className="w-full bg-zinc-800 hover:bg-neon-cyan hover:text-black text-white text-[10px] font-bold py-2 rounded uppercase transition-colors flex items-center justify-center gap-2"
                                        >
                                            ACCEPT DARE <ArrowRight size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
