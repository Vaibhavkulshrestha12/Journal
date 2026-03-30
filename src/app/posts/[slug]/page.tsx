import { prisma } from "@/lib/prisma";
import PostReadingView from "@/components/blog/PostReadingView";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  const post = await prisma.post.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      comments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!post) {
    notFound();
  }

  // Increment views server-side
  await prisma.post.update({
    where: { id: post.id },
    data: { viewsCount: { increment: 1 } },
  });

  return (
    <div className="bg-black min-h-screen text-white">
      <nav className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between border-b border-zinc-900/50">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Journal" width={28} height={28} className="rounded" />
          <span className="text-lg font-extrabold italic tracking-tighter">JOURNAL.</span>
        </Link>
        <Link href="/" className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-bold text-zinc-500 hover:text-white transition-colors">
          Return to Library
        </Link>
      </nav>
      <PostReadingView post={post as any} />
    </div>
  );
}
