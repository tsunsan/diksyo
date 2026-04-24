import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
    return (
        <div className="grid min-h-svh lg:grid-cols-2 font-mono bg-zinc-50">
            <div className="flex flex-col gap-4 p-6 md:p-10 border-r-4 border-black">
                <div className="flex justify-center gap-2 md:justify-start">
                    <a href="#" className="flex items-center gap-3 font-bold uppercase tracking-tighter text-xl">
                            <img
                                src="/icon.svg"
                                alt="Diksyo Logo"
                                className="size-8 object-contain"
                            />
                        Diksyo
                    </a>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <LoginForm/>
                    </div>
                </div>
            </div>


            <div className="relative hidden bg-purple-600 lg:block overflow-hidden border-l-4 border-black">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #000 2px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                <div className="absolute top-0 w-full border-b-4 border-black bg-yellow-400 py-2 overflow-hidden whitespace-nowrap">
                    <div className="inline-block animate-marquee font-black uppercase text-sm">
                     - Login to the Diksyo Mainframe // SRS v2.0 [cite: 43] &#x2022; Transhuman Evolution in Progress [cite: 50] &#x2022; Access Level: Lakan # Limited
                    </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center p-12">

                    {/* The "Astro Card" */}
                    <div className="relative border-4 border-black bg-white p-8 shadow-[16px_16px_0_0_#000]">
                        <img
                            src="/images/Astro.svg"
                            alt="Transhuman Evolution"
                            className="h-auto w-full max-w-lg object-contain transition-transform hover:rotate-2 duration-300"
                        />

                        {/* 3. Refined Progression Badge */}
                        <div className="absolute -bottom-8 -left-8 bg-black text-white border-4 border-white px-6 py-3 font-black shadow-[8px_8px_0_0_#000] -rotate-3 uppercase italic text-lg">
                            Level: Lakan [cite: 50]
                        </div>

                        {/* 4. Feature Callout */}
                        <div className="absolute -top-10 -right-10 bg-zinc-900 border-4 border-yellow-400 px-4 py-2 font-bold text-yellow-400 shadow-[6px_6px_0_0_#000] rotate-3 text-xs">
                            GENERATE CONTEXT // SRS v2.0 [cite: 43]
                        </div>
                    </div>
                </div>

                {/* Gritty Texture Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-40 pointer-events-none"></div>
            </div>
        </div>
    )
}