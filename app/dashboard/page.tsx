import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/(auth)/actions' // Adjust path if your actions.ts is elsewhere
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
    // 1. Server-Side Protection
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fallback to email if full_name metadata is missing
    const displayName = user.user_metadata?.full_name || user.email

    // 2. Mocking your "Real-Life Modes" [cite: 27]
    const featuredSets = [
        { title: "Dating Convo", words: 25, color: "bg-pink-400", level: "Baguhan" },
        { title: "Job Interview", words: 40, color: "bg-blue-400", level: "Lakan" },
        { title: "Street Slang", words: 50, color: "bg-yellow-400", level: "Kasanayan" },
    ]

    return (
        <div className="min-h-screen bg-zinc-50 font-mono text-black">
            {/* Navigation Bar */}
            <nav className="flex items-center justify-between p-6 border-b-4 border-black bg-white">
                <div className="flex items-center gap-3 font-black uppercase tracking-tighter text-2xl italic">
                    <img src="/icon.svg" alt="Diksyo Logo" className="size-8 object-contain" />
                    DIKSYO
                </div>

                <div className="flex items-center gap-4">
                    <span className="font-bold hidden md:block">Kamusta, {displayName}!</span>

                    {/* LOGOUT FORM - See explanation below */}
                    <form action={logout}>
                        <Button
                            type="submit"
                            variant="outline"
                            className="rounded-none border-2 border-black bg-red-400 font-bold shadow-[4px_4px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all uppercase"
                        >
                            Umalis (Logout)
                        </Button>
                    </form>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto p-6 mt-8">
                <div className="mb-8 border-4 border-black p-6 bg-yellow-400 shadow-[8px_8px_0_0_#000]">
                    <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Your Training Ground</h1>
                    <p className="font-bold">Select a vocabulary set to begin your quest from Baguhan to Lakan.</p>
                </div>

                <h2 className="text-xl font-bold uppercase mb-4 border-b-2 border-black pb-2">Featured Scenario Packs</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {featuredSets.map((set, index) => (
                        <Card
                            key={index}
                            className={`rounded-none border-4 border-black shadow-[8px_8px_0_0_#000] ${set.color} hover:-translate-y-1 hover:shadow-[10px_10px_0_0_#000] transition-all cursor-pointer`}
                        >
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-black uppercase">{set.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-end">
                                    <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold uppercase bg-white border-2 border-black px-2 py-1 w-max">
                      {set.level}
                    </span>
                                        <span className="font-bold mt-2">{set.words} Words</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    )
}