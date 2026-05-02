"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, Shuffle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { searchWordBySlug } from "@/app/actions/dictionary";

export default function SearchBar() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 1. Debounce Logic: Wait ~300ms after the user stops typing
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    // 2. Fetch Logic: Triggered when debouncedQuery changes
    useEffect(() => {
        async function fetchSuggestions() {
            if (!debouncedQuery.trim()) {
                setResults([]);
                setIsOpen(false);
                return;
            }

            setIsSearching(true);
            try {
                const res = await searchWordBySlug(debouncedQuery.toLowerCase());

                // FIX: Check for "FOUND" instead of "SUCCESS" to satisfy your Discriminated Union
                if (res.status === "FOUND") {
                    setResults([res.data]);
                    setIsOpen(true);
                } else if (res.status === "SIMILAR" && res.data) {
                    setResults(res.data);
                    setIsOpen(true);
                } else {
                    setResults([]);
                    setIsOpen(false);
                }
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setIsSearching(false);
            }
        }

        fetchSuggestions();
    }, [debouncedQuery]);

    // 3. Handle Form Submit (Hard Navigation)
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            setIsOpen(false);
            router.push(`/salita/${query.toLowerCase()}`);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative w-full z-50" ref={dropdownRef}>
            <form
                onSubmit={handleSubmit}
                className="flex w-full flex-col border-4 border-black bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform focus-within:-translate-y-1 sm:flex-row md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
                <div className="flex flex-1 items-center bg-white px-2 py-2 sm:px-4 sm:py-0">
                    {isSearching ? (
                        <Loader2 className="mx-2 h-6 w-6 shrink-0 animate-spin text-black sm:h-8 sm:w-8" />
                    ) : (
                        <Search className="mx-2 h-6 w-6 shrink-0 text-gray-400 sm:h-8 sm:w-8" />
                    )}

                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search Diksyo..."
                        className="w-full min-w-0 bg-transparent p-2 text-lg font-bold text-black outline-none placeholder:text-gray-400 sm:p-4 sm:text-xl md:text-2xl"
                        autoComplete="off"
                    />

                    <Link
                        href="/salita/random"
                        className="group mr-2 flex shrink-0 items-center justify-center border-4 border-black bg-cyan-300 p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none sm:mr-4"
                        title="Random Word"
                        onClick={() => setIsOpen(false)}
                    >
                        <Shuffle className="h-5 w-5 text-black transition-transform group-hover:rotate-180 sm:h-6 sm:w-6" />
                    </Link>
                </div>
                <button
                    type="submit"
                    className="border-t-4 border-black bg-green-400 px-6 py-3 text-xl font-black uppercase transition-colors hover:bg-green-500 sm:border-l-4 sm:border-t-0 sm:px-8 sm:py-4 sm:text-2xl"
                >
                    Search
                </button>
            </form>

            {/* Neo-brutalist Autocomplete Dropdown */}
            {isOpen && results.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-2 flex flex-col border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    {results.slice(0, 5).map((result) => (
                        <Link
                            key={result.id || result.word}
                            href={`/salita/${result.slug || result.word.toLowerCase()}`}
                            onClick={() => setIsOpen(false)}
                            className="group flex flex-col border-b-2 border-black p-4 last:border-b-0 hover:bg-yellow-400 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-xl font-black uppercase">{result.word}</span>
                                {result.partOfSpeech && (
                                    <span className="border-2 border-black bg-purple-400 px-2 py-1 text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none transition-shadow">
                                        {result.partOfSpeech}
                                    </span>
                                )}
                            </div>
                            {result.translation && (
                                <span className="mt-1 text-sm font-bold text-gray-600 group-hover:text-black">
                                    {result.translation}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}