"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  ["How it works", "#how-it-works"],
  ["Protection", "#security-layers"],
  ["Solutions", "#solutions"],
  ["FAQ", "#faq"],
];

export function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-ink/80 backdrop-blur-xl">
      <div className="shell flex h-20 items-center justify-between">
        <a href="#top" className="relative z-10 flex items-center" aria-label="CyberShield home">
          <img src="/cybershield-logo.png" alt="CyberShield" className="h-12 w-auto max-w-[190px] object-contain" />
        </a>
        <nav aria-label="Primary navigation" className="hidden items-center gap-8 lg:flex">
          {links.map(([label, href]) => (
            <a key={href} href={href} className="nav-link">{label}</a>
          ))}
        </nav>
        <a href="#contact" className="button-primary hidden lg:inline-flex">Book assessment</a>
        <button
          type="button"
          className="grid size-11 place-items-center rounded-full border border-white/15 text-white lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile navigation" className="border-t border-white/10 bg-ink px-5 py-5 lg:hidden">
          <div className="mx-auto flex max-w-xl flex-col gap-1">
            {links.map(([label, href]) => (
              <a key={href} href={href} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-base text-slate-200 hover:bg-white/5">{label}</a>
            ))}
            <a href="#contact" onClick={() => setOpen(false)} className="button-primary mt-3 justify-center">Book assessment</a>
          </div>
        </nav>
      )}
    </header>
  );
}
