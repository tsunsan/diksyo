import { db } from "@/db"; // Adjust this import based on your setup
import { roots, words } from "@/db/schema";

const seedData = [
    {
        root: { name: "Kilig", definition: "A romantic thrill or shudder." },
        word: {
            word: "Kilig",
            slug: "kilig",
            partOfSpeech: "Noun / Verb",
            translation: "Romantic thrill",
            meaningFilipino: "Pakiramdam ng tuwa o pananabik dahil sa isang romantikong karanasan.",
            originalExplanation: "It's that sudden, uncontrollable urge to bite your pillow and kick your feet in the air because your crush just liked your story. It's the Filipino equivalent of butterflies in your stomach, but on heavy caffeine.",
            usageExamples: [
                { s: "Kinilig ako nang hawakan niya ang kamay ko.", t: "I felt a romantic thrill when he held my hand." },
                { s: "Grabe ang kilig ko sa eksena nila sa pelikula!", t: "I swooned so hard at their movie scene!" }
            ]
        }
    },
    {
        root: { name: "Tampo", definition: "Mild resentment or sulking." },
        word: {
            word: "Tampo",
            slug: "tampo",
            partOfSpeech: "Noun / Verb",
            translation: "Sulking",
            meaningFilipino: "Pagtatampo o pagpapakita ng hinanakit sa isang tao.",
            originalExplanation: "You're not explicitly angry, but you definitely want them to know you're upset. It’s the art of giving the silent treatment while secretly hoping they coax you out of it with food or an apology.",
            usageExamples: [
                { s: "Nagtatampo si Maria kasi nakalimutan ko ang birthday niya.", t: "Maria is sulking because I forgot her birthday." },
                { s: "Huwag ka na magtampo, bibilhan na kita ng milk tea.", t: "Stop sulking, I'll buy you milk tea." }
            ]
        }
    },
    {
        root: { name: "Chika", definition: "Gossip or casual conversation." },
        word: {
            word: "Chika",
            slug: "chika",
            partOfSpeech: "Noun",
            translation: "Gossip / Story",
            meaningFilipino: "Kwento, balita, o tsismis.",
            originalExplanation: "The lifeblood of Filipino social gatherings. It can range from innocent life updates to highly classified, CIA-level neighborhood gossip. If someone says 'May chika ako,' you drop everything and listen.",
            usageExamples: [
                { s: "Ano ang latest na chika?", t: "What's the latest gossip?" },
                { s: "Nag-chika lang kami sandali sa kanto.", t: "We just had a quick chat at the corner." }
            ]
        }
    },
    {
        root: { name: "Gigil", definition: "Overwhelming urge to squeeze." },
        word: {
            word: "Gigil",
            slug: "gigil",
            partOfSpeech: "Noun",
            translation: "Urge to pinch/squeeze",
            meaningFilipino: "Nanggigigil dahil sa sobrang kyut o sobrang inis.",
            originalExplanation: "It’s aggressive affection. When a baby is so devastatingly cute that your brain short-circuits and you just want to squish their cheeks until they pop. Can also apply to extreme, teeth-grinding annoyance.",
            usageExamples: [
                { s: "Nanggigigil ako sa aso mo, ang taba!", t: "I have the urge to squeeze your dog, it's so fat!" },
                { s: "Gigil na gigil ako sa boss ko kanina.", t: "I was gritting my teeth in annoyance at my boss earlier." }
            ]
        }
    },
    {
        root: { name: "Diskarte", definition: "Strategy or street smarts." },
        word: {
            word: "Diskarte",
            slug: "diskarte",
            partOfSpeech: "Noun",
            translation: "Strategy / Hustle",
            meaningFilipino: "Paraan o pamamaraan para makamit ang isang bagay.",
            originalExplanation: "The ultimate Filipino survival skill. It’s not about being book smart; it’s about knowing how to hustle, smooth-talk, and navigate life’s obstacles with zero budget and pure resourcefulness.",
            usageExamples: [
                { s: "Kailangan mo ng diskarte para makapasa sa exam na 'yan.", t: "You need a strategy to pass that exam." },
                { s: "Ang galing ng diskarte niya sa negosyo.", t: "His business hustle is excellent." }
            ]
        }
    },
    {
        root: { name: "Pikon", definition: "Easily angered or sore loser." },
        word: {
            word: "Pikon",
            slug: "pikon",
            partOfSpeech: "Adjective",
            translation: "Easily angered",
            meaningFilipino: "Madaling magalit pag binibiro o natatalo.",
            originalExplanation: "That one friend who can dish out insults all day but throws a tantrum the moment someone makes a joke about them. In Filipino culture, there is one universal rule: 'Ang pikon, talo' (The sore loser loses).",
            usageExamples: [
                { s: "Huwag mo na siyang asarin, pikon 'yan.", t: "Don't tease him, he gets angry easily." },
                { s: "Natalo lang sa game, napikon agad.", t: "He just lost the game and immediately got salty." }
            ]
        }
    },
    {
        root: { name: "Torpe", definition: "Shy in courtship." },
        word: {
            word: "Torpe",
            slug: "torpe",
            partOfSpeech: "Adjective",
            translation: "Cowardly in love",
            meaningFilipino: "Lalaking nahihiyang manligaw o magtapat ng nararamdaman.",
            originalExplanation: "A guy who would rather fight a dragon than confess his feelings to his crush. He will like her Instagram posts from 2018 but will physically evaporate if she makes eye contact with him.",
            usageExamples: [
                { s: "Ang torpe mo, kaya ka nauunahan eh.", t: "You're so cowardly in love, that's why others beat you to it." },
                { s: "Torpe siya kaya dinaan na lang sa kanta.", t: "He was too shy, so he just expressed it through a song." }
            ]
        }
    },
    // --- BAYANIHAN & BAYAN ---
    {
        root: { name: "Bayan", definition: "Town or country." },
        word: {
            word: "Bayanihan",
            slug: "bayanihan",
            partOfSpeech: "Noun",
            translation: "Communal unity",
            meaningFilipino: "Pagtutulungan ng magkakapitbahay o komunidad.",
            originalExplanation: "The ultimate team effort. Historically, it meant carrying a literal house on your shoulders with your neighbors. Today, it’s chipping in for a coworker's medical bill or helping push a stalled jeepney in the rain.",
            usageExamples: [
                { s: "Buhay na buhay ang bayanihan sa aming barangay.", t: "Communal unity is very much alive in our neighborhood." }
            ]
        }
    },
    {
        root: { name: "Bayan", definition: "Town or country." },
        word: {
            word: "Bayan",
            slug: "bayan",
            partOfSpeech: "Noun",
            translation: "Town / Country",
            meaningFilipino: "Isang pook na may mga naninirahan; bansa o nasyon.",
            originalExplanation: "It can mean your local town or the entire nation. It's the root of patriotism ('Makabayan') and community action ('Bayanihan').",
            usageExamples: [
                { s: "Para sa bayan!", t: "For the country!" }
            ]
        }
    },
    // --- JAPORMS & PORMA ---
    {
        root: { name: "Porma", definition: "Form or style." },
        word: {
            word: "Japorms",
            slug: "japorms",
            partOfSpeech: "Adjective",
            translation: "Dressed up",
            meaningFilipino: "Naka-ayos ng mabuti, madalas astig ang bihis.",
            originalExplanation: "When you step out of the house smelling like a whole bottle of cologne and wearing your freshest kicks. You aren't just dressed; you are assembled for maximum visual impact.",
            usageExamples: [
                { s: "Saan ang lakad natin at ang japorms mo ngayon?", t: "Where are we going that you're so dressed up today?" }
            ]
        }
    },
    {
        root: { name: "Porma", definition: "Form or style." },
        word: {
            word: "Porma",
            slug: "porma",
            partOfSpeech: "Noun",
            translation: "Form / Style",
            meaningFilipino: "Ang panlabas na anyo o istilo ng pananamit.",
            originalExplanation: "It translates directly to 'form', but colloquially refers to someone's fashion sense, swagger, or the way they present themselves.",
            usageExamples: [
                { s: "Ang ganda ng porma mo ngayon ah.", t: "Your style looks great today." }
            ]
        }
    },
    // --- MAARTE & ARTE ---
    {
        root: { name: "Arte", definition: "Art or acting." },
        word: {
            word: "Maarte",
            slug: "maarte",
            partOfSpeech: "Adjective",
            translation: "High maintenance",
            meaningFilipino: "Taong mapili, mabusisi, o nag-iinarte.",
            originalExplanation: "Someone who requires a 12-step skincare routine before camping, or refuses to eat street food because of the 'ambiance.' It means high maintenance, often accompanied by a dramatic flair.",
            usageExamples: [
                { s: "Huwag ka na maging maarte, suotin mo na 'yan.", t: "Stop being so fussy, just wear it." }
            ]
        }
    },
    {
        root: { name: "Arte", definition: "Art or acting." },
        word: {
            word: "Arte",
            slug: "arte",
            partOfSpeech: "Noun",
            translation: "Art / Drama",
            meaningFilipino: "Sining, o ang pagpapakita ng labis na damdamin.",
            originalExplanation: "The root of all drama. It can literally mean 'art', but in everyday use, it's the base element of someone being extra, dramatic, or fussy.",
            usageExamples: [
                { s: "Puro ka arte, bilisan mo na!", t: "You're all drama, hurry up!" }
            ]
        }
    }
];

export async function seed() {
    console.log("Seeding started...");

    for (const item of seedData) {
        // 1. Insert or find the root word
        const [insertedRoot] = await db.insert(roots)
            .values({
                name: item.root.name,
                definition: item.root.definition,
            })
            .onConflictDoUpdate({
                target: roots.name,
                set: { definition: item.root.definition },
            })
            .returning();

        // 2. Insert the word with the root relation
        await db.insert(words)
            .values({
                rootId: insertedRoot.id,
                word: item.word.word,
                slug: item.word.slug,
                partOfSpeech: item.word.partOfSpeech, // Added Part of Speech here!
                translation: item.word.translation,
                meaningFilipino: item.word.meaningFilipino,
                originalExplanation: item.word.originalExplanation,
                usageExamples: item.word.usageExamples,
            })
            .onConflictDoNothing(); // Skip if slug already exists
    }

    console.log("Seeding complete! Ready for the dictionary quest.");
}

// Execute the seed function
seed().catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
});