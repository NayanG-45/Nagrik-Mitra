"use client";

import { useState, useTransition, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

function ResetPasswordContent() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      const { error: err } = await supabase.auth.updateUser({
        password: password,
      });

      if (err) throw err;

      setSuccess("Your password has been successfully updated!");
      setLoading(false);

      startTransition(() => {
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 2000);
      });
    } catch (err) {
      setError(err.message || "Failed to update password.");
      setLoading(false);
    }
  };

  const isWorking = loading || isPending;

  return (
    <div className="flex-grow flex items-center justify-center p-6 bg-background relative min-h-[calc(100vh-80px)]">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none"></div>
      </div>

      {/* Reset Card */}
      <div className="w-full max-w-md bg-surface-container-lowest/80 backdrop-blur-lg border border-outline-variant p-8 rounded-[2rem] signature-shadow">
        <div className="mb-6 text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4">
            <span className="material-symbols-outlined text-[28px]">lock_reset</span>
          </div>
          <h3 className="font-display text-headline-lg text-on-surface mb-2">
            Reset Your Password
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Please enter your new password below to secure your account.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error-container text-error rounded-2xl flex items-start gap-2 animate-fade-in border border-error/10">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
            <span className="font-label-sm text-label-sm leading-relaxed">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-2xl flex items-start gap-2 animate-fade-in border border-green-200">
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">check_circle</span>
            <span className="font-label-sm text-label-sm leading-relaxed">{success}</span>
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="password">
              New Password
            </label>
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
                placeholder="Minimum 6 characters"
                className="w-full h-12 pl-12 pr-4 bg-surface-container-low border border-outline-variant hover:border-outline focus:border-primary focus:bg-white rounded-xl font-body-md text-body-md transition-all duration-300 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-1.5" htmlFor="confirmPassword">
              Confirm New Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                lock_clock
              </span>
              <input
                id="confirmPassword"
                type="password"
                required
                disabled={isWorking}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full h-12 pl-12 pr-4 bg-surface-container-low border border-outline-variant hover:border-outline focus:border-primary focus:bg-white rounded-xl font-body-md text-body-md transition-all duration-300 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isWorking}
            className="w-full h-12 bg-primary text-on-primary font-label-md text-label-md rounded-xl hover:bg-primary-container shadow-md transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none mt-2"
          >
            {isWorking ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              "Update Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex-grow flex items-center justify-center min-h-[calc(100vh-80px)] bg-background">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
