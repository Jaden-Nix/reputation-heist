import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Web3Provider } from '@/components/providers/Web3Provider';
import GameNavigation from '@/components/ui/GameNavigation';

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
                {/* Scanlines removed for polished demo look */}

                <Web3Provider>
                    <Toaster position="bottom-right" richColors theme="dark" />
                    <GameNavigation />
                    {children}
                </Web3Provider>
            </body>
        </html>
    );
}
