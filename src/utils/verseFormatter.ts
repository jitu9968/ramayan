/**
 * Formats raw Ramcharitmanas / Hanuman Chalisa / Bajrang Baan / Aarti HTML
 * into the canonical Balkand presentation style:
 * - Mangalacharan / Shloka in an amber blockquote header card
 * - Chaupai, Chhand, Doha, and Soratha separated into distinct .verse-block cards
 *   with proper color, font-devanagari / font-heading typography, and spacing.
 */

export function formatRamayanHtml(rawHtml: string, postId?: number): string {
  if (!rawHtml) return '';

  // If already formatted with .verse-block cards (e.g., Usage, Goswami, Quiz, Facts), return as-is
  if (rawHtml.includes('verse-block')) {
    return rawHtml;
  }

  // Special formatter for Hanuman Chalisa (ID 73)
  if (postId === 73) {
    return formatHanumanChalisaHtml(rawHtml);
  }

  // Special formatter for Bajrang Baan (ID 109)
  if (postId === 109) {
    return formatBajrangBaanHtml(rawHtml);
  }

  // Special formatter for Aarti (ID 39)
  if (postId === 39) {
    return formatAartiHtml(rawHtml);
  }

  // Standard 7 Kandas formatter (Bal, Ayodhya, Aranya, Kishkindha, Sunder, Lanka, Uttar)
  return formatKandHtml(rawHtml);
}

