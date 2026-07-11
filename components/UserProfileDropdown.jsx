"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UserProfileDropdown({ user, supabase }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  // Close dropdown if user clicks outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsOpen(false);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  // Get user details
  const email = user?.email;
  const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || "Citizen";
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  
  // First letter of name for placeholder avatar
  const initial = fullName ? fullName.charAt(0).toUpperCase() : (email ? email.charAt(0).toUpperCase() : "C");

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-surface-container-low transition-colors duration-200 focus:outline-none"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={fullName}
            referrerPolicy="no-referrer"
            className="w-9 h-9 rounded-full object-cover border border-outline-variant shadow-sm"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-label-md border border-primary/20">
            {initial}
          </div>
        )}
        <span className="hidden lg:block text-label-md font-semibold text-on-surface select-none">
          {fullName.split(" ")[0]}
        </span>
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant select-none transition-transform duration-200">
          {isOpen ? "keyboard_arrow_up" : "keyboard_arrow_down"}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-64 bg-surface-container-lowest/95 backdrop-blur-md border border-outline-variant rounded-2xl signature-shadow z-50 animate-fade-in py-2 overflow-hidden">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-outline-variant flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full object-cover border border-outline-variant"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-headline-md shrink-0">
                {initial}
              </div>
            )}
            <div className="overflow-hidden">
              <h4 className="text-label-md font-bold text-on-surface truncate leading-tight">
                {fullName}
              </h4>
              <p className="text-label-sm font-normal text-on-surface-variant truncate mt-0.5">
                {email}
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="p-1.5 space-y-0.5">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-label-md text-on-surface hover:bg-surface-container-low transition-colors duration-150"
            >
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                dashboard
              </span>
              <span>Dashboard</span>
            </Link>

            <Link
              href="/assistant"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-label-md text-on-surface hover:bg-surface-container-low transition-colors duration-150"
            >
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                chat
              </span>
              <span>AI Assistant</span>
            </Link>

            <Link
              href="/news"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-label-md text-on-surface hover:bg-surface-container-low transition-colors duration-150"
            >
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                newspaper
              </span>
              <span>News Updates</span>
            </Link>
          </div>

          <div className="border-t border-outline-variant my-1.5"></div>

          {/* Action (Logout) */}
          <div className="px-1.5 pb-1">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-label-md text-error hover:bg-error-container/20 transition-colors duration-150 text-left font-semibold"
            >
              <span className="material-symbols-outlined text-[20px] text-error">
                logout
              </span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
