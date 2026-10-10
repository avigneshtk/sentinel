'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/analyze', label: 'TraceTrust' },
  { href: '/privacy-scan', label: 'TRACELESS' },
  { href: '/timeline', label: 'Timeline' },
  { href: '/safety-center', label: 'Safety Centre' },
  { href: '/settings', label: 'Privacy & Settings' },
];

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white"
      >
        S
      </span>
      <span className="text-lg font-bold tracking-wide text-slate-100">
        SENTINEL
      </span>
    </span>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-navy-950/90 backdrop-blur">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6"
      >
        <Link href="/" aria-label="SENTINEL home">
          <Logo />
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active =
              item.href !== '/dashboard' && pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                    active
                      ? 'bg-indigo-500/15 text-indigo-300'
                      : 'text-slate-300 hover:bg-navy-800 hover:text-slate-100'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Mobile menu button */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-300 hover:bg-navy-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <span aria-hidden="true" className="text-xl">
            {open ? '✕' : '☰'}
          </span>
        </button>
      </nav>

      {/* Mobile nav */}
      {open && (
        <nav id="mobile-nav" aria-label="Mobile navigation" className="md:hidden">
          <ul className="space-y-1 border-t border-slate-800 px-4 py-3">
            {NAV.map((item) => {
              const active =
                item.href !== '/dashboard' && pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setOpen(false)}
                    className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${
                      active
                        ? 'bg-indigo-500/15 text-indigo-300'
                        : 'text-slate-300 hover:bg-navy-800'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-navy-950">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md">
            <Logo />
            <p className="mt-3 text-sm text-slate-400">
              Detect threats. Protect privacy. Take action. A digital-safety
              and threat-intelligence platform for Track 03 — The Human
              Attack Surface.
            </p>
          </div>
          <div className="text-sm">
            <p className="font-medium text-slate-200">In immediate danger?</p>
            <p className="mt-1 text-slate-400">
              India: call <strong className="text-slate-200">112</strong> (emergency),{' '}
              <strong className="text-slate-200">181</strong> (women helpline),{' '}
              <strong className="text-slate-200">1930</strong> (cyber crime).
            </p>
          </div>
        </div>
        <p className="mt-6 border-t border-slate-800 pt-4 text-xs text-slate-500">
          SENTINEL is a triage and guidance tool. It is not a risk score, a
          medical or legal service, or a substitute for professional support.
          Nothing you paste is sent to any server unless a feature says so.
        </p>
      </div>
    </footer>
  );
}
