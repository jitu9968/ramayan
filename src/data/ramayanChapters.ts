import { WPPostDetail, WPPostMeta } from '../types/ramayan';
import rawPostsData from './ramayanFullRaw.json';
import { formatRamayanHtml } from '../utils/verseFormatter';

const rawPosts: Record<string, string> = rawPostsData as Record<string, string>;

export interface RamayanKandData {
  id: number;
  kandNumber: number;
  titleDevanagari: string;
  titleEnglish: string;
  slug: string;
  date: string;
  summary: string;
  mangalacharan: string;
  contentHtml: string;
  isNew?: boolean;
}

export const CANONICAL_ORDER: string[] = [
  'balkand',
  'ayodhyakand',
  'aranyakand',
  'kishkindhakand',
  'sunderkand',
  'lankakand',
  'uttarkand',
  'aarti',
  'quiz',
  'interestingfacts',
  'usage',
  'goswami',
  'hanumanchalisa',
  'bajrangban'
];

export const RAMAYAN_KANDS: RamayanKandData[] = [
  {
    id: 8,
    kandNumber: 1,
    titleDevanagari: "१. बालकाण्ड (Balkand)",
    titleEnglish: "Balkand - Childhood & Early Divine Glory",
    slug: "balkand",
    date: "2006-07-24T07:06:16",
    summary: "The divine invocation, birth of Lord Rama in Ayodhya, childhood episodes, protection of Sage Vishwamitra's Yajna, and Sita Swayamvar.",
    mangalacharan: "वर्णानामर्थसंघानां रसानां छन्दसामपि। मंगलानां च कर्तारौ वन्दे वाणीविनायकौ॥",
    contentHtml: `
      <div className="ramayan-kand-container space-y-6">
        <blockquote class="my-4 p-4 border-l-4 border-amber-600 bg-amber-500/10 rounded-xl text-center font-heading">
          <strong>मंगलाचरण (Mangalacharan)</strong><br/>
          वर्णानामर्थसंघानां रसानां छन्दसामपि। मंगलानां च कर्तारौ वन्दे वाणीविनायकौ॥<br/>
          <em class="text-xs opacity-80 text-amber-800 dark:text-amber-200">I reverence Saraswati and Ganesha, the creators of letters, meanings, sentiments, metres, and auspicious blessings.</em>
        </blockquote>

        <h3 class="text-xl font-bold font-heading text-amber-700 dark:text-amber-400 mt-6 border-b pb-2">१. गुरु वन्दना एवं राम जन्मोत्सव (Sri Ram Avatar)</h3>

        <div class="verse-block bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 my-4 space-y-3">
          <p class="font-bold text-amber-700 dark:text-amber-400 font-heading">॥ चौपाई ॥</p>
          <p class="font-devanagari text-lg leading-loose">
            बंदऊँ गुरु पद पदुम परागा। सुरुचि सुबास सरस अनुरागा॥<br/>
            अमिअ मूरिमय चूरन चारू। समन सकल भव रुज परिवारू॥ १ ॥
          </p>
          <p class="text-xs theme-muted border-t pt-2 border-amber-500/20">
            <strong>Translation:</strong> I bow to the lotus feet of the Guru, which are full of divine fragrance and love. They act as the nectarous remedy to heal all worldly afflictions.
          </p>
        </div>

        <div class="verse-block bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 my-4 space-y-3">
          <p class="font-bold text-amber-700 dark:text-amber-400 font-heading">॥ दोहा ॥</p>
          <p class="font-devanagari text-lg leading-loose font-bold text-center">
            भए प्रगट कृपाला दीनदयाला कौसल्या हितकारी।<br/>
            हरषित महतारी मुनि मन हारी अद्भुत रूप बिचारी॥
          </p>
          <p class="text-xs theme-muted border-t pt-2 border-amber-500/20">
            <strong>Translation:</strong> The compassionate Lord, benefactor of the humble, manifested Himself for the joy of Mother Kausalya. The mother rejoiced seeing His miraculous divine form.
          </p>
        </div>
      </div>
    `
  },
  {
    id: 11,
    kandNumber: 2,
    titleDevanagari: "२. अयोध्या काण्ड (Ayodhyakand)",
    titleEnglish: "Ayodhyakand - Preparations, Exile & Devotion of Bharat",
    slug: "ayodhyakand",
    date: "2006-07-24T07:15:37",
    summary: "Preparations for Lord Rama's coronation, Kaikeyi's boons, Shri Ram's exile, Kevat's devotion, and Bharat's righteousness.",
    mangalacharan: "यस्याङ्के च विभाति भूधरसुता देवापगा मस्तके। भाले बालविधुर्गले च गरलं यस्योरसि व्यालराट्॥",
    contentHtml: `
      <div className="ramayan-kand-container space-y-6">
        <blockquote class="my-4 p-4 border-l-4 border-amber-600 bg-amber-500/10 rounded-xl text-center font-heading">
          <strong>मंगलाचरण (Ayodhyakand Invocation)</strong><br/>
          श्रीरामचंद्र चरणौ मनसा स्मरामि श्रीरामचंद्र चरणौ वचसा गृणामि।
        </blockquote>

        <h3 class="text-xl font-bold font-heading text-amber-700 dark:text-amber-400 mt-6 border-b pb-2">१. केवट प्रसङ्ग एवं प्रेम भक्ति (Kevat Samvad)</h3>

        <div class="verse-block bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 my-4 space-y-3">
          <p class="font-bold text-amber-700 dark:text-amber-400 font-heading">॥ चौपाई ॥</p>
          <p class="font-devanagari text-lg leading-loose">
            माँगि नाव न केवटु आना। कहइ तुम्हार मरमु मैं जाना॥<br/>
            चरन कमल रज कहुँ सबु कहई। मानुष करनि मूरि कछु अहई॥
          </p>
        </div>
      </div>
    `
  },
  {
    id: 10,
    kandNumber: 3,
    titleDevanagari: "३. अरण्य काण्ड (Aranyakand)",
    titleEnglish: "Aranyakand - Forest Journey & Shabri Bhakti",
    slug: "aranyakand",
    date: "2006-07-24T07:14:36",
    summary: "Forest stay, Panchavati, Golden Deer, Sita Abduction, Shabri's Navadha Bhakti.",
    mangalacharan: "मूलं धर्मतरवे विवेकजलधेश्चन्द्रं द्विजानां हितम्।",
    contentHtml: `
      <div className="ramayan-kand-container space-y-6">
        <blockquote class="my-4 p-4 border-l-4 border-amber-600 bg-amber-500/10 rounded-xl text-center font-heading">
          <strong>शबरी भक्ति उपदेश (Navadha Bhakti)</strong><br/>
          नवधा भगति कहउँ तोहि पाहीं। सावधान सुनु धरु मन माहीं॥
        </blockquote>
      </div>
    `
  },
  {
    id: 7,
    kandNumber: 4,
    titleDevanagari: "४. किष्किन्धा काण्ड (Kishkindhakand)",
    titleEnglish: "Kishkindhakand - Meeting Hanuman Ji & Sugreev",
    slug: "kishkindhakand",
    date: "2006-07-24T07:06:16",
    summary: "Meeting Hanuman Ji at Rishyamook mountain, alliance with Sugreev, search for Sita.",
    mangalacharan: "कुन्दइन्दूदरगौरसुन्दरं अम्बिकापतिमभीष्टसिद्धिदम्।",
    contentHtml: `
      <div className="ramayan-kand-container space-y-6">
        <blockquote class="my-4 p-4 border-l-4 border-amber-600 bg-amber-500/10 rounded-xl text-center font-heading">
          <strong>हनुमान-राम मिलन</strong><br/>
          विप्र रूप धरि कपट न कीन्हा। प्रभु पहिचानि चरन गहि लीन्हा॥
        </blockquote>
      </div>
    `
  },
  {
    id: 12,
    kandNumber: 5,
    titleDevanagari: "५. सुन्दर काण्ड (Sunderkand)",
    titleEnglish: "Sundarkand - Heroic Feats of Lord Hanuman",
    slug: "sunderkand",
    date: "2006-07-24T07:16:23",
    summary: "Hanuman Ji's ocean leap, Ashok Vatika Sita Milan, Golden Lanka Dahan.",
    mangalacharan: "अतुलितबलधामं हेमशैलाभदेहं दनुजवनकृशानुं ज्ञानिनामग्रगण्यम्।",
    contentHtml: `
      <div className="ramayan-kand-container space-y-6">
        <blockquote class="my-4 p-4 border-l-4 border-amber-600 bg-amber-500/10 rounded-xl text-center font-heading">
          <strong>श्रीसुन्दरकाण्ड श्लोक</strong><br/>
          सकलगुणनिधानं वानराणामधीशं रघुपतिप्रियभक्तं वातजातं नमामि॥
        </blockquote>
      </div>
    `
  },
  {
    id: 9,
    kandNumber: 6,
    titleDevanagari: "६. लंका काण्ड (Lankakand)",
    titleEnglish: "Lankakand - Ram Setu & Victory over Ravana",
    slug: "lankakand",
    date: "2006-07-24T07:13:51",
    summary: "Construction of Ram Setu, Laxman Sanjeevani, and destruction of Ravana.",
    mangalacharan: "रामाय रामभद्राय रामचन्द्राय वेधसे।",
    contentHtml: `
      <div className="ramayan-kand-container space-y-6">
        <blockquote class="my-4 p-4 border-l-4 border-amber-600 bg-amber-500/10 rounded-xl text-center font-heading">
          <strong>राम सेतु निर्माण एवं विजय</strong><br/>
          बांधि सेतु अति कौतुक कीन्हा। निसिचर सकल सचकित चहूँ दीन्हा॥
        </blockquote>
      </div>
    `
  },
  {
    id: 15,
    kandNumber: 7,
    titleDevanagari: "७. उत्तर कांड (Uttarkand)",
    titleEnglish: "Uttarkand - Return to Ayodhya & Ramrajya",
    slug: "uttarkand",
    date: "2006-07-24T07:41:23",
    summary: "Return to Ayodhya, grand coronation, description of Ramrajya.",
    mangalacharan: "केकीकण्ठाभनीलं सुरवरविलसद्विप्रपादाब्जचिह्नम्।",
    contentHtml: `
      <div className="ramayan-kand-container space-y-6">
        <blockquote class="my-4 p-4 border-l-4 border-amber-600 bg-amber-500/10 rounded-xl text-center font-heading">
          <strong>रामराज्य वर्णन</strong><br/>
          दैहिक दैविक भौतिक तापा। राम राज नहिं काहुहि ब्यापा॥
        </blockquote>
      </div>
    `
  },
  {
    id: 39,
    kandNumber: 8,
    titleDevanagari: "८. श्री रामायण जी की आरती",
    titleEnglish: "Shri Ramayan Ji Ki Aarti",
    slug: "aarti",
    date: "2017-04-26T14:07:15",
    summary: "Aarti of Shri Ramcharitmanas.",
    mangalacharan: "आरती श्रीरामायणजी की। कीरति कलित ललित सियापी की॥",
    isNew: true,
    contentHtml: `
      <div className="ramayan-kand-container space-y-6">
        <blockquote class="my-4 p-4 border-l-4 border-amber-600 bg-amber-500/10 rounded-xl text-center font-heading">
          <strong>॥ श्री रामायण जी की आरती ॥</strong><br/>
          आरती श्रीरामायणजी की। कीरति कलित ललित सियापी की॥
        </blockquote>
        <div class="verse-block bg-amber-500/5 p-4 rounded-xl border border-amber-500/20 my-4 space-y-3">
          <p class="font-devanagari text-lg leading-loose">
            गावत ब्रह्मादिक मुनि ध्यावत। नारद सारद सहित सिखावत॥<br/>
            सनकादिक सेष सब गावत। गावत बेद पुरान असेसहि॥ १ ॥<br/><br/>
            गावत संतत संभु भवानी। अरु घटसंभव मुनि बिग्यानी॥<br/>
            ब्यास आदिकबि बर्णि बखानी। काकभुसुंडि गरुड़ के ही की॥ २ ॥<br/><br/>
            कलिमल हरनि बिषय रस फीकी। सुभग सिंगार मुक्ति जुवती की॥<br/>
            दलन रोग भव भूरि अमी की। तात मात सब बिधि तुलसी की॥ ३ ॥
          </p>
        </div>
      </div>
    `
  },
  {
    id: 1009,
    kandNumber: 9,
    titleDevanagari: "९. रामायण प्रश्नावली (Quiz)",
    titleEnglish: "Ramayan Prashnavali & Knowledge Quiz",
    slug: "quiz",
    date: "2026-02-01T00:00:00",
    summary: "Interactive Ramayan Prashnavali and knowledge test.",
    mangalacharan: "प्रश्नावली - रामायण के बारे में अपनी जानकारी का परीक्षण करें।",
    isNew: true,
    contentHtml: `
      <div className="ramayan-kand-container space-y-6">
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
    titleDevanagari: "१०. श्री रामचरित मानस – रोचक तथ्य",
    titleEnglish: "Shri Ramcharitmanas - Fascinating Spiritual Facts",
    slug: "interestingfacts",
    date: "2026-02-02T00:00:00",
    summary: "Interesting facts and figures about Ramcharitmanas composition.",
    mangalacharan: "श्रीरामचरितमानस के दिव्य एवं रोचक तथ्य।",
    isNew: true,
    contentHtml: `
      <div className="ramayan-kand-container space-y-6">
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
    titleDevanagari: "११. रामायण के प्रयोग",
    titleEnglish: "Ramayan Ke Prayog - Sacred Chaupais for Daily Life",
    slug: "usage",
    date: "2017-08-10T14:49:31",
    summary: "Proven remedies and sacred Chaupais of Shri Ramcharitmanas for peace, knowledge, protection, and prosperity.",
    mangalacharan: "श्री रामचरित मानस की चौपाइयों का विशेष फलदायी प्रयोग।",
    isNew: true,
    contentHtml: `
      <div className="ramayan-kand-container space-y-6">
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
    titleDevanagari: "१२. गोस्वामी तुलसीदास",
    titleEnglish: "Goswami Tulsidas Ji - Biography & Works",
    slug: "goswami",
    date: "2006-08-06T11:32:12",
    summary: "Biography of Goswami Tulsidas Ji, author of Shri Ramcharitmanas, his sacred composition and life story.",
    mangalacharan: "संवत सोलह सै असी, असी गंग के तीर। श्रावण शुक्ला सप्तमी, तुलसी तज्यो शरीर॥",
    isNew: true,
    contentHtml: `
      <div className="ramayan-kand-container space-y-6">
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
    titleDevanagari: "१३. हनुमान चालीसा",
    titleEnglish: "Hanuman Chalisa",
    slug: "hanumanchalisa",
    date: "2017-05-09T05:22:52",
    summary: "40 verses in praise of Lord Hanuman.",
    mangalacharan: "श्रीगुरु चरन सरोज रज निज मनु मुकुरु सुधारि। बरनौ रघूबर बिमल जसु जो दायकु फल चारि॥",
    isNew: true,
    contentHtml: `
      <div className="ramayan-kand-container space-y-6">
        <blockquote class="my-4 p-4 border-l-4 border-amber-600 bg-amber-500/10 rounded-xl text-center font-heading">
          <strong>॥ श्री हनुमान चालीसा ॥</strong><br/>
          जय हनुमान ज्ञान गुन सागर। जय कपीस तिहुँ लोक उजागर॥
        </blockquote>
      </div>
    `
  },
  {
    id: 109,
    kandNumber: 14,
    titleDevanagari: "१४. बजरंग बाण",
    titleEnglish: "Bajrang Baan",
    slug: "bajrangban",
    date: "2017-05-28T09:11:11",
    summary: "Powerful hymn dedicated to Lord Hanuman for protection.",
    mangalacharan: "जय हनुमान संत हितकारी। सुन लीजै प्रभु अरज हमारी॥",
    isNew: true,
    contentHtml: `
      <div className="ramayan-kand-container space-y-6">
        <blockquote class="my-4 p-4 border-l-4 border-amber-600 bg-amber-500/10 rounded-xl text-center font-heading">
          <strong>॥ श्री बजरंग बाण ॥</strong><br/>
          जय हनुमान संत हितकारी। सुन लीजै प्रभु अरज हमारी॥
        </blockquote>
      </div>
    `
  }
];

// Hydrate all Kandas and chapters with complete formatted verses from the full dataset
RAMAYAN_KANDS.forEach((kand) => {
  const fullRaw = rawPosts[String(kand.id)];
  if (fullRaw) {
    kand.contentHtml = formatRamayanHtml(fullRaw, kand.id);
  }
});

export function getRamayanKandAsWPDetail(kandId: number): WPPostDetail | undefined {
  const kand = RAMAYAN_KANDS.find((k) => k.id === kandId);
  if (!kand) return undefined;
  return {
    id: kand.id,
    title: { rendered: kand.titleDevanagari },
    slug: kand.slug,
    date: kand.date,
    content: { rendered: kand.contentHtml }
  };
}

export function getRamayanKandMetas(): WPPostMeta[] {
  return RAMAYAN_KANDS.map((k) => ({
    id: k.id,
    title: { rendered: k.titleDevanagari },
    slug: k.slug,
    date: k.date,
    isNew: k.isNew
  }));
}
