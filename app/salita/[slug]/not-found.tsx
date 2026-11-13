"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import DictionaryClient from "@/components/dictionary";
import { decodeSlug } from "@/lib/utils";

// Shown with a 404 status when a /salita/<slug> URL matches no word, usually
// a typo typed into the search bar. It keeps the old behaviour for people:
// the search box is pre-filled and the client looks up close matches.
export default function SalitaNotFound() {
    const pathname = usePathname();
    const slug = decodeSlug(pathname.split("/").filter(Boolean).pop() ?? "");

    return (
        <div className="min-h-screen bg-[#FFFBF0] p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 flex gap-4">
                    <Link href="/" className="inline-flex items-center gap-1 border-2 border-black bg-yellow-300 px-3 py-1.5 text-xs font-black uppercase tracking-tight shadow-[3px_3px_0_0_#000] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">
                        ← Back Home
                    </Link>
                </div>
                <DictionaryClient
                    initialWords={[]}
                    initialDiscoverWords={[]}
                    initialSearch={slug}
                    resolveSessionOnClient
                    loadDailyWordsOnClient
                />
            </div>
        </div>
    );
}
