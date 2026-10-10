import React from 'react';
import { Search, Bookmark, Download, HardDrive, RefreshCw, FileText, AlignLeft } from 'lucide-react';
import { ThemeMode } from '../types/ramayan';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchMode: 'titles' | 'fulltext';
  onSearchModeChange: (mode: 'titles' | 'fulltext') => void;
  onOpenManager: () => void;
  cachedCount: number;
  totalChapters: number;
  isDownloading: boolean;
  theme: ThemeMode;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  searchMode,
  onSearchModeChange,
  onOpenManager,
  cachedCount,
  totalChapters,
  isDownloading,
  theme,
  onRefresh,
  isRefreshing
}) => {
  return (
    <header className="sticky top-0 z-30 shadow-sm border-b backdrop-blur-md transition-colors duration-200 theme-bg theme-border pt-safe">
      <div className="max-w-3xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Brand & Devanagari Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center text-white shadow-md font-heading text-xl select-none">
              राम
            </div>
            <div>
              <h1 className="font-heading text-lg leading-tight theme-text font-bold tracking-wide">
                श्री रामचरितमानस
              </h1>
              <p className="text-xs theme-muted font-medium font-sans">
                Bilingual Ramayan Reader
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh Index"
              className="p-2 rounded-full theme-card theme-border border theme-text hover:opacity-80 active:scale-95 transition-all shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-600' : ''}`} />
            </button>

            <button
              onClick={onOpenManager}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full theme-card theme-border border theme-text hover:opacity-80 active:scale-95 transition-all shadow-sm text-xs font-medium"
              title="Bookmarks & Offline Cache Manager"
            >
              <HardDrive className="w-3.5 h-3.5 text-amber-600" />
              <span>Offline</span>
              {cachedCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-600 text-white">
                  {cachedCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Quick Search Bar & Search Mode Selector */}
        <div className="mt-3 space-y-2">
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 theme-muted pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={
                  searchMode === 'titles'
                    ? "Search chapter title (e.g. 'Sundar', 'Chalisa')..."
                    : "Search full text of all downloaded chapters (e.g. 'चौपाई', 'हनुमान')..."
                }
                className="w-full pl-9 pr-14 py-2 text-sm rounded-xl theme-card theme-border border theme-text placeholder:theme-muted focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs theme-muted hover:theme-text font-semibold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Search Mode Toggle Pills */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] theme-muted font-medium">Search In:</span>
            <button
              onClick={() => onSearchModeChange('titles')}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all flex items-center gap-1 ${
                searchMode === 'titles'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'theme-card theme-border theme-text opacity-70 hover:opacity-100'
              }`}
            >
              <AlignLeft className="w-3 h-3" />
              <span>Chapter Titles</span>
            </button>

            <button
              onClick={() => onSearchModeChange('fulltext')}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all flex items-center gap-1 ${
                searchMode === 'fulltext'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'theme-card theme-border theme-text opacity-70 hover:opacity-100'
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>Full Text (Offline)</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
