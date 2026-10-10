import { WPPostMeta } from '../types/ramayan';

/**
 * Phonetic & Transliteration dictionary map for bilingual Ramayan search.
 * Maps English transliterated search terms to their Devanagari equivalents.
 */
const TRANSLITERATION_MAP: Record<string, string[]> = {
  bal: ['बाल', 'balkand'],
  balkand: ['बाल', 'बालकाण्ड', 'बाल काण्ड'],
  ayodhya: ['अयोध्या', 'ayodhyakand'],
  ayodhyakand: ['अयोध्या', 'अयोध्याकाण्ड', 'अयोध्या काण्ड'],
  aranya: ['अरण्य', 'aranyakand'],
  aranyakand: ['अरण्य', 'अरण्यकाण्ड', 'अरण्य काण्ड'],
  kishkindha: ['किष्किन्धा', 'kishkindhakand'],
  kishkindhakand: ['किष्किन्धा', 'किष्किन्धाकाण्ड', 'किष्किन्धा काण्ड'],
  sundar: ['सुन्दर', 'सुंदर', 'sunderkand', 'sundarkand'],
  sunder: ['सुन्दर', 'सुंदर', 'sunderkand'],
  sunderkand: ['सुन्दर', 'सुंदर', 'सुन्दरकाण्ड', 'सुन्दर काण्ड'],
  sundarkand: ['सुन्दर', 'सुंदर', 'सुन्दरकाण्ड', 'सुन्दर काण्ड'],
  lanka: ['लंका', 'लङ्का', 'lankakand'],
  lankakand: ['लंका', 'लङ्का', 'लंकाकाण्ड', 'लंका काण्ड'],
  uttar: ['उत्तर', 'uttarkand'],
  uttarkand: ['उत्तर', 'उत्तरकाण्ड', 'उत्तर काण्ड'],
  hanuman: ['हनुमान', 'हनुमान्'],
  chalisa: ['चालीसा'],
  bajrang: ['बजरंग'],
  baan: ['बाण'],
  aarti: ['आरती', 'आरती'],
  ram: ['राम', 'श्रीराम', 'रामायण'],
  ramayan: ['रामायण', 'रामचरितमानस'],
  manas: ['मानस'],
  ramcharitmanas: ['रामचरितमानस', 'राम चरित मानस'],
  chaupai: ['चौपाई'],
  doha: ['दोहा']
};

/**
 * Decodes HTML entities safely.
 */
export function decodeHtmlEntities(html: string): string {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

/**
 * Performs a smart, bilingual search across chapter titles, slugs, and transliterations.
 */
export function searchChapters(chapters: WPPostMeta[], query: string): WPPostMeta[] {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return chapters;

  // Find all mapped variants if query is in transliteration dictionary
  const queryVariants: string[] = [cleanQuery];
  Object.keys(TRANSLITERATION_MAP).forEach((key) => {
    if (cleanQuery.includes(key) || key.includes(cleanQuery)) {
      queryVariants.push(...TRANSLITERATION_MAP[key]);
    }
  });

  return chapters.filter((chapter) => {
    const decodedTitle = decodeHtmlEntities(chapter.title.rendered).toLowerCase();
    const slug = (chapter.slug || '').toLowerCase();

    // 1. Direct title or slug match
    if (decodedTitle.includes(cleanQuery) || slug.includes(cleanQuery)) {
      return true;
    }

    // 2. Transliteration variant match
    for (const variant of queryVariants) {
      const cleanVariant = variant.toLowerCase();
      if (decodedTitle.includes(cleanVariant) || slug.includes(cleanVariant)) {
        return true;
      }
    }

    return false;
  });
}
