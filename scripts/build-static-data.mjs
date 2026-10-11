import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const RAW_JSON_PATH = path.join(ROOT_DIR, 'src', 'data', 'ramayanFullRaw.json');
const OUT_DIR = path.join(ROOT_DIR, 'public', 'data');
const CHAPTERS_OUT_DIR = path.join(OUT_DIR, 'chapters');

const DATA_VERSION = '1.1.0';

// --- Verse Formatter (same canonical logic as src/utils/verseFormatter.ts) ---

function cleanHtmlToLines(rawHtml) {
  return rawHtml
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<div id="jp-post-flair"[\s\S]*$/i, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<ins[\s\S]*?<\/ins>/gi, '')
    .replace(/<img[^>]*>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8220;|&#8221;|&#8243;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function formatKandHtml(rawHtml) {
  const lines = cleanHtmlToLines(rawHtml);
  if (lines.length === 0) return rawHtml;

  const blocks = [];
  let currentType = 'invocation';
  let buffer = [];

  const flush = () => {
    if (buffer.length === 0) return;
    const content = buffer.join('<br/>');

    switch (currentType) {
      case 'invocation':
        blocks.push(`
          <div class="my-4 p-4 border border-amber-500/30 bg-amber-500/5 rounded-xl text-center font-heading text-amber-800 dark:text-amber-300 space-y-1">
            ${buffer.map((l) => `<div class="font-bold">${l}</div>`).join('')}
          </div>
        `);
        break;

      case 'shloka':
        blocks.push(`
          <blockquote class="my-4 p-4 border-l-4 border-amber-600 bg-amber-500/10 rounded-xl text-center font-heading space-y-2">
            <strong class="text-amber-700 dark:text-amber-400 block mb-1">॥ मंगलाचरण / श्लोक ॥</strong>
            <div class="font-devanagari leading-loose">${content}</div>
          </blockquote>
        `);
        break;

      case 'chaupai':
        blocks.push(`
          <div class="verse-block bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 my-4 space-y-3">
            <p class="font-bold text-amber-700 dark:text-amber-400 font-heading">॥ चौपाई ॥</p>
            <p class="font-devanagari leading-loose">${content}</p>
          </div>
        `);
        break;

      case 'chhand':
        blocks.push(`
          <div class="verse-block bg-amber-500/5 p-4 rounded-xl border border-amber-500/25 my-4 space-y-3">
            <p class="font-bold text-amber-700 dark:text-amber-400 font-heading">॥ छन्द ॥</p>
            <p class="font-devanagari leading-loose italic">${content}</p>
          </div>
        `);
        break;

      case 'doha':
        blocks.push(`
          <div class="verse-block bg-amber-500/10 p-4 rounded-xl border-l-4 border border-amber-600/40 my-5 space-y-2 shadow-sm">
            <p class="font-bold text-amber-700 dark:text-amber-400 font-heading text-center">॥ दोहा ॥</p>
            <p class="font-devanagari leading-loose font-bold text-center">${content}</p>
          </div>
        `);
        break;

      case 'soratha':
        blocks.push(`
          <div class="verse-block bg-amber-500/10 p-4 rounded-xl border-l-4 border border-amber-600/40 my-5 space-y-2 shadow-sm">
            <p class="font-bold text-amber-700 dark:text-amber-400 font-heading text-center">॥ सोरठा ॥</p>
            <p class="font-devanagari leading-loose font-bold text-center">${content}</p>
          </div>
        `);
        break;

      case 'vishram':
        blocks.push(`
          <div class="my-6 py-2 px-4 rounded-full bg-amber-500/15 border border-amber-500/30 text-center font-heading text-sm font-bold text-amber-800 dark:text-amber-300">
            ${content}
          </div>
        `);
        break;

      case 'samapti':
        blocks.push(`
          <blockquote class="my-6 p-5 border-2 border-amber-600/40 bg-amber-500/10 rounded-2xl text-center font-heading font-bold text-amber-800 dark:text-amber-300 space-y-1">
            ${content}
          </blockquote>
        `);
        break;
    }

    buffer = [];
  };

  let dohaLinesInCurrentVerse = 0;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];

    if (/^[-*~–—\s•]+$/.test(rawLine)) {
      flush();
      currentType = 'chaupai';
      dohaLinesInCurrentVerse = 0;
      continue;
    }

    if (/^(मासपारायण|नवाह्नपारायण)/.test(rawLine)) {
      flush();
      currentType = 'vishram';
      buffer.push(rawLine);
      flush();
      currentType = 'chaupai';
      dohaLinesInCurrentVerse = 0;
      continue;
    }

    if (/^(इति श्रीमद्रामचरितमानसे|\(.*समाप्त\)|.*सोपानः समाप्तः)/.test(rawLine)) {
      if (currentType !== 'samapti') {
        flush();
        currentType = 'samapti';
      }
      buffer.push(rawLine);
      continue;
    }

    if (/^श्लोक\s*[-=–—:]?/.test(rawLine)) {
      flush();
      currentType = 'shloka';
      const cleaned = rawLine.replace(/^श्लोक\s*[-=–—:]?\s*/, '').trim();
      if (cleaned) buffer.push(cleaned);
      continue;
    }

    if (/^(दो0|दो०|दो-|दों0|दोहा)\s*[-=–—:]?/.test(rawLine)) {
      flush();
      currentType = 'doha';
      dohaLinesInCurrentVerse = 1;
      const cleaned = rawLine.replace(/^(दो0|दो०|दो-|दों0|दोहा)\s*[-=–—:]?\s*/, '').trim();
      if (cleaned) buffer.push(cleaned);
      continue;
    }

    if (/^(सो0|सो०|सो-|सोरठा)\s*[-=–—:]?/.test(rawLine)) {
      flush();
      currentType = 'soratha';
      dohaLinesInCurrentVerse = 1;
      const cleaned = rawLine.replace(/^(सो0|सो०|सो-|सोरठा)\s*[-=–—:]?\s*/, '').trim();
      if (cleaned) buffer.push(cleaned);
      continue;
    }

    if (/^(छं0|छं०|छं-|छं=|छन्द)\s*[-=–—:]?/.test(rawLine)) {
      flush();
      currentType = 'chhand';
      dohaLinesInCurrentVerse = 0;
      const cleaned = rawLine.replace(/^(छं0|छं०|छं-|छं=|छन्द)\s*[-=–—:]?\s*/, '').trim();
      if (cleaned) buffer.push(cleaned);
      continue;
    }

    if (currentType === 'shloka') {
      const isChaupaiLine = rawLine.includes('।') && rawLine.endsWith('।।') && !/\d/.test(rawLine.slice(-6));
      if (isChaupaiLine && buffer.some((b) => /।।\s*3\s*।।/.test(b))) {
        flush();
        currentType = 'chaupai';
        buffer.push(rawLine);
        continue;
      }
      buffer.push(rawLine);
      continue;
    }

    if (currentType === 'doha' || currentType === 'soratha') {
      if (dohaLinesInCurrentVerse >= 2) {
        const strippedEnd = rawLine.replace(/(।।|॥)\s*[\d(कखगघङचछजझ०-९)]*\s*(।।|॥)?$/, '।।');
        const bodyBeforeEnd = strippedEnd.slice(0, -2);
        const hasInternalSingleDanda = bodyBeforeEnd.includes('।') && !bodyBeforeEnd.includes('।।');

        if (hasInternalSingleDanda && strippedEnd.endsWith('।।')) {
          flush();
          currentType = 'chaupai';
          dohaLinesInCurrentVerse = 0;
          buffer.push(rawLine);
          continue;
        } else {
          const sameType = currentType;
          flush();
          currentType = sameType;
          dohaLinesInCurrentVerse = 1;
          buffer.push(rawLine);
          continue;
        }
      } else {
        dohaLinesInCurrentVerse++;
        buffer.push(rawLine);
        continue;
      }
    }

    if (currentType === 'samapti' && !/^(इति|\(|.*समाप्त)/.test(rawLine)) {
      flush();
      currentType = 'chaupai';
    }

    buffer.push(rawLine);
  }

  flush();

  return `<div class="ramayan-kand-container space-y-6">${blocks.join('\n')}</div>`;
}

