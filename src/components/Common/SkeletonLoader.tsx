import React from 'react';

export const ChapterListSkeleton: React.FC = () => {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="p-4 rounded-2xl theme-card theme-border border flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3.5 flex-1">
            <div className="w-9 h-9 rounded-xl theme-bg border theme-border flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded-md w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded-md w-1/3" />
            </div>
          </div>
          <div className="w-5 h-5 bg-gray-300 dark:bg-gray-700 rounded-full" />
        </div>
      ))}
    </div>
  );
};

export const ReaderSkeleton: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto w-full px-5 py-8 space-y-6 animate-pulse">
      <div className="text-center space-y-3 border-b pb-6 theme-border">
        <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 mx-auto" />
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-md w-2/3 mx-auto" />
      </div>

      <div className="space-y-4 pt-4">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-11/12" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-4/5" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full" />
        <div className="h-16 bg-amber-500/10 rounded-xl border border-amber-500/20 my-6" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-10/12" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full" />
      </div>
    </div>
  );
};
