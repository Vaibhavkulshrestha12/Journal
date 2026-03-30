import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/utils";
import { 
  Eye, ThumbsUp, FileText, 
  MessageSquare, TrendingUp
} from "lucide-react";

export default async function AnalyticsPage() {
  const postsCount = await prisma.post.count();
  const publishedCount = await prisma.post.count({ where: { status: "PUBLISHED" } });
  const draftCount = await prisma.post.count({ where: { status: "DRAFT" } });
  const totalViews = await prisma.post.aggregate({ _sum: { viewsCount: true } });
  const totalLikes = await prisma.post.aggregate({ _sum: { likesCount: true } });
  const totalDislikes = await prisma.post.aggregate({ _sum: { dislikesCount: true } });
  const commentsCount = await prisma.comment.count();
  const engagementsCount = await prisma.postEngagement.count();

  const topPosts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { viewsCount: "desc" },
    take: 5,
    include: {
      _count: {
        select: { comments: true }
      }
    }
  });

  const metrics = [
    { label: "Total Posts", value: formatNumber(postsCount), icon: FileText, sub: `${publishedCount} published · ${draftCount} drafts` },
    { label: "Total Views", value: formatNumber(totalViews._sum.viewsCount || 0), icon: Eye, sub: "Across all posts" },
    { label: "Likes", value: formatNumber(totalLikes._sum.likesCount || 0), icon: ThumbsUp, sub: `${formatNumber(totalDislikes._sum.dislikesCount || 0)} dislikes` },
    { label: "Comments", value: formatNumber(commentsCount), icon: MessageSquare, sub: `${formatNumber(engagementsCount)} total engagements` },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Analytics</h1>
        <p className="text-zinc-500 text-sm sm:text-base">Insights on your content performance.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="p-4 sm:p-6 rounded-xl border border-zinc-900 bg-zinc-950 hover:border-zinc-800 transition-colors">
              <div className="p-2 rounded bg-zinc-900 text-zinc-400 w-fit mb-3 sm:mb-4">
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="text-xl sm:text-2xl font-bold mb-1">{m.value}</div>
              <div className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-wider font-semibold">{m.label}</div>
              <p className="text-[10px] sm:text-[11px] text-zinc-600 mt-2">{m.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold">Top Performing Posts</h2>
        <div className="border border-zinc-900 rounded-xl overflow-hidden bg-zinc-950">
          {topPosts.length === 0 ? (
            <div className="p-12 text-center text-zinc-600 flex flex-col items-center gap-3">
              <TrendingUp className="w-8 h-8 opacity-20" />
              <span>Publish your first post to see analytics here.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-900/50 text-[10px] uppercase tracking-widest font-bold text-zinc-500">
                    <th className="px-4 sm:px-6 py-3 sm:py-4">#</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4">Title</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-right">Views</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-right">Likes</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-right">Comments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {topPosts.map((post: any, i: number) => (
                    <tr key={post.id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-zinc-600 font-mono text-sm">{i + 1}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium">{post.title}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-right text-sm text-zinc-400">{formatNumber(post.viewsCount)}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-right text-sm text-zinc-400">{formatNumber(post.likesCount)}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-right text-sm text-zinc-400">{formatNumber(post._count.comments)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
