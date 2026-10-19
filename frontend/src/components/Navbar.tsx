"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, SignInButton, UserButton } from "@clerk/nextjs";
import {
  ShieldAlert,
  PhoneCall,
  FileText,
  LayoutDashboard,
  Menu,
  X,
  HeartHandshake,
  Activity,
} from "lucide-react";

const HELPLINES = [
  { name: "Emergency", number: "112", desc: "National Emergency Response System" },
  { name: "Women in Distress", number: "181", desc: "Women Helpline" },
  { name: "Childline", number: "1098", desc: "Emergency Child Protection" },
  { name: "Tele-MANAS", number: "14416", desc: "National Mental Health Support" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Overview", href: "/", icon: Activity },
    { label: "File a Report", href: "/portal", icon: ShieldAlert },
    { label: "My Case Status", href: "/portal/history", icon: FileText },
    { label: "Responder Desk", href: "/admin", icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md transition-all">
      {/* 24x7 Toll-Free Crisis Helplines Civic Header Utility Bar */}
      <div className="border-b border-slate-800/70 bg-slate-900/80 px-4 py-2 text-xs">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="font-semibold text-slate-200 tracking-wide">
              24×7 Toll-Free Crisis Helplines:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3" role="navigation" aria-label="Emergency Helplines">
            {HELPLINES.map((item) => (
              <a
                key={item.number}
                href={`tel:${item.number}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/80 bg-slate-800/70 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:border-teal-500 hover:text-teal-300 transition-colors"
                title={`${item.desc} — Call ${item.number}`}
                aria-label={`Call ${item.name} at ${item.number}`}
              >
                <PhoneCall className="h-3 w-3 text-teal-400" />
                <span className="text-slate-400">{item.name}:</span>
                <span className="font-mono font-bold text-white">{item.number}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Civic Navigation Bar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Dignified Clinical Brand Identity */}
        <Link href="/" className="flex items-center gap-3 group" aria-label="TraumaSense India Home">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-900/60 border border-teal-700/60 text-teal-300 group-hover:bg-teal-800/70 transition-colors">
            <HeartHandshake className="h-5 w-5 text-teal-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl font-bold tracking-tight text-white group-hover:text-teal-300 transition-colors">
                TraumaSense
              </span>
              <span className="rounded-md bg-teal-950 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-teal-300 border border-teal-800/80">
                India
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Multilingual Clinical Triage &amp; Crisis Response
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800/80" aria-label="Primary Navigation">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-teal-950/90 text-teal-300 border border-teal-700/60 shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-teal-400" : "text-slate-400"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Authentication Controls */}
        <div className="hidden md:flex items-center gap-3">
          {isLoaded && (
            <>
              {isSignedIn ? (
                <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                  <UserButton />
                </div>
              ) : (
                <SignInButton mode="modal">
                  <button className="flex items-center gap-2 rounded-xl bg-teal-700 hover:bg-teal-600 active:scale-95 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer">
                    Duty Officer Sign In
                  </button>
                </SignInButton>
              )}
            </>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-1" aria-label="Mobile Navigation">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive
                      ? "bg-teal-950/80 text-teal-300 border border-teal-800"
                      : "text-slate-300 hover:bg-slate-800/60"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-4 w-4 text-teal-400" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-slate-800">
            {isLoaded && !isSignedIn && (
              <SignInButton mode="modal">
                <button className="w-full rounded-lg bg-teal-700 py-2.5 text-center text-xs font-semibold text-white shadow hover:bg-teal-600">
                  Duty Officer Sign In
                </button>
              </SignInButton>
            )}
            {isLoaded && isSignedIn && (
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-xs text-slate-400">Authenticated Session</span>
                <UserButton />
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
