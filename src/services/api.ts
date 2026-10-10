import { WPPostMeta, WPPostDetail } from '../types/ramayan';
import { RAMAYAN_KANDS, getRamayanKandAsWPDetail, getRamayanKandMetas } from '../data/ramayanChapters';

const BASE_URL = 'https://www.jituonline.in/ramayan/wp-json/wp/v2/posts';
const PAGES_URL = 'https://www.jituonline.in/ramayan/wp-json/wp/v2/pages';

/**
 * Sorts WordPress posts strictly into canonical order (1 to 14):
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

  return [...posts].sort((a, b) => getOrderIndex(a) - getOrderIndex(b));
}

/**
 * Fetches chapter/post index from WordPress API or falls back to local data.
 */
export async function fetchChapterIndex(): Promise<WPPostMeta[]> {
  let allPosts: WPPostMeta[] = [];

  try {
    // 1. Fetch posts from WordPress API
    const response = await fetch(
      `${BASE_URL}?per_page=100&_fields=id,title,slug,date`,
      { headers: { Accept: 'application/json' } }
    );

    if (response.ok) {
      const posts: WPPostMeta[] = await response.json();
      if (Array.isArray(posts) && posts.length > 0) {
        allPosts = posts;
      }
    }

    // 2. Fetch pages (for Quiz, Usage, Goswami, etc.)
    try {
      const pageRes = await fetch(
        `${PAGES_URL}?per_page=100&_fields=id,title,slug,date`,
        { headers: { Accept: 'application/json' } }
      );
      if (pageRes.ok) {
        const pages: WPPostMeta[] = await pageRes.json();
        pages.forEach((page) => {
          const slug = (page.slug || '').toLowerCase();
          const title = (page.title?.rendered || '').toLowerCase();
          if (
            slug.includes('prashnavali') ||
            slug.includes('usage') ||
            slug.includes('goswami') ||
            slug.includes('interesting') ||
            title.includes('प्रश्नावली') ||
            title.includes('प्रयोग') ||
            title.includes('गोस्वामी') ||
            page.id === 44 ||
            page.id === 126 ||
            page.id === 18
          ) {
            if (!allPosts.some((p) => p.id === page.id)) {
              allPosts.push({ ...page, isPage: true } as any);
            }
          }
        });
      }
    } catch (e) {
      console.warn('Pages API fetch notice:', e);
    }
  } catch (error) {
    console.warn('Failed to fetch from Ramayan WordPress API (CORS/network fallback)', error);
  }

  // If online fetch returned empty array or failed due to CORS, use local dataset
  if (allPosts.length === 0) {
    return getRamayanKandMetas();
  }

  // Ensure any missing local items (like usage, goswami) exist in index
  const localMetas = getRamayanKandMetas();
  localMetas.forEach((localItem) => {
    if (!allPosts.some((p) => p.id === localItem.id || p.slug === localItem.slug)) {
      allPosts.push(localItem);
    }
  });

  const sorted = sortRamayanChapters(allPosts);
  return sorted.map((p, idx) => ({
    ...p,
    isNew: idx >= 7
  }));
}

/**
 * Fetches full chapter detail payload from WordPress API or falls back to local data.
 */
export async function fetchChapterDetail(id: number): Promise<WPPostDetail> {
  // 1. Try Posts API
  try {
    const response = await fetch(
      `${BASE_URL}/${id}?_fields=id,title,content,slug,date`,
      { headers: { Accept: 'application/json' } }
    );

    if (response.ok) {
      const detail: WPPostDetail = await response.json();
      if (detail && detail.content && detail.content.rendered) {
        return detail;
      }
    }
  } catch (e) {
    console.warn(`Post fetch failed for ID ${id}`, e);
  }

  // 2. Try Pages API
  try {
    const pageResponse = await fetch(
      `${PAGES_URL}/${id}?_fields=id,title,content,slug,date`,
      { headers: { Accept: 'application/json' } }
    );

    if (pageResponse.ok) {
      const pageDetail: WPPostDetail = await pageResponse.json();
      if (pageDetail && pageDetail.content && pageDetail.content.rendered) {
        return pageDetail;
      }
    }
  } catch (e) {
    console.warn(`Page fetch failed for ID ${id}`, e);
  }

  // 3. Fallback to bundled local dataset
  const localDetail = getRamayanKandAsWPDetail(id);
  if (localDetail) {
    return localDetail;
  }

  throw new Error(`Unable to load content for ID ${id}`);
}
