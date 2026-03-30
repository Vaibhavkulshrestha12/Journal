import { prisma } from "@/lib/prisma";
import { formatNumber, cn } from "@/lib/utils";
import { 
  FileText, Eye, ThumbsUp, MessageSquare, 
  TrendingUp, ArrowUpRight
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const postsCount = await prisma.post.count();
  const totalViews = await prisma.post.aggregate({
    _sum: { viewsCount: true }
  });
  const totalLikes = await prisma.post.aggregate({
    _sum: { likesCount: true }
  });
  const commentsCount = await prisma.comment.count();
  
  const recentPosts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 5
  });

  const stats = [
    { label: "Total Posts", value: formatNumber(postsCount), icon: FileText },
    { label: "Total Views", value: formatNumber(totalViews._sum.viewsCount || 0), icon: Eye },
    { label: "Engagement", value: formatNumber(totalLikes._sum.likesCount || 0), icon: ThumbsUp },
    { label: "Comments", value: formatNumber(commentsCount), icon: MessageSquare },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Overview</h1>
          <p className="text-zinc-500">Welcome back. Here's what's happening today.</p>
        </div>
        <Link href="/dashboard/editor">
          <Button className="bg-white text-black hover:bg-zinc-200">
            Create New Post
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="p-6 rounded-xl border border-zinc-900 bg-zinc-950 hover:border-zinc-800 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded bg-zinc-900 text-zinc-400">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Posts</h2>
            <Link href="/dashboard/posts" className="text-xs text-zinc-500 hover:text-white transition-colors">View All</Link>
          </div>
          <div className="border border-zinc-900 rounded-xl overflow-hidden divide-y divide-zinc-900 bg-zinc-950">
            {recentPosts.length === 0 ? (
              <div className="p-12 text-center text-zinc-600">No posts yet. Start writing!</div>
            ) : (
              recentPosts.map((post: any) => (
                <div key={post.id} className="p-4 flex items-center justify-between hover:bg-zinc-900/50 transition-colors">
                  <div>
                    <h3 className="font-medium text-sm mb-1">{post.title}</h3>
                    <div className="flex items-center gap-3 text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                      <span>{post.status}</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      <span>{formatNumber(post.viewsCount)} Views</span>
                    </div>
                  </div>
                  <Link href={`/dashboard/editor?slug=${post.slug}`}>
                    <Button variant="outline" size="sm" className="h-8 border-zinc-800 text-xs">Edit</Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Trending</h2>
          <div className="p-6 rounded-xl border border-zinc-900 bg-zinc-950 flex flex-col items-center justify-center text-center space-y-4">
            <TrendingUp className="w-8 h-8 text-white opacity-20" />
            <div>
              <p className="text-zinc-500 text-sm">Post tracking starts when people view your blog.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
