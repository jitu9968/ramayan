import React, { useEffect, useState, useMemo } from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';

interface SplashScreenProps {
  onDismiss: () => void;
  durationSeconds?: number; // default 5 seconds
}

export const SACRED_DOHAS = [
  {
    doha: "मंगल भवन अमंगल हारी ।\nद्रबहु सुदसरथ अजिर बिहारी ॥",
    meaning: "प्रभु श्री राम सर्व संकटों का नाश कर जीवन में मंगल एवं सुख भरें।"
  },
  {
    doha: "सियाराम मय सब जग जानी ।\nकरहुँ प्रनाम जोरि जुग पानी ॥",
    meaning: "समस्त संसार में श्री सीताराम जी का स्वरूप देखकर दोनों हाथ जोड़कर प्रणाम करता हूँ।"
  },
  {
    doha: "जेहिके जेहि पर सत्य सनेहू ।\nसो तेहि मिलइ न कछु संदेहू ॥",
    meaning: "जिसकी प्रभु में सच्ची प्रीति और निष्ठा है, उसे अभिष्ट फल अवश्य प्राप्त होता है।"
  },
  {
    doha: "जाकी रही भावना जैसी ।\nप्रभु मूरति देखी तिन तैसी ॥",
    meaning: "प्रभु श्री राम भक्त की निर्मल भावना के अनुरूप ही अपना दिव्य रूप प्रकट करते हैं।"
  },
  {
    doha: "राम काज लगि तव अवतारा ।\nसुनतहिं भयउ पर्बत आकारा ॥",
    meaning: "प्रभु सेवा एवं भक्ति में लीन रहने से मन में असीम बल और साहस का संचार होता है।"
  },
  {
    doha: "धीरज धर्म मित्र अरु नारी ।\nआपद काल परिखिअहिं चारी ॥",
    meaning: "धैर्य, धर्म, सच्चे मित्र और धर्मनिष्ठा की कसौटी विपरीत परिस्थितियों में होती है।"
  },
  {
    doha: "परहित सरिस धर्म नहिं भाई ।\nपरपीड़ा सम नहिं अधमाई ॥",
    meaning: "परोपकार और दयाभाव ही सबसे बड़ा धर्म है।"
  },
  {
    doha: "हरि अनंत हरि कथा अनंता ।\nकहहिं सुनहिं बहुबिधि सब संता ॥",
    meaning: "अनंत परमेश्वर की महिमा और रामकथा अनंत है, जिसे संतजन गाते हैं।"
  }
];

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onDismiss,
  durationSeconds = 5
}) => {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Pick a random Doha on mount
  const randomDoha = useMemo(() => {
    const idx = Math.floor(Math.random() * SACRED_DOHAS.length);
    return SACRED_DOHAS[idx];
  }, []);

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
      <div className="relative w-full max-w-md bg-amber-950/90 border border-amber-500/30 rounded-3xl p-5 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center space-y-4 overflow-hidden">
        
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
        <div className="space-y-1 pt-1">
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
        <div className="relative w-full aspect-square max-w-[240px] rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-xl group">
          <img
            src="./ramdarbar.jpg"
            alt="Shri Ram Darbar - Lord Ram, Sita, Laxman & Hanuman Ji"
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 ring-1 ring-inset ring-amber-400/30 rounded-2xl pointer-events-none" />
        </div>

        {/* Random Doha / आशीर्वाद Card */}
        <div className="w-full bg-amber-500/10 border border-amber-500/25 p-3.5 rounded-2xl space-y-2 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Random Doha | आशीर्वाद</span>
          </div>

          <p className="font-devanagari text-sm font-bold text-amber-100 leading-relaxed drop-shadow-sm whitespace-pre-line">
            {randomDoha.doha}
          </p>
          
          {randomDoha.meaning && (
            <p className="font-devanagari text-[11px] text-amber-300/80 leading-normal border-t border-amber-500/20 pt-1.5">
              {randomDoha.meaning}
            </p>
          )}
        </div>

        {/* Progress Bar & Countdown Footer */}
        <div className="w-full space-y-2.5 pt-1">
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
