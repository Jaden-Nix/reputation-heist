export default function Loading() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 font-mono">
      <div className="w-16 h-16 border-t-4 border-neon-cyan rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(0,243,255,0.4)]" />
      <div className="text-neon-cyan animate-pulse tracking-widest text-sm uppercase">Decrypting Uplink...</div>
    </div>
  );
}
