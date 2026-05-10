// db/seed.ts
import { db } from "./index"; 
import { roots, words } from "./schema";

async function seed() {
  console.log("Clearing existing data...");
  // Delete child tables first to avoid foreign key constraint errors
  await db.delete(words);
  await db.delete(roots);

  // 1. Insert Roots
  const insertedRoots = await db.insert(roots).values([
    { name: "MAHAL", definition: "precious/expensive/love" },
    { name: "LIWANAG", definition: "light" },
    { name: "LAYA", definition: "freedom" },
    { name: "SAYA", definition: "joy/happiness" },
    { name: "BAYAN", definition: "town/country/community" },
    { name: "BUHAY", definition: "life/alive" },
  ]).returning();

  // Helper function to easily grab root IDs
  const getRootId = (rootName: string) => 
    insertedRoots.find(r => r.name === rootName)?.id;

  // 2. Insert Words mapped to the newly created Root IDs
  await db.insert(words).values([
    {
      word: "Pagmamahal",
      slug: "pagmamahal",
      rootId: getRootId("MAHAL"),
      pronunciation: "/pag-ma-ma-HÁL/",
      partOfSpeech: "PANGNGALAN",
      posEnglish: "NOUN",
      translation: "Deep feeling of love, affection, and care toward a person, thing, or concept.",
      meaningFilipino: "Ang malalim na damdamin ng pagmamahal, pagtanggap, at pagmamalasakit sa isang tao, bagay, o konsepto.",
      originalExplanation: "Not just your average 'I love you'—this is the heavy-duty, unconditional, 'I'd-take-a-bullet-for-you' kind of love.",
      etymology: "Mula sa salitang-ugat na MAHAL (precious/expensive) + pag- (verbal prefix).",
      usageNotes: "Ginagamit upang ilarawan ang malalim na pagmamahal. Mas pormal kaysa sa 'pagmahal'.",
      level: "INTERMEDIATE",
      frequency: "Common",
      tags: ["DAMDAMIN", "RELASYON"],
      related: ["PAG-IBIG", "PAGMAHAL", "MALASAKIT", "PAGKALINGA", "MAHAL"],
      usageExamples: [
        { sentence: "Ang **pagmamahal** ng isang ina sa kanyang anak ay walang hanggan.", translation: "A mother's **love** for her child is eternal." },
        { sentence: "Ipinakita niya ang kanyang **pagmamahal** sa pamamagitan ng mga simpleng kilos.", translation: "He showed his **love** through simple gestures." },
        { sentence: "Ang **pagmamahal** sa bayan ay dapat na linangin mula sa pagkabata.", translation: "**Love** for the nation must be cultivated from childhood." }
      ]
    },
    {
      word: "Mahal",
      slug: "mahal",
      rootId: getRootId("MAHAL"),
      pronunciation: "/MA-hal/",
      partOfSpeech: "PANG-URI",
      posEnglish: "ADJECTIVE",
      translation: "Something or someone of high value or price; precious; treasured.",
      meaningFilipino: "Ang isang bagay o tao na may mataas na halaga o presyo; mahalaga; pinahahalagahan.",
      originalExplanation: "Can mean either 'expensive' or 'love'. So if your partner calls you 'mahal', you're either beloved or high-maintenance.",
      etymology: "Mula sa Sanskrit na 'mahā' (great, large).",
      usageNotes: "Maaaring tumukoy sa presyo (expensive) o damdamin (beloved/precious).",
      level: "BEGINNER",
      frequency: "Very Common",
      tags: ["HALAGA", "DAMDAMIN"],
      related: ["BAGO", "MURA", "HALAGA", "PRESYO", "PAGMAMAHAL"],
      usageExamples: [
        { sentence: "**Mahal** ang presyo ng mansyon sa lungsod.", translation: "The price of a mansion in the city is **expensive**." },
        { sentence: "**Mahal** kita nang higit sa lahat.", translation: "I love you more than anything — you are **precious** to me." }
      ]
    },
    {
      word: "Kaliwanagan",
      slug: "kaliwanagan",
      rootId: getRootId("LIWANAG"),
      pronunciation: "/ka-li-wa-NA-gan/",
      partOfSpeech: "PANGNGALAN",
      posEnglish: "NOUN",
      translation: "The state of having knowledge, understanding, or clarity about something; enlightenment.",
      meaningFilipino: "Ang katayuan ng pagkakaroon ng kaalaman, pag-unawa, o linaw tungkol sa isang bagay.",
      originalExplanation: "When the lightbulb finally goes off in your head and things make sense.",
      etymology: "Mula sa LIWANAG (light) + ka- -an (noun circumfix).",
      usageNotes: "Kadalasang ginagamit sa pilosopikal o relihiyosong konteksto.",
      level: "ADVANCED",
      frequency: "Uncommon",
      tags: ["KARUNUNGAN", "PILOSOPIYA"],
      related: ["LIWANAG", "KAALAMAN", "KARUNUNGAN", "DUNONG"],
      usageExamples: [
        { sentence: "Hanapin natin ang **kaliwanagan** sa kaalaman at karunungan.", translation: "Let us seek **enlightenment** through knowledge and wisdom." }
      ]
    },
    {
      word: "Maliwanag",
      slug: "maliwanag",
      rootId: getRootId("LIWANAG"),
      pronunciation: "/ma-li-WÁ-nag/",
      partOfSpeech: "PANG-URI",
      posEnglish: "ADJECTIVE",
      translation: "Bright, clear, or luminous.",
      meaningFilipino: "Puno ng liwanag; madaling makita o maintindihan.",
      originalExplanation: "Can be used when things are literally blindingly bright, or when someone finally gets your point. Crystal clear, basically.",
      etymology: "Mula sa salitang-ugat na LIWANAG na kinabitan ng unlaping ma-.",
      usageNotes: "Maaaring gamitin para sa literal na liwanag (ilaw/araw) o sa pagiging malinaw ng isang paliwanag o sitwasyon.",
      level: "BEGINNER",
      frequency: "Very Common",
      tags: ["PANG-ARAW-ARAW", "PAGLALARAWAN"],
      related: ["ILAW", "KALIWANAGAN", "SIKAT"],
      usageExamples: [
        { sentence: "**Maliwanag** ang sikat ng buwan kagabi.", translation: "The moonlight was **bright** last night." },
        { sentence: "**Maliwanag** ba ang aking mga panuto?", translation: "Are my instructions **clear**?" }
      ]
    },
    {
      word: "Kalayaan",
      slug: "kalayaan",
      rootId: getRootId("LAYA"),
      pronunciation: "/ka-la-YÁ-an/",
      partOfSpeech: "PANGNGALAN",
      posEnglish: "NOUN",
      translation: "Freedom, independence, or liberty.",
      meaningFilipino: "Ang kalagayan ng pagkakaroon ng karapatang kumilos, magsalita, o mag-isip nang walang hadlang o pumipigil.",
      originalExplanation: "The ultimate flex of independence. Think Braveheart screaming 'Freedom!' but in tropical weather.",
      etymology: "Mula sa salitang-ugat na LAYA na kinabitan ng panlaping ka- at hulaping -an.",
      usageNotes: "Madalas ginagamit tuwing pinag-uusapan ang kasaysayan, pulitika, at mga karapatang pantao.",
      level: "INTERMEDIATE",
      frequency: "Common",
      tags: ["LIPUNAN", "KASAYSAYAN"],
      related: ["MALAYA", "KASARINLAN"],
      usageExamples: [
        { sentence: "Ipinaglaban ng ating mga bayani ang **kalayaan** ng Pilipinas.", translation: "Our heroes fought for the **freedom** of the Philippines." }
      ]
    },
    {
      word: "Bayanihan",
      slug: "bayanihan",
      rootId: getRootId("BAYAN"),
      pronunciation: "/ba-ya-NÍ-han/",
      partOfSpeech: "PANGNGALAN",
      posEnglish: "NOUN",
      translation: "A spirit of communal unity, work, and cooperation.",
      meaningFilipino: "Kaugalian ng mga Pilipino na nagpapakita ng kusang-loob na pagtutulungan at pagkakaisa upang makamit ang isang layunin.",
      originalExplanation: "The OG Filipino crowdfunding and crowdsourcing. Literally lifting a house together because why hire movers when you have neighbors?",
      etymology: "Mula sa salitang-ugat na BAYAN na nangangahulugang komunidad o bansa.",
      usageNotes: "Isang napakalalim na konseptong kultural sa Pilipinas. Tradisyonal itong isinasalarawan ng mga magkakapitbahay na sabay-sabay nagbubuhat ng isang bahay-kubo upang ilipat ito.",
      level: "ADVANCED",
      frequency: "Common",
      tags: ["KULTURA", "LIPUNAN"],
      related: ["TULONG", "KAPWA", "PAGKAKAISA"],
      usageExamples: [
        { sentence: "Buhay na buhay ang diwa ng **bayanihan** nang tumulong ang lahat pagkatapos ng bagyo.", translation: "The spirit of **bayanihan** was very much alive when everyone helped out after the typhoon." }
      ]
    },
    {
      word: "Masaya",
      slug: "masaya",
      rootId: getRootId("SAYA"),
      pronunciation: "/ma-sa-YÁ/",
      partOfSpeech: "PANG-URI",
      posEnglish: "ADJECTIVE",
      translation: "Happy, joyful, or cheerful.",
      meaningFilipino: "Nakararamdam o nagpapakita ng kagalakan at tuwa.",
      originalExplanation: "The baseline Filipino default state. Whether there's a massive feast or a literal flood, someone is bound to be 'masaya'.",
      etymology: "Mula sa salitang-ugat na SAYA na kinabitan ng unlaping ma-.",
      usageNotes: "Isa sa mga pinakakaraniwang salita upang ilarawan ang positibong emosyon o isang nakakatuwang pangyayari.",
      level: "BEGINNER",
      frequency: "Very Common",
      tags: ["DAMDAMIN", "PANG-ARAW-ARAW"],
      related: ["TUWA", "LIGAYA", "GALAK"],
      usageExamples: [
        { sentence: "**Masaya** ang pamilya dahil kumpleto sila tuwing Pasko.", translation: "The family is **happy** because they are complete every Christmas." }
      ]
    },
    {
      word: "Mabuhay",
      slug: "mabuhay",
      rootId: getRootId("BUHAY"),
      pronunciation: "/ma-BÚ-hay/",
      partOfSpeech: "PANDIWA",
      posEnglish: "VERB",
      translation: "To live / Welcome! / Long live!",
      meaningFilipino: "Manatiling buhay; o isang pagbati na nangangahulugang pagpapakita ng suporta o pagtanggap.",
      originalExplanation: "The Swiss Army knife of Filipino greetings. Means 'welcome', 'long live', or 'cheers', depending on how loud you yell it.",
      etymology: "Mula sa salitang-ugat na BUHAY na kinabitan ng unlaping ma-.",
      usageNotes: "Bilang pandiwa, ito ay 'to live'. Bilang interjection, ito ang pambansang pagbati ng Pilipinas upang tanggapin ang mga bisita ('Welcome!') o purihin ang isang tao ('Long live!').",
      level: "BEGINNER",
      frequency: "Very Common",
      tags: ["PAGBATI", "KULTURA"],
      related: ["BUHAY", "TULOY", "MALIGAYANG PAGDATING"],
      usageExamples: [
        { sentence: "**Mabuhay** ang mga bagong kasal!", translation: "**Long live** the newlyweds!" },
        { sentence: "Kailangan nating kumain upang **mabuhay**.", translation: "We need to eat in order **to live**." }
      ]
    }
  ]);

  console.log("Seeding complete!");
}

seed().catch(console.error);