function formatHanumanChalisaHtml(rawHtml) {
  const lines = cleanHtmlToLines(rawHtml);
  const blocks = [];

  blocks.push(`
    <blockquote class="my-4 p-4 border-l-4 border-amber-600 bg-amber-500/10 rounded-xl text-center font-heading">
      <strong class="text-amber-700 dark:text-amber-400">॥ श्री हनुमान चालीसा ॥</strong><br/>
      <span class="text-sm opacity-90">गोस्वामी तुलसीदास रचित चालीस चौपाइयाँ एवं दोहे</span>
    </blockquote>
  `);

  let mode = 'doha';
  let currentPair = [];

  const flushPair = () => {
    if (currentPair.length === 0) return;
    if (mode === 'doha') {
      blocks.push(`
        <div class="verse-block bg-amber-500/10 p-4 rounded-xl border-l-4 border border-amber-600/40 my-4 space-y-2 shadow-sm">
          <p class="font-bold text-amber-700 dark:text-amber-400 font-heading text-center">॥ दोहा ॥</p>
          <p class="font-devanagari leading-loose font-bold text-center">${currentPair.join('<br/>')}</p>
        </div>
      `);
    } else {
      blocks.push(`
        <div class="verse-block bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 my-3 space-y-2">
          <p class="font-bold text-amber-700 dark:text-amber-400 font-heading text-center text-sm">॥ चौपाई ॥</p>
          <p class="font-devanagari leading-loose text-center">${currentPair.join('<br/>')}</p>
        </div>
      `);
    }
    currentPair = [];
  };

  for (const line of lines) {
    if (/^॥?\s*दोहा\s*॥?$/.test(line)) {
      flushPair();
      mode = 'doha';
      continue;
    }
    if (/^॥?\s*चौपाई\s*॥?$/.test(line)) {
      flushPair();
      mode = 'chaupai';
      continue;
    }

    currentPair.push(line);
    if (currentPair.length === 2) {
      flushPair();
    }
  }
  flushPair();

  return `<div class="ramayan-kand-container space-y-4">${blocks.join('\n')}</div>`;
}

