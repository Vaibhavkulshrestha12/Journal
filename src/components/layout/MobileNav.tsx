"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-1 -mr-1 text-zinc-400 hover:text-white transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 top-16 bg-black/80 backdrop-blur-sm z-40" 
            onClick={() => setIsOpen(false)} 
          />
          <div className="absolute top-10 right-0 w-48 bg-zinc-950 border border-zinc-900 rounded-lg shadow-2xl p-5 z-50 flex flex-col gap-5">
            <Link 
              onClick={() => setIsOpen(false)} 
              href="/posts" 
              className="text-xs uppercase tracking-widest font-bold text-zinc-400 hover:text-white transition-colors"
            >
              Archive
            </Link>
            <Link 
              onClick={() => setIsOpen(false)} 
              href="https://www.vaibhavkulshrestha.me/about" 
              className="text-xs uppercase tracking-widest font-bold text-zinc-400 hover:text-white transition-colors"
            >
              About
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
