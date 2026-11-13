import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    await supabase.auth.getUser()
    return supabaseResponse

}

export async function proxy(request: NextRequest) {
    return await updateSession(request)
}

// Proxy runs as a function before the cache, so every matched request costs
// CPU even when the page itself is cached. Word pages, share images, the
// sitemap and robots.txt are what crawlers hit and need no session refresh:
// those pages resolve the session in the browser, and Server Actions check
// the user themselves (and can refresh the cookies) through getUser().
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|salita|sitemap\\.xml|robots\\.txt|.*opengraph-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}