import { get, set, del, keys, clear } from 'idb-keyval';
import { WPPostDetail, Bookmark, LastRead, ReaderSettings } from '../types/ramayan';

const CHAPTER_PREFIX = 'ramayan_chapter_';
const BOOKMARKS_KEY = 'ramayan_bookmarks';
const LAST_READ_KEY = 'ramayan_last_read';
const SETTINGS_KEY = 'ramayan_reader_settings';
const INDEX_CACHE_KEY = 'ramayan_chapter_index';

// --- CHAPTER CACHING IN INDEXEDDB ---

export async function saveChapterToCache(chapter: WPPostDetail): Promise<void> {
  await set(`${CHAPTER_PREFIX}${chapter.id}`, chapter);
}

export async function getChapterFromCache(id: number): Promise<WPPostDetail | undefined> {
  return await get<WPPostDetail>(`${CHAPTER_PREFIX}${id}`);
}

export async function getCachedChapterIds(): Promise<number[]> {
  const allKeys = await keys();
  return allKeys
    .filter((key): key is string => typeof key === 'string' && key.startsWith(CHAPTER_PREFIX))
    .map((key) => parseInt(key.replace(CHAPTER_PREFIX, ''), 10));
}

export async function clearChapterCache(): Promise<void> {
  const allKeys = await keys();
  const chapterKeys = allKeys.filter(
    (key): key is string => typeof key === 'string' && key.startsWith(CHAPTER_PREFIX)
  );
  for (const key of chapterKeys) {
    await del(key);
  }
}

export async function saveChapterIndexCache(indexData: any[]): Promise<void> {
  await set(INDEX_CACHE_KEY, indexData);
}

export async function getChapterIndexCache(): Promise<any[] | undefined> {
  return await get<any[]>(INDEX_CACHE_KEY);
}

// --- BOOKMARKS ---

export async function getBookmarks(): Promise<Bookmark[]> {
  const data = await get<Bookmark[]>(BOOKMARKS_KEY);
  return data || [];
}

export async function saveBookmarks(bookmarks: Bookmark[]): Promise<void> {
  await set(BOOKMARKS_KEY, bookmarks);
}

export async function toggleBookmark(postId: number, postTitle: string): Promise<boolean> {
  const current = await getBookmarks();
  const existingIndex = current.findIndex((b) => b.postId === postId);
  
  if (existingIndex >= 0) {
    current.splice(existingIndex, 1);
    await saveBookmarks(current);
    return false; // Removed
  } else {
    const newBookmark: Bookmark = {
      id: `bm_${postId}`,
      postId,
      postTitle,
      timestamp: Date.now()
    };
    current.unshift(newBookmark);
    await saveBookmarks(current);
    return true; // Added
  }
}

export async function isBookmarked(postId: number): Promise<boolean> {
  const current = await getBookmarks();
  return current.some((b) => b.postId === postId);
}

// --- LAST READ ---

export async function getLastRead(): Promise<LastRead | null> {
  const data = await get<LastRead>(LAST_READ_KEY);
  return data || null;
}

export async function saveLastRead(lastRead: LastRead): Promise<void> {
  await set(LAST_READ_KEY, lastRead);
}

// --- SETTINGS (LOCAL STORAGE + IDB FALLBACK) ---

export const DEFAULT_SETTINGS: ReaderSettings = {
  fontSize: 20,
  theme: 'light',
  lineHeight: 'relaxed',
  fontFamily: 'devanagari'
};

export function getStoredSettings(): ReaderSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Failed to read settings from localStorage', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveStoredSettings(settings: ReaderSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings to localStorage', e);
  }
}

// --- ESTIMATE CACHE SIZE ---

export async function getCacheStorageStats(): Promise<{ cachedCount: number; estimatedSizeMB: string }> {
  const ids = await getCachedChapterIds();
  let totalBytes = 0;
  for (const id of ids) {
    const chapter = await getChapterFromCache(id);
    if (chapter) {
      totalBytes += JSON.stringify(chapter).length * 2; // UTF-16 byte estimation
    }
  }
  const estimatedSizeMB = (totalBytes / (1024 * 1024)).toFixed(2);
  return { cachedCount: ids.length, estimatedSizeMB };
}

// --- GLOBAL OFFLINE FULL-TEXT SEARCH ---

import { GlobalSearchResult } from '../types/ramayan';
import { RAMAYAN_KANDS } from '../data/ramayanChapters';

export async function searchOfflineChapters(query: string): Promise<GlobalSearchResult[]> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  const results: GlobalSearchResult[] = [];
  const cachedIds = await getCachedChapterIds();
  const allChaptersToSearch: WPPostDetail[] = [];

  // 1. Load all cached chapters from IndexedDB
  for (const id of cachedIds) {
    const chapter = await getChapterFromCache(id);
    if (chapter) {
      allChaptersToSearch.push(chapter);
    }
  }

  // 2. Add local Ramayan dataset if not already in IndexedDB
  for (const kand of RAMAYAN_KANDS) {
    if (!allChaptersToSearch.some((c) => c.id === kand.id)) {
      allChaptersToSearch.push({
        id: kand.id,
        title: { rendered: kand.titleDevanagari },
        slug: kand.slug,
        date: kand.date,
        content: { rendered: kand.contentHtml }
      });
    }
  }

  // Helper to decode HTML entities & strip tags
  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // 3. Search through text content of each chapter
  for (const chapter of allChaptersToSearch) {
    const rawText = stripHtml(chapter.content.rendered);
    const lowerText = rawText.toLowerCase();
    const titleText = stripHtml(chapter.title.rendered);

    // Count occurrences
    let matchCount = 0;
    let pos = lowerText.indexOf(cleanQuery);
    let firstMatchIndex = -1;

    while (pos !== -1) {
      if (firstMatchIndex === -1) firstMatchIndex = pos;
      matchCount++;
      pos = lowerText.indexOf(cleanQuery, pos + cleanQuery.length);
    }

    // Also check title
    if (titleText.toLowerCase().includes(cleanQuery)) {
      matchCount += 2;
    }

    if (matchCount > 0) {
      let snippet = '';
      if (firstMatchIndex !== -1) {
        const start = Math.max(0, firstMatchIndex - 40);
        const end = Math.min(rawText.length, firstMatchIndex + cleanQuery.length + 50);
        snippet = (start > 0 ? '...' : '') + rawText.substring(start, end).replace(/\s+/g, ' ') + (end < rawText.length ? '...' : '');
      } else {
        snippet = rawText.substring(0, 90).replace(/\s+/g, ' ') + '...';
      }

      results.push({
        postId: chapter.id,
        postTitle: titleText,
        snippet,
        matchCount
      });
    }
  }

  // Sort by highest match count
  return results.sort((a, b) => b.matchCount - a.matchCount);
}
