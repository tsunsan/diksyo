import Link from "next/link";
import { ArrowRight, BookOpen, Flame, Shuffle, Zap, List, Dices } from "lucide-react";
import SearchBar from "@/components/search-bar";
import LandingNav from "@/components/landing-nav";
import LandingMarquee from "@/components/landing-marquee";
import LandingHero from "@/components/landing-hero";
import InteractiveMockup from "@/components/interactive-mockup";
import { getWordOfTheDay, getLandingPageStats } from "@/app/actions/dictionary";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Diksyo | The Modern Tagalog Dictionary & Learning Engine",
    description:
        "Diksyo is your ultimate Tagalog dictionary (diksyonaryo) and personal engine for mastering the Filipino language. Look up any word, explore roots, and learn through active recall and spaced repetition.",
    openGraph: {
        title: "Diksyo — Decode Filipino",
        description:
            "Your ultimate Tagalog dictionary. Type any word to uncover its meaning, roots, and real-life context. Master Filipino with active recall and spaced repetition.",
        type: "website",
        url: "https://diksyo.app",
        siteName: "Diksyo",
    },
    twitter: {
        card: "summary_large_image",
        title: "Diksyo — Decode Filipino",
        description:
            "Your ultimate Tagalog dictionary. Type any word to uncover its meaning, roots, and real-life context.",
    },
    keywords: [
        "Tagalog dictionary",
        "diksyonaryo",
        "Filipino dictionary",
        "learn Tagalog",
        "Tagalog translation",
        "Filipino vocabulary",
        "spaced repetition Tagalog",
        "active recall Filipino",
    ],
};

export const revalidate = 3600; // Revalidate every hour to update the Word of the Day

