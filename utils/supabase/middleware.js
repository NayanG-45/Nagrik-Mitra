import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // If keys are missing, bypass session refresh to avoid build/runtime crash
    return supabaseResponse;
  }

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do not remove this. It refreshes the session if it's expired.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is not logged in and is trying to access protected routes, redirect to login
  const redirectUrl = request.nextUrl.clone();
  const isProtectedRoute = 
    redirectUrl.pathname.startsWith("/dashboard") || 
    redirectUrl.pathname.startsWith("/assistant");

  if (!user && isProtectedRoute) {
    redirectUrl.pathname = "/login";
    // Keep track of the original page to redirect back after sign in
    redirectUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is logged in and is trying to access the login page, redirect to dashboard
  if (user && redirectUrl.pathname.startsWith("/login")) {
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
