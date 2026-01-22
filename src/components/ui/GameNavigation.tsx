'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Skull } from 'lucide-react';
import ConnectWallet from '@/components/game/ConnectWallet';
import ThemeToggle from '@/components/ui/ThemeToggle';
import NotificationBell from '@/components/ui/NotificationBell';

export default function GameNavigation() {
    const pathname = usePathname();

    // Only show navigation on the Bounty Board page
    if (pathname !== '/bounty-board') return null;

    return (
        <>
            <nav className="absolute top-6 left-6 z-50">
                <Link href="/" className="bg-black/50 backdrop-blur-md border border-zinc-800 p-3 hover:border-neon-cyan transition-all group rounded-full block">
                    <Skull className="text-zinc-500 group-hover:text-neon-cyan transition-colors" size={24} />
                </Link>
            </nav>
            <nav className="absolute top-6 right-6 z-50 flex items-center gap-4">
                <div className="bg-black/80 backdrop-blur-md border border-zinc-800 p-2 rounded-full flex gap-2 shadow-2xl">
                    <ConnectWallet />
                    <NotificationBell />
                    <ThemeToggle />
                </div>
            </nav>
        </>
    );
}
