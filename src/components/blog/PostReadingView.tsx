"use client";

import { useState, useOptimistic, useTransition, useEffect } from "react";
import { ThumbsUp, ThumbsDown, MessageSquare, Share2, Send, User } from "lucide-react";
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css';

interface Post {
  id: string;
  title: string;
  content: string;
  coverImage?: string;
  createdAt: string;
  likesCount: number;
  dislikesCount: number;
  comments?: any[];
}

export default function PostReadingView({ post }: { post: Post }) {
  const authorName = process.env.NEXT_PUBLIC_AUTHOR_NAME || "Anonymous Author";
  
  const [likes, setLikes] = useState(post.likesCount);
  const [dislikes, setDislikes] = useState(post.dislikesCount);
  const [likeActive, setLikeActive] = useState(false);
  const [dislikeActive, setDislikeActive] = useState(false);
  const [engageLoading, setEngageLoading] = useState(false);

  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const [commentLoading, setCommentLoading] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  useEffect(() => {
    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });

    // Fetch up-to-date counts and user's past engagement
    fetch(`/api/posts/engage?postId=${post.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.type === 'LIKE') setLikeActive(true);
        if (data.type === 'DISLIKE') setDislikeActive(true);
        if (data.likesCount !== undefined) setLikes(data.likesCount);
        if (data.dislikesCount !== undefined) setDislikes(data.dislikesCount);
      })
      .catch(() => {});
  }, [post.content, post.id]);

  const handleEngage = async (type: "LIKE" | "DISLIKE") => {
    if (engageLoading) return;
    setEngageLoading(true);

    if (type === "LIKE") {
      if (likeActive) {
        setLikes((p) => p - 1);
        setLikeActive(false);
      } else {
        setLikes((p) => p + 1);
        setLikeActive(true);
        if (dislikeActive) {
          setDislikes((p) => p - 1);
          setDislikeActive(false);
        }
      }
    } else {
      if (dislikeActive) {
        setDislikes((p) => p - 1);
        setDislikeActive(false);
      } else {
        setDislikes((p) => p + 1);
        setDislikeActive(true);
        if (likeActive) {
          setLikes((p) => p - 1);
          setLikeActive(false);
        }
      }
    }

    try {
      const res = await fetch("/api/posts/engage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, type }),
      });
      const data = await res.json();
      if (data.likesCount !== undefined) setLikes(data.likesCount);
      if (data.dislikesCount !== undefined) setDislikes(data.dislikesCount);
    } catch {
    } finally {
      setEngageLoading(false);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim() || commentText.length < 3 || commentLoading) return;
    setCommentLoading(true);

    const optimisticComment = {
      id: `temp-${Date.now()}`,
      content: commentText,
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [optimisticComment, ...prev]);
    const savedText = commentText;
    setCommentText("");

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, content: savedText }),
      });
      const real = await res.json();
      setComments((prev) =>
        prev.map((c) => (c.id === optimisticComment.id ? real : c))
      );
    } catch {
      setComments((prev) => prev.filter((c) => c.id !== optimisticComment.id));
    } finally {
      setCommentLoading(false);
    }
  };

  const shareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <header className="space-y-6 mb-12 sm:mb-16">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <time className="uppercase tracking-[0.2em] font-semibold">
              {new Date(post.createdAt).toLocaleDateString(undefined, { dateStyle: "long" })}
            </time>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <div className="flex items-center gap-1.5">
              <User className="w-3 h-3" />
              <span className="font-medium">{authorName}</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-[-0.03em] leading-[1.1] text-white">
            {post.title}
          </h1>
        </div>

        {post.coverImage && (
          <div className="aspect-video w-full bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800/50">
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}
      </header>

      <div
        className="
          prose prose-invert max-w-full w-full mb-16 break-words
          prose-headings:font-extrabold prose-headings:tracking-tight prose-headings:text-white
          prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
          prose-p:text-zinc-300 prose-p:leading-[1.8] prose-p:text-base
          prose-a:text-white prose-a:underline prose-a:underline-offset-4
          prose-strong:text-white
          prose-code:text-zinc-300 prose-code:bg-zinc-800/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:break-words
          prose-pre:bg-[#1e1e1e] prose-pre:border prose-pre:border-zinc-800 prose-pre:rounded-xl prose-pre:max-w-full prose-pre:overflow-x-auto
          prose-img:rounded-xl prose-img:border prose-img:border-zinc-800
          prose-blockquote:border-l-white/30 prose-blockquote:text-zinc-400
          prose-li:text-zinc-300
        "
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <div className="border-t border-b border-zinc-800/50 py-4 mb-12">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleEngage("LIKE")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                likeActive
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 border border-transparent"
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${likeActive ? "fill-current" : ""}`} />
              <span>{likes}</span>
            </button>
            <button
              onClick={() => handleEngage("DISLIKE")}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                dislikeActive
                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 border border-transparent"
              }`}
            >
              <ThumbsDown className={`w-4 h-4 ${dislikeActive ? "fill-current" : ""}`} />
              <span>{dislikes}</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={shareLink}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-all font-medium relative"
            >
              <Share2 className="w-4 h-4" />
              <span>{showCopied ? "Copied!" : "Share"}</span>
            </button>
            <div className="flex items-center gap-1.5 text-zinc-500 text-sm">
              <MessageSquare className="w-4 h-4" />
              <span>{comments.length}</span>
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-8 pb-20">
        <h3 className="text-lg font-bold tracking-tight text-white">
          Discussion ({comments.length})
        </h3>
        <div className="flex gap-2 sm:gap-3 w-full max-w-full">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleComment()}
            placeholder="Share your thoughts..."
            className="flex-1 min-w-0 h-11 px-3 sm:px-4 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
          />
          <button
            onClick={handleComment}
            disabled={commentLoading || commentText.length < 3}
            className="h-11 px-4 sm:px-5 shrink-0 bg-white text-black rounded-lg font-semibold text-sm hover:bg-zinc-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6">
          {comments.length === 0 ? (
            <p className="text-zinc-600 text-sm italic">No comments yet. Be the first to share your perspective.</p>
          ) : (
            comments.map((comment: any) => (
              <div key={comment.id} className="space-y-1.5 pb-6 border-b border-zinc-900/50 last:border-0">
                <div className="flex items-center justify-between text-[11px] text-zinc-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3 h-3" />
                    Anonymous
                  </span>
                  <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </article>
  );
}
