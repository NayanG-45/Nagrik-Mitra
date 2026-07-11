import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  // Access cookies asynchronously
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Supabase credentials missing. Check your .env.local file.");
    }
    // Return dummy client during build to avoid build-time static page prerendering errors
    return createServerClient(
      url || "https://placeholder-url.supabase.co",
      anonKey || "placeholder-anon-key",
      {
        cookies: {
          getAll() {
            return [];
          },
          setAll() {},
        },
      }
    );
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // This can be ignored if called from a Server Component
        }
      },
    },
  });
}
