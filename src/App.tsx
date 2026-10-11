import React, { useEffect, useState, useMemo } from 'react';
import {
  WPPostMeta,
  WPPostDetail,
  ReaderSettings,
  LastRead,
  DownloadProgress,
  GlobalSearchResult
} from './types/ramayan';
import { fetchChapterIndex, fetchChapterDetail, syncFromGitHubCdn } from './services/api';
import {
  getChapterFromCache,
  saveChapterToCache,
  getCachedChapterIds,
  getLastRead,
  getStoredSettings,
  saveStoredSettings,
  saveChapterIndexCache,
  getChapterIndexCache,
  searchOfflineChapters
} from './services/storage';

import { Header } from './components/Header';
import { HeroLastRead } from './components/ChapterList/HeroLastRead';
import { DownloadProgressCard } from './components/ChapterList/DownloadProgressCard';
import { ChapterCard } from './components/ChapterList/ChapterCard';
import { ReaderView } from './components/Reader/ReaderView';
import { ReaderSettingsModal } from './components/Controls/ReaderSettingsModal';
import { StorageBookmarksModal } from './components/Manager/StorageBookmarksModal';
import { SplashScreen } from './components/Common/SplashScreen';
import { ChapterListSkeleton, ReaderSkeleton } from './components/Common/SkeletonLoader';
import { searchChapters } from './utils/search';
import { getRamayanKandMetas } from './data/ramayanChapters';
import { AlertTriangle, RefreshCw, FileText, ChevronRight, Search as SearchIcon } from 'lucide-react';

