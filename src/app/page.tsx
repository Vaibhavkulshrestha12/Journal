import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { formatNumber } from "@/lib/utils";
import { Eye } from "lucide-react";
import DecryptedText from "@/components/ui/DecryptedText";

export default async function HomePage() {
  const latestPosts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const featuredPosts = await prisma.post.findMany({
    where: { status: "PUBLISHED", isFeatured: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-white selection:text-black">
      {/* Navigation */}
      <nav className="border-b border-zinc-900 sticky top-0 bg-black/80 backdrop-blur-md z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image src="/logo.png" alt="Journal" width={28} height={28} className="rounded" />
            <span className="text-xl font-extrabold italic tracking-tighter hidden sm:inline">JOURNAL<span className="text-zinc-600">.</span></span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-8 text-[11px] uppercase tracking-[0.2em] font-bold text-zinc-500">
            <Link href="/posts" className="hover:text-white transition-colors">Archive</Link>
            <Link href="/posts" className="hover:text-white transition-colors hidden sm:inline">About</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-20 sm:space-y-32">
        {/* Hero Section */}
        <section className="space-y-6 sm:space-y-8">
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-zinc-500">Independent Journal since 2026</span>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-extrabold tracking-[-0.04em] leading-[0.95]">
              <DecryptedText 
                text="Exploring the"
                animateOn="view"
                revealDirection="start"
                sequential
              />
              <br /> 
              <span className="text-zinc-700">
                <DecryptedText 
                  text="Digital Frontier."
                  animateOn="view"
                  revealDirection="end"
                  sequential
                />
              </span>
            </h1>
          </div>
          <p className="max-w-xl text-zinc-400 text-base sm:text-lg leading-relaxed">
            Thoughts on code, design, and building production-grade systems in the age of agentic AI. 
            No noise, just high-fidelity insights.
          </p>
        </section>

        {/* Featured Section */}
        {featuredPosts.length > 0 && (
          <section className="space-y-8 sm:space-y-12">
            <h2 className="text-[10px] uppercase tracking-[0.4em] font-bold text-zinc-600 text-center">Featured Stories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-zinc-900 border border-zinc-900 rounded-lg overflow-hidden">
              {featuredPosts.map((post: any) => (
                <Link key={post.id} href={`/posts/${post.slug}`} className="bg-black p-6 sm:p-8 space-y-6 group hover:bg-zinc-950 transition-colors">
                  <div className="aspect-[4/5] bg-zinc-900 rounded overflow-hidden">
                    {post.coverImage && <img src={post.coverImage} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-bold leading-tight group-hover:underline underline-offset-4">{post.title}</h3>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Latest Feed */}
        <section className="space-y-10 sm:space-y-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-zinc-900 pb-6 sm:pb-8 gap-4">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Latest Feed</h2>
            <Link href="/posts" className="text-xs uppercase tracking-widest font-bold text-zinc-500 hover:text-white transition-colors">See Archive &rarr;</Link>
          </div>

          <div className="space-y-16 sm:space-y-24">
            {latestPosts.map((post: any) => (
              <Link key={post.id} href={`/posts/${post.slug}`} className="group block space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
                  <div className="md:col-span-8 space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-3 sm:gap-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500">
                      <span>{new Date(post.createdAt).toDateString()}</span>
                      <span className="w-1 h-1 bg-zinc-800 rounded-full" />
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" /> {formatNumber(post.viewsCount)}
                      </div>
                    </div>
                    <h3 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tighter group-hover:text-zinc-400 transition-colors">{post.title}</h3>
                    <p className="text-zinc-500 text-sm sm:text-lg line-clamp-2 max-w-2xl">
                      {post.content.replace(/<[^>]*>/g, "").substring(0, 150)}...
                    </p>
                  </div>
                  <div className="md:col-span-4 aspect-video bg-zinc-900 rounded overflow-hidden shadow-2xl transition-transform group-hover:scale-[1.02] duration-500">
                    {post.coverImage && <img src={post.coverImage} className="w-full h-full object-cover grayscale opacity-60 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700" />}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-12 sm:py-20 bg-zinc-950/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-8 sm:gap-12">
          <div className="space-y-3 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Image src="/logo.png" alt="Journal" width={24} height={24} className="rounded" />
              <h2 className="text-xl font-extrabold tracking-tighter italic">JOURNAL.</h2>
            </div>
            <p className="text-zinc-600 text-xs sm:text-sm uppercase tracking-widest font-bold leading-relaxed max-w-xs">
              Built for the digital age <br /> Focused on premium quality.
            </p>
          </div>
          <div className="flex gap-8 sm:gap-12 text-[10px] uppercase tracking-widest font-bold text-zinc-500">
            <Link href="https://x.com/Vaibhav_1208" target="_blank" className="hover:text-white transition-colors">Twitter (X)</Link>
            <Link href="https://github.com/vaibhavkulshrestha12" target="_blank" className="hover:text-white transition-colors">GitHub</Link>
            <Link href="https://www.linkedin.com/in/vaibhav-kulshrestha-053924283" target="_blank" className="hover:text-white transition-colors">LinkedIn</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
