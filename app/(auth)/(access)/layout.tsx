import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Zap, Target, Flame, BookOpen, Sparkles } from "lucide-react"

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
    // 1. Instantiate the Supabase server client
    const supabase = await createClient()

    // 2. Check if a valid session currently exists
    const { data: { user } } = await supabase.auth.getUser()

    // 3. If they are already logged in, instantly bounce them to the dictionary
    if (user) {
        redirect('/dictionary')
    }

    return (
        <div className="grid min-h-svh lg:grid-cols-2 font-mono bg-zinc-50">
            {/* Left Side: Dynamic Content (Forms) */}
            <div className="flex flex-col gap-4 p-6 md:p-10 border-r-4 border-black">
                <div className="flex justify-center gap-2 md:justify-start">
                    <a href="/" className="flex items-center gap-3 font-bold uppercase tracking-tighter text-xl">
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
                        {children}
                    </div>
                </div>
            </div>

            {/* Right Side: Shared Neo-Brutalist Showcase */}
            <div className="relative hidden bg-indigo-400 lg:flex flex-col items-center justify-center overflow-hidden border-l-4 border-black">
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #000 3px, transparent 0)',
                        backgroundSize: '32px 32px'
                    }}
                ></div>

                <div className="absolute inset-0 flex items-center justify-center p-12">
                    <div className="relative z-10 w-full max-w-md border-4 border-black bg-white p-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 duration-300">
                        <div className="border-4 border-black bg-cyan-200 mb-6 p-6 relative overflow-hidden">
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000001a_1px,transparent_1px),linear-gradient(to_bottom,#0000001a_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white rounded-full border-4 border-black opacity-40 pointer-events-none"></div>
                            <img
                                src="/images/Experiments.svg"
                                alt="Language Synthesis"
                                className="relative z-10 h-48 w-full object-contain drop-shadow-[6px_6px_0_rgba(0,0,0,1)] transition-transform hover:scale-105 duration-300"
                            />
                        </div>

                        <div className="mb-4">
                            <h2 className="text-3xl font-black uppercase tracking-tight text-black leading-[1.1]">
                                Formulate <br/> <span className="bg-black text-white px-2 py-0.5 mt-1 inline-block">Fluency.</span>
                            </h2>
                            <p className="mt-4 text-sm font-bold text-gray-600 uppercase tracking-widest border-l-4 border-pink-400 pl-3">
                                FSRS Engine Ready
                            </p>
                        </div>

                        {/* Stickers */}
                        <div className="absolute -top-5 -left-8 border-4 border-black bg-white px-4 py-2 font-black text-black shadow-[4px_4px_0_0_#000] -rotate-3 uppercase flex items-center gap-2">
                            <Target className="h-5 w-5 text-purple-500" /> Rank: Alamat
                        </div>
                        <div className="absolute -bottom-5 -right-6 border-4 border-black bg-white px-5 py-2 font-black text-black shadow-[4px_4px_0_0_#000] rotate-2 uppercase flex items-center gap-2">
                            <Flame className="h-5 w-5 text-red-500 fill-red-500" /> 12 Day Streak
                        </div>
                        <div className="absolute top-12 -right-7 border-4 border-black bg-yellow-400 p-2 shadow-[4px_4px_0_0_#000] rotate-6"><Zap className="h-6 w-6 text-black fill-black" /></div>
                        <div className="absolute top-1/2 -left-8 border-4 border-black bg-pink-400 p-2 shadow-[4px_4px_0_0_#000] -rotate-12"><BookOpen className="h-6 w-6 text-black fill-black" /></div>
                        <div className="absolute -bottom-8 left-12 border-4 border-black bg-cyan-300 p-2 shadow-[4px_4px_0_0_#000] rotate-12"><Sparkles className="h-6 w-6 text-black fill-black" /></div>
                    </div>
                </div>
            </div>
        </div>
    )
}