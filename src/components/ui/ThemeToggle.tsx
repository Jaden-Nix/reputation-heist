'use client';

import { Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    }, [isDark]);

    return (
        <button
            onClick={() => setIsDark(!isDark)}
            className="bg-zinc-900 border border-zinc-700 p-2 text-zinc-400 hover:text-white transition rounded-full"
        >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
    );
}
