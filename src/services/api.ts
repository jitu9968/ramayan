import { WPPostMeta, WPPostDetail, DataManifest } from '../types/ramayan';
import { getRamayanKandAsWPDetail, getRamayanKandMetas } from '../data/ramayanChapters';
import {
  getStoredManifest,
  saveStoredManifest,
  saveChapterToCache,
  saveChapterIndexCache,
  getChapterFromCache
} from './storage';
import { formatRamayanHtml } from '../utils/verseFormatter';

const LOCAL_DATA_BASE = './data';
const GITHUB_CDN_BASE = 'https://cdn.jsdelivr.net/gh/jitu9968/ramayan@main/public/data';

/**
 * Sorts posts strictly into canonical order (1 to 14):
 */
export function sortRamayanChapters(posts: WPPostMeta[]): WPPostMeta[] {
  const getOrderIndex = (post: WPPostMeta) => {
    const slug = (post.slug || '').toLowerCase();
    const title = (post.title?.rendered || '').toLowerCase();

    if (slug.includes('balkand') || title.includes('बाल')) return 1;
    if (slug.includes('ayodhya') || title.includes('अयोध्या')) return 2;
    if (slug.includes('aranya') || title.includes('अरण्य')) return 3;
    if (slug.includes('kishkindha') || title.includes('किष्किन्धा')) return 4;
    if (slug.includes('sunder') || slug.includes('sundar') || title.includes('सुन्दर') || title.includes('सुंदर')) return 5;
    if (slug.includes('lanka') || title.includes('लंका') || title.includes('लङ्का')) return 6;
    if (slug.includes('uttar') || title.includes('उत्तर')) return 7;
    if (slug.includes('aarti') || title.includes('आरती')) return 8;
    if (slug.includes('quiz') || slug.includes('prashnavali') || title.includes('प्रश्नावली')) return 9;
    if (slug.includes('interesting') || title.includes('रोचक')) return 10;
    if (slug.includes('usage') || title.includes('प्रयोग')) return 11;
    if (slug.includes('goswami') || title.includes('गोस्वामी')) return 12;
    if (slug.includes('chalisa') || title.includes('चालीसा')) return 13;
    if (slug.includes('bajrang') || title.includes('बजरंग')) return 14;

    return 99;
  };

  return [...posts]
    .filter((p) => getOrderIndex(p) <= 14)
    .sort((a, b) => getOrderIndex(a) - getOrderIndex(b));
}

/**
 * Loads the chapter index from bundled static /data/index.json (0ms local load)
 * with fallback to in-memory metadata.
 */
export async function fetchChapterIndex(): Promise<WPPostMeta[]> {
  try {
    const localRes = await fetch(`${LOCAL_DATA_BASE}/index.json`, {
      headers: { Accept: 'application/json' }
    });
    if (localRes.ok) {
      const posts: WPPostMeta[] = await localRes.json();
      if (Array.isArray(posts) && posts.length > 0) {
        return sortRamayanChapters(posts);
      }
    }
  } catch (e) {
    console.warn('Local static index fetch notice, falling back to inline metadata', e);
  }

  return getRamayanKandMetas();
}

/**
 * Loads a chapter's full pre-formatted content from:
 * 1. Bundled static /data/chapters/{id}.json (instant local asset, works offline)
 * 2. GitHub jsDelivr CDN (for Over-The-Air added/updated chapters)
 * 3. Inline fallback summary
 */
export async function fetchChapterDetail(id: number): Promise<WPPostDetail> {
  // 1. Load from bundled static asset (/data/chapters/{id}.json)
  try {
    const localRes = await fetch(`${LOCAL_DATA_BASE}/chapters/${id}.json`, {
      headers: { Accept: 'application/json' }
    });
    if (localRes.ok) {
      const detail: WPPostDetail = await localRes.json();
      if (detail?.content?.rendered) {
        return {
          ...detail,
          content: {
            ...detail.content,
            rendered: formatRamayanHtml(detail.content.rendered, detail.id)
          }
        };
      }
    }
  } catch (e) {
    console.warn(`Local static chapter ${id} fetch notice:`, e);
  }

  // 2. Fallback to GitHub jsDelivr CDN (free forever open-source CDN)
  try {
    const cdnRes = await fetch(`${GITHUB_CDN_BASE}/chapters/${id}.json`, {
      headers: { Accept: 'application/json' }
    });
    if (cdnRes.ok) {
      const detail: WPPostDetail = await cdnRes.json();
      if (detail?.content?.rendered) {
        return {
          ...detail,
          content: {
            ...detail.content,
            rendered: formatRamayanHtml(detail.content.rendered, detail.id)
          }
        };
      }
    }
  } catch (e) {
    console.warn(`GitHub CDN fetch notice for chapter ${id}:`, e);
  }

  // 3. Final fallback to inline metadata
  const localDetail = getRamayanKandAsWPDetail(id);
  if (localDetail) {
    return localDetail;
  }

  throw new Error(`Unable to load content for chapter ID ${id}`);
}

