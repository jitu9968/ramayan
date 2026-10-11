export interface WPPostMeta {
  id: number;
  title: {
    rendered: string;
  };
  slug: string;
  date: string;
  isNew?: boolean;
}

export interface WPPostDetail extends WPPostMeta {
  content: {
    rendered: string;
    protected?: boolean;
  };
  excerpt?: {
    rendered: string;
  };
}

export type ThemeMode = 'light' | 'sepia' | 'dark';

export interface ReaderSettings {
  fontSize: number; // 16px to 32px
  theme: ThemeMode;
  lineHeight: 'relaxed' | 'loose' | 'normal';
  fontFamily: 'devanagari' | 'heading' | 'sans';
}

export interface Bookmark {
  id: string; // post_id + optional verse index
  postId: number;
  postTitle: string;
  excerptSnippet?: string;
  timestamp: number;
}

export interface LastRead {
  postId: number;
  postTitle: string;
  scrollPosition: number; // Y offset in pixels
  timestamp: number;
}

export interface DownloadProgress {
  total: number;
  downloaded: number;
  isDownloading: boolean;
  currentTitle?: string;
  error?: string;
}

export interface GlobalSearchResult {
  postId: number;
  postTitle: string;
  snippet: string;
  matchCount: number;
}

export interface ChapterManifestEntry {
  id: number;
  slug: string;
  hash: string;
  bytes: number;
}

export interface DataManifest {
  version: string;
  updatedAt: string;
  cdnBaseUrl: string;
  totalChapters: number;
  chapters: Record<string, ChapterManifestEntry>;
}