export default async function LandingPage() {
    const dailyWord = await getWordOfTheDay();
    const stats = await getLandingPageStats();

    // Fallback if DB returns null (empty database edge case)
    const wotd = dailyWord ?? {
        word: "Makisig",
        partOfSpeech: "Pang-uri",
        translation: "Handsome, elegant, or dashing.",
        slug: "makisig",
    };

    // JSON-LD structured data for WebSite + SearchAction (sitelinks search box)
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Diksyo",
        url: "https://diksyo.app",
        description: "The Modern Tagalog Dictionary & Learning Engine",
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: "https://diksyo.app/salita/{search_term_string}",
            },
            "query-input": "required name=search_term_string",
        },
    };

    return (
        <div className="min-h-screen bg-white font-sans text-black selection:bg-cyan-300 selection:text-black">
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Navigation — Client Island (auth state + skeleton CLS fix) */}
            <LandingNav />

            {/* GSAP Animation Wrapper — Client Island */}
            <LandingHero>

                {/* HERO SECTION */}
                <section className="relative z-20 flex min-h-[70vh] w-full flex-col items-center justify-center border-b-4 border-black bg-indigo-400 p-6 py-20 text-center md:p-12 lg:py-32">

                    {/* Background decorations container */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#000 2px, transparent 2px)", backgroundSize: "30px 30px" }}></div>

                        {/* Decorative SVGs — aria-hidden with empty alt for accessibility */}
                        <img
                            src="/images/Whoa.svg"
                            alt=""
                            aria-hidden="true"
                            className="svg-float absolute -bottom-4 -left-12 hidden w-64 drop-shadow-[8px_8px_0_rgba(0,0,0,1)] md:block lg:w-80"
                        />
                        <img
                            src="/images/Entertainment.svg"
                            alt=""
                            aria-hidden="true"
                            className="svg-float absolute -top-4 -right-16 hidden w-56 drop-shadow-[8px_8px_0_rgba(0,0,0,1)] md:block lg:w-72"
                        />

                        <div className="absolute -left-10 top-10 h-32 w-32 rotate-12 border-4 border-black bg-yellow-400 shadow-[8px_8px_0_0_#000] hidden md:block"></div>
                        <div className="absolute -right-12 bottom-20 h-40 w-40 rounded-full border-4 border-black bg-cyan-300 shadow-[8px_8px_0_0_#000] hidden md:block"></div>
                    </div>

                    <div className="relative z-10 flex w-full max-w-4xl flex-col items-center">
                        <h1 className="hero-element mb-6 flex flex-col items-center text-5xl font-black uppercase leading-[1.1] tracking-tighter sm:text-6xl md:mb-8 md:text-8xl">
                            <span className="mb-2 sm:mb-4 inline-block border-4 border-black bg-white px-6 py-2 sm:px-8 sm:py-3 text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                                Decode Filipino.
                            </span>
                        </h1>
                        <h2 className="hero-element mb-10 max-w-3xl text-xl font-bold text-white drop-shadow-[2px_2px_0_black] sm:text-2xl md:mb-12 md:text-3xl">
                            Your ultimate <span className="text-yellow-300">Tagalog dictionary</span> (<em>diksyonaryo</em>). Type any word to uncover its meaning, roots, and real-life context.
                        </h2>

                        <div className="hero-element w-full max-w-2xl">
                            <div className="transform transition-transform hover:scale-[1.02]">
                                <SearchBar />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Marquee — Client Island (CSS animation) */}
                <LandingMarquee />

                <div className="relative w-full overflow-hidden bg-zinc-50">
                    {/* SVG Background Layer */}
                    <div 
                        className="absolute inset-0 pointer-events-none z-0 opacity-[0.07] will-change-transform transform-gpu"
                        style={{
                            backgroundImage: 'url("/images/Chaotic Good.svg"), url("/images/Chillin.svg"), url("/images/Chilly.svg"), url("/images/Consumer.svg"), url("/images/Ecto Plasma.svg"), url("/images/Feliz.svg"), url("/images/Late for Class.svg"), url("/images/Meela Pantalones.svg"), url("/images/New Beginnings.svg"), url("/images/Wont Stop.svg")',
                            backgroundSize: '400px, 350px, 300px, 450px, 350px, 400px, 300px, 450px, 350px, 400px',
                            backgroundPosition: '0px 0px, 400px 200px, 800px 50px, 150px 500px, 600px 650px, 950px 450px, 250px 900px, 700px 1050px, 1100px 800px, -100px 300px',
                            backgroundRepeat: 'repeat'
                        }}
                    />

                    <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-16 md:px-6 md:py-24">

                    {/* =========================================
                        SOCIAL PROOF STATS BANNER
                        ========================================= */}
                    <section className="scroll-section mb-24 grid grid-cols-1 gap-0 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:grid-cols-3 md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex flex-col items-center justify-center border-b-4 border-black bg-sky-400 px-6 py-8 sm:border-b-0 sm:border-r-4">
                            <span className="text-4xl font-black tracking-tighter md:text-5xl">{stats.wordCount.toLocaleString()}+</span>
                            <span className="mt-1 text-sm font-bold uppercase tracking-widest">Words</span>
                        </div>
                        <div className="flex flex-col items-center justify-center border-b-4 border-black bg-violet-400 px-6 py-8 sm:border-b-0 sm:border-r-4">
                            <span className="text-4xl font-black tracking-tighter md:text-5xl">{stats.rootCount.toLocaleString()}+</span>
                            <span className="mt-1 text-sm font-bold uppercase tracking-widest">Root Families</span>
                        </div>
                        <div className="flex flex-col items-center justify-center bg-emerald-400 px-6 py-8">
                            <span className="text-4xl font-black tracking-tighter md:text-5xl">100%</span>
                            <span className="mt-1 text-sm font-bold uppercase tracking-widest">Free Forever</span>
                        </div>
                    </section>

                    {/* =========================================
                        "LOOKING FOR" SECTION
                        ========================================= */}
                    <section className="scroll-section mb-24 flex flex-col gap-8 md:gap-12">

                        {/* Block 1: For Everyone (Dictionary Focus) */}
                        <div className="flex flex-col-reverse items-stretch gap-0 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:flex-row md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                            <div className="flex w-full flex-col items-start justify-center bg-sky-400 p-6 md:w-1/2 md:p-12">
                                <div className="mb-4 inline-block border-2 border-black bg-white px-3 py-1 text-sm font-bold uppercase tracking-widest">
                                    For Everyone
                                </div>
                                <h2 className="mb-4 text-3xl font-black uppercase tracking-tighter sm:text-4xl md:text-5xl">
                                    A Tagalog dictionary for learning
                                </h2>
                                <p className="mb-8 text-lg font-bold sm:text-xl">
                                    Whether you&apos;re looking up a specific word or just browsing, you&apos;ll find a universe of friendly explanations and fun activities designed to educate and entertain.
                                </p>
                                <Link
                                    href="/salita"
                                    className="group flex items-center gap-2 border-4 border-black bg-white px-6 py-3 font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                                >
                                    Learn more <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </div>

                            {/* Interactive Dictionary Mockup Showcase */}
                            <div className="relative flex min-h-[350px] w-full items-center justify-center overflow-hidden border-b-4 border-black bg-amber-400 p-4 sm:p-8 md:w-1/2 md:border-b-0 md:border-l-4">
                                <InteractiveMockup
                                    ariaLabel="Example of a Diksyo dictionary entry showing the word Aral and its derived word Mag-aral"
                                    className="w-full max-w-sm rotate-3 transform cursor-pointer border-4 border-black bg-white p-4 sm:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform duration-300 hover:rotate-0 active:rotate-0 focus:rotate-0"
                                >
                                    {/* Root Section */}
                                    <div className="mb-4 sm:mb-6">
                                        <span className="inline-block border-2 border-black bg-cyan-300 px-2 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                            Root / Ugat
                                        </span>
                                        <h3 className="mt-4 text-3xl sm:text-4xl font-black uppercase tracking-tight">Aral</h3>
                                        <p className="mt-2 border-l-4 border-black pl-3 text-sm font-bold italic text-gray-700">
                                            To study or to learn.
                                        </p>
                                    </div>

                                    {/* Derived Words List */}
                                    <div className="space-y-4 border-t-4 border-black pt-4 sm:pt-6">
                                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                                            Derived Word
                                        </h4>

                                        <div className="group border-4 border-black bg-gray-50 p-3 sm:p-4 transition-colors hover:bg-yellow-100">
                                            <div className="mb-2 flex items-start justify-between">
                                                <p className="text-lg sm:text-xl font-black uppercase italic leading-none group-hover:underline">
                                                    Mag-aral
                                                </p>
                                                <div className="h-4 w-4 shrink-0 border-2 border-black bg-green-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" title="Mastery Level" />
                                            </div>

                                            {/* Kahulugan (Tagalog Meaning) */}
                                            <div className="mb-2 mt-3">
                                                <p className="text-[10px] font-black uppercase text-gray-500">Kahulugan:</p>
                                                <p className="text-sm sm:text-md font-bold leading-tight text-black">
                                                    Ang proseso ng pagkatuto o pagtuklas ng kaalaman.
                                                </p>
                                            </div>

                                            {/* English Translation */}
                                            <div className="border-t-2 border-dashed border-gray-400 pt-2">
                                                <p className="text-[10px] font-black uppercase text-gray-500">Translation:</p>
                                                <p className="text-sm italic text-gray-700">
                                                    To study
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </InteractiveMockup>
                            </div>
                        </div>

                        {/* Block 2: For Learners (Gamified Engine Focus) */}
                        <div className="flex flex-col items-stretch gap-0 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:flex-row md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">

                            {/* Interactive Quiz Flashcard Mockup */}
                            <div className="relative flex min-h-[350px] w-full items-center justify-center overflow-hidden border-b-4 border-black bg-violet-400 p-4 sm:p-8 md:w-1/2 md:border-b-0 md:border-r-4">

                                {/* Decorative background cards */}
                                <div className="absolute h-64 w-72 sm:h-72 sm:w-80 rotate-6 border-4 border-black bg-sky-400 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"></div>
                                <div className="absolute h-64 w-72 sm:h-72 sm:w-80 -rotate-3 border-4 border-black bg-amber-400 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"></div>

                                <InteractiveMockup
                                    ariaLabel="Example of the Active Recall quiz interface showing a typing prompt"
                                    className="group relative z-10 flex w-full max-w-sm cursor-pointer flex-col border-4 border-black bg-white p-4 sm:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-2 active:-translate-y-2 focus:-translate-y-2"
                                >

                                    <div className="mb-4 flex items-center justify-between border-b-4 border-black pb-4">
                                        <span className="border-2 border-black bg-rose-400 px-2 py-1 text-[10px] sm:text-xs font-black uppercase tracking-wide text-white">Active Recall</span>
                                        <div className="flex items-center gap-1">
                                            <Flame className="h-4 w-4 sm:h-5 sm:w-5 fill-red-500 text-red-500" />
                                            <span className="text-sm sm:text-base font-bold">12 Day Streak</span>
                                        </div>
                                    </div>

                                    <p className="mb-2 text-center text-xs sm:text-sm font-black uppercase tracking-widest text-gray-500">Translate to Filipino:</p>
                                    <p className="mb-6 sm:mb-8 text-center text-2xl sm:text-3xl font-black italic">&quot;To study&quot;</p>

                                    {/* Typing Input Area Mockup */}
                                    <div className="flex w-full items-center border-4 border-black bg-gray-50 p-3 sm:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <span className="font-mono text-xl sm:text-2xl font-black uppercase">Mag-ar</span>
                                        <span className="ml-1 inline-block h-6 w-2 sm:h-7 sm:w-3 animate-pulse bg-black"></span>
                                    </div>

                                    {/* Keyboard Hint */}
                                    <div className="mt-4 sm:mt-6 flex justify-center">
                                        <span className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase text-gray-400">
                                            Press <kbd className="border-2 border-gray-300 bg-gray-100 px-2 py-1 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">ENTER</kbd> to submit
                                        </span>
                                    </div>
                                </InteractiveMockup>
                            </div>

                            <div className="flex w-full flex-col items-start justify-center bg-white p-6 md:w-1/2 md:p-12">
                                <div className="mb-4 inline-block border-2 border-black bg-emerald-400 px-3 py-1 text-sm font-bold uppercase tracking-widest text-black">
                                    For Learners
                                </div>
                                <h2 className="mb-4 text-3xl font-black uppercase tracking-tighter sm:text-4xl md:text-5xl">
                                    A scientific and fun way to improve vocabulary
                                </h2>
                                <p className="mb-8 text-lg font-bold sm:text-xl">
                                    Play games and compete in activities on your own. With our advanced Spaced Repetition (FSRS) teaching algorithm and study tools, get ready for your vocabulary to expand!
                                </p>
                                <Link
                                    href="/signup"
                                    className="group flex items-center gap-2 border-4 border-black bg-green-400 px-6 py-3 font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                                >
                                    Get Started Free <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* Word of the Day & Random Word Controls */}
                    <section className="scroll-section mb-24 grid gap-8 lg:grid-cols-2">

                        {/* Dynamic Word of the Day Banner */}
                        <div className="group relative flex flex-col overflow-hidden border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                            {/* Decorative background shape (Gradient style) */}
                            <div className="absolute -right-8 -top-8 w-48 h-48 bg-[#7C3AED] rounded-full opacity-30 blur-2xl group-hover:bg-[#FF6D00] transition-colors duration-700 pointer-events-none"></div>
                            <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-[#FDE047] rounded-full opacity-40 blur-xl group-hover:bg-[#0057FF] transition-colors duration-700 pointer-events-none"></div>

                            {/* Content Area */}
                            <div className="relative z-10 flex flex-1 flex-col p-6 sm:p-8">
                                {/* Header Area */}
                                <div className="mb-6 flex items-center gap-2">
                                    <Flame className="h-6 w-6 shrink-0 fill-red-500 text-red-500" />
                                    <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-black">Word of the Day</h2>
                                </div>

                                <div className="mb-6 flex flex-wrap items-baseline gap-3 sm:gap-4">
                                    <span className="text-4xl font-black text-black sm:text-5xl lg:text-6xl">{wotd.word}</span>
                                    {wotd.partOfSpeech && (
                                        <span className="inline-block border-2 border-black bg-purple-400 px-3 py-1 text-[10px] sm:text-xs font-black uppercase tracking-widest text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                            {wotd.partOfSpeech}
                                        </span>
                                    )}
                                </div>

                                <div className="mb-8 border-l-4 border-black pl-4">
                                    <p className="mb-1 text-xs sm:text-sm font-black uppercase text-gray-500">Meaning</p>
                                    <p className="text-lg sm:text-xl font-bold text-gray-800">
                                        {wotd.translation}
                                    </p>
                                </div>

                                <div className="mt-auto">
                                    <Link
                                        href={`/salita/${wotd.slug}`}
                                        className="group/btn flex w-fit items-center gap-3 border-4 border-black bg-yellow-400 px-6 py-4 text-lg font-black uppercase text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[6px] hover:translate-y-[6px] hover:shadow-none"
                                    >
                                        View Context <ArrowRight className="h-6 w-6 transition-transform group-hover/btn:translate-x-2" />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Random Word Card */}
                        <div className="relative flex flex-col overflow-hidden border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                            {/* Header Area */}
                            <div className="flex items-center gap-2 border-b-4 border-black bg-pink-400 px-6 py-4 sm:px-8">
                                <Dices className="h-6 w-6 shrink-0 fill-blue-500 text-blue-500" />
                                <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-black">Random Discovery</h2>
                            </div>

                            {/* Content Area */}
                            <div className="relative z-10 flex flex-1 flex-col justify-center p-6 sm:p-8">
                                <h3 className="mb-4 text-3xl font-black uppercase tracking-tight text-black sm:text-4xl md:text-5xl">
                                    Lost for words?
                                </h3>
                                <p className="mb-8 max-w-sm text-base sm:text-lg font-bold text-gray-700">
                                    Jump directly into the dictionary and let Diksyo handpick a random word for your quest.
                                </p>

                                <div className="mt-auto">
                                    <Link
                                        href="/salita/random"
                                        className="group flex w-fit items-center gap-3 border-4 border-black bg-green-400 px-6 py-4 text-lg font-black uppercase text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[6px] hover:translate-y-[6px] hover:shadow-none"
                                    >
                                        <Shuffle className="h-6 w-6 transition-transform group-hover:rotate-180" /> Roll the Dice
                                    </Link>
                                </div>
                            </div>

                            {/* Geometric Decorations */}
                            <div className="absolute -right-10 -top-10 h-32 w-32 rotate-12 border-4 border-black bg-yellow-400 opacity-30 pointer-events-none"></div>
                            <div className="absolute -bottom-8 -right-8 h-24 w-24 rounded-full border-4 border-black bg-cyan-300 opacity-40 pointer-events-none"></div>
                        </div>

                    </section>

                    {/* THE CORE ENGINE FEATURES */}
                    <section className="scroll-section mb-24 relative">
                        <h2 className="mb-8 text-center text-4xl sm:text-5xl font-black uppercase tracking-tighter">Why Diksyo?</h2>
                        <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
                            {/* Feature 1 */}
                            <div className="relative border-4 border-black bg-white p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-2 sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                <div className="mb-4 sm:mb-6 inline-block border-4 border-black bg-green-400 p-3 sm:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-black" />
                                </div>
                                <h3 className="mb-2 sm:mb-4 text-xl sm:text-2xl font-black uppercase">Active Recall Quiz</h3>
                                <p className="text-base sm:text-lg font-medium">
                                    Don&apos;t just recognize words, produce them. Type the Filipino translation directly and get instant feedback.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="relative border-4 border-black bg-white p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-2 sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                <div className="mb-4 sm:mb-6 inline-block border-4 border-black bg-yellow-400 p-3 sm:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-black" />
                                </div>
                                <h3 className="mb-2 sm:mb-4 text-xl sm:text-2xl font-black uppercase">Smart FSRS Logic</h3>
                                <p className="text-base sm:text-lg font-medium">
                                    An advanced algorithm calculates your optimal review date based on difficulty. See difficult words more often.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="relative border-4 border-black bg-white p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-2 sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                                <div className="mb-4 sm:mb-6 inline-block border-4 border-black bg-purple-400 p-3 sm:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    <List className="h-6 w-6 sm:h-8 sm:w-8 text-black" />
                                </div>
                                <h3 className="mb-2 sm:mb-4 text-xl sm:text-2xl font-black uppercase">Personal Vaults</h3>
                                <p className="text-base sm:text-lg font-medium">
                                    Build your own skill tree. Curate personalized vocabulary lists for your job, school, or daily life.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* =========================================
                        BOTTOM CTA — Captures users who scrolled all the way
                        ========================================= */}
                    <section className="scroll-section mb-24">
                        <div className="flex flex-col items-center gap-6 border-4 border-black bg-green-400 p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] sm:p-12 md:p-16 md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                            <h2 className="text-3xl font-black uppercase tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                                Ready to Master Filipino?
                            </h2>
                            <p className="max-w-2xl text-lg font-bold sm:text-xl">
                                Join Diksyo for free and start building your vocabulary today. Active recall quizzes, spaced repetition, and a beautifully curated dictionary — all in one place.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link
                                    href="/signup"
                                    className="group flex items-center gap-2 border-4 border-black bg-white px-6 py-4 text-lg font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[6px] hover:translate-y-[6px] hover:shadow-none"
                                >
                                    Get Started Free <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
                                </Link>
                                <Link
                                    href="/salita"
                                    className="group flex items-center gap-2 border-4 border-black bg-yellow-400 px-6 py-4 text-lg font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[6px] hover:translate-y-[6px] hover:shadow-none"
                                >
                                    <BookOpen className="h-6 w-6" /> Explore Dictionary
                                </Link>
                            </div>
                        </div>
                    </section>
                    </div>
                </div>
            </LandingHero>

            {/* Footer */}
            <footer className="border-t-4 border-black bg-black px-4 py-8 text-white sm:px-6 sm:py-12">
                <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-center md:justify-between md:gap-6">
                    <div className="flex flex-col items-center gap-2 md:items-start">
                        <div className="text-3xl sm:text-4xl font-black uppercase tracking-tighter">
                            DIKSYO
                        </div>
                        <div className="text-sm font-bold text-gray-400">
                            © 2026 DIKSYO. All rights reserved.
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4 text-sm font-bold uppercase tracking-widest text-gray-300 md:justify-end">
                        <Link href="/privacy" className="hover:text-yellow-400 hover:underline">
                            Privacy Policy
                        </Link>
                        <span className="hidden md:inline">•</span>
                        <Link href="/terms" className="hover:text-yellow-400 hover:underline">
                            Terms & Conditions
                        </Link>
                        <span className="hidden md:inline">•</span>
                        <Link href="/contact-us" className="hover:text-yellow-400 hover:underline">
                            Contact Us
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}