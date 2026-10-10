import React from 'react';
import { ChevronRight, HardDriveDownload, Calendar, Sparkles } from 'lucide-react';
import { WPPostMeta } from '../../types/ramayan';

interface ChapterCardProps {
  chapter: WPPostMeta;
  index: number;
  isCached: boolean;
  onSelect: (id: number) => void;
}

export const ChapterCard: React.FC<ChapterCardProps> = ({
  chapter,
  index,
  isCached,
  onSelect
}) => {
  // Decode HTML entities in title if any
  const decodedTitle = React.useMemo(() => {
    const txt = document.createElement('textarea');
    txt.innerHTML = chapter.title.rendered;
    return txt.value;
  }, [chapter.title.rendered]);

  const isNew = chapter.isNew || index >= 7;

  const formattedDate = new Date(chapter.date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div
      onClick={() => onSelect(chapter.id)}
      className="p-4 rounded-2xl theme-card theme-border border shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-between gap-3 group"
    >
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        {/* Chapter Index Badge */}
        <div className="w-9 h-9 rounded-xl theme-bg border theme-border flex items-center justify-center font-bold text-xs theme-muted flex-shrink-0 group-hover:border-amber-500/50 group-hover:text-amber-600 transition-colors">
          #{index + 1}
        </div>

        {/* Chapter Details */}
        <div className="min-w-0 space-y-1 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold font-devanagari theme-text leading-snug group-hover:text-amber-600 transition-colors">
              {decodedTitle}
            </h3>

            {isNew && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-xs animate-pulse">
                <Sparkles className="w-2.5 h-2.5" />
                <span>New</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs theme-muted flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formattedDate}</span>
            </span>

            {isCached && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <HardDriveDownload className="w-3 h-3" />
                <span>Offline Ready</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <ChevronRight className="w-5 h-5 theme-muted group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
    </div>
  );
};
