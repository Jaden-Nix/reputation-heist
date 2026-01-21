import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Web3Provider } from '@/components/providers/Web3Provider';
import ConnectWallet from '@/components/game/ConnectWallet';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Link from 'next/link';
import { Skull } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Reputation Heist',
    description: 'Bet your reputation. Complete the dare. Or get cooked by the AI.',
};

import { Toaster } from 'sonner';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.className} transition-colors duration-500`} suppressHydrationWarning>
                <div className="scanlines opacity-20 pointer-events-none" />

                <Web3Provider>
                    <Toaster position="bottom-right" richColors theme="dark" />
                    <nav className="fixed top-0 left-0 p-6 z-50 flex gap-4">
                        <Link href="/" className="bg-black/50 backdrop-blur-md border border-zinc-800 p-2 hover:border-neon-cyan transition-colors group">
                            <Skull className="text-zinc-500 group-hover:text-neon-cyan transition-colors" size={20} />
                        </Link>
                    </nav>
                    <nav className="fixed top-0 right-0 p-6 z-50 flex gap-4">
                        <ConnectWallet />
                        <ThemeToggle />
                    </nav>
                    {children}
                </Web3Provider>
            </body>
        </html>
    );
}
