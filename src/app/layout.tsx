import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Web3Provider } from '@/components/providers/Web3Provider';
import ConnectWallet from '@/components/game/ConnectWallet';
import ThemeToggle from '@/components/ui/ThemeToggle';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Reputation Heist',
    description: 'Bet your reputation. Complete the dare. Or get cooked by the AI.',
};

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
