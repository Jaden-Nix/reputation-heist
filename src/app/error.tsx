'use client';
import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-center font-mono">
      <h2 className="text-4xl font-black text-red-500 mb-4 uppercase italic tracking-tighter">System Critical Failure</h2>
      <p className="text-zinc-400 mb-8 max-w-md">The encryption layer has been compromised or a connection was severed by the Heist Master.</p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="bg-neon-cyan text-black px-6 py-3 font-bold uppercase hover:scale-105 transition-transform"
        >
          Re-establish Connection
        </button>
        <Link 
          href="/"
          className="border border-zinc-700 text-zinc-500 px-6 py-3 font-bold uppercase hover:text-white transition-colors"
        >
          Abort Mission
        </Link>
      </div>
    </div>
  );
}