function cleanHtmlToLines(rawHtml: string): string[] {
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

function formatKandHtml(rawHtml: string): string {
  const lines = cleanHtmlToLines(rawHtml);
  if (lines.length === 0) return rawHtml;

  const blocks: string[] = [];

  type BlockType = 'invocation' | 'shloka' | 'chaupai' | 'chhand' | 'doha' | 'soratha' | 'vishram' | 'samapti';
  let currentType: BlockType = 'invocation';
  let buffer: string[] = [];

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

    // Skip pure decorative separator lines (--*--*--, ~~~~, ----) and flush current block
    if (/^[-*~–—\s•]+$/.test(rawLine)) {
      flush();
      currentType = 'chaupai';
      dohaLinesInCurrentVerse = 0;
      continue;
    }

    // Check for Masparayan / Navahparayan Vishram
    if (/^(मासपारायण|नवाह्नपारायण)/.test(rawLine)) {
      flush();
      currentType = 'vishram';
      buffer.push(rawLine);
      flush();
      currentType = 'chaupai';
      dohaLinesInCurrentVerse = 0;
      continue;
    }

    // Check for Kand Samapti (इति श्रीमद्रामचरितमानसे... or (...काण्ड समाप्त))
    if (/^(इति श्रीमद्रामचरितमानसे|\(.*समाप्त\)|.*सोपानः समाप्तः)/.test(rawLine)) {
      if (currentType !== 'samapti') {
        flush();
        currentType = 'samapti';
      }
      buffer.push(rawLine);
      continue;
    }

    // Check for Shloka marker
    if (/^श्लोक\s*[-=–—:]?/.test(rawLine)) {
      flush();
      currentType = 'shloka';
      const cleaned = rawLine.replace(/^श्लोक\s*[-=–—:]?\s*/, '').trim();
      if (cleaned) buffer.push(cleaned);
      continue;
    }

    // Check for Doha marker (दो0-, दो-, दों0-, दो0=, दोहा)
    if (/^(दो0|दो०|दो-|दों0|दोहा)\s*[-=–—:]?/.test(rawLine)) {
      flush();
      currentType = 'doha';
      dohaLinesInCurrentVerse = 1;
      const cleaned = rawLine.replace(/^(दो0|दो०|दो-|दों0|दोहा)\s*[-=–—:]?\s*/, '').trim();
      if (cleaned) buffer.push(cleaned);
      continue;
    }

    // Check for Soratha marker (सो0-, सो-, सोरठा)
    if (/^(सो0|सो०|सो-|सोरठा)\s*[-=–—:]?/.test(rawLine)) {
      flush();
      currentType = 'soratha';
      dohaLinesInCurrentVerse = 1;
      const cleaned = rawLine.replace(/^(सो0|सो०|सो-|सोरठा)\s*[-=–—:]?\s*/, '').trim();
      if (cleaned) buffer.push(cleaned);
      continue;
    }

    // Check for Chhand marker (छं0-, छं-, छं=, छन्द)
    if (/^(छं0|छं०|छं-|छं=|छन्द)\s*[-=–—:]?/.test(rawLine)) {
      flush();
      currentType = 'chhand';
      dohaLinesInCurrentVerse = 0;
      const cleaned = rawLine.replace(/^(छं0|छं०|छं-|छं=|छन्द)\s*[-=–—:]?\s*/, '').trim();
      if (cleaned) buffer.push(cleaned);
      continue;
    }

    // Handle transition from Shloka to Chaupai (e.g., in Sunderkand after Shloka 3)
    if (currentType === 'shloka') {
      // In Sunderkand, after रघुपतिप्रियभक्तं वातजातं नमामि।।3।।, Chaupai begins with जामवंत के बचन सुहाए
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

    // Handle Doha / Soratha multi-line separation and unseparated Chaupai transitions
    if (currentType === 'doha' || currentType === 'soratha') {
      if (dohaLinesInCurrentVerse >= 2) {
        // Previous 2-line Doha/Soratha finished!
        // Check if this new line is a Chaupai (single line with internal । and ending ।।) or another Doha/Soratha
        const strippedEnd = rawLine.replace(/(।।|॥)\s*[\d(कखगघङचछजझ०-९)]*\s*(।।|॥)?$/, '।।');
        const bodyBeforeEnd = strippedEnd.slice(0, -2);
        const hasInternalSingleDanda = bodyBeforeEnd.includes('।') && !bodyBeforeEnd.includes('।।');

        if (hasInternalSingleDanda && strippedEnd.endsWith('।।')) {
          // Transition back to Chaupai!
          flush();
          currentType = 'chaupai';
          dohaLinesInCurrentVerse = 0;
          buffer.push(rawLine);
          continue;
        } else {
          // Consecutive Doha or Soratha — flush previous Doha so each Doha is separated into its own card!
          const sameType: BlockType = currentType;
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

    // If after Samapti in Uttarkand, Aarti lines appear
    if (currentType === 'samapti' && !/^(इति|\(|.*समाप्त)/.test(rawLine)) {
      flush();
      currentType = 'chaupai';
    }

    buffer.push(rawLine);
  }

  flush();

  return `<div class="ramayan-kand-container space-y-6">${blocks.join('\n')}</div>`;
}

function formatHanumanChalisaHtml(rawHtml: string): string {
  const lines = cleanHtmlToLines(rawHtml);
  const blocks: string[] = [];

  blocks.push(`
    <blockquote class="my-4 p-4 border-l-4 border-amber-600 bg-amber-500/10 rounded-xl text-center font-heading">
      <strong class="text-amber-700 dark:text-amber-400">॥ श्री हनुमान चालीसा ॥</strong><br/>
      <span class="text-sm opacity-90">गोस्वामी तुलसीदास रचित चालीस चौपाइयाँ एवं दोहे</span>
    </blockquote>
  `);

  let mode: 'doha' | 'chaupai' = 'doha';
  let currentPair: string[] = [];

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

function formatBajrangBaanHtml(rawHtml: string): string {
  const lines = cleanHtmlToLines(rawHtml);
  const blocks: string[] = [];

  blocks.push(`
    <blockquote class="my-4 p-4 border-l-4 border-amber-600 bg-amber-500/10 rounded-xl text-center font-heading">
      <strong class="text-amber-700 dark:text-amber-400">॥ श्री बजरंग बाण ॥</strong><br/>
      <span class="text-sm opacity-90">जय हनुमन्त सन्त हितकारी। सुनि लीजै प्रभु अरज हमारी॥</span>
    </blockquote>
  `);

  let mode: 'intro' | 'stuti' | 'doha' | 'chaupai' = 'intro';
  let buffer: string[] = [];

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
      // Group chaupai lines into 2-line cards for easy reading
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

function formatAartiHtml(rawHtml: string): string {
  const lines = cleanHtmlToLines(rawHtml);
  const blocks: string[] = [];

  blocks.push(`
    <blockquote class="my-4 p-4 border-l-4 border-amber-600 bg-amber-500/10 rounded-xl text-center font-heading">
      <strong class="text-amber-700 dark:text-amber-400">॥ श्री रामायण जी की आरती ॥</strong><br/>
      आरती श्री रामायण जी की। कीरति कलित ललित सिय पिय की॥
    </blockquote>
  `);

  let stanza: string[] = [];
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
