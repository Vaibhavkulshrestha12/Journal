import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatNumber } from "@/lib/utils";

export default async function ArchivePage() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="bg-black min-h-screen text-white p-8">
      <div className="max-w-4xl mx-auto space-y-12 py-20">
        <div className="space-y-4">
          <Link href="/" className="text-xs uppercase tracking-widest font-bold text-zinc-500 hover:text-white transition-colors">&larr; Back Home</Link>
          <h1 className="text-5xl font-bold tracking-tighter">Archive</h1>
        </div>

        <div className="space-y-1px bg-zinc-900 border border-zinc-900 rounded-lg overflow-hidden">
          {posts.length === 0 ? (
            <div className="p-20 text-center text-zinc-600 bg-black">The vaults are empty.</div>
          ) : (
            posts.map((post: any) => (
              <Link key={post.id} href={`/posts/${post.slug}`} className="flex items-center justify-between p-6 bg-black hover:bg-zinc-950 transition-colors group">
                <div className="space-y-1">
                  <h2 className="font-bold group-hover:underline underline-offset-4">{post.title}</h2>
                  <div className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-xs text-zinc-500 font-mono">
                  {formatNumber(post.viewsCount)} Views
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
