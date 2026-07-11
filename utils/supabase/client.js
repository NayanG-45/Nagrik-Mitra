import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Supabase credentials missing. Check your .env.local file.");
    }
    // Return a dummy client during build to avoid crashing Next.js static prerendering
    return createBrowserClient(
      url || "https://placeholder-url.supabase.co",
      anonKey || "placeholder-anon-key"
    );
  }

  return createBrowserClient(url, anonKey);
}
