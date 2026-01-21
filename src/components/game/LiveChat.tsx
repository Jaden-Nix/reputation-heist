'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User } from 'lucide-react';

interface Message {
    id: number;
    user: string;
    text: string;
    type: 'user' | 'system' | 'hype';
}

const MOCK_MESSAGES = [
    "based", "cooked him", "L bozo", "wen rug?", "vitalik is watching",
    "huge if true", "ngmi", "send it", "top signal", "audited?",
    "reputation destroyed", "imagine betting against this"
];

const MOCK_USERS = [
    "anon_42", "0xchad", "degen_king", "satoshi_w", "based_god", "vitalik_fan"
];

export default function LiveChat() {
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, user: 'SYSTEM', text: 'Encrypted channel established.', type: 'system' }
    ]);
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Simulate Fake Chat Traffic
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                const text = MOCK_MESSAGES[Math.floor(Math.random() * MOCK_MESSAGES.length)];
                const user = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
                addMessage(user, text, 'user');
            }
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const addMessage = (user: string, text: string, type: 'user' | 'system' | 'hype' = 'user') => {
        setMessages(prev => [...prev.slice(-50), { id: Date.now(), user, text, type }]);
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        addMessage('YOU', input, 'user');
        setInput('');
    };

    return (
        <div className="flex flex-col h-[400px] bg-black/50 border border-zinc-800 backdrop-blur-sm">
            {/* Header */}
            <div className="p-2 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
                <span className="text-xs font-mono text-neon-cyan flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> LIVE FEED
                </span>
                <span className="text-[10px] text-zinc-500">{messages.length} msgs</span>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-zinc-700">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`text-sm font-mono ${msg.type === 'system' ? 'text-yellow-500 italic' : ''}`}
                        >
                            <span className={`${msg.user === 'YOU' ? 'text-neon-cyan' : 'text-zinc-500'} font-bold mr-2`}>
                                {msg.user}:
                            </span>
                            <span className="text-zinc-300">{msg.text}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-2 border-t border-zinc-800 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Say something..."
                    className="flex-1 bg-black border border-zinc-700 p-2 text-xs text-white focus:border-neon-cyan outline-none font-mono"
                />
                <button type="submit" className="bg-zinc-800 hover:bg-zinc-700 text-neon-cyan p-2">
                    <Send size={14} />
                </button>
            </form>
        </div>
    );
}
