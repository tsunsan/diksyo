"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { ArrowRight, LogIn, UserPlus } from "lucide-react";

export default function LandingNav() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            setIsLoggedIn(!!session);
            setIsLoading(false);
        };

        checkSession();
    }, []);

    return (
        <nav className="sticky top-0 z-50 flex flex-col gap-4 border-b-4 border-black bg-yellow-400 px-4 py-4 md:flex-row md:items-center md:justify-between md:gap-6 md:px-6 shadow-[0_4px_0_0_rgba(0,0,0,1)] transition-all">
            {/* Left: Logo */}
            <div className="flex w-full justify-center md:w-1/3 md:justify-start">
                <Link href="/" className="text-4xl font-black uppercase tracking-tighter hover:scale-105 transition-transform">
                    DIKSYO
                </Link>
            </div>

            {/* Right: Dynamic Auth Buttons */}
            <div className="flex w-full justify-center gap-3 font-bold md:w-1/3 md:justify-end md:gap-4">
                {isLoading ? (
                    /* Skeleton placeholders matching button dimensions to prevent CLS */
                    <>
                        <div className="h-[44px] w-[120px] border-4 border-black/20 bg-yellow-300 animate-pulse md:h-[52px] md:w-[130px]" />
                        <div className="h-[44px] w-[120px] border-4 border-black/20 bg-yellow-300 animate-pulse md:h-[52px] md:w-[130px]" />
                    </>
                ) : isLoggedIn ? (
                    <Link
                        href="/dictionary"
                        className="border-4 border-black bg-green-400 px-4 py-2 uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none md:px-6 md:py-3 flex items-center gap-2"
                    >
                        BACK TO DICTIONARY <ArrowRight className="h-5 w-5" />
                    </Link>
                ) : (
                    <>
                        <Link
                            href="/login"
                            className="flex items-center gap-2 border-4 border-black bg-purple-400 px-4 py-2 uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none md:px-6 md:py-3"
                        >
                            <LogIn className="h-4 w-4 md:h-5 md:w-5" /> Log In
                        </Link>
                        <Link
                            href="/signup"
                            className="flex items-center gap-2 border-4 border-black bg-white px-4 py-2 uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none md:px-6 md:py-3"
                        >
                            <UserPlus className="h-4 w-4 md:h-5 md:w-5" /> Sign Up
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
