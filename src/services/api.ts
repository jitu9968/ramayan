import { WPPostMeta, WPPostDetail } from '../types/ramayan';

const BASE_URL = 'https://www.jituonline.in/ramayan/wp-json/wp/v2/posts';
const PAGES_URL = 'https://www.jituonline.in/ramayan/wp-json/wp/v2/pages';

/**
 * Sorts WordPress posts strictly into the requested canonical order (1 to 12):
 * 1. बालकाण्ड (balkand)
 * 2. अयोध्या काण्ड (ayodhyakand)
 * 3. अरण्य काण्ड (aranyakand)
 * 4. किष्किन्धा काण्ड (kishkindhakand)
 * 5. सुन्दर काण्ड (sunderkand)
 * 6. लंका काण्ड (lankakand)
 * 7. उत्तर कांड (uttarkand)
 * 8. श्री रामायण जी की आरती (aarti)
 * 9. रामायण प्रश्नावली (Quiz)
 * 10. श्री रामचरित मानस – रोचक तथ्य
 * 11. हनुमान चालीसा (hanumanchalisa)
 * 12. बजरंग बाण (bajrangban)
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
 * Fetches chapter/post index from the Ramayan WordPress API & applies canonical sorting.
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
            // Avoid duplicates if already in posts
            if (!allPosts.some((p) => p.id === page.id)) {
              allPosts.push({ ...page, isPage: true } as any);
            }
          }
        });
      }
    } catch (e) {
      console.warn('Pages fetch notice:', e);
    }
  } catch (error) {
    console.warn('Failed to fetch from Ramayan WordPress API', error);
  }

  // Sort strictly in 1-12 canonical sequence
  const sorted = sortRamayanChapters(allPosts);

  // Mark items 8 through 12 as 'New' badge
  return sorted.map((p, idx) => ({
    ...p,
    isNew: idx >= 7
  }));
}

/**
 * Fetches full chapter detail payload from the Ramayan WordPress API.
 */
export async function fetchChapterDetail(id: number): Promise<WPPostDetail> {
  // First try fetching from Posts API
  try {
    const response = await fetch(
      `${BASE_URL}/${id}?_fields=id,title,content,slug,date`,
      { headers: { Accept: 'application/json' } }
    );

    if (response.ok) {
      const detail: WPPostDetail = await response.json();
      return detail;
    }
  } catch (e) {
    console.warn(`Post fetch failed for ${id}, trying Pages API`, e);
  }

  // Fallback to Pages API (e.g. for page 44 Quiz)
  try {
    const pageResponse = await fetch(
      `${PAGES_URL}/${id}?_fields=id,title,content,slug,date`,
      { headers: { Accept: 'application/json' } }
    );

    if (pageResponse.ok) {
      const pageDetail: WPPostDetail = await pageResponse.json();
      return pageDetail;
    }
  } catch (e) {
    console.error(`Page fetch failed for ${id}`, e);
  }

  throw new Error(`WordPress API returned error for content ID ${id}`);
}
