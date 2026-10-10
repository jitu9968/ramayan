import React from 'react';
import { BookOpen, ArrowRight } from 'lucide-react';
import { LastRead } from '../../types/ramayan';

interface HeroLastReadProps {
  lastRead: LastRead | null;
  onOpenChapter: (id: number) => void;
}

export const HeroLastRead: React.FC<HeroLastReadProps> = ({ lastRead, onOpenChapter }) => {
  if (!lastRead) return null;

  const formattedDate = new Date(lastRead.timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-700 via-amber-600 to-orange-600 text-white shadow-lg relative overflow-hidden group">
      {/* Decorative background watermark */}
      <div className="absolute -right-6 -bottom-8 opacity-15 font-heading text-8xl pointer-events-none select-none">
        राम
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-amber-200 text-xs font-semibold tracking-wider uppercase">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Continue Reading</span>
            <span className="opacity-60">• {formattedDate}</span>
          </div>
          <h2 className="text-lg font-bold font-devanagari line-clamp-1">
            {lastRead.postTitle || 'Resume Chapter'}
          </h2>
        </div>

        <button
          onClick={() => onOpenChapter(lastRead.postId)}
          className="self-start sm:self-center flex items-center gap-2 px-4 py-2 bg-white text-amber-900 rounded-xl font-medium text-xs shadow-md hover:bg-amber-50 active:scale-95 transition-all group-hover:translate-x-0.5"
        >
          <span>Resume Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
