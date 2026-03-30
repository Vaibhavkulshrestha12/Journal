"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    await signIn("cognito", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white flex flex-col font-[Inter,system-ui,sans-serif]">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 sm:px-10 py-6 sm:py-8">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Journal" width={28} height={28} className="rounded" />
          <h1 className="text-xl font-extrabold italic tracking-tighter">JOURNAL.</h1>
        </div>
        <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-zinc-600">
          Admin Access
        </span>
      </header>

      {/* Centered Card */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-[#131313] rounded-2xl p-8 sm:p-10 space-y-8" style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
            <div className="space-y-3 text-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.04em]">
                Welcome Back
              </h2>
              <p className="text-zinc-500 text-sm leading-relaxed">
                Sign in to manage your stories
              </p>
            </div>

            <div className="h-px bg-[#2a2a2a]" />

            <div className="space-y-4">
              <button
                onClick={handleSignIn}
                disabled={isLoading}
                className="w-full h-12 bg-white text-[#1a1c1c] font-bold text-sm rounded-lg hover:bg-[#d4d4d4] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-[#1a1c1c] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                      <polyline points="10 17 15 12 10 7" />
                      <line x1="15" y1="12" x2="3" y2="12" />
                    </svg>
                    Sign In with AWS Cognito
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-zinc-600 leading-relaxed">
                Authentication is handled securely via AWS Cognito.
                <br />
                Only pre-configured admin accounts can sign in.
              </p>
            </div>
          </div>

          <div className="mt-8 sm:mt-10 flex items-center justify-center gap-6 text-[10px] uppercase tracking-[0.15em] font-semibold text-zinc-700">
            <span>© {new Date().getFullYear()} Journal</span>
            <span className="text-zinc-800">·</span>
            <span>Privacy</span>
            <span className="text-zinc-800">·</span>
            <span>Terms</span>
          </div>
        </div>
      </main>
    </div>
  );
}
