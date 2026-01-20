'use client';
import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Wallet, LogOut, AlertTriangle } from 'lucide-react';

export default function ConnectWallet() {
    const { address, isConnected, chainId } = useAccount();
    const { connect } = useConnect();
    const { disconnect } = useDisconnect();
    const { switchChain } = useSwitchChain();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch by rendering null or default until mounted
    if (!mounted) {
        return (
            <button
                className="flex items-center gap-2 bg-neon-cyan text-black px-4 py-2 font-bold uppercase text-xs hover:bg-white transition hover:scale-105"
            >
                <Wallet size={16} /> CONNECT WALLET
            </button>
        );
    }

    if (isConnected) {
        if (chainId !== 84532) { // Base Sepolia ID
            return (
                <button
                    onClick={() => switchChain({ chainId: 84532 })}
                    className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 font-bold uppercase text-xs hover:bg-red-600 transition"
                >
                    <AlertTriangle size={16} /> WRONG NETWORK
                </button>
            );
        }

        return (
            <button
                onClick={() => disconnect()}
                className="flex items-center gap-2 bg-heist-panel border border-zinc-700 px-4 py-2 hover:bg-zinc-800 transition text-xs font-mono text-neon-cyan"
            >
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                {address?.slice(0, 6)}...{address?.slice(-4)}
                <LogOut size={12} className="ml-2 text-zinc-500" />
            </button>
        );
    }

    return (
        <button
            onClick={() => connect({ connector: injected() })}
            className="flex items-center gap-2 bg-neon-cyan text-black px-4 py-2 font-bold uppercase text-xs hover:bg-white transition hover:scale-105"
        >
            <Wallet size={16} /> CONNECT WALLET
        </button>
    );
}
