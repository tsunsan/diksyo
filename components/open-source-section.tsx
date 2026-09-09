import { ArrowUpRight } from "lucide-react";

export function GithubIcon({ className = "w-5 h-5" }: { className?: string }) {
    return (
        <svg
            role="img"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
    );
}

export function KaggleIcon({ className = "w-5 h-5" }: { className?: string }) {
    return (
        <svg
            role="img"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M18.825 23.859c-.022.092-.117.141-.281.141h-3.139c-.187 0-.351-.082-.492-.248l-5.178-6.589-1.448 1.374v5.111c0 .235-.117.352-.351.352H5.352c-.234 0-.352-.117-.352-.352V.352c0-.235.118-.352.352-.352h2.584c.234 0 .351.117.351.352v13.322l6.208-6.061c.164-.164.328-.246.492-.246h3.279c.14 0 .234.047.281.141.047.117.023.211-.07.281l-6.98 6.753 7.331 8.985c.094.094.117.188.07.281z" />
        </svg>
    );
}

export default function OpenSourceSection() {
    return (
        <section className="scroll-section mb-24">
            <div className="mb-8 flex flex-col items-center text-center">
                <div className="mb-3 inline-block border-2 border-black bg-white px-3 py-1 text-xs sm:text-sm font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    Radical Transparency
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tighter sm:text-4xl md:text-5xl">
                    Open Source. Open Data.
                </h2>
                <p className="mt-3 max-w-2xl text-base sm:text-lg font-bold text-gray-700">
                    Diksyo is built for the community. Whether you want to contribute code or train language models on Filipino vocabulary, everything is public.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
                {/* GitHub Card: Code is Open */}
                <div className="relative flex flex-col justify-between overflow-hidden border-4 border-black bg-cyan-300 p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1">
                    {/* Decorative accent shape */}
                    <div className="absolute -right-8 -top-8 h-28 w-28 rotate-12 border-4 border-black bg-purple-400 opacity-30 pointer-events-none" />

                    <div className="relative z-10 mb-8">
                        <div className="mb-4 inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <GithubIcon className="h-3.5 w-3.5" />
                            <span>GitHub Repository</span>
                        </div>

                        <h3 className="mb-3 text-3xl font-black uppercase tracking-tight text-black sm:text-4xl">
                            Code is Open
                        </h3>

                        <p className="text-base sm:text-lg font-bold leading-relaxed text-black/90">
                            Built transparently with Next.js, Drizzle, &amp; FSRS. Star us on GitHub, fork the repo, or submit pull requests.
                        </p>
                    </div>

                    <div className="relative z-10 pt-2">
                        <a
                            href="https://github.com/tsunsan/diksyo"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex w-full items-center justify-center gap-3 border-4 border-black bg-white px-6 py-4 text-base font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-yellow-300 hover:translate-x-1 hover:translate-y-1 hover:shadow-none sm:w-auto"
                        >
                            <GithubIcon className="h-5 w-5" />
                            <span>View on GitHub</span>
                            <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </a>
                    </div>
                </div>

                {/* Kaggle Card: Data is Free */}
                <div className="relative flex flex-col justify-between overflow-hidden border-4 border-black bg-yellow-400 p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1">
                    {/* Decorative accent shape */}
                    <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full border-4 border-black bg-emerald-300 opacity-30 pointer-events-none" />

                    <div className="relative z-10 mb-8">
                        <div className="mb-4 inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <KaggleIcon className="h-3.5 w-3.5" />
                            <span>Kaggle Dataset</span>
                        </div>

                        <h3 className="mb-3 text-3xl font-black uppercase tracking-tight text-black sm:text-4xl">
                            Data is Free
                        </h3>

                        <p className="text-base sm:text-lg font-bold leading-relaxed text-black/90">
                            Access our curated database of 20,000+ Tagalog vocabulary words, roots, affixes, and contextual sentences. Free for NLP research, linguists, and builders.
                        </p>
                    </div>

                    <div className="relative z-10 pt-2">
                        <a
                            href="https://www.kaggle.com/datasets/tsunsan/diksyo-tagalog-vocabulary"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex w-full items-center justify-center gap-3 border-4 border-black bg-white px-6 py-4 text-base font-black uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-sky-300 hover:translate-x-1 hover:translate-y-1 hover:shadow-none sm:w-auto"
                        >
                            <KaggleIcon className="h-5 w-5" />
                            <span>Explore Dataset</span>
                            <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
