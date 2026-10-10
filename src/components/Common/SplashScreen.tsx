import React, { useEffect, useState } from 'react';
import { Sparkles, ChevronRight, X } from 'lucide-react';

interface SplashScreenProps {
  onDismiss: () => void;
  durationSeconds?: number; // default 5 seconds
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onDismiss,
  durationSeconds = 5
}) => {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const totalMs = durationSeconds * 1000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingMs = Math.max(0, totalMs - elapsed);
      const remainingSec = Math.ceil(remainingMs / 1000);
      
      setTimeLeft(remainingSec);
      setProgress(Math.min(100, (elapsed / totalMs) * 100));

      if (remainingMs <= 0) {
        clearInterval(interval);
        handleStartExit();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [durationSeconds]);

  const handleStartExit = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onDismiss();
    }, 400); // 400ms fade transition
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-amber-950 via-amber-900 to-amber-950 p-4 transition-all duration-400 ${
        isFadingOut ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Decorative Radial Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent pointer-events-none" />

      {/* Main Splash Card */}
      <div className="relative w-full max-w-md bg-amber-950/90 border border-amber-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center space-y-5 overflow-hidden">
        
        {/* Top Close / Skip Button */}
        <button
          onClick={handleStartExit}
          className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 z-10"
          title="Skip Splash Screen"
        >
          <span>Skip</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Heading */}
        <div className="space-y-1 pt-2">
          <div className="flex items-center justify-center gap-1.5 text-amber-400">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-semibold tracking-wider uppercase">जय श्री राम</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <h1 className="text-2xl font-bold font-devanagari text-amber-100 drop-shadow-md">
            श्री रामचरित मानस
          </h1>
        </div>

        {/* Sacred Image Container */}
        <div className="relative w-full aspect-square max-w-[280px] rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-xl group">
          <img
            src="/ramdarbar.jpg"
            alt="Shri Ram Darbar - Lord Ram, Sita, Laxman & Hanuman Ji"
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            onError={(e) => {
              // Fallback if image fails to load
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          {/* Subtle Golden Vignette Overlay */}
          <div className="absolute inset-0 ring-1 ring-inset ring-amber-400/30 rounded-2xl pointer-events-none" />
        </div>

        {/* Sacred Verses */}
        <div className="space-y-2 max-w-xs px-2">
          <p className="font-devanagari text-base font-bold text-amber-200 leading-relaxed drop-shadow-sm">
            सियाराम मय सब जग जानी ।<br />
            करहुँ प्रनाम जोरि जुग पानी ॥
          </p>
          <p className="font-devanagari text-xs text-amber-300/80 leading-normal">
            मंगल भवन अमंगल हारी । द्रबहु सुदसरथ अजिर बिहारी ॥
          </p>
        </div>

        {/* Progress Bar & Countdown Footer */}
        <div className="w-full space-y-3 pt-2">
          {/* Progress Bar Container */}
          <div className="w-full h-1.5 bg-amber-950/80 border border-amber-500/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-500 transition-all duration-75 ease-linear rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-amber-300/70 font-sans px-1">
            <span>Starting in {timeLeft}s...</span>
            <button
              onClick={handleStartExit}
              className="font-semibold text-amber-400 hover:text-amber-200 underline decoration-amber-500/40 hover:decoration-amber-300 transition-all"
            >
              प्रारम्भ करें →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
