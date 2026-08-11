import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'

export async function createClient() {
    const cookieStore = await cookies()

    const client = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch (error) {
                        const message = error instanceof Error ? error.message : String(error)
                        const isReadonlyCookieError =
                            message.includes("Cookies can only be modified") ||
                            message.includes("read only")

                        if (!isReadonlyCookieError) {
                            console.error("[supabase] Failed to set auth cookies:", error)
                        }
                    }
                },
            },
        }
    )

    // --- DEVELOPMENT GLOBAL AUTH BYPASS ---
    if (process.env.NODE_ENV === 'development') {
        const originalGetUser = client.auth.getUser.bind(client.auth);
        client.auth.getUser = async (jwt) => {
            const { data: { session } } = await client.auth.getSession();
            if (session) {
                 return await originalGetUser(jwt);
            }
            return {
                data: {
                    user: {
                        id: "61b54244-1db4-4cfb-a815-970603b70fe7",
                        email: "dev@local.com"
                    } as any
                },
                error: null
            };
        };
    }
    // --------------------------------------

    return client;
}

export const getUser = cache(async () => {
    const supabase = await createClient();
    return supabase.auth.getUser();
});