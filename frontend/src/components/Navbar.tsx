"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, SignInButton, UserButton } from "@clerk/nextjs";
import {
  ShieldAlert,
  PhoneCall,
  Activity,
  FileText,
  LayoutDashboard,
  Menu,
  X,
  Radio,
} from "lucide-react";

const HELPLINES = [
  { name: "Emergency", number: "112", color: "text-red-400 bg-red-950/60 border-red-800" },
  { name: "Women", number: "181", color: "text-pink-400 bg-pink-950/60 border-pink-800" },
  { name: "Childline", number: "1098", color: "text-amber-400 bg-amber-950/60 border-amber-800" },
  { name: "Tele-MANAS", number: "14416", color: "text-cyan-400 bg-cyan-950/60 border-cyan-800" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Overview", href: "/", icon: Activity },
    { label: "Report Distress", href: "/portal", icon: ShieldAlert },
    { label: "Case Tracker", href: "/portal/history", icon: FileText },
    { label: "Officer Triage", href: "/admin", icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md transition-all">
      {/* Top Emergency Helplines Ticker */}
      <div className="border-b border-slate-800/50 bg-slate-900/60 px-4 py-1.5 text-xs">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="font-semibold uppercase tracking-wider text-slate-300">
              National Emergency Helplines (India):
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {HELPLINES.map((item) => (
              <a
                key={item.number}
                href={`tel:${item.number}`}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition hover:brightness-125 ${item.color}`}
                title={`Call ${item.name} (${item.number})`}
              >
                <PhoneCall className="h-3 w-3" />
                <span>{item.name}:</span>
                <span className="font-bold">{item.number}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 via-rose-600 to-indigo-700 shadow-lg shadow-red-900/30 group-hover:scale-105 transition-transform">
            <Radio className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight text-white group-hover:text-red-400 transition-colors">
                TraumaSense
              </span>
              <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-red-400 border border-red-500/30">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Multimodal Crisis Assessment &amp; SVI Triage
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80">
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
                className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-red-600/20 text-red-300 border border-red-500/40 shadow-sm shadow-red-950"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-red-400" : "text-slate-400"}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Auth Controls */}
        <div className="hidden md:flex items-center gap-3">
          {isLoaded && (
            <>
              {isSignedIn ? (
                <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                  <UserButton />
                </div>
              ) : (
                <SignInButton mode="modal">
                  <button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-red-900/30 hover:brightness-110 active:scale-95 transition-all cursor-pointer">
                    Sign In
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
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/95 px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-1">
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
                      ? "bg-red-600/20 text-red-300 border border-red-500/30"
                      : "text-slate-300 hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className="h-4 w-4 text-red-400" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-2 border-t border-slate-800">
            {isLoaded && !isSignedIn && (
              <SignInButton mode="modal">
                <button className="w-full rounded-lg bg-red-600 py-2.5 text-center text-xs font-bold text-white shadow-md hover:bg-red-500">
                  Sign In / Register
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
