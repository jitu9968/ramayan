import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  SlidersHorizontal,
  HardDriveDownload,
  Share2,
  Search,
  X,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { WPPostDetail, ReaderSettings } from '../../types/ramayan';
import { isBookmarked, toggleBookmark, saveLastRead } from '../../services/storage';

interface ReaderViewProps {
  chapter: WPPostDetail;
  onBack: () => void;
  onNextChapter?: () => void;
  onPrevChapter?: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  settings: ReaderSettings;
  onOpenSettings: () => void;
  isCachedOffline: boolean;
  initialScrollPosition?: number;
}

export const ReaderView: React.FC<ReaderViewProps> = ({
  chapter,
  onBack,
  onNextChapter,
  onPrevChapter,
  hasNext,
  hasPrev,
  settings,
  onOpenSettings,
  isCachedOffline,
  initialScrollPosition = 0
}) => {
  const [bookmarked, setBookmarked] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [readerSearchQuery, setReaderSearchQuery] = useState<string>('');
  const [matchCount, setMatchCount] = useState<number>(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0);

  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const matchesRef = useRef<HTMLElement[]>([]);

  // Decode title
  const decodedTitle = React.useMemo(() => {
    const txt = document.createElement('textarea');
    txt.innerHTML = chapter.title.rendered;
    return txt.value;
  }, [chapter.title.rendered]);

  // Check bookmark state
  useEffect(() => {
    isBookmarked(chapter.id).then(setBookmarked);
  }, [chapter.id]);

  // Handle bookmark toggle
  const handleToggleBookmark = async () => {
    const newState = await toggleBookmark(chapter.id, decodedTitle);
    setBookmarked(newState);
  };

  // Restore scroll position on initial load
  useEffect(() => {
    if (initialScrollPosition > 0 && containerRef.current) {
      setTimeout(() => {
        window.scrollTo({ top: initialScrollPosition, behavior: 'smooth' });
      }, 150);
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [chapter.id, initialScrollPosition]);

  // Track and save scroll position for "Last Read"
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        saveLastRead({
          postId: chapter.id,
          postTitle: decodedTitle,
          scrollPosition: window.scrollY,
          timestamp: Date.now()
        });
      }, 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [chapter.id, decodedTitle]);

  // In-Reader Text Search & Highlight Logic
  useEffect(() => {
    if (!contentRef.current) return;

    // Reset previous highlights if any
    const existingMarks = contentRef.current.querySelectorAll('mark.reader-search-highlight');
    existingMarks.forEach((mark) => {
      const parent = mark.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(mark.textContent || ''), mark);
        parent.normalize();
      }
    });

    matchesRef.current = [];
    setMatchCount(0);
    setCurrentMatchIndex(0);

    const q = readerSearchQuery.trim();
    if (!q || !isSearchOpen) return;

    // Highlight matches in content
    const walkAndHighlight = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.nodeValue || '';
        const lowerText = text.toLowerCase();
        const lowerQ = q.toLowerCase();
        const index = lowerText.indexOf(lowerQ);

        if (index >= 0) {
          const matchedText = text.substring(index, index + q.length);
          const afterText = text.substring(index + q.length);

          const mark = document.createElement('mark');
          mark.className = 'reader-search-highlight bg-amber-400 dark:bg-amber-600 text-amber-950 dark:text-amber-100 rounded px-1 font-bold shadow-sm transition-all';
          mark.textContent = matchedText;

          const parent = node.parentNode;
          if (parent) {
            const beforeNode = document.createTextNode(text.substring(0, index));
            const afterNode = document.createTextNode(afterText);

            parent.insertBefore(beforeNode, node);
            parent.insertBefore(mark, node);
            parent.insertBefore(afterNode, node);
            parent.removeChild(node);

            matchesRef.current.push(mark);

            // Recursively process afterNode if more occurrences exist
            if (afterText.toLowerCase().includes(lowerQ)) {
              walkAndHighlight(afterNode);
            }
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
        Array.from(node.childNodes).forEach(walkAndHighlight);
      }
    };

    walkAndHighlight(contentRef.current);
    setMatchCount(matchesRef.current.length);

    if (matchesRef.current.length > 0) {
      setCurrentMatchIndex(1);
      scrollToMatch(0);
    }
  }, [readerSearchQuery, isSearchOpen, chapter.content.rendered]);

  const scrollToMatch = (index: number) => {
    const el = matchesRef.current[index];
    if (el) {
      // Remove active class from all
      matchesRef.current.forEach((m) => m.classList.remove('ring-4', 'ring-amber-600'));
      el.classList.add('ring-4', 'ring-amber-600');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleNextMatch = () => {
    if (matchCount === 0) return;
    const nextIdx = (currentMatchIndex % matchCount) + 1;
    setCurrentMatchIndex(nextIdx);
    scrollToMatch(nextIdx - 1);
  };

  const handlePrevMatch = () => {
    if (matchCount === 0) return;
    const prevIdx = currentMatchIndex === 1 ? matchCount : currentMatchIndex - 1;
    setCurrentMatchIndex(prevIdx);
    scrollToMatch(prevIdx - 1);
  };

  // Native share chapter
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: decodedTitle,
          text: `Read ${decodedTitle} on Shri Ramcharitmanas Reader`,
          url: window.location.href
        });
      } catch (err) {
        console.warn('Share cancelled', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Chapter link copied to clipboard!');
    }
  };

  // Font family helper
  const getFontFamilyClass = () => {
    switch (settings.fontFamily) {
      case 'heading':
        return 'font-heading';
      case 'sans':
        return 'font-sans';
      default:
        return 'font-devanagari';
    }
  };

  // Line height helper
  const getLineHeightClass = () => {
    switch (settings.lineHeight) {
      case 'loose':
        return 'leading-[2.2]';
      case 'relaxed':
        return 'leading-[1.9]';
      default:
        return 'leading-relaxed';
    }
  };

  return (
    <div className="min-h-full flex flex-col transition-colors duration-200 theme-bg">
      {/* Sticky Reader Navigation Header */}
      <header className="sticky top-0 z-30 shadow-sm border-b backdrop-blur-md theme-bg theme-border pt-safe transition-colors duration-200">
        <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
          {/* Back Action */}
          <button
            onClick={onBack}
            className="p-2 rounded-full theme-card theme-border border theme-text hover:opacity-80 active:scale-95 transition-all shadow-sm flex items-center gap-1 text-xs font-medium"
            title="Back to Table of Contents"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Index</span>
          </button>

          {/* Chapter Title Header */}
          <div className="text-center min-w-0 flex-1 px-2">
            <h2 className="text-sm font-bold font-devanagari theme-text truncate">
              {decodedTitle}
            </h2>
            {isCachedOffline && (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-center gap-1">
                <HardDriveDownload className="w-2.5 h-2.5" />
                <span>Offline Cached</span>
              </span>
            )}
          </div>

          {/* Reader Action Icons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-2 rounded-full theme-card theme-border border transition-all active:scale-95 shadow-sm ${
                isSearchOpen ? 'text-amber-600 border-amber-500/50 bg-amber-500/10' : 'theme-text hover:opacity-80'
              }`}
              title="Search within chapter"
            >
              <Search className="w-4 h-4" />
            </button>

            <button
              onClick={handleToggleBookmark}
              className={`p-2 rounded-full theme-card theme-border border transition-all active:scale-95 shadow-sm ${
                bookmarked ? 'text-amber-600 border-amber-500/50' : 'theme-text hover:opacity-80'
              }`}
              title={bookmarked ? 'Remove Bookmark' : 'Bookmark Chapter'}
            >
              {bookmarked ? (
                <BookmarkCheck className="w-4 h-4 fill-amber-600 text-amber-600" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2 rounded-full theme-card theme-border border theme-text hover:opacity-80 active:scale-95 transition-all shadow-sm"
              title="Typography & Theme Controls"
            >
              <SlidersHorizontal className="w-4 h-4 text-amber-600" />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-full theme-card theme-border border theme-text hover:opacity-80 active:scale-95 transition-all shadow-sm"
              title="Share Chapter"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* In-Reader Active Search Bar */}
        {isSearchOpen && (
          <div className="px-4 py-2 border-t theme-border theme-card flex items-center gap-2 animate-in slide-in-from-top-2 duration-200">
            <Search className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <input
              type="text"
              autoFocus
              value={readerSearchQuery}
              onChange={(e) => setReaderSearchQuery(e.target.value)}
              placeholder="Search words/verses in this chapter..."
              className="w-full text-xs py-1.5 px-3 rounded-lg theme-bg border theme-border theme-text focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            {matchCount > 0 && (
              <span className="text-[11px] font-mono theme-muted font-bold whitespace-nowrap">
                {currentMatchIndex}/{matchCount}
              </span>
            )}
            <div className="flex items-center gap-0.5">
              <button
                onClick={handlePrevMatch}
                disabled={matchCount === 0}
                className="p-1 rounded theme-bg border theme-border theme-text disabled:opacity-40"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleNextMatch}
                disabled={matchCount === 0}
                className="p-1 rounded theme-bg border theme-border theme-text disabled:opacity-40"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setReaderSearchQuery('');
                }}
                className="p-1 rounded theme-bg border theme-border theme-text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Chapter Content Area */}
      <main ref={containerRef} className="flex-1 max-w-3xl mx-auto w-full px-5 py-8">
        {/* Chapter Title Header in Reading View */}
        <div className="text-center mb-8 border-b pb-6 theme-border">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-heading text-2xl text-amber-600">
            राम
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-devanagari theme-text leading-snug">
            {decodedTitle}
          </h1>
        </div>

        {/* Dynamic HTML Verse Formatting Container */}
        <div
          ref={contentRef}
          style={{ fontSize: `${settings.fontSize}px` }}
          className={`ramayan-reader-content theme-text ${getFontFamilyClass()} ${getLineHeightClass()} space-y-6`}
          dangerouslySetInnerHTML={{ __html: chapter.content.rendered }}
        />
      </main>

      {/* Floating / Sticky Bottom Navigation Bar for Next/Prev Chapter */}
      <footer className="sticky bottom-0 z-20 border-t backdrop-blur-md theme-bg theme-border py-3 pb-safe transition-colors duration-200">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between gap-3">
          <button
            onClick={onPrevChapter}
            disabled={!hasPrev}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-semibold shadow-sm transition-all ${
              hasPrev
                ? 'theme-card theme-border theme-text hover:border-amber-500/50 active:scale-95'
                : 'opacity-40 theme-border theme-text cursor-not-allowed'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs font-medium theme-muted font-devanagari">
            जय श्री राम
          </span>

          <button
            onClick={onNextChapter}
            disabled={!hasNext}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-semibold shadow-sm transition-all ${
              hasNext
                ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600 active:scale-95'
                : 'opacity-40 theme-border theme-text cursor-not-allowed'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
};
