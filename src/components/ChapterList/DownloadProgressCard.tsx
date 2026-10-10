import React from 'react';
import { Download, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { DownloadProgress } from '../../types/ramayan';

interface DownloadProgressCardProps {
  progress: DownloadProgress;
  onStartDownload: () => void;
  cachedCount: number;
  totalCount: number;
}

export const DownloadProgressCard: React.FC<DownloadProgressCardProps> = ({
  progress,
  onStartDownload,
  cachedCount,
  totalCount
}) => {
  const isFullyCached = totalCount > 0 && cachedCount >= totalCount;
  const percentage = progress.total > 0 ? Math.round((progress.downloaded / progress.total) * 100) : 0;

  if (isFullyCached) {
    return (
      <div className="mb-6 p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <div>
            <span className="font-semibold">Full Offline Access Ready</span>
            <p className="opacity-80 text-[11px]">All {totalCount} chapters downloaded for offline reading.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 rounded-2xl theme-card theme-border border shadow-sm space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Download className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-semibold theme-text">
            Offline Library Sync ({cachedCount}/{totalCount || '...'})
          </span>
        </div>
        {!progress.isDownloading && (
          <button
            onClick={onStartDownload}
            disabled={totalCount === 0}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium shadow hover:shadow-md active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download All</span>
          </button>
        )}
      </div>

      {progress.isDownloading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs theme-muted">
            <span className="truncate max-w-[200px]">
              {progress.currentTitle ? `Downloading: ${progress.currentTitle}` : 'Preparing sync...'}
            </span>
            <span className="font-mono font-semibold text-amber-600">{percentage}%</span>
          </div>

          {/* Progress Bar Container */}
          <div className="w-full h-2 rounded-full theme-bg overflow-hidden border theme-border">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300 rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <p className="text-[11px] theme-muted flex items-center gap-1">
            <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
            <span>Storing chapters into IndexedDB for zero-network reading...</span>
          </p>
        </div>
      )}

      {progress.error && (
        <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-lg border border-red-200 dark:border-red-900">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{progress.error}</span>
        </div>
      )}
    </div>
  );
};
