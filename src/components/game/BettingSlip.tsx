'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, AlertTriangle, CheckCircle } from 'lucide-react';
// import useSound from 'use-sound'; // Placeholder for now

interface BettingSlipProps {
    isOpen: boolean;
    onClose: () => void;
    heist: any;
    side: 'P1' | 'P2' | null; // P1 = WIN, P2 = FAIL
}

export default function BettingSlip({ isOpen, onClose, heist, side }: BettingSlipProps) {
    const [amount, setAmount] = useState('0.05');
    const [confirmed, setConfirmed] = useState(false);

    // Mock Odds Calculation
    const odds = side === 'P1' ? 1.5 : 2.8;
    const potentialPayout = (parseFloat(amount || '0') * odds).toFixed(3);
    const credibilityGain = Math.floor(parseFloat(amount || '0') * 100);

    const handleConfirm = () => {
        // playSound('/sounds/cha-ching.mp3');
        setConfirmed(true);
        setTimeout(() => {
            setConfirmed(false);
            onClose();
        }, 2000);
    };

    return (
        <AnimatePresence>
            {isOpen && heist && side && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Slip Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-heist-panel border-l border-neon-cyan z-50 shadow-[-20px_0_50px_rgba(0,0,0,0.8)] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black/20">
                            <div>
                                <h2 className="text-2xl font-black italic text-white">BETTING SLIP</h2>
                                <p className="text-neon-cyan text-xs font-mono">LIVE MARKET // {heist.id}</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                                <X className="text-zinc-500 hover:text-white" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6 space-y-8 overflow-y-auto">

                            {/* Selection Summary */}
                            <div className="bg-zinc-900 border border-zinc-700 p-4 rounded relative overflow-hidden">
                                <div className={`absolute top-0 right-0 px-2 py-1 text-[10px] font-bold ${side === 'P1' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'}`}>
                                    {side === 'P1' ? 'BETTING TO WIN' : 'BETTING TO FAIL'}
                                </div>
                                <h3 className="font-bold text-white mb-1">{heist.player1.name}</h3>
                                <p className="text-sm text-zinc-400 line-clamp-2">"{heist.dare}"</p>
                            </div>

                            {/* Odds Display */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-black p-3 border border-zinc-800 text-center">
                                    <div className="text-xs text-zinc-500 font-mono">CURRENT ODDS</div>
                                    <div className="text-3xl font-black text-white">{odds}x</div>
                                </div>
                                <div className="bg-black p-3 border border-zinc-800 text-center">
                                    <div className="text-xs text-zinc-500 font-mono">CRED BOOST</div>
                                    <div className="text-3xl font-black text-purple-400">+{credibilityGain}</div>
                                </div>
                            </div>

                            {/* Stake Input */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-neon-cyan uppercase tracking-widest">Wager Amount (ETH)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-black border-2 border-zinc-700 p-4 pl-4 text-2xl font-mono text-white focus:border-neon-cyan outline-none transition-colors"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">ETH</div>
                                </div>
                                <div className="flex justify-between text-xs text-zinc-500 font-mono">
                                    <span>Balance: 4.20 ETH</span>
                                    <button onClick={() => setAmount('1.0')} className="hover:text-white underline">MAX</button>
                                </div>
                            </div>

                            {/* Payout Calc */}
                            <div className="flex justify-between items-end border-t border-zinc-800 pt-6">
                                <div className="text-zinc-400 text-sm">Est. Payout</div>
                                <div className="text-4xl font-black text-neon-cyan drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]">
                                    {potentialPayout} <span className="text-lg text-zinc-500">ETH</span>
                                </div>
                            </div>

                        </div>

                        {/* Footer / Action */}
                        <div className="p-6 border-t border-zinc-800 bg-black/40">
                            {!confirmed ? (
                                <button
                                    onClick={handleConfirm}
                                    className="w-full bg-neon-cyan text-black font-black uppercase py-4 text-xl hover:bg-white hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,243,255,0.4)]"
                                >
                                    CONFIRM WAGER
                                </button>
                            ) : (
                                <button className="w-full bg-green-500 text-black font-black uppercase py-4 text-xl flex items-center justify-center gap-2 animate-pulse">
                                    <CheckCircle /> BET PLACED!
                                </button>
                            )}
                            <p className="text-center text-[10px] text-zinc-600 mt-4 font-mono">
                                <AlertTriangle size={10} className="inline mr-1" />
                                10% House Fee applies to winnings. Reputation at risk.
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
