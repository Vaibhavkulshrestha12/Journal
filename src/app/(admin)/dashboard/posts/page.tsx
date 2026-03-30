import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Eye, ThumbsUp } from "lucide-react";
import { formatNumber, cn } from "@/lib/utils";
import PostActions from "@/components/dashboard/PostActions";

export default async function PostsManagementPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Posts</h1>
          <p className="text-zinc-500 text-sm">Manage your stories, drafts, and archives.</p>
        </div>
        <Link href="/dashboard/editor">
          <Button className="bg-white text-black hover:bg-zinc-200">
            Write Post
          </Button>
        </Link>
      </div>

      <div className="border border-zinc-900 rounded-xl overflow-hidden bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-zinc-900 bg-zinc-900/50 text-[10px] uppercase tracking-widest font-bold text-zinc-500">
                <th className="px-4 sm:px-6 py-3 sm:py-4">Title</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4">Status</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-right">Engagement</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4">Date</th>
                <th className="px-4 sm:px-6 py-3 sm:py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-600">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-8 h-8 opacity-20" />
                      <span>No posts found. Create your first post!</span>
                    </div>
                  </td>
                </tr>
              ) : (
                posts.map((post: any) => (
                  <tr key={post.id} className="hover:bg-zinc-900/30 transition-colors group">
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="font-medium text-sm group-hover:text-white transition-colors">{post.title}</div>
                      <div className="text-[10px] text-zinc-600 font-mono mt-1">/{post.slug}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                        post.status === "PUBLISHED" ? "bg-zinc-800 text-white" : "bg-zinc-900 text-zinc-600"
                      )}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                      <div className="flex items-center justify-end gap-4 text-zinc-500 text-[11px]">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {formatNumber(post.viewsCount)}
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {formatNumber(post.likesCount)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs text-zinc-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                      <PostActions slug={post.slug} status={post.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