function formatBajrangBaanHtml(rawHtml) {
  const lines = cleanHtmlToLines(rawHtml);
  const blocks = [];

  blocks.push(`
    <blockquote class="my-4 p-4 border-l-4 border-amber-600 bg-amber-500/10 rounded-xl text-center font-heading">
      <strong class="text-amber-700 dark:text-amber-400">॥ श्री बजरंग बाण ॥</strong><br/>
      <span class="text-sm opacity-90">जय हनुमन्त सन्त हितकारी। सुनि लीजै प्रभु अरज हमारी॥</span>
    </blockquote>
  `);

  let mode = 'intro';
  let buffer = [];

  const flush = () => {
    if (buffer.length === 0) return;
    if (mode === 'intro') {
      blocks.push(`
        <div class="verse-block bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 my-4">
          <p class="font-devanagari text-base leading-relaxed theme-muted">${buffer.join('<br/>')}</p>
        </div>
      `);
    } else if (mode === 'stuti') {
      blocks.push(`
        <blockquote class="my-4 p-4 border-l-4 border-amber-600 bg-amber-500/10 rounded-xl text-center font-heading space-y-2">
          <strong class="text-amber-700 dark:text-amber-400 block">॥ श्रीराम स्तुति ॥</strong>
          <p class="font-devanagari leading-loose">${buffer.join('<br/>')}</p>
        </blockquote>
      `);
    } else if (mode === 'doha') {
      blocks.push(`
        <div class="verse-block bg-amber-500/10 p-4 rounded-xl border-l-4 border border-amber-600/40 my-4 space-y-2 shadow-sm">
          <p class="font-bold text-amber-700 dark:text-amber-400 font-heading text-center">॥ दोहा ॥</p>
          <p class="font-devanagari leading-loose font-bold text-center">${buffer.join('<br/>')}</p>
        </div>
      `);
    } else {
      for (let i = 0; i < buffer.length; i += 2) {
        const pair = buffer.slice(i, i + 2);
        blocks.push(`
          <div class="verse-block bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 my-3 space-y-2">
            <p class="font-bold text-amber-700 dark:text-amber-400 font-heading text-center text-sm">॥ चौपाई ॥</p>
            <p class="font-devanagari leading-loose text-center">${pair.join('<br/>')}</p>
          </div>
        `);
      }
    }
    buffer = [];
  };

  for (const line of lines) {
    if (line.startsWith('श्रीराम स्तुति')) {
      flush();
      mode = 'stuti';
      continue;
    }
    if (line === 'दोहा' || line === '॥दोहा॥') {
      flush();
      mode = 'doha';
      continue;
    }
    if (line === 'चौपाई' || line === '॥चौपाई॥') {
      flush();
      mode = 'chaupai';
      continue;
    }
    buffer.push(line);
  }
  flush();

  return `<div class="ramayan-kand-container space-y-4">${blocks.join('\n')}</div>`;
}

