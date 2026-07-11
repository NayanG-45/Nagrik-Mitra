"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const getLinkClasses = (path) => {
    const baseClasses = "font-label-md text-label-md pb-1 transition-all duration-300 ease-out";
    if (pathname === path) {
      return `${baseClasses} text-primary border-b-2 border-primary active:scale-[1.01]`;
    }
    return `${baseClasses} text-on-surface-variant hover:text-primary`;
  };

  return (
    <header className="bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant sticky top-0 z-50 transition-all duration-300">
      <div className="flex justify-between items-center w-full px-margin-desktop py-unit-md max-w-container-max mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-display text-headline-md font-extrabold tracking-tight text-on-surface">Nagrik Mitra</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className={getLinkClasses("/")}>
            Home
          </Link>
          <Link href="/dashboard" className={getLinkClasses("/dashboard")}>
            Dashboard
          </Link>
          <Link href="/features" className={getLinkClasses("/features")}>
            Features
          </Link>
          <Link href="/news" className={getLinkClasses("/news")}>
            News
          </Link>
          <Link href="/assistant" className={getLinkClasses("/assistant")}>
            Assistant
          </Link>
        </nav>
        <div className="flex items-center gap-unit-md">
          <button className="hidden md:block font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors px-4 py-2">Sign In</button>
          <Link href="/dashboard" className="bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md text-label-md hover:bg-primary-container shadow-md transition-all duration-300 hover:scale-[1.02]">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
