import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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
                    } catch {
                        // TODO: "Handle cookie setting errors gracefully, possibly by logging them or providing feedback to the user"
                    }
                },
            },
        }
    )

    // --- DEVELOPMENT GLOBAL AUTH BYPASS ---
    if (process.env.NODE_ENV === 'development') {
        const originalGetUser = client.auth.getUser.bind(client.auth);
        client.auth.getUser = async (jwt) => {
            const result = await originalGetUser(jwt);
            if (!result.data?.user) {
                return {
                    data: {
                        user: {
                            id: "61b54244-1db4-4cfb-a815-970603b70fe7",
                            email: "dev@local.com"
                        } as any
                    },
                    error: null
                };
            }
            return result;
        };
    }
    // --------------------------------------

    return client;
}