export default function App() {
  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);

  // State
  const [chapters, setChapters] = useState<WPPostMeta[]>([]);
  const [cachedIds, setCachedIds] = useState<number[]>([]);
  const [activeChapterId, setActiveChapterId] = useState<number | null>(null);
  const [activeChapterDetail, setActiveChapterDetail] = useState<WPPostDetail | null>(null);
  const [lastRead, setLastReadState] = useState<LastRead | null>(null);
  
  // Settings & Theme
  const [settings, setSettings] = useState<ReaderSettings>(getStoredSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'titles' | 'fulltext'>('titles');
  const [fullTextResults, setFullTextResults] = useState<GlobalSearchResult[]>([]);
  const [isSearchingFullText, setIsSearchingFullText] = useState(false);

  // Loading States
  const [isLoadingIndex, setIsLoadingIndex] = useState(true);
  const [isLoadingChapter, setIsLoadingChapter] = useState(false);
  const [indexError, setIndexError] = useState<string | null>(null);
  const [chapterError, setChapterError] = useState<string | null>(null);

  // Batch Download Progress
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({
    total: 0,
    downloaded: 0,
    isDownloading: false
  });

  // Apply root theme class to html element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-sepia', 'theme-dark');
    root.classList.add(`theme-${settings.theme}`);
  }, [settings.theme]);

  // Initial Load: Fetch Index & Storage stats
  useEffect(() => {
    loadInitialData();
  }, []);

  // Offline Full Text Search effect
  useEffect(() => {
    if (searchMode === 'fulltext' && searchQuery.trim()) {
      setIsSearchingFullText(true);
      const timer = setTimeout(() => {
        searchOfflineChapters(searchQuery).then((res) => {
          setFullTextResults(res);
          setIsSearchingFullText(false);
        });
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setFullTextResults([]);
      setIsSearchingFullText(false);
    }
  }, [searchQuery, searchMode]);

  const loadInitialData = async () => {
    setIsLoadingIndex(true);
    setIndexError(null);

    try {
      const freshIndex = await fetchChapterIndex();
      if (freshIndex && freshIndex.length > 0) {
        setChapters(freshIndex);
        await saveChapterIndexCache(freshIndex);
      } else {
        const localMetas = getRamayanKandMetas();
        setChapters(localMetas);
        await saveChapterIndexCache(localMetas);
      }
    } catch (err: any) {
      console.warn('Local index load notice, relying on cached dataset', err);
      const cachedIndex = await getChapterIndexCache();
      if (cachedIndex && cachedIndex.length > 0) {
        setChapters(cachedIndex);
      } else {
        const localMetas = getRamayanKandMetas();
        setChapters(localMetas);
      }
    } finally {
      const ids = await getCachedChapterIds();
      setCachedIds(ids);
      const lr = await getLastRead();
      setLastReadState(lr);
      setIsLoadingIndex(false);
    }

    // Background delta check against GitHub CDN manifest.json (only downloads if hash changed)
    syncFromGitHubCdn()
      .then((res) => {
        if (res.index && res.index.length > 0) {
          setChapters(res.index);
        }
        refreshCachedIds();
      })
      .catch(() => {
        /* Offline or CDN unreachable - local static bundle is already active */
      });
  };

  // Open Chapter with Instant Local / IndexedDB Data Flow
  const handleOpenChapter = async (id: number) => {
    setActiveChapterId(id);
    setIsLoadingChapter(true);
    setChapterError(null);

    try {
      // 1. Check IndexedDB first for zero latency
      const cached = await getChapterFromCache(id);
      if (cached) {
        setActiveChapterDetail(cached);
        setIsLoadingChapter(false);
        return;
      }

      // 2. Load from bundled static /data/chapters/{id}.json (or GitHub CDN fallback)
      const detail = await fetchChapterDetail(id);
      setActiveChapterDetail(detail);

      // 3. Save payload to IndexedDB in background
      saveChapterToCache(detail).then(refreshCachedIds);
    } catch (err: any) {
      console.error('Error opening chapter:', err);
      setChapterError('Failed to load chapter content.');
    } finally {
      setIsLoadingChapter(false);
    }
  };

  const refreshCachedIds = async () => {
    const ids = await getCachedChapterIds();
    setCachedIds(ids);
  };

  // Update Settings
  const handleUpdateSettings = (newSettings: Partial<ReaderSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    saveStoredSettings(updated);
  };

  // Batch Download Entire Ramayan for Offline Reading
  const handleStartBatchDownload = async () => {
    if (chapters.length === 0 || downloadProgress.isDownloading) return;

    setDownloadProgress({
      total: chapters.length,
      downloaded: cachedIds.length,
      isDownloading: true
    });

    let currentDownloadedCount = cachedIds.length;

    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      if (cachedIds.includes(chapter.id)) {
        continue; // Already cached
      }

      try {
        setDownloadProgress((prev) => ({
          ...prev,
          currentTitle: chapter.title.rendered,
          downloaded: currentDownloadedCount
        }));

        const detail = await fetchChapterDetail(chapter.id);
        await saveChapterToCache(detail);
        currentDownloadedCount++;

        setDownloadProgress((prev) => ({
          ...prev,
          downloaded: currentDownloadedCount
        }));
      } catch (e) {
        console.warn(`Batch download skip for chapter ${chapter.id}`, e);
      }
    }

    await refreshCachedIds();
    setDownloadProgress({
      total: chapters.length,
      downloaded: currentDownloadedCount,
      isDownloading: false
    });
  };

  // Navigation helpers in Reader View
  const currentIndex = useMemo(() => {
    if (!activeChapterId) return -1;
    return chapters.findIndex((c) => c.id === activeChapterId);
  }, [activeChapterId, chapters]);

  const handleNextChapter = () => {
    if (currentIndex >= 0 && currentIndex < chapters.length - 1) {
      handleOpenChapter(chapters[currentIndex + 1].id);
    }
  };

  const handlePrevChapter = () => {
    if (currentIndex > 0) {
      handleOpenChapter(chapters[currentIndex - 1].id);
    }
  };

  // Chapter titles Search filter
  const filteredChapters = useMemo(() => {
    return searchChapters(chapters, searchQuery);
  }, [chapters, searchQuery]);

  // Back to Table of Contents
  const handleBackToToc = async () => {
    setActiveChapterId(null);
    setActiveChapterDetail(null);
    // Refresh last read state
    const lr = await getLastRead();
    setLastReadState(lr);
    refreshCachedIds();
  };

  return (
    <div className="h-full flex flex-col theme-bg transition-colors duration-200">
      {/* SPLASH SCREEN OVERLAY */}
      {showSplash && (
        <SplashScreen
          onDismiss={() => setShowSplash(false)}
          durationSeconds={5}
        />
      )}

      {/* 1. READER VIEW */}
      {activeChapterId !== null ? (
        isLoadingChapter ? (
          <div className="h-full flex flex-col">
            <header className="sticky top-0 z-30 shadow-sm border-b backdrop-blur-md theme-bg theme-border pt-safe">
              <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
                <button
                  onClick={handleBackToToc}
                  className="px-3 py-1.5 rounded-full theme-card theme-border border text-xs font-semibold theme-text"
                >
                  ← Back to Index
                </button>
                <span className="text-xs theme-muted">Loading Chapter...</span>
              </div>
            </header>
            <ReaderSkeleton />
          </div>
        ) : chapterError ? (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-red-500" />
            <h3 className="text-lg font-bold theme-text">Chapter Loading Error</h3>
            <p className="text-xs theme-muted max-w-md">{chapterError}</p>
            <div className="flex gap-3">
              <button
                onClick={handleBackToToc}
                className="px-4 py-2 rounded-xl theme-card theme-border border text-xs font-semibold theme-text"
              >
                Back to Index
              </button>
              <button
                onClick={() => handleOpenChapter(activeChapterId)}
                className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold shadow"
              >
                Retry
              </button>
            </div>
          </div>
        ) : activeChapterDetail ? (
          <ReaderView
            chapter={activeChapterDetail}
            onBack={handleBackToToc}
            onNextChapter={handleNextChapter}
            onPrevChapter={handlePrevChapter}
            hasNext={currentIndex < chapters.length - 1}
            hasPrev={currentIndex > 0}
            settings={settings}
            onOpenSettings={() => setIsSettingsOpen(true)}
            isCachedOffline={cachedIds.includes(activeChapterDetail.id)}
            initialScrollPosition={lastRead?.postId === activeChapterDetail.id ? lastRead.scrollPosition : 0}
          />
        ) : null
      ) : (
        /* 2. TABLE OF CONTENTS / HOME VIEW */
        <div className="flex-1 flex flex-col min-h-0">
          <Header
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchMode={searchMode}
            onSearchModeChange={setSearchMode}
            onOpenManager={() => setIsManagerOpen(true)}
            cachedCount={cachedIds.length}
            totalChapters={chapters.length}
            isDownloading={downloadProgress.isDownloading}
            theme={settings.theme}
            onRefresh={loadInitialData}
            isRefreshing={isLoadingIndex}
          />

          <main className="flex-1 overflow-y-auto max-w-3xl mx-auto w-full px-4 py-5 pb-safe">
            {/* Hero Last Read Card */}
            {!searchQuery && <HeroLastRead lastRead={lastRead} onOpenChapter={handleOpenChapter} />}

            {/* Offline Batch Download Card */}
            {!searchQuery && (
              <DownloadProgressCard
                progress={downloadProgress}
                onStartDownload={handleStartBatchDownload}
                cachedCount={cachedIds.length}
                totalCount={chapters.length}
              />
            )}

            {/* MODE 1: GLOBAL OFFLINE FULL-TEXT SEARCH RESULTS */}
            {searchMode === 'fulltext' && searchQuery.trim() ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold font-devanagari theme-text flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span>Full-Text Search Results</span>
                    <span className="text-xs font-sans font-normal theme-muted">
                      ({fullTextResults.length} {fullTextResults.length === 1 ? 'chapter' : 'chapters'} matched)
                    </span>
                  </h2>
                </div>

                {isSearchingFullText ? (
                  <div className="py-12 text-center space-y-2 theme-muted">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-600" />
                    <p className="text-xs">Searching full text across downloaded IndexedDB chapters...</p>
                  </div>
                ) : fullTextResults.length === 0 ? (
                  <div className="py-16 text-center space-y-2 theme-muted">
                    <SearchIcon className="w-8 h-8 mx-auto opacity-40" />
                    <p className="text-sm font-semibold">No full-text verse matches found for "{searchQuery}".</p>
                    <p className="text-xs">Try downloading all chapters or searching for terms like 'हनुमान', 'राम', or 'चौपाई'.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {fullTextResults.map((res) => (
                      <div
                        key={res.postId}
                        onClick={() => handleOpenChapter(res.postId)}
                        className="p-4 rounded-2xl theme-card theme-border border shadow-sm hover:shadow-md transition-all active:scale-[0.98] cursor-pointer space-y-2 group"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold font-devanagari theme-text group-hover:text-amber-600 transition-colors">
                            {res.postTitle}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                            {res.matchCount} {res.matchCount === 1 ? 'match' : 'matches'}
                          </span>
                        </div>

                        <p className="text-xs theme-muted font-devanagari leading-relaxed bg-amber-500/5 p-2.5 rounded-xl border border-amber-500/10">
                          {res.snippet}
                        </p>

                        <div className="flex items-center justify-end text-xs text-amber-600 font-semibold gap-1 pt-1">
                          <span>Read Chapter</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* MODE 2: STANDARD CHAPTER INDEX SEARCH */
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold font-devanagari theme-text flex items-center gap-2">
                    <span>अध्याय सूचिका</span>
                    <span className="text-xs font-sans font-normal theme-muted">
                      ({filteredChapters.length} {filteredChapters.length === 1 ? 'Chapter' : 'Chapters'})
                    </span>
                  </h2>
                </div>

                {/* Error view */}
                {indexError && (
                  <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs space-y-2 mb-6">
                    <div className="flex items-center gap-2 font-bold">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>API Connection Error</span>
                    </div>
                    <p>{indexError}</p>
                    <button
                      onClick={loadInitialData}
                      className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold shadow hover:bg-red-700 transition-colors"
                    >
                      Retry Connection
                    </button>
                  </div>
                )}

                {/* Chapter List or Skeletons */}
                {isLoadingIndex ? (
                  <ChapterListSkeleton />
                ) : filteredChapters.length === 0 ? (
                  <div className="py-16 text-center space-y-2 theme-muted">
                    <p className="text-sm font-semibold">No matching chapters found.</p>
                    <p className="text-xs">Try switching to "Full Text (Offline)" search mode above.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredChapters.map((chapter, idx) => (
                      <ChapterCard
                        key={chapter.id}
                        chapter={chapter}
                        index={idx}
                        isCached={cachedIds.includes(chapter.id)}
                        onSelect={handleOpenChapter}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      )}

      {/* 3. SETTINGS MODAL */}
      <ReaderSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* 4. BOOKMARKS & OFFLINE MANAGER MODAL */}
      <StorageBookmarksModal
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
        onSelectChapter={handleOpenChapter}
        onRefreshCacheStats={refreshCachedIds}
        onTriggerSync={loadInitialData}
        isSyncing={isLoadingIndex}
      />
    </div>
  );
}