/**
 * Lightweight Over-The-Air (OTA) delta sync against GitHub / jsDelivr CDN.
 * Checks manifest.json (~1.7 KB). If remote hashes match local hashes, 0 chapter requests are made.
 * Only modified or new chapters are downloaded from the CDN.
 */
export async function syncFromGitHubCdn(): Promise<{
  updatedChapters: number;
  version: string;
  index?: WPPostMeta[];
}> {
  // Load current baseline manifest (from IndexedDB or bundled /data/manifest.json)
  let localManifest = await getStoredManifest();
  if (!localManifest) {
    try {
      const bundledRes = await fetch(`${LOCAL_DATA_BASE}/manifest.json`);
      if (bundledRes.ok) {
        localManifest = await bundledRes.json();
        if (localManifest) {
          await saveStoredManifest(localManifest);
        }
      }
    } catch {
      // Ignore if offline
    }
  }

  // Fetch remote manifest from GitHub CDN
  const remoteRes = await fetch(`${GITHUB_CDN_BASE}/manifest.json`, {
    headers: { Accept: 'application/json' },
    cache: 'no-cache'
  });

  if (!remoteRes.ok) {
    throw new Error(`CDN manifest returned status ${remoteRes.status}`);
  }

  const remoteManifest: DataManifest = await remoteRes.json();
  let updatedChapters = 0;

  // Check each chapter hash; download from CDN only if hash changed or missing
  for (const [idStr, remoteEntry] of Object.entries(remoteManifest.chapters || {})) {
    const localEntry = localManifest?.chapters?.[idStr];
    const isHashChanged = !localEntry || localEntry.hash !== remoteEntry.hash;

    if (isHashChanged) {
      try {
        const chRes = await fetch(`${GITHUB_CDN_BASE}/chapters/${remoteEntry.id}.json`, {
          headers: { Accept: 'application/json' },
          cache: 'no-cache'
        });
        if (chRes.ok) {
          const detail: WPPostDetail = await chRes.json();
          await saveChapterToCache({
            ...detail,
            content: {
              ...detail.content,
              rendered: formatRamayanHtml(detail.content.rendered, detail.id)
            }
          });
          updatedChapters++;
        }
      } catch (e) {
        console.warn(`Failed to sync updated chapter ${idStr} from CDN`, e);
      }
    } else {
      // Ensure local static chapter is seeded in IndexedDB if not already cached
      const cached = await getChapterFromCache(remoteEntry.id);
      if (!cached) {
        try {
          const detail = await fetchChapterDetail(remoteEntry.id);
          await saveChapterToCache(detail);
        } catch {
          // Ignore
        }
      }
    }
  }

  // If manifest version changed, also refresh index.json from CDN
  let updatedIndex: WPPostMeta[] | undefined;
  if (!localManifest || localManifest.version !== remoteManifest.version || updatedChapters > 0) {
    try {
      const idxRes = await fetch(`${GITHUB_CDN_BASE}/index.json`, {
        headers: { Accept: 'application/json' },
        cache: 'no-cache'
      });
      if (idxRes.ok) {
        const rawIndex: WPPostMeta[] = await idxRes.json();
        updatedIndex = sortRamayanChapters(rawIndex);
        await saveChapterIndexCache(updatedIndex);
      }
    } catch {
      // Ignore
    }
  }

  await saveStoredManifest(remoteManifest);

  return {
    updatedChapters,
    version: remoteManifest.version,
    index: updatedIndex
  };
}
