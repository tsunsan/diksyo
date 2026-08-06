"use client";

export default function LandingMarquee() {
    const words = ["MAG-ARAL", "TUKLASIN", "SALITA", "WIKA", "DIKSYONARYO", "KAHULUGAN", "PAG-UNAWA"];

    return (
        <div
            className="w-full overflow-hidden border-y-4 border-black bg-pink-400 py-3 md:py-5 shadow-[0_8px_0px_0px_rgba(0,0,0,1)] relative z-10 -mt-2"
            aria-hidden="true"
        >
            <div
                className="flex gap-8 whitespace-nowrap pl-8"
                style={{
                    animation: "marquee-scroll 40s linear infinite",
                    width: "max-content",
                }}
            >
                {/* Duplicate enough times so it seamlessly loops on ultrawide monitors */}
                {Array.from({ length: 10 }).flatMap(() => words).map((word, i) => (
                    <div key={i} className="flex items-center gap-8">
                        <span className="text-3xl font-black uppercase italic tracking-tighter sm:text-4xl text-black">
                            {word}
                        </span>
                        <span className="text-3xl text-white drop-shadow-[2px_2px_0_black]">✦</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