function formatAartiHtml(rawHtml) {
  const lines = cleanHtmlToLines(rawHtml);
  const blocks = [];

  blocks.push(`
    <blockquote class="my-4 p-4 border-l-4 border-amber-600 bg-amber-500/10 rounded-xl text-center font-heading">
      <strong class="text-amber-700 dark:text-amber-400">॥ श्री रामायण जी की आरती ॥</strong><br/>
      आरती श्री रामायण जी की। कीरति कलित ललित सिय पिय की॥
    </blockquote>
  `);

  let stanza = [];
  let stanzaNum = 1;

  for (const line of lines) {
    if (line.startsWith('बोलो सिया पति')) {
      blocks.push(`
        <div class="verse-block bg-amber-500/10 p-4 rounded-xl border border-amber-500/30 my-4 text-center">
          <p class="font-bold text-amber-700 dark:text-amber-400 font-heading text-lg">॥ ${line} ॥</p>
        </div>
      `);
      continue;
    }
    stanza.push(line);
    if (line.startsWith('आरती श्री रामायण जी की') && stanza.length > 1) {
      blocks.push(`
        <div class="verse-block bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 my-4 space-y-2">
          <p class="font-bold text-amber-700 dark:text-amber-400 font-heading">॥ आरती पद ${stanzaNum} ॥</p>
          <p class="font-devanagari leading-loose">${stanza.join('<br/>')}</p>
        </div>
      `);
      stanza = [];
      stanzaNum++;
    }
  }

  if (stanza.length > 0) {
    blocks.push(`
      <div class="verse-block bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 my-4 space-y-2">
        <p class="font-devanagari leading-loose">${stanza.join('<br/>')}</p>
      </div>
    `);
  }

  return `<div class="ramayan-kand-container space-y-4">${blocks.join('\n')}</div>`;
}

function formatRamayanHtml(rawHtml, postId) {
  if (!rawHtml) return '';
  if (rawHtml.includes('verse-block')) return rawHtml;
  if (postId === 73) return formatHanumanChalisaHtml(rawHtml);
  if (postId === 109) return formatBajrangBaanHtml(rawHtml);
  if (postId === 39) return formatAartiHtml(rawHtml);
  return formatKandHtml(rawHtml);
}

// --- Canonical 14 Chapters Metadata & Static Fallback Content ---

