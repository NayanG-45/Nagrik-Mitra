"use client";

import { useState, useEffect, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextRedirect = searchParams.get("next") || "/dashboard";
  const initialError = searchParams.get("error");

  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  // Rotating Indian language greeting for citizen connection
  const greetings = [
    { lang: "English", text: "Welcome to Nagrik Mitra" },
    { lang: "Hindi", text: "नागरिक मित्र में आपका स्वागत है" },
    { lang: "Bengali", text: "নাগরিক মিত্রে আপনাকে স্বাগত" },
    { lang: "Telugu", text: "నాగరిక్ మిత్రకు స్వాగతం" },
    { lang: "Marathi", text: "नागरिक मित्र मध्ये आपले स्वागत आहे" },
    { lang: "Tamil", text: "நாகரிக மித்ராவிற்கு உங்களை வரவேற்கிறோம்" },
    { lang: "Gujarati", text: "નાગરિક મિત્રમાં આપનું સ્વાગત છે" },
    { lang: "Kannada", text: "ನಾಗರಿಕ ಮಿತ್ರಕ್ಕೆ ಸ್ವಾಗತ" },
  ];
  const [greetingIdx, setGreetingIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setGreetingIdx((prev) => (prev + 1) % greetings.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (initialError) {
      setError(initialError);
    }
  }, [initialError]);

  useEffect(() => {
    const defaultMode = searchParams.get("mode");
    if (defaultMode === "signup") {
      setMode("signup");
    }
  }, [searchParams]);

  const handleAuthError = (err, defaultMsg) => {
    console.error("Auth Exception Details:", err);
    if (!err) {
      setError(defaultMsg);
      return;
    }
    const msg = err.message || err.error_description || String(err);
    if (msg === "{}" || msg === "[object Object]" || !msg.trim()) {
      setError(`${defaultMsg} (Details: Check browser DevTools console or your Supabase Auth logs)`);
    } else {
      setError(msg);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    const supabase = createClient();
    
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextRedirect)}`,
        },
      });
      if (err) throw err;
    } catch (err) {
      handleAuthError(err, "Could not initiate Google login.");
      setLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");
    const supabase = createClient();

    try {
      const { error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (err) throw err;

      startTransition(() => {
        router.push(nextRedirect);
        router.refresh();
      });
    } catch (err) {
      handleAuthError(err, "Invalid email or password.");
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");
    const supabase = createClient();

    try {
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextRedirect)}`,
        },
      });
      if (err) throw err;

      if (data?.session) {
        startTransition(() => {
          router.push(nextRedirect);
          router.refresh();
        });
      } else {
        setSuccessMessage("Registration successful! Please check your email to verify your account.");
        setLoading(false);
      }
    } catch (err) {
      handleAuthError(err, "An error occurred during registration.");
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");
    const supabase = createClient();

    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      if (err) throw err;

      setSuccessMessage("Password reset email sent! Please check your inbox for the link.");
      setLoading(false);
    } catch (err) {
      handleAuthError(err, "Could not send password reset email.");
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "signin" ? "signup" : "signin"));
    setError("");
    setSuccessMessage("");
  };

  const isWorking = loading || isPending;

  return (
    <div className="flex-grow flex flex-col md:flex-row min-h-[calc(100vh-80px)] bg-background overflow-hidden relative">
      {/* Visual Left Banner (Desktop Only) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-tr from-primary to-[#5b46e8] text-on-primary flex-col justify-between p-12 relative overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-secondary-fixed/20 rounded-full blur-[80px] translate-x-1/3 translate-y-1/3 pointer-events-none"></div>
        
        {/* Top Branding Header */}
        <div className="flex items-center gap-2 z-10">
          <span className="material-symbols-outlined text-[32px] text-white">verified_user</span>
          <span className="font-display text-headline-md font-bold tracking-tight">Nagrik Mitra</span>
        </div>

        {/* Middle Message Slider */}
        <div className="z-10 max-w-lg mb-12">
          <div className="min-h-[80px] flex flex-col justify-center">
            <span className="font-label-sm text-label-sm text-primary-fixed-dim uppercase tracking-widest mb-2 block">
              {greetings[greetingIdx].lang}
            </span>
            <h2 className="font-display text-display text-white mb-4 leading-tight transition-all duration-500 ease-in-out">
              {greetings[greetingIdx].text}
            </h2>
          </div>
          <p className="font-body-lg text-body-lg text-white/80 leading-relaxed">
            One secure digital account connecting you to government welfare schemes, grievance departments, and documents in your regional language.
          </p>
        </div>

        {/* Bottom Quote / Feature Checklist */}
        <div className="z-10 border-t border-white/15 pt-6 flex flex-col gap-3 font-label-md text-label-md text-white/70">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-green-400 text-[18px]">check_circle</span>
            <span>Verify Eligibility for 500+ Central and State Schemes</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-green-400 text-[18px]">check_circle</span>
            <span>Direct Multilingual Voice AI Assistant Support</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-green-400 text-[18px]">check_circle</span>
            <span>File & Monitor Local Grievances Seamlessly</span>
          </div>
        </div>
      </div>

      {/* Auth Interface Right Pane */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 lg:p-16 relative">
        <div className="absolute inset-0 pointer-events-none -z-10 md:hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[80px] -ml-32 -mb-32"></div>
        </div>

        {/* Form Container (Glassmorphic design) */}
        <div className="w-full max-w-md bg-surface-container-lowest/80 backdrop-blur-lg border border-outline-variant p-8 rounded-[2rem] signature-shadow transition-all duration-300">
          
          {/* Header Mobile Logo */}
          <div className="flex justify-center md:hidden mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
              <span className="material-symbols-outlined text-[20px]">verified_user</span>
              <span className="font-display text-label-md font-bold tracking-tight">Nagrik Mitra</span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-display text-headline-lg text-on-surface mb-2">
              {mode === "signin" && "Sign In to Your Account"}
              {mode === "signup" && "Create Citizen Account"}
              {mode === "forgot" && "Reset Your Password"}
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {mode === "signin" && "Enter your credentials to access your personal dashboard."}
              {mode === "signup" && "Fill out the fields to register for unified governance access."}
              {mode === "forgot" && "Enter your email to receive a password reset link."}
            </p>
          </div>

          {/* Error and Success Banners */}
          {error && (
            <div className="mb-6 p-4 bg-error-container text-error rounded-2xl flex items-start gap-2 animate-fade-in border border-error/10">
              <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
              <span className="font-label-sm text-label-sm leading-relaxed">{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-2xl flex items-start gap-2 animate-fade-in border border-green-200">
              <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">check_circle</span>
              <span className="font-label-sm text-label-sm leading-relaxed">{successMessage}</span>
            </div>
          )}

          {/* Sign In / Sign Up Forms */}
          <form 
            onSubmit={(e) => {
              if (mode === "signin") handleSignIn(e);
              else if (mode === "signup") handleSignUp(e);
              else if (mode === "forgot") handleForgotPassword(e);
            }} 
            className="space-y-4"
          >
            {mode === "signup" && (
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="fullName">
                  Full Name
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                    person
                  </span>
                  <input
                    id="fullName"
                    type="text"
                    required
                    disabled={isWorking}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full h-12 pl-12 pr-4 bg-surface-container-low border border-outline-variant hover:border-outline focus:border-primary focus:bg-white rounded-xl font-body-md text-body-md transition-all duration-300 outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  disabled={isWorking}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full h-12 pl-12 pr-4 bg-surface-container-low border border-outline-variant hover:border-outline focus:border-primary focus:bg-white rounded-xl font-body-md text-body-md transition-all duration-300 outline-none"
                />
              </div>
            </div>

            {mode !== "forgot" && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-label-md text-label-md text-on-surface" htmlFor="password">
                    Password
                  </label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode("forgot");
                        setError("");
                        setSuccessMessage("");
                      }}
                      className="text-label-sm font-semibold text-primary hover:underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                    lock
                  </span>
                  <input
                    id="password"
                    type="password"
                    required
                    disabled={isWorking}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 pl-12 pr-4 bg-surface-container-low border border-outline-variant hover:border-outline focus:border-primary focus:bg-white rounded-xl font-body-md text-body-md transition-all duration-300 outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isWorking}
              className="w-full h-12 bg-primary text-on-primary font-label-md text-label-md rounded-xl hover:bg-primary-container shadow-md transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none mt-2"
            >
              {isWorking ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : mode === "signin" ? (
                "Sign In"
              ) : mode === "signup" ? (
                "Register Account"
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <hr className="border-outline-variant" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 bg-surface-container-lowest text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">
              Or continue with
            </span>
          </div>

          {/* OAuth Buttons */}
          <button
            type="button"
            disabled={isWorking}
            onClick={handleGoogleSignIn}
            className="w-full h-12 border border-outline-variant hover:border-outline hover:bg-surface-container-low bg-surface-container-lowest text-on-surface font-label-md text-label-md rounded-xl transition-all duration-300 flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none"
          >
            {loading && !email ? (
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.58c-.28 1.48-1.12 2.74-2.38 3.58v2.98h3.84c2.24-2.06 3.5-5.09 3.5-8.71z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.84-2.98c-1.08.72-2.45 1.16-4.09 1.16-3.15 0-5.81-2.13-6.76-5.01H1.28v3.09C3.25 21.27 7.31 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.24 14.26c-.25-.72-.39-1.5-.39-2.3s.14-1.58.39-2.3V6.57H1.28C.47 8.2.01 10.05.01 12s.46 3.8 1.27 5.43l3.96-3.17z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.73 1.28 6.57l3.96 3.09c.95-2.88 3.61-5.01 6.76-5.01z"
                />
              </svg>
            )}
            <span>Sign in with Google</span>
          </button>

          {/* Toggle Link */}
          <div className="mt-8 text-center text-label-md font-label-md text-on-surface-variant">
            {mode === "forgot" ? (
              <button
                type="button"
                disabled={isWorking}
                onClick={() => {
                  setMode("signin");
                  setError("");
                  setSuccessMessage("");
                }}
                className="text-primary hover:underline hover:text-primary-container font-semibold disabled:opacity-50"
              >
                Back to Sign In
              </button>
            ) : (
              <>
                {mode === "signin" ? "New to Nagrik Mitra?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  disabled={isWorking}
                  onClick={toggleMode}
                  className="text-primary hover:underline hover:text-primary-container font-semibold disabled:opacity-50"
                >
                  {mode === "signin" ? "Register here" : "Sign in here"}
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex items-center justify-center min-h-[calc(100vh-80px)] bg-background">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
