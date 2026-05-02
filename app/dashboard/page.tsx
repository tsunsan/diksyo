import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getFeaturedPacks } from '@/app/actions/lists'
import Link from 'next/link'

// Import Shadcn Dialog Primitives
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export default async function DashboardPage() {
    // 1. Server-Side Protection
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fallback to email if full_name metadata is missing
    const displayName = user.user_metadata?.full_name || user.email

    // Fetch the official featured packs directly from the database
    const userLists = await getFeaturedPacks();

    // Define a palette of Neo-brutalist colors to cycle through
    const cardColors = [
        "bg-pink-400",
        "bg-blue-400",
        "bg-yellow-400",
        "bg-green-400",
        "bg-cyan-300"
    ];

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

                    {/* LOGOUT FORM */}
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

                <h2 className="text-xl font-bold uppercase mb-4 border-b-2 border-black pb-2">
                    Featured Scenario Packs
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {userLists.map((list: any, index: number) => {
                        const colorClass = cardColors[index % cardColors.length];

                        return (
                            <Dialog key={list.id}>
                                {/* The Card is now the trigger to open the modal */}
                                <DialogTrigger>
                                    <Card
                                        className={`rounded-none border-4 border-black shadow-[8px_8px_0_0_#000] ${colorClass} hover:-translate-y-1 hover:shadow-[10px_10px_0_0_#000] transition-all cursor-pointer flex flex-col h-full`}
                                    >
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg font-black uppercase">{list.title}</CardTitle>
                                            {list.description && (
                                                <p className="text-sm font-bold mt-1 line-clamp-2 leading-tight">
                                                    {list.description}
                                                </p>
                                            )}
                                        </CardHeader>
                                        <CardContent className="mt-auto pt-4">
                                            <div className="flex justify-between items-end">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-bold uppercase bg-white border-2 border-black px-2 py-1 w-max shadow-[2px_2px_0_0_#000]">
                                                        Baguhan
                                                    </span>
                                                    <span className="font-black mt-2 text-lg">
                                                        {list.words?.length || 0} Words
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </DialogTrigger>

                                {/* The Neo-brutalist Modal Content */}
                                <DialogContent className="border-4 border-black shadow-[12px_12px_0_0_#000] rounded-none bg-white font-mono max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle className="text-3xl md:text-4xl font-black uppercase border-b-4 border-black pb-4">
                                            {list.title}
                                        </DialogTitle>
                                        <DialogDescription className="font-bold text-lg text-black pt-4">
                                            {list.description}
                                        </DialogDescription>
                                    </DialogHeader>

                                    {/* Scrollable Word Preview Area */}
                                    <div className="my-4 max-h-64 overflow-y-auto border-4 border-black bg-zinc-100 p-4 shadow-[inset_4px_4px_0_0_rgba(0,0,0,0.1)]">
                                        <h3 className="font-black uppercase mb-4 text-gray-500 tracking-widest text-sm">
                                            Words in this set ({list.words?.length || 0})
                                        </h3>
                                        <ul className="space-y-3">
                                            {/* We map through the nested word data created by our list_words join table */}
                                            {list.words?.map((item: any) => (
                                                <li key={item.word.id} className="flex justify-between items-center border-b-2 border-dashed border-gray-300 pb-2">
                                                    <span className="font-black uppercase text-lg">{item.word.word}</span>
                                                    <span className="font-bold text-gray-600 italic text-right max-w-[50%]">
                                                        {item.word.translation}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col sm:flex-row justify-end gap-4 mt-4">
                                        <Link href={`/study/${list.id}`} className="w-full sm:w-auto">
                                            <Button className="w-full rounded-none border-4 border-black bg-green-400 font-black uppercase text-xl px-8 py-6 shadow-[6px_6px_0_0_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                                                Learn This
                                            </Button>
                                        </Link>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )
                    })}
                </div>
            </main>
        </div>
    )
}