const CANONICAL_CHAPTERS = [
  {
    id: 8,
    kandNumber: 1,
    titleDevanagari: '१. बालकाण्ड (Balkand)',
    slug: 'balkand',
    date: '2006-07-24T07:06:16',
    isNew: false
  },
  {
    id: 11,
    kandNumber: 2,
    titleDevanagari: '२. अयोध्या काण्ड (Ayodhyakand)',
    slug: 'ayodhyakand',
    date: '2006-07-24T07:15:37',
    isNew: false
  },
  {
    id: 10,
    kandNumber: 3,
    titleDevanagari: '३. अरण्य काण्ड (Aranyakand)',
    slug: 'aranyakand',
    date: '2006-07-24T07:14:36',
    isNew: false
  },
  {
    id: 7,
    kandNumber: 4,
    titleDevanagari: '४. किष्किन्धा काण्ड (Kishkindhakand)',
    slug: 'kishkindhakand',
    date: '2006-07-24T07:06:16',
    isNew: false
  },
  {
    id: 12,
    kandNumber: 5,
    titleDevanagari: '५. सुन्दर काण्ड (Sunderkand)',
    slug: 'sunderkand',
    date: '2006-07-24T07:16:23',
    isNew: false
  },
  {
    id: 9,
    kandNumber: 6,
    titleDevanagari: '६. लंका काण्ड (Lankakand)',
    slug: 'lankakand',
    date: '2006-07-24T07:13:51',
    isNew: false
  },
  {
    id: 15,
    kandNumber: 7,
    titleDevanagari: '७. उत्तर कांड (Uttarkand)',
    slug: 'uttarkand',
    date: '2006-07-24T07:41:23',
    isNew: false
  },
  {
    id: 39,
    kandNumber: 8,
    titleDevanagari: '८. श्री रामायण जी की आरती',
    slug: 'aarti',
    date: '2017-04-26T14:07:15',
    isNew: true
  },
  {
    id: 1009,
    kandNumber: 9,
    titleDevanagari: '९. रामायण प्रश्नावली (Quiz)',
    slug: 'quiz',
    date: '2026-02-01T00:00:00',
    isNew: true,
    inlineHtml: `
      <div class="ramayan-kand-container space-y-6">
        <blockquote class="my-4 p-4 border-l-4 border-amber-600 bg-amber-500/10 rounded-xl text-center font-heading">
          <strong>॥ रामायण प्रश्नावली ॥</strong><br/>
          आप रामायण के बारे में कितना जानते हैं? आइये अपनी रामायण की जानकारी का परीक्षण करते हैं।
        </blockquote>
        <div class="verse-block bg-amber-500/5 p-5 rounded-2xl border border-amber-500/30 space-y-4">
          <h4 class="font-bold text-amber-700 dark:text-amber-400 font-heading">प्रथम संस्करण (First Edition Quiz)</h4>
          <p class="text-sm theme-text leading-relaxed font-devanagari">
            १. श्रीरामचरितमानस की रचना किसने की?<br/>
            <strong class="text-amber-600">उत्तर: गोस्वामी तुलसीदास जी</strong>
          </p>
          <p class="text-sm theme-text leading-relaxed font-devanagari border-t pt-2 border-amber-500/20">
            २. श्री रामचरितमानस में कुल कितने काण्ड हैं?<br/>
            <strong class="text-amber-600">उत्तर: ७ काण्ड (बाल, अयोध्या, अरण्य, किष्किन्धा, सुन्दर, लंका, उत्तर)</strong>
          </p>
          <p class="text-sm theme-text leading-relaxed font-devanagari border-t pt-2 border-amber-500/20">
            ३. हनुमान जी ने लंका में किस वाटिका में माता सीता से भेंट की थी?<br/>
            <strong class="text-amber-600">उत्तर: अशोक वाटिका</strong>
          </p>
        </div>
      </div>
    `
  },
  {
    id: 1010,
    kandNumber: 10,
    titleDevanagari: '१०. श्री रामचरित मानस – रोचक तथ्य',
    slug: 'interestingfacts',
    date: '2026-02-02T00:00:00',
    isNew: true,
    inlineHtml: `
      <div class="ramayan-kand-container space-y-6">
        <blockquote class="my-4 p-4 border-l-4 border-amber-600 bg-amber-500/10 rounded-xl text-center font-heading">
          <strong>॥ श्री रामचरित मानस – रोचक तथ्य ॥</strong><br/>
          श्रीरामचरितमानस ग्रंथ की रचना से जुड़े अद्भुत एवं प्रेरणादायी तथ्य।
        </blockquote>
        <div class="verse-block bg-amber-500/5 p-5 rounded-2xl border border-amber-500/30 space-y-3 font-devanagari text-sm theme-text leading-relaxed">
          <p>• <strong>रचना समय:</strong> श्रीरामचरितमानस की रचना में कुल <strong>२ वर्ष ७ महीने २६ दिन</strong> का समय लगा था।</p>
          <p>• <strong>आरंभ तिथि:</strong> संवत १६३१ (सन १५७४ ईस्वी) की रामनवमी के शुभ दिन अयोध्या में प्रारंभ हुआ था।</p>
          <p>• <strong>कुल चौपाइयाँ:</strong> इसमें लगभग ९,३८० चौपाइयाँ, १,०७४ दोहे, और २०७ सोरठे हैं।</p>
          <p>• <strong>सबसे बड़ा काण्ड:</strong> बालकाण्ड सबसे विस्तृत काण्ड है।</p>
          <p>• <strong>सबसे छोटा काण्ड:</strong> किष्किन्धाकाण्ड सबसे संक्षिप्त काण्ड है।</p>
          <p>• <strong>परम फलदायी काण्ड:</strong> सुन्दरकाण्ड का पाठ हनुमान जी की विशेष कृपा और संकट निवारण के लिए प्रसिद्ध है।</p>
        </div>
      </div>
    `
  },
  {
    id: 126,
    kandNumber: 11,
    titleDevanagari: '११. रामायण के प्रयोग',
    slug: 'usage',
    date: '2017-08-10T14:49:31',
    isNew: true,
    inlineHtml: `
      <div class="ramayan-kand-container space-y-6">
        <blockquote class="my-4 p-4 border-l-4 border-amber-600 bg-amber-500/10 rounded-xl text-center font-heading">
          <strong>॥ रामायण के प्रयोग ॥</strong><br/>
          श्री रामचरित मानस के ढेर सारे प्रयोग हैं। रामायण की चौपाईयों का प्रयोग लोग सैकड़ों वर्षों से करते आये हैं। यह पूरी तरह से आजमाया हुआ प्रयोग है।
        </blockquote>

        <div class="space-y-4">
          <div class="verse-block bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 space-y-2">
            <h4 class="font-bold text-amber-700 dark:text-amber-400 font-heading">१. प्रभु से क्षमा याचना के लिए चौपाई:</h4>
            <p class="font-devanagari text-lg leading-loose">
              अनुचित बहुत कहेउं अग्याता।<br/>
              छमहु क्षमा मंदिर दोउ भ्राता॥
            </p>
          </div>

          <div class="verse-block bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 space-y-2">
            <h4 class="font-bold text-amber-700 dark:text-amber-400 font-heading">२. सुख समृधि पाने के लिए चौपाई:</h4>
            <p class="font-devanagari text-lg leading-loose">
              जे सकाम नर सुनहिं जे गावहिं।<br/>
              सुख सम्पत्ति नानाविधि पावहिं॥
            </p>
          </div>

          <div class="verse-block bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 space-y-2">
            <h4 class="font-bold text-amber-700 dark:text-amber-400 font-heading">३. अच्छी बुद्धि और ज्ञान पाने के लिए चौपाई:</h4>
            <p class="font-devanagari text-lg leading-loose">
              ताके जुग पद कमल मनावऊं।<br/>
              जासु कृपा निरमल मति पावऊं॥
            </p>
          </div>

          <div class="verse-block bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 space-y-2">
            <h4 class="font-bold text-amber-700 dark:text-amber-400 font-heading">४. बुरी शक्तियों से बचाव के लिए:</h4>
            <p class="font-devanagari text-lg leading-loose">
              प्रनवउ पवन कुमार खल बन पावक ग्यान धुन।<br/>
              जासु हृदय आगार बसहि राम सर चाप धर॥
            </p>
          </div>

          <div class="verse-block bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 space-y-2">
            <h4 class="font-bold text-amber-700 dark:text-amber-400 font-heading">५. वर्षा होने के लिए चौपाई:</h4>
            <p class="font-devanagari text-lg leading-loose">
              सोइ जल अनल अनिल संघाता।<br/>
              होइ जलद जग जीवनदाता॥
            </p>
          </div>

          <div class="verse-block bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 space-y-2">
            <h4 class="font-bold text-amber-700 dark:text-amber-400 font-heading">६. विद्या प्राप्ति के लिए चौपाई:</h4>
            <p class="font-devanagari text-lg leading-loose">
              गुरु ग्रह गए पढ़न रघुराई।<br/>
              अलपकाल विद्या सब आई॥
            </p>
          </div>

          <div class="verse-block bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 space-y-2">
            <h4 class="font-bold text-amber-700 dark:text-amber-400 font-heading">७. अकाल मृत्यु से बचाव के लिए चौपाई:</h4>
            <p class="font-devanagari text-lg leading-loose">
              नाम पाहरू दिवस निसि ध्यान तुम्हार कपाट।<br/>
              लोचन निज पद जंत्रित प्रान केहि बात॥
            </p>
          </div>

          <div class="verse-block bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 space-y-2">
            <h4 class="font-bold text-amber-700 dark:text-amber-400 font-heading">८. शत्रु को मित्र बनाने के लिए चौपाई:</h4>
            <p class="font-devanagari text-lg leading-loose">
              गरल सुधा रिपु करहि मिताई।<br/>
              गोपद सिंधु अनल सितलाई॥
            </p>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 18,
    kandNumber: 12,
    titleDevanagari: '१२. गोस्वामी तुलसीदास',
    slug: 'goswami',
    date: '2006-08-06T11:32:12',
    isNew: true,
    inlineHtml: `
      <div class="ramayan-kand-container space-y-6">
        <blockquote class="my-4 p-4 border-l-4 border-amber-600 bg-amber-500/10 rounded-xl text-center font-heading">
          <strong>॥ गोस्वामी तुलसीदास जी परिचय ॥</strong><br/>
          श्री रामचरितमानस के रचयिता गोस्वामी तुलसीदास जी का जीवन परिचय एवं प्रमुख ग्रंथ।
        </blockquote>

        <div class="verse-block bg-amber-500/5 p-5 rounded-2xl border border-amber-500/30 space-y-4 font-devanagari theme-text text-base leading-relaxed">
          <p>
            श्री रामचरितमानस के रचयिता गोस्वामी तुलसीदास जी का जन्म सन् १५६८ में राजापुर में श्रावण शुक्ल ७ को हुआ था। पिता का नाम आत्माराम और माता का नाम हुलसी देवी था। तुलसी की पूजा के फलस्वरुप उत्पन्न पुत्र का नाम तुलसीदास रखा गया।
          </p>

          <p>
            गोस्वामी तुलसीदास जी को महर्षि वाल्मीकि का अवतार माना जाता है। उनका जन्म बांदा जिले के राजापुर गाँव में एक सरयू पारीण ब्राह्मण परिवार में हुआ था। उनका विवाह सं. १५८३ की ज्येष्ठ शुक्ल त्रयोदशी को बुद्धिमती (रत्नावली) से हुआ। वे अपनी पत्नी के प्रति पूर्ण रुप से आसक्त थे।
          </p>

          <div class="p-4 bg-amber-500/10 rounded-xl border-l-4 border-amber-600 font-bold text-center">
            हाड़ माँस को देह मम, तापर जितनी प्रीति।<br/>
            तिसु आधो जो राम प्रति, अवसि मिटिहि भवभीति॥
          </div>

          <h4 class="font-bold text-amber-700 dark:text-amber-400 font-heading border-b pb-2 pt-2">प्रसिद्ध ग्रंथ:</h4>
          <p class="text-sm">
            गोस्वामी तुलसीदास जी द्वारा रचित प्रमुख ग्रंथ: दोहावली, कवित्तरामायण, गीतावली, श्रीरामचरितमानस, रामलला नहछू, पार्वतीमंगल, जानकी मंगल, बरवै रामायण, रामाज्ञा, विनय पत्रिका, वैराग्य संदीपनी, कृष्ण गीतावली, संकट मोचन, हनुमान बाहुक, हनुमान चालीसा एवं बजरंग बाण।
          </p>

          <div class="p-4 bg-amber-500/10 rounded-xl border-l-4 border-amber-600 font-bold text-center">
            संवत सोलह सै असी, असी गंग के तीर।<br/>
            श्रावण शुक्ला सप्तमी, तुलसी तज्यो शरीर॥
          </div>
        </div>
      </div>
    `
  },
  {
    id: 73,
    kandNumber: 13,
    titleDevanagari: '१३. हनुमान चालीसा',
    slug: 'hanumanchalisa',
    date: '2017-05-09T05:22:52',
    isNew: true
  },
  {
    id: 109,
    kandNumber: 14,
    titleDevanagari: '१४. बजरंग बाण',
    slug: 'bajrangban',
    date: '2017-05-28T09:11:11',
    isNew: true
  }
];

async function syncFromWordPressIfRequested(rawPosts) {
  if (!process.argv.includes('--sync-wp')) return rawPosts;

  console.log('Syncing latest posts from WordPress API (jituonline.in)...');
  try {
    const res = await fetch('https://www.jituonline.in/ramayan/wp-json/wp/v2/posts?per_page=100&_fields=id,title,slug,date,content');
    if (res.ok) {
      const posts = await res.json();
      for (const post of posts) {
        if (post?.id && post?.content?.rendered) {
          rawPosts[String(post.id)] = post.content.rendered;
        }
      }
      fs.writeFileSync(RAW_JSON_PATH, JSON.stringify(rawPosts, null, 2), 'utf8');
      console.log(`Updated ${posts.length} posts in src/data/ramayanFullRaw.json`);
    }
  } catch (err) {
    console.warn('WordPress sync skipped due to network error:', err.message);
  }
  return rawPosts;
}

async function main() {
  fs.mkdirSync(CHAPTERS_OUT_DIR, { recursive: true });

  let rawPosts = JSON.parse(fs.readFileSync(RAW_JSON_PATH, 'utf8'));
  rawPosts = await syncFromWordPressIfRequested(rawPosts);

  const indexList = [];
  const chapterHashes = {};

  for (const ch of CANONICAL_CHAPTERS) {
    const rawHtml = rawPosts[String(ch.id)] || ch.inlineHtml || '';
    const formattedHtml = formatRamayanHtml(rawHtml, ch.id).trim();

    const detailPayload = {
      id: ch.id,
      title: { rendered: ch.titleDevanagari },
      slug: ch.slug,
      date: ch.date,
      isNew: ch.isNew,
      content: { rendered: formattedHtml }
    };

    const jsonString = JSON.stringify(detailPayload);
    const hash = crypto.createHash('sha256').update(jsonString).digest('hex').slice(0, 12);

    const chapterFile = path.join(CHAPTERS_OUT_DIR, `${ch.id}.json`);
    fs.writeFileSync(chapterFile, jsonString, 'utf8');

    indexList.push({
      id: ch.id,
      title: { rendered: ch.titleDevanagari },
      slug: ch.slug,
      date: ch.date,
      isNew: ch.isNew
    });

    chapterHashes[String(ch.id)] = {
      id: ch.id,
      slug: ch.slug,
      hash,
      bytes: Buffer.byteLength(jsonString, 'utf8')
    };
  }

  // Write index.json
  const indexFile = path.join(OUT_DIR, 'index.json');
  fs.writeFileSync(indexFile, JSON.stringify(indexList, null, 2), 'utf8');

  // Write manifest.json
  const manifest = {
    version: DATA_VERSION,
    updatedAt: new Date().toISOString(),
    cdnBaseUrl: 'https://cdn.jsdelivr.net/gh/jitu9968/ramayan@main/public/data',
    totalChapters: indexList.length,
    chapters: chapterHashes
  };
  const manifestFile = path.join(OUT_DIR, 'manifest.json');
  fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2), 'utf8');

  console.log(`Generated ${indexList.length} static chapter JSONs in public/data/chapters/ (v${DATA_VERSION})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
