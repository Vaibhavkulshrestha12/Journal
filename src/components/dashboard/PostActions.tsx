"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash, ExternalLink, Loader2, X, Check } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";

interface PostActionsProps {
  slug: string;
  status: string;
}

export default function PostActions({ slug, status }: PostActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`/api/posts/${slug}`);
      router.refresh();
      setShowConfirm(false);
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert(`Failed to delete post: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="flex items-center justify-end gap-1">
      {showConfirm ? (
        <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-2">
          <span className="text-[10px] text-red-500 font-bold uppercase mr-1">Confirm?</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-zinc-800"
            onClick={() => setShowConfirm(false)}
            disabled={isDeleting}
          >
            <X className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500 hover:bg-red-950/20"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          </Button>
        </div>
      ) : (
        <>
          {status === "PUBLISHED" && (
            <Link href={`/posts/${slug}`} target="_blank">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-zinc-500 hover:text-white"
                title="View blog"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </Link>
          )}
          <Link href={`/dashboard/editor?slug=${slug}`}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-500 hover:text-white"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-500 hover:text-red-400"
            title="Delete"
            onClick={() => setShowConfirm(true)}
          >
            <Trash className="w-4 h-4" />
          </Button>
        </>
      )}
    </div>
  );
}
