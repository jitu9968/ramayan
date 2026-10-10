import React, { useState, useEffect } from 'react';
import { X, Bookmark, HardDrive, Trash2, RefreshCw, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Bookmark as BookmarkType } from '../../types/ramayan';
import { getBookmarks, saveBookmarks, getCacheStorageStats, clearChapterCache } from '../../services/storage';

interface StorageBookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChapter: (id: number) => void;
  onRefreshCacheStats: () => void;
  onTriggerSync: () => void;
  isSyncing: boolean;
}

export const StorageBookmarksModal: React.FC<StorageBookmarksModalProps> = ({
  isOpen,
  onClose,
  onSelectChapter,
  onRefreshCacheStats,
  onTriggerSync,
  isSyncing
}) => {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'storage'>('bookmarks');
  const [bookmarks, setBookmarksList] = useState<BookmarkType[]>([]);
  const [cacheStats, setCacheStats] = useState<{ cachedCount: number; estimatedSizeMB: string }>({
    cachedCount: 0,
    estimatedSizeMB: '0.00'
  });
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    const bms = await getBookmarks();
    setBookmarksList(bms);
    const stats = await getCacheStorageStats();
    setCacheStats(stats);
  };

  const handleDeleteBookmark = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = bookmarks.filter((b) => b.id !== id);
    setBookmarksList(updated);
    await saveBookmarks(updated);
  };

  const handleClearCache = async () => {
    if (confirm('Are you sure you want to clear all offline cached chapters?')) {
      setIsClearing(true);
      await clearChapterCache();
      await loadData();
      onRefreshCacheStats();
      setIsClearing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-3xl theme-card theme-border border shadow-2xl p-5 space-y-5 max-h-[85vh] flex flex-col pt-safe pb-safe-or-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header & Tabs */}
        <div className="flex items-center justify-between pb-2 border-b theme-border">
          <div className="flex items-center gap-1 p-1 rounded-2xl theme-bg border theme-border">
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'bookmarks'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'theme-text hover:opacity-80'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Bookmarks ({bookmarks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('storage')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'storage'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'theme-text hover:opacity-80'
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Offline Storage</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full theme-bg theme-text hover:opacity-80 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3">
          {/* TAB 1: BOOKMARKS */}
          {activeTab === 'bookmarks' && (
            <div>
              {bookmarks.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <Bookmark className="w-10 h-10 mx-auto theme-muted opacity-40" />
                  <p className="text-sm font-medium theme-muted">No bookmarks saved yet.</p>
                  <p className="text-xs theme-muted opacity-70">
                    Tap the bookmark icon in any chapter to save it here for quick access.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {bookmarks.map((bm) => (
                    <div
                      key={bm.id}
                      onClick={() => {
                        onClose();
                        onSelectChapter(bm.postId);
                      }}
                      className="p-3.5 rounded-2xl theme-bg border theme-border hover:border-amber-500/50 cursor-pointer flex items-center justify-between gap-3 group transition-all"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <h4 className="text-sm font-bold font-devanagari theme-text truncate group-hover:text-amber-600">
                          {bm.postTitle}
                        </h4>
                        <p className="text-[11px] theme-muted">
                          Saved on {new Date(bm.timestamp).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleDeleteBookmark(bm.id, e)}
                          className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 active:scale-95 transition-all"
                          title="Remove bookmark"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-4 h-4 theme-muted group-hover:text-amber-600" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: OFFLINE STORAGE MANAGER */}
          {activeTab === 'storage' && (
            <div className="space-y-4">
              {/* Storage Stats Summary Box */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold theme-muted uppercase tracking-wider">
                    Cached Chapters
                  </span>
                  <span className="text-base font-bold text-amber-600 font-mono">
                    {cacheStats.cachedCount} Chapters
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold theme-muted uppercase tracking-wider">
                    Estimated Cache Size
                  </span>
                  <span className="text-base font-bold text-amber-600 font-mono">
                    ~{cacheStats.estimatedSizeMB} MB
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    onTriggerSync();
                    loadData();
                  }}
                  disabled={isSyncing}
                  className="w-full py-3 px-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow hover:shadow-md active:scale-95 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing WordPress Updates...' : 'Sync Latest WordPress Updates'}</span>
                </button>

                <button
                  onClick={handleClearCache}
                  disabled={isClearing || cacheStats.cachedCount === 0}
                  className="w-full py-3 px-4 rounded-2xl border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-40"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear Offline Cache</span>
                </button>
              </div>

              <p className="text-[11px] theme-muted text-center leading-relaxed">
                IndexedDB enables full offline reading capability without requiring an internet connection once downloaded